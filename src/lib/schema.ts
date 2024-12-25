import { z } from "zod";

export const entityCardSchema = z.object({
  title: z.string().describe("A brief, informative phrase (under 40 characters) representing the main topic of the user query."),
  subtitle: z.string().describe("A short phrase (under 5 words) that categorize or further describe the title."),
  description: z.string().describe("One or two paragraphs (40-80 words per paragraph) summarizing the topic's key attributes."),
  highlighting: z.string().describe("A short consecutive substring (3-5 words) from the description paragraph highlighting the most important attribute or topic of the description. The highlighted phrase should be exactly as it occured in the description."),
  facts: z.array(
    z.object({
      name: z.string().describe("1-3 words, unique, and succinctly represents the fact"),
      full_answer: z.string().describe("20-40 words of the full fact"),
      short_answer: z.string().describe("Under 10-word summary for the fact"),
      fact_type: z.enum(["FACT_SEEKING", "LIST_ANSWER_SEEKING", "LONG_ANSWER_SEEKING", "WEB_RESULTS_SEEKING"]).describe("The type of fact"),
      is_numeric_fact: z.boolean().describe("True if the answer is a numeric value with units (e.g., 100 miles) or a date."),
      has_image_grounding: z.boolean().describe("True if the short answer is an entity with an associated image."),
    })
  ).describe("At most 3 salient facts about the topic."),
});