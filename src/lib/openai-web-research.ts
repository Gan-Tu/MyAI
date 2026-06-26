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

function collectOutputText(value: unknown, text: string[] = []) {
  if (!value || typeof value !== "object") return text;

  if (Array.isArray(value)) {
    for (const item of value) collectOutputText(item, text);
    return text;
  }

  const item = value as Record<string, unknown>;
  if (item.type === "output_text" && typeof item.text === "string") {
    text.push(item.text);
  }

  for (const child of Object.values(item)) {
    collectOutputText(child, text);
  }

  return text;
}

type WidgetWebResearchRequest = {
  query: string;
  purpose: string;
  userPrompt: string;
  signal?: AbortSignal;
  referenceImageContext?: {
    count: number;
    names: string[];
    notes: string;
  };
};

function createWidgetResearchPrompt(request: WidgetWebResearchRequest) {
  const referenceContext = request.referenceImageContext?.notes
    ? `
Reference image context:
- Uploaded image count: ${request.referenceImageContext.count}
- Uploaded image names: ${
        request.referenceImageContext.names.join(", ") || "unnamed"
      }
- Reference notes:
${request.referenceImageContext.notes}
`.trim()
    : "Reference image context: none";

  return `
Research facts for a compact @tugan/widgets UI.

User widget prompt:
${request.userPrompt.trim()}

Planner search query:
${request.query.trim()}

Why this search is needed:
${request.purpose.trim()}

${referenceContext}

Return 4-6 concise, widget-usable facts only. Prioritize details that can become
labels, values, badges, captions, rows, prices, dates, statuses, ratings, names,
release info, or short descriptions in the final widget. Prefer current facts
when the subject is time-sensitive.

Rules:
- Stay scoped to the user prompt and search purpose.
- Do not write a general article summary.
- Do not include citation markdown or URLs unless a URL itself is useful widget data.
- If sources conflict or the fact is uncertain, say so briefly.
- Do not include real personal contact details, full addresses, payment identifiers, or secrets from web results.
- If the widget needs customer/contact demo data, instruct the final widget generator to use synthetic placeholders instead of web-sourced personal data.
- Do not invent facts that are not supported by the search results.
`.trim();
}

export async function researchWithOpenAIWebSearch(
  request: WidgetWebResearchRequest,
) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    signal: request.signal,
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
          search_context_size: "low",
        },
      ],
      input: createWidgetResearchPrompt(request),
    }),
  });

  if (!response.ok) {
    throw new Error(`Error researching web: ${response.status}`);
  }

  const body = await response.json();
  return collectOutputText(body).join("\n").trim();
}
