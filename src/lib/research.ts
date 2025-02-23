import { openai } from '@ai-sdk/openai';
import { generateObject, generateText } from 'ai';
import { z } from "zod";

export async function generatePlan(topic: string): Promise<{ subTopics: string[]; thoughts: string }> {
  const { text } = await generateText({
    model: openai('gpt-4o-mini'),
    prompt: `For the topic: "${topic}", provide a brief thought process (1-2 sentences) on what you plan to do and what might need more research. Then, list 3-5 concise sub-topics or queries to investigate as a numbered list.`,
  });

  const [thoughts, subTopicsText] = text.split(/(?=\n\s*1\.)/); // Split at first numbered item
  const subTopics = subTopicsText
    .split('\n')
    .map((line) => line.replace(/^\d+\.\s*/, '').trim())
    .filter((line) => line)
    .slice(0, 5); // Limit to 5 sub-topics for brevity

  return { subTopics, thoughts: thoughts.trim().substring(0, 200) }; // Limit thoughts to 200 chars for brevity
}

export async function performSearch(query: string): Promise<string[]> {
  // Removed Google search and URL scraping. Simulate LLM-based research content
  const { text } = await generateText({
    model: openai('gpt-4o-mini'),
    prompt: `Generate 3 concise, hypothetical insights about "${query}" as if conducting research without web searches. Format each insight as a single sentence.`,
  });

  const insights = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line)
    .slice(0, 3); // Limit to 3 insights

  return insights;
}

export async function summarizeFindings(findings: string[]): Promise<{ summary: string; needsMoreResearch: string }> {
  const findingsText = findings.join('\n');

  const result = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: z.object({
      summary: z.string().describe('A concise one-sentence summary of the 3 findings, under 75 words.'),
      needsMoreResearch: z.string().describe('A concise one-sentence explanation of what might need more research, under 75 words. If no research is needed, output emtpy string'),
    }),
    prompt: `Given these 3 findings: "${findingsText}", provide a concise summary in one sentence (under 75 words) and a one-sentence explanation of what might need more research (under 75 words). Ensure the total output is under 150 words, and return the results in JSON format.`,
  });

  return {
    summary: result.object.summary.trim(),
    needsMoreResearch: result.object.needsMoreResearch.trim(),
  };
}

export async function compileReport(
  topic: string,
  summaries: { subTopic: string; summary: string }[]
): Promise<string> {
  const summariesText = summaries
    .map((s) => `Sub-topic: ${s.subTopic}\n${s.summary}`)
    .join('\n\n');
  const { text } = await generateText({
    model: openai('gpt-4o-mini'),
    prompt: `Compile a concise final research report on "${topic}" with a brief introduction (1 sentence), the following summaries, and a brief conclusion (1 sentence):\n\n${summariesText}`,
  });
  return text.substring(0, 1000); // Limit report to 1000 chars for brevity
}