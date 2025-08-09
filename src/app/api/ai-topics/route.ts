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

import bing_search from '@/lib/agents';
import { decrypt } from '@/lib/encryption';
import { defaultLanguageModel } from '@/lib/models';
import redis, { checkRateLimit } from "@/lib/redis";
import { entityCardSchema } from '@/lib/schema';
import { getAiTopicsRespCacheKey } from "@/lib/utils";
import { streamObject } from 'ai';
import { NextResponse } from 'next/server';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const systemPrompt = "# Topic Card Generation\n\nYou are an expert research assistant that builds a glanceable, Google-style knowledge card from a user query. Prioritize clarity, relevance, and accuracy. All MUST/NEVER rules are hard requirements. If a length cap would materially harm clarity, prefer clarity.\n\n---\n\n## 1) Output fields\n\n* **Title** (under 40 characters): concise noun phrase naming the main entity or concept. No generic/format words (e.g., overview, explained, guide). If the query has one clear entity, use the entity name.\n  High-level principle: name the thing, not the format (e.g., for recipes, title is the dish name, not “X recipe” or “X ingredients”).\n\n  **Title examples**\n\n  * Do: `Olivia` (query: “adam wife” -> answer is Olivia)\n  * Do: `Green tea shot`\n  * Do: `HIPAA`\n  * Don’t: `Green tea shot recipe`, `Olivia overview`, `HIPAA explained`\n\n* **Subtitle** (optional, <= 5 words): adds objective value; use common nouns or adjectives only; no verbs, adverbs, pronouns, or subjective/harmful terms. Prefer an entity category.\n\n  **Subtitle examples**\n\n  * Do: `american singer`, `government regulation`, `tv series`\n  * Don’t: `very popular artist`, `explains policy`, `you should watch`\n\n* **Description** (40–80 words total, 1–2 short paragraphs): succinct context and key attributes. Neutral tone, no hype.\n\n* **Highlighting** 3–5 consecutive words copied verbatim from the description that emphasize a key point. Must not overlap with the title or query.\n\n* **Video (optional)**: choose only from provided candidates; skip if none. Prefer for media topics; avoid for static/text-best topics and exclude news/legal-case videos.\n\n* **Facts**: produce 3 facts. No video or highlight fields.\n\n---\n\n## 2) Fact types and structure\n\nAllowed fact types only: `SHORT_FACT_SEEKING`, `LIST_ANSWER_SEEKING`. Recategorize or drop anything else.\n\n**Common fields (both types)**\n\n* `name` (short, unique label)\n* `short_answer`\n* `full_answer` (concise paragraph that adds detail; do not merely repeat the short answer)\n\n**Type details**\n\n* `SHORT_FACT_SEEKING`\n\n  * One short factual answer (<= 40 chars), self-contained.\n  * Include `is_numeric_fact` (bool) when the answer is a number, unit, or date.\n* `LIST_ANSWER_SEEKING`\n\n  * Use when the answer is best presented as a list of entities.\n  * `full_answer`: comma-separated list; add brief context in parentheses if items are ambiguous.\n  * `items`: each has `item_name` and `item_context`\n\n---\n\n## 3) Choosing fact intents\n\nSelect facts that are:\n\n* Directly relevant to the exact query slice (no scope creep).\n* Summarizable in one line (SHORT) or as clear list items (LIST).\n* Distinct from each other (no duplication).\n* High-value, common needs over trivia.\n\n**Key principles with up to 4 category examples**\n\n* People: age, role or team, height, notable work.\n* Food or drink: ingredients, nutrition/calories, ABV or taste profile.\n* Film/TV/media: release date, cast, rating/awards, where to watch.\n* Video games: release date, platform, genre, creator.\n\n**Choosing fact intents — examples**\n\n* Query: “Golden Gate Bridge”\n\n  * Do: `Length`, `Design`, `History`\n  * Don’t: `Bridges in US`\n* Query: “The Witcher Season 4”\n\n  * Do: `Release date`, `Cast`, `Story focus`\n  * Don’t: `Character analysis`, `Plot`\n* Query: “Kyle Richards and Morgan Wade”\n\n  * Do: `Relationship status`, `First met`, `Music video together`\n  * Don’t: `Kyle's profession`, `Morgan's profession` (too individual for a pair query)\n\n---\n\n## 4) Writing the facts\n\n**Naming (`name`)**\n\n* <= 15 characters, unique, concise, accurate.\n* Do not include the subject name.\n* No questions; do not leak the answer in the name.\n* Must be unambiguous and use everyday noun phrases.\n\n**Short answer**\n\n* Unambiguous and complete; use everyday phrasing.\n* Information-dense; avoid generic or obvious statements.\n* Add clarifying detail when useful (e.g., “375 limited units”, not “375 units”).\n* Type cap: `SHORT_FACT_SEEKING` <= 40 chars.\n\n**Full answer**\n\n* One compact paragraph (~40–80 words) that adds specific detail beyond the short answer. Briefly define jargon if necessary.\n* For `LIST_ANSWER_SEEKING`, provide concise item contexts; use parentheses when needed.\n\n---\n\n## 5) Output format (JSON)\n\nReturn a single JSON object with this structure (use ASCII characters; avoid backslashes before “$”; use today’s date for temporal phrasing and avoid forward-looking terms for past events):\n\n```json\n{\n  \"title\": \"<Title under 40 characters>\",\n  \"subtitle\": \"<Optional subtitle, <= 5 words or \\\"\\\">\",\n  \"description\": \"<40–80 words total>\",\n  \"highlighting\": \"<3–5 consecutive words from description>\",\n  \"video\": {\n    \"name\": \"<video title>\",\n    \"url\"\" \"<url or the video chosen>\"\n  },\n  \"facts\": [\n    {\n      \"name\": \"<<=15 chars>\",\n      \"fact_type\": \"SHORT_FACT_SEEKING\",\n      \"short_answer\": \"<<=40 chars>\",\n      \"full_answer\": \"<~40–80 words elaboration>\"\n    },\n    {\n      \"name\": \"<<=15 chars>\",\n      \"fact_type\": \"LIST_ANSWER_SEEKING\",\n      \"short_answer\": \"<one-line summary if applicable>\",\n      \"full_answer\": \"<item1 (context), item2 (context), ...>\",\n      \"items\": [\n        {\n          \"item_name\": \"<text>\",\n          \"item_context\": \"<brief text>\"\n        }\n      ]\n    }\n  ]\n}\n```"


const extractVideoSrcWithoutAutoplay = (embedHtml: string) => {
    const regex = /src="([^"]+)"/; // Regular expression to extract the src attribute
    const match = embedHtml.match(regex);

    if (match && match[1]) {
        let src = match[1];

        // Convert http to https if necessary
        if (src.startsWith('http://')) {
            src = src.replace('http://', 'https://');
        }

        // Remove the autoplay parameter if it exists
        const url = new URL(src);
        url.searchParams.delete('autoplay');
        return url.toString();
    }

    return null; // Return null if src is not found
};

function getTodayStr() {
    let today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(today.getDate()).padStart(2, '0');
    return `${year} -${month} -${day} `;
}


export async function POST(req: Request) {
    const context = await req.json();
    const headers = req.headers;
    const modelChoice = headers.get('X-AI-Model') || defaultLanguageModel

    let { passed, secondsLeft } = await checkRateLimit("/api/ai-topics")
    if (!passed) {
        return NextResponse.json({
            error: `Rate Limited.${secondsLeft && `${secondsLeft}s left`}.`
        }, { status: 429 })
    }

    // let prompt = decrypt(systemPrompt, process.env.PROMPT_SECRET!).trim()
    let prompt = systemPrompt.trim()

    try {
        let searchResults = await bing_search(context, 10);
        if (searchResults.videos) {
            let videoList = ''
            searchResults.videos?.value?.forEach(result => {
                if (result.name && result.allowMobileEmbed && result.embedHtml?.includes("youtube")
                    && result.height <= result.width) {
                    videoList += `\n\nName: ${result.name} \nUrl: ${extractVideoSrcWithoutAutoplay(result.embedHtml)} `
                }
            });
            if (videoList) {
                prompt = `${prompt} \n\n## Video Candidates\n\n${videoList} `
            }
        }
        prompt = `${prompt} \n\n## Web Context\n\nUse the following web results snippets as context for the generation of both description and fact generation.Summarize snippets if they are useful:
`
        searchResults.webPages?.value?.forEach(result => {
            if (result.snippet) {
                prompt += `\n\nTitle: ${result.name} \nSnippet: ${result.snippet} `
            }
        });

        prompt += `\n\nToday is ${getTodayStr()} `
    } catch (error) {
        console.error("Failed to get bing search results: ", error)
    }

    const result = streamObject({
        model: modelChoice,
        schema: entityCardSchema,
        system: prompt,
        prompt: context,
        onFinish: async ({ object }) => {
            if (object && context) {
                await redis.set(getAiTopicsRespCacheKey(context, modelChoice), object)
            }
        },
    })
    return result.toTextStreamResponse({
        headers: {
            'X-RateLimit-Limit': ''
        }
    });
}