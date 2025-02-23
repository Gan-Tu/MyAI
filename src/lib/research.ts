import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

const RESEARCH_MODEL = openai("gpt-4o-mini");

export async function generatePlan(topic: string): Promise<{ subTopics: string[]; thoughts: string }> {
  const { text } = await generateText({
    model: RESEARCH_MODEL,
    prompt: `Generate a research plan for the topic: "${topic}". First, explain your thought process for what you plan to do and what might need more research. Then, list the sub-topics or queries to investigate as a numbered list.`,
  });

  const [thoughts, subTopicsText] = text.split(/(?=\n\s*1\.)/);
  const subTopics = subTopicsText
    .split('\n')
    .map((line) => line.replace(/^\d+\.\s*/, '').trim())
    .filter((line) => line);

  return { subTopics, thoughts: thoughts.trim() };
}

export async function performSearch(query: string): Promise<string[]> {
  const res = await fetch(`/api/google/web?query=${encodeURIComponent(query)}`);
  const { data } = await res.json();
  const snippets = data.map((item: any) => item.snippet || '');

  // Fetch markdown content from top 3 URLs
  const markdownContents = await Promise.all(
    data.slice(0, 3).map(async (item: any) => {
      try {
        const scrapeRes = await fetch(`https://urlreader.tugan.app/api/scrape?url=${encodeURIComponent(item.link)}`);
        const markdown = await scrapeRes.text();
        return markdown;
      } catch (error) {
        console.error(`Failed to scrape ${item.link}:`, error);
        return item.snippet; // Fallback to snippet if scraping fails
      }
    })
  );

  return markdownContents.filter((content) => content.length > 0);
}

export async function summarizeFindings(findings: string[]): Promise<{ summary: string; needsMoreResearch: string }> {
  const prompt = `Summarize these findings into a concise paragraph: "${findings.join('\n')}". Then, explain what you think needs more research based on this summary.`;
  const { text } = await generateText({
    model: RESEARCH_MODEL,
    prompt,
  });
  const [summary, needsMoreResearch] = text.split(/(?=\n\s*Based on this summary,)/i); // Split at transition
  return { summary: summary.trim(), needsMoreResearch: (needsMoreResearch || '').trim() };
}

export async function compileReport(
  topic: string,
  summaries: { subTopic: string; summary: string }[]
): Promise<string> {
  const summariesText = summaries
    .map((s) => `Sub-topic: ${s.subTopic}\n${s.summary}`)
    .join('\n\n');
  const prompt = `Compile a final research report on "${topic}" with an introduction, the following summaries, and a conclusion:\n\n${summariesText}`;
  const { text } = await generateText({
    model: RESEARCH_MODEL,
    prompt,
  });
  return text;
}