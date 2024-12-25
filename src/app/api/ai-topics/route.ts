import { entityCardSchema } from '@/lib/schema';
import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const systemPrompt = `
# Topic Card Generation

Your task is to generate a topic card based on a user query. The card should include:

* **Title:** A brief, informative phrase (under 40 characters) representing the main topic of the user query.
* **Subtitle:** An optional short phrase (under 5 words) that categorize or further describe the title.
* **Description:** One or two paragraphs (40-80 words per paragraph) summarizing the topic's key attributes.
* **Highlighting:** A short consecutive substring (3-5 words) from the description paragraph highlighting the most important attribute or topic of the description. The highlighted phrase should be exactly the same words as it occured in the description. It should not be same or similar to the title or user query.
* **Facts:** At most 3 salient facts about the topic.

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
`

function getFakeResponseStream() {
    const jsonData = {
        "title": "Willow Chip by Google",
        "subtitle": "Technology company",
        "description": "Willow Chip is a cutting-edge technology developed by Google, designed to enhance machine learning and artificial intelligence applications. This chip focuses on optimizing performance and energy efficiency, making it suitable for a wide range of devices, from smartphones to data centers. With its advanced architecture, Willow Chip aims to accelerate processing speeds and improve overall computational capabilities, paving the way for more sophisticated AI solutions.",
        "highlighting": "enhance machine learning",
        "facts": [
            {
                "name": "Release Year",
                "full_answer": "Willow Chip was announced in 2023, showcasing Google's commitment to advancing AI technology.",
                "short_answer": "2023",
                "fact_type": "FACT_SEEKING",
                "is_numeric_fact": true,
                "has_image_grounding": false
            },
            {
                "name": "Energy Efficiency",
                "full_answer": "The Willow Chip is designed to be highly energy-efficient, reducing power consumption while maintaining high performance levels.",
                "short_answer": "High energy efficiency",
                "fact_type": "FACT_SEEKING",
                "is_numeric_fact": false,
                "has_image_grounding": false
            },
            {
                "name": "Applications",
                "full_answer": "Willow Chip can be utilized in various applications, including mobile devices, cloud computing, and AI-driven services.",
                "short_answer": "Mobile, cloud, AI services",
                "fact_type": "LIST_ANSWER_SEEKING",
                "is_numeric_fact": false,
                "has_image_grounding": false
            }
        ]
    }
    const stream = new ReadableStream({
        async start(controller) {
            // Split JSON data into chunks
            const chunks = JSON.stringify(jsonData).match(/.{1,50}/g); // Split into chunks of 50 characters
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

export async function POST(req: Request) {
    const context = await req.json();

    if (process.env.NODE_ENV === 'development') {
        return getFakeResponseStream();
    }

    const result = await streamObject({
        model: openai('gpt-4o-mini'),
        schema: entityCardSchema,
        system: systemPrompt,
        prompt: context,
    });

    return result.toTextStreamResponse();
}