import bing_search from '@/lib/agents';
import { getLanguageModel } from '@/lib/models';
import redis, { checkRateLimit } from "@/lib/redis";
import { entityCardSchema } from '@/lib/schema';
import { getAiTopicsRespCacheKey } from "@/lib/utils";
import { LanguageModel, streamObject } from 'ai';
import { NextResponse } from 'next/server';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const systemPrompt = `
# Topic Card Generation

Follow these rules precisely. Rules with capitalized instructions are mandatory. Follow word and characters count instructions strictly, unless it will degrade the clarity of topic card significantly.

Generate a informative, glanceable, knowledge topic card based on a user query with these components:

* **Title:** Brief, informative noun phrase representing main entity concept. Under 40 characters.
  * Do NOT use generic nouns and/or adjectives. (No terms like "overview", "explained", "details")
  * If user query is answer seeking and the answer has exactly one clear and distinct entity. Use the entity name as title. For example, if user query is "Adam wife" and the description is about "Olivia", use "Olivia" as title. If the answer contains multiple entities, do NOT do this.
  * If description is about food and drink recipe, do NOT use words like "recipe" and "ingredients" as title
* **Subtitle:** Prefered but optional. Under 5 words.
  * MUST adds value to title. Be objective, avoids verbs or subjective terms.
  * If topic is about an entity, PREFER using entity category as subtitle. Example entity categories include but NOT limited to "government regulation", "upcoming movie", "tv shows", "american singer", "tiktok influencer", etc.
  * Use only common nouns and/or adjectives. No verbs, adverbs, pronouns, or complex/unfamiliar terms.
  * The subtitle must be non-judgmental and objective. NO subjective words such as "healthy", "good", "beautiful", "nice", "dangerous" etc., as well as any potentially harmful or offensive language.
  * If no suitable subtitle exists or violates any of these rules, leave the subtitle field empty.
* **Description:** One or two paragraphs. Under 40-80 words in total. Summarize the topic's key attributes.
* **Highlighting:** 3-5 consecutive words from the description emphasizing a key point. Exact match of any description substring, not similar to title/query.
* **Facts:** Optional. Up to 3 succinct, unique facts about the topic.
  * **Name:** Declarative phrases or keywords. 1-3 words. Easy to understand.
    * Avoid including the primary and secondary subjects of the query.
        * **Example 1:** 
            * **User Query:** "HIIT exercises"
            * **Good:** "Benefits" 
            * **Bad:**  "Benefits of HIIT" (includes the query subject "HIIT")
        * **Example 2:**
            * **User Query:** "SpaceX"
            * **Good:** "Missions"
            * **Bad:** "SpaceX Missions" (includes the query subject "SpaceX") 
    * Do NOT use question format. Fact names should be declarative phrases or keywords.
        * **Good:**  "Length," "Benefits", "Causes"
        * **Bad:** "What is the length?", "What are the benefits?", "What causes...?"
    * Facts should be unique from each other in content.
  * **Short Answer:** 1-20 words. Concise, unambiguous summary. Not vague.
    * If fact is a single, short factual answer, use 1-3 words. 
    * If fact is a list answer, use a comma separated list of all the entities mentioned. Do NOT summarize list answers with a single numeric fact, such as "two daughters".
    * If fact is a long answer, and not suitable as either short answer or list answer, write a short summary of the full answer. 
        * **Good:**  "Effective when done regularly.", "Blending colors for gradient effects."
        * **Bad:** "Effective", "Blending"
  * **Full Answer:** 20-40 words, formatted properly.
    * If fact is a single, short factual answer, bold it in the long form answer as well.
    * If fact is a list answer, must use bulleted list items with **bold** formatting and item context.
    * Full answer should mention the short answer used as well for consistency.
  * When outputing facts, order fact with longest short answer aa the last fact.
  * PREFER outputing numerical facts, but only if they are highgly factual, or grounded in he given web snippets.
  * For exercises, prefer generating facts like "muscles worked". For sports queries, prefer outputting most relevant statistic or categorization for the sport.
  * PREFER outputting one short fact, one listy fact, one long fact, whenever possible.
* **Video** Optional. 
  * ONLY select videos that are instructional, or adds significant value, from provided candidates section. 
  * If candidates section is empty, do not select any.
  * Do NOT select a video for static or context-rich topics best understood via text.
  * Prefer selecting a video for media topics, such as music, tv, movies, etc.
  * Do NOT select videos about newsy events, such as legal cases.

## Output Format:

* Avoid using unicode characters.
* Avoid backslashes before dollar sign "$".
* Use provided today's date as context to reword response. Avoid forward looking terms ("tomorrow", "next week", "upcoming", etc.) for events that has happened.
`

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
    return `${year}-${month}-${day}`;
}


export async function POST(req: Request) {
    const context = await req.json();
    const headers = req.headers;
    const modelChoice = headers.get('X-AI-Model') || 'gpt-4o-mini'

    let { passed, secondsLeft } = await checkRateLimit("/api/ai-topics")
    if (!passed) {
        return NextResponse.json({
            error: `Rate Limited. ${secondsLeft && `${secondsLeft}s left`}.`
        }, { status: 429 })
    }

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
        prompt = `${prompt}\n\n## Web Context\n\nUse the following web results snippets as context for the generation of both description and fact generation. Summarize snippets if they are useful:
        `
        searchResults.webPages?.value?.forEach(result => {
            if (result.snippet) {
                prompt += `\n\nTitle: ${result.name}\nSnippet: ${result.snippet}`
            }
        });

        prompt += `\n\nToday is ${getTodayStr()}`
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
    return result.toTextStreamResponse({
        headers: {
            'X-RateLimit-Limit': ''
        }
    });
}