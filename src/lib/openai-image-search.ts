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

import { ImageSearchResult } from "@/lib/types";

type OpenAIImageSearchResult = {
  type?: string;
  image_url?: string;
  thumbnail_url?: string;
  source_website_url?: string;
  caption?: string | null;
};

type SearchImagesWithOpenAIOptions = {
  signal?: AbortSignal;
};

function collectOpenAIImageResults(
  value: unknown,
  results: OpenAIImageSearchResult[] = [],
) {
  if (!value || typeof value !== "object") return results;

  if (Array.isArray(value)) {
    for (const item of value) {
      collectOpenAIImageResults(item, results);
    }
    return results;
  }

  const item = value as Record<string, unknown>;
  if (
    item.type === "image_result" ||
    typeof item.image_url === "string" ||
    typeof item.thumbnail_url === "string"
  ) {
    results.push(item as OpenAIImageSearchResult);
  }

  for (const child of Object.values(item)) {
    collectOpenAIImageResults(child, results);
  }

  return results;
}

function toImageSearchResult(
  result: OpenAIImageSearchResult,
): ImageSearchResult | null {
  const link = result.image_url || result.thumbnail_url;
  if (!link) return null;

  return {
    link,
    title: result.caption || "Image result",
    image: result.source_website_url
      ? {
          contextLink: result.source_website_url,
        }
      : undefined,
  };
}

export async function searchImagesWithOpenAI(
  query: string,
  maxResults = 10,
  options: SearchImagesWithOpenAIOptions = {},
): Promise<ImageSearchResult[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    signal: options.signal,
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-5.5",
      reasoning: { effort: "high" },
      tools: [
        {
          type: "web_search",
          search_content_types: ["image"],
          image_settings: {
            max_results: maxResults,
            caption: true,
          },
        },
      ],
      include: ["web_search_call.results"],
      input: `Find image results for ${query.trim()}.`,
    }),
  });

  if (!response.ok) {
    throw new Error(`Error fetching images: ${response.status}`);
  }

  const body = await response.json();
  return collectOpenAIImageResults(body)
    .map(toImageSearchResult)
    .filter((item): item is ImageSearchResult => Boolean(item));
}
