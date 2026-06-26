// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { getLanguageModel } from "@/lib/language-model";
import { defaultLanguageModel } from "@/lib/models";
import { searchImagesWithOpenAI } from "@/lib/openai-image-search";
import { analyzeWidgetReferenceImages } from "@/lib/openai-reference-images";
import { researchWithOpenAIWebSearch } from "@/lib/openai-web-research";
import { checkRateLimit } from "@/lib/redis";
import { generateObject, generateText } from "ai";
import { NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";

export const maxDuration = 60;

const MAX_REFERENCE_IMAGES = 3;
const MAX_REFERENCE_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_ASSET_SEARCHES = 10;
const MAX_AVAILABLE_IMAGES = 24;
const referenceImageDataUrlPattern =
  /^data:image\/(?:png|jpeg|jpg|webp);base64,/i;
const widgetAuthoringGuide = readFileSync(
  join(process.cwd(), "src/app/api/generative-widgets/AGENTS.md"),
  "utf8",
).trim();

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(jsonValueSchema),
  ]),
);

const generatedWidgetSchema = z.object({
  template: z.string().min(1),
  data: z.record(jsonValueSchema),
  theme: z.enum(["light", "dark"]),
  designSpec: z.string().min(1),
});

const widgetAssetPlanSchema = z.object({
  webSearches: z
    .array(
      z.object({
        query: z.string().min(2),
        purpose: z.string().min(1),
      }),
    )
    .max(MAX_ASSET_SEARCHES),
  imageSearches: z
    .array(
      z.object({
        query: z.string().min(2),
        purpose: z.string().min(1),
      }),
    )
    .max(MAX_ASSET_SEARCHES),
});

const referenceImageSchema = z.object({
  name: z.string().optional(),
  dataUrl: z.string().min(1),
});

const generateWidgetRequestSchema = z.object({
  prompt: z.string().optional(),
  referenceImages: z
    .array(referenceImageSchema)
    .max(MAX_REFERENCE_IMAGES)
    .optional(),
});

const assetPlanningPrompt = `
You decide whether a generated @tugan/widgets widget needs current web research, real web image URLs, both, or neither.

Return webSearches as an empty array unless current or factual web information would clearly improve the final widget.
Use web search for real entities or topics where details matter, such as movies, shows, books, products, restaurants, travel destinations, companies, public figures, sports, events, venues, news, releases, prices, ratings, or current status.
Do not use web search for generic dashboards, forms, settings panels, package tracking, mock finance summaries, timers, todo lists, schedules, invoices, alerts, or purely fictional/demo cards unless the user asks for real/current information.

Return imageSearches as an empty array unless real images would clearly improve the final widget.
If the user explicitly asks for images, photos, pictures, thumbnails, logos, avatars, covers, posters, or visual rows/cards, return imageSearches.
Use image search for visual, real-world subjects such as products, movies, books, restaurants, travel destinations, venues, public figures, brands, articles, albums, recipes, or events.
For dashboards, forms, settings panels, package tracking, finance summaries, metrics, timers, todo lists, schedules, invoices, alerts, and status cards, use image search when a real visual anchor would materially improve the widget, such as product photos, merchant logos, app icons, carrier logos, venue photos, cover art, company logos, person headshots, or other concrete subjects implied by the prompt.
Skip image search only when the widget is purely abstract, numeric, text-only, or would be clearer with icons/badges instead of external images.

When searches are useful:
- Return as many precise webSearches as are useful for the widget, up to ${MAX_ASSET_SEARCHES}. Use fewer when fewer are enough.
- Return as many precise image search queries as are useful for the widget, up to ${MAX_ASSET_SEARCHES}. Use fewer when fewer are enough.
- If the user specifies a count of entities/items/cards/images to show, use that count as guidance for search count when it is useful, capped at ${MAX_ASSET_SEARCHES}.
- Each query should name the concrete thing to research or show, not the entire user prompt.
- Prefer product/place/person/media-title queries that can return directly usable image URLs.
`.trim();

const systemPrompt = widgetAuthoringGuide;

function getWidgetGenerationReasoning(model: string) {
  return model.startsWith("openai/") ? "high" : undefined;
}

function dedupeImages(
  images: Awaited<ReturnType<typeof searchImagesWithOpenAI>>,
) {
  const seen = new Set<string>();
  return images.filter((image) => {
    if (seen.has(image.link)) return false;
    seen.add(image.link);
    return true;
  });
}

function compactResearchNotes(
  notes: { query: string; purpose: string; summary: string }[],
) {
  return notes
    .filter((note) => note.summary)
    .map(
      (note) =>
        `Query: ${note.query}\nPurpose: ${note.purpose}\nFacts:\n${note.summary}`,
    );
}

function promptExplicitlyRequestsImages(prompt: string) {
  return /\b(images?|photos?|pictures?|thumbnails?|logos?|avatars?|covers?|posters?|visuals?)\b/i.test(
    prompt,
  );
}

function createFallbackImageSearch(prompt: string) {
  return {
    query: prompt
      .trim()
      .replace(/\s+/g, " ")
      .slice(0, 160),
    purpose: "The user explicitly requested images in the widget.",
  };
}

function createReferenceImageContext(
  referenceImages: { name?: string }[],
  notes: string,
) {
  return {
    count: referenceImages.length,
    names: referenceImages
      .map((image) => image.name)
      .filter((name): name is string => Boolean(name)),
    notes,
  };
}

function createStreamEvent(type: string, payload: Record<string, unknown>) {
  return `${JSON.stringify({ type, ...payload })}\n`;
}

function getDataUrlByteSize(dataUrl: string) {
  const base64 = dataUrl.split(",", 2)[1] || "";
  return Math.floor((base64.length * 3) / 4);
}

function validateReferenceImages(referenceImages: { dataUrl: string }[]) {
  for (const image of referenceImages) {
    if (!referenceImageDataUrlPattern.test(image.dataUrl)) {
      throw new Error("Reference images must be PNG, JPEG, or WebP files.");
    }
    if (getDataUrlByteSize(image.dataUrl) > MAX_REFERENCE_IMAGE_BYTES) {
      throw new Error("Each reference image must be 5 MB or smaller.");
    }
  }
}

function parseGeneratedWidget(text: string) {
  const jsonText =
    text.match(/```(?:json)?\s*([\s\S]*?)```/)?.[1]?.trim() ?? text.trim();
  const widget = generatedWidgetSchema.parse(JSON.parse(jsonText));
  const template = widget.template
    .replace(
      /\sborder(?:=\{(?:true|false)\}|="(?:true|false)")?(?=[\s/>])/g,
      "",
    )
    .replace(/\s\$(\w+)=\{([^{}]+)\}/g, ' $$$1="$2"')
    .replace(/\s<(Badge)([^>]*)\svalue=/g, " <$1$2 label=")
    .replace(/\s<(Button)([^>]*)\svalue=/g, " <$1$2 label=")
    .replace(/\s<(Badge|Button)([^>]*)\stone=/g, " <$1$2 color=")
    .replace(/\s<(Text|Title|Caption)([^>]*)\salign=/g, " <$1$2 textAlign=")
    .replace(/\scolor="green"/g, ' color="success"')
    .replace(/\scolor="red"/g, ' color="danger"')
    .replace(/\scolor="yellow"/g, ' color="warning"')
    .replace(/\scolor="orange"/g, ' color="warning"')
    .replace(/\scolor="blue"/g, ' color="info"')
    .replace(/\scolor="purple"/g, ' color="discovery"')
    .replace(/\scolor="gray"/g, ' color="secondary"');

  return {
    ...widget,
    template,
  };
}

export async function POST(req: Request) {
  let requestBody: z.infer<typeof generateWidgetRequestSchema>;
  try {
    requestBody = generateWidgetRequestSchema.parse(await req.json());
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Invalid generation request",
      },
      { status: 400 },
    );
  }

  const { prompt, referenceImages = [] } = requestBody;
  const modelChoice = req.headers.get("X-AI-Model") || defaultLanguageModel;

  if (!prompt?.trim()) {
    return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
  }

  const { passed, secondsLeft } = await checkRateLimit(
    "/api/generative-widgets",
  );
  if (!passed) {
    return NextResponse.json(
      {
        error: `Rate Limited. ${secondsLeft && `${secondsLeft}s left`}.`,
      },
      { status: 429 },
    );
  }

  try {
    validateReferenceImages(referenceImages);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Invalid reference images",
      },
      { status: 400 },
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (type: string, payload: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(createStreamEvent(type, payload)));
      };

      try {
        let referenceImageAnalysis = "";
        if (referenceImages.length > 0) {
          try {
            send("status", {
              message:
                referenceImages.length === 1
                  ? "Reading reference image"
                  : `Reading ${referenceImages.length} reference images`,
            });
            referenceImageAnalysis = await analyzeWidgetReferenceImages(
              prompt.trim(),
              referenceImages,
            );
            send("status", { message: "Reference image analysis complete" });
          } catch (referenceImageError) {
            console.error(
              "Failed to analyze reference images: ",
              referenceImageError,
            );
            send("status", {
              message: "Reference image analysis failed. Continuing without it",
            });
          }
        }
        const referenceImageContext = createReferenceImageContext(
          referenceImages,
          referenceImageAnalysis,
        );

        send("status", { message: "Planning the widget" });
        const { object: plannedAssets } = await generateObject({
          model: getLanguageModel(modelChoice),
          reasoning: getWidgetGenerationReasoning(modelChoice),
          schema: widgetAssetPlanSchema,
          system: assetPlanningPrompt,
          prompt: JSON.stringify({
            prompt: prompt.trim(),
            referenceImageContext,
          }),
        });
        const assetPlan =
          promptExplicitlyRequestsImages(prompt) &&
          plannedAssets.imageSearches.length === 0
            ? {
                ...plannedAssets,
                imageSearches: [createFallbackImageSearch(prompt)],
              }
            : plannedAssets;

        const searchCount =
          assetPlan.webSearches.length + assetPlan.imageSearches.length;
        send("status", {
          message:
            searchCount > 0
              ? "Planning complete. Gathering supporting context"
              : "Planning complete. No web or image search needed",
        });

        let researchNotes: {
          query: string;
          purpose: string;
          summary: string;
        }[] = [];
        if (assetPlan.webSearches.length > 0) {
          try {
            send("status", {
              message:
                assetPlan.webSearches.length === 1
                  ? "Searching the web for facts"
                  : `Searching the web for ${assetPlan.webSearches.length} fact sources`,
            });
            researchNotes = await Promise.all(
              assetPlan.webSearches.map(async (search) => ({
                ...search,
                summary: await researchWithOpenAIWebSearch({
                  query: search.query,
                  purpose: search.purpose,
                  userPrompt: prompt.trim(),
                  referenceImageContext,
                }),
              })),
            );
            send("status", { message: "Web research complete" });
          } catch (researchError) {
            console.error(
              "Failed to enrich widget with web research: ",
              researchError,
            );
            send("status", {
              message: "Web research failed. Continuing without it",
            });
          }
        }

        let availableImages: Awaited<ReturnType<typeof searchImagesWithOpenAI>> =
          [];
        if (assetPlan.imageSearches.length > 0) {
          try {
            send("status", {
              message:
                assetPlan.imageSearches.length === 1
                  ? "Searching for real image URLs"
                  : `Searching for real image URLs from ${assetPlan.imageSearches.length} queries`,
            });
            const imageGroups = await Promise.all(
              assetPlan.imageSearches.map((search) =>
                searchImagesWithOpenAI(search.query, 3),
              ),
            );
            availableImages = dedupeImages(imageGroups.flat()).slice(
              0,
              MAX_AVAILABLE_IMAGES,
            );
            send("status", { message: "Image search complete" });
          } catch (imageError) {
            console.error(
              "Failed to enrich widget with image search: ",
              imageError,
            );
            send("status", {
              message: "Image search failed. Continuing without it",
            });
          }
        }

        send("status", { message: "Generating the widget interface" });
        const { text } = await generateText({
          model: getLanguageModel(modelChoice),
          reasoning: getWidgetGenerationReasoning(modelChoice),
          system: `${systemPrompt}

Return only valid JSON with these keys: template, data, theme, designSpec.
Do not wrap the JSON in markdown or prose.`,
          prompt: JSON.stringify({
            prompt: prompt.trim(),
            referenceImageContext,
            webSearchesRequested: assetPlan.webSearches,
            researchNotes: compactResearchNotes(researchNotes),
            imageSearchesRequested: assetPlan.imageSearches,
            availableImages: availableImages.map((image) => ({
              url: image.link,
              title: image.title,
              source: image.image?.contextLink,
            })),
          }),
        });
        const object = parseGeneratedWidget(text);

        send("status", { message: "Widget ready" });
        send("result", { widget: object });
      } catch (error) {
        console.error("Failed to generate widget: ", error);
        send("error", {
          error:
            error instanceof Error ? error.message : "Failed to generate widget",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
