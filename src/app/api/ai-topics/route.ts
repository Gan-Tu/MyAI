import bing_search from '@/lib/agents';
import { getLanguageModel } from '@/lib/models';
import redis from "@/lib/redis";
import { entityCardSchema } from '@/lib/schema';
import { getAiTopicsRespCacheKey } from "@/lib/utils";
import { LanguageModel, streamObject } from 'ai';
import { NextResponse } from 'next/server';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const systemPrompt = `
# Topic Card Generation

Your task is to generate a topic card based on a user query. The card should include:

* **Title:** A brief, informative phrase (under 40 characters) representing the main topic of the user query.
* **Subtitle:** An optional short phrase (under 5 words) that categorize or further describe the title.
* **Description:** One or two paragraphs (40-80 words per paragraph) summarizing the topic's key attributes.
* **Highlighting:** A short consecutive substring (roughly 3-5 words but longer is ok) from the description paragraph highlighting the most important attribute or topic of the description. The highlighted phrase should be exactly the same words as it occured in the description. It should not be same or similar to the title or user query.
* **Facts:** At most 3 salient facts about the topic.
* **Video** An optional video selection for the query. Only select a video if it is highly instructional to the topic. Do not select a video for static or context-rich topics best understood via text. Only select the video mentioned in the video candidates section. If it's empty, do not select a video. Do NOT select a video for topics centered on persons, events, everyday topics, news, or legal cases.

## Title Guidelines

**Mandatory:**

* Do not include the unnecessary generic overview words in title, such as "overview", "explained", "details", "explained", case insensitive.

## Subtitle Guidelines

**Mandatory:**

* ONLY provide a subtitle if it adds value to the title.
* Prefer adding subtitle whenever possible.
* Use only common nouns and/or adjectives. (No verbs, adverbs, pronouns, or complex/unfamiliar terms).
* The subtitle must be non-judgmental and objective. This means the subtitles should not contain subjective words such as "healthy", "good", "beautiful", "nice", "dangerous" etc., as well as any potentially harmful or offensive language.
* Avoid overly broad or generic subtitles.
* If the title refers to a company, include the word "company" in the subtitle.
* If the descrirption is about food or drinks, avoid naming subtitle indicating it's receipe. Examples include not using words like "recipe", "how to make", "ingredients", "preparation", etc.
* If no suitable subtitle exists or violates any of these rules, leave the subtitle field empty.

## Fact Guidelines

**Mandatory:**

* **Structure:** Each fact must have a 'name', 'full_answer', and 'short_answer'.
* **Relevance:** All facts should be about the same key topic as the user query not some related topic or subject.
  * **Example 1:**
        * **User Query:** "Golden Gate Bridge"
        * **Good:** "Length", "Design", "History"
        * **Bad:** "Bridges in Europe" (unrelated topic)
  * **Example 2:**
        * **User Query:** "simone biles vault jump"
        * **Good:** "Difficulty", "Debut Date"
        * **Bad:** "Vault weight" (vault equipment is not the main topic), "Olympics Medals" (Simone Biles is not the main topic)
* **Diversity:** Explore different facets of the main topic.
* **User Priority:** Consider what information users are *most likely* to seek first when researching the main topic. Leverage the context and your knowledge of common information needs.
* **Clarity:** Facts should be easy to understand. Avoid facts with uncertain or ambiguous answers.
* **Timelessness:** Avoid facts that are overly complex, tangential, time-sensitive, or likely to become outdated.
* **No Duplicates:** Facts are *unique* and should not duplicate information in the description.

**Fact Name:**

* 1-3 words, unique, and succinctly represents the fact.
* Avoid including the primary and secondary subjects of the query.
    * **Example 1:** 
        * **User Query:** "HIIT exercises"
        * **Good:** "Benefits" 
        * **Bad:**  "Benefits of HIIT" (includes the query subject "HIIT")
    * **Example 2:**
        * **User Query:** "SpaceX"
        * **Good:** "Missions"
        * **Bad:** "SpaceX Missions" (includes the query subject "SpaceX") 
* **Do not** use question format for fact names. Fact names should be declarative phrases or keywords.
    * **Good:**  "Length," "Benefits", "Causes"
    * **Bad:** "What is the length?", "What are the benefits?", "What causes...?"
* **Clarity:** Fact names should be easy to understand on their own.

**Fact Types:**

* **FACT_SEEKING:** Single factual answer in under 3 words.
    * 'is_numeric_fact': True if the answer is a numeric value with units (e.g., 100 miles) or a date.
    * 'has_image_grounding': True if the short answer is an entity with an associated image.
* **LIST_ANSWER_SEEKING:**  Answer formatted as bullet points.
    * 'has_image_grounding': True if the list items are entities and the first item has an associated image.
* **LONG_ANSWER_SEEKING:** Single long answer, not suitable for bullet points.
* **WEB_RESULTS_SEEKING:** Multi-faceted answer best served by web pages, videos, or images.

**Fact Full Answer:**

* 20-40 words.
* Bulleted list items with **bold** formatting and optional item context for 'LIST_ANSWER_SEEKING' facts.
    * **Example:**
        * **Good:** "* **Item 1**\n* **Item 2**\n* **Item 3**", "* **Item 1:** Item 1 context\n* **Item2:** Item 2 context"
        * **Bad:** "**Item 1:** Item 1 context\n**Item2:** Item 2 context" (missing bullet points)

**Fact Short Answer:**

* Avoid vague phrases.
* 1-3 words for 'FACT_SEEKING'.
* Comma-separated items for 'LIST_ANSWER_SEEKING'.
* Under 10-word summary for 'LONG_ANSWER_SEEKING' and 'WEB_RESULTS_SEEKING'. A short summary of the full answer.
    * **Good:**  "Effective when done regularly.", "Blending colors for gradient effects."
    * **Bad:** "Effective", "Blending"

## Output Format:

**Mandatory:**

* Avoid using unicode characters.
* Avoid backslashes before dollar sign "$". 
* The highlighted phrase should be exactly the same words as it occured in the description.
* Provide factual information. For numeric facts and statements, if you are not sure, do not include them.
* Avoid using video if possible.
`

function getFakeResponseStream(jsonData: object) {
    const stream = new ReadableStream({
        async start(controller) {
            // Split into chunks of 50 characters
            const chunks = JSON.stringify(jsonData).match(/.{1,50}/g);
            if (chunks) {
                for (const chunk of chunks) {
                    // Enqueue the chunk
                    controller.enqueue(new TextEncoder().encode(chunk));
                    // Delay before sending the next chunk
                    await new Promise((resolve) => setTimeout(resolve, 100)); // 100ms delay
                }
            }
            // Close the stream after all chunks are sent
            controller.close();
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "application/json", // Or "text/plain"
        },
    });
}

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


export async function POST(req: Request) {
    const context = await req.json();
    const headers = req.headers;
    const modelChoice = headers.get('X-AI-Model') || 'gpt-4o-mini'

    let model: LanguageModel | null = null;
    try {
        model = getLanguageModel(modelChoice)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: (error as Error).message }, { status: 400 })
    }


    let prompt = systemPrompt
    try {
        let searchResults = await bing_search(context, 10);
        if (searchResults.videos) {
            let videoList = ''
            searchResults.videos?.value?.forEach(result => {
                if (result.name && result.allowMobileEmbed && result.embedHtml?.includes("youtube")
                    && result.height <= result.width) {
                    videoList += `\n\nName: ${result.name}\nUrl: ${extractVideoSrcWithoutAutoplay(result.embedHtml)}`
                }
            });
            if (videoList) {
                prompt = `${prompt}\n\n## Video Candidates\n\n${videoList}`
            }
        }
        prompt = `${prompt}\n\n## Context\n\nUse the following web results snippets as context for the generation of both description and fact generation. Summarize snippets if they are useful:
        `
        searchResults.webPages?.value?.forEach(result => {
            if (result.snippet) {
                prompt += `\n\nTitle: ${result.name}\nSnippet: ${result.snippet}`
            }
        });
    } catch (error) {
        console.error("Failed to get bing search results: ", error)
    }

    const result = await streamObject({
        model: model,
        schema: entityCardSchema,
        system: prompt,
        prompt: context,
        onFinish: async ({ object }) => {
            if (object && context) {
                await redis.set(getAiTopicsRespCacheKey(context, modelChoice), object)
            }
        },
    })
    return result.toTextStreamResponse();
}