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

import { getLanguageModel } from '@/lib/models';
import { checkRateLimit } from '@/lib/redis';
import { LanguageModel, streamText } from 'ai';
import { NextResponse } from 'next/server';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { prompt }: { prompt: string } = await req.json();
  const headers = req.headers;
  const modelChoice = headers.get('X-AI-Model') || 'gpt-4o-mini'

  let { passed, secondsLeft } = await checkRateLimit("/api/web-summarizer")
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

  const scrapeResponse = await fetch(`https://urlreader.tugan.app/api/scrape?waitForTimeoutSeconds=15&url=${encodeURIComponent(prompt)}&json=1`);
  if (!scrapeResponse.ok) {
    return NextResponse.json(
      { error: `Failed to fetch URL content: ${scrapeResponse.statusText}` }, {
        status: 500

    }
    );
  }
  const { error, title, markdownContent } = await scrapeResponse.json();
  if (error) {
    return NextResponse.json({ error: `Failed to fetch URL content: ${error}` }, { status: 500 });
  }

  const result = await streamText({
    model: model,
    prompt: `
      You are an AI assistant specialized in summarizing web content. Given webpage content in Markdown format, generate a concise high level summary, no more than 3 paragraphs or 20% of original content length. Each paragraph should cover a distinct aspect of the content.

      **Instructions:**
      1. Extract key information, including main points, arguments, facts, and conclusions.
      2. Organize the summary into paragraphs, each focusing on a unique topic.
      3. Use clear and professional language. Avoid jargon unless necessary.
      4. Handle Markdown elements as follows:
          - **Headings:** Use them to determine paragraph topics without reproducing them verbatim.
          - **Lists:** Condense into concise sentences or short paragraphs.
          - **Links:** Reference linked content if relevant without including hyperlinks. For example, "More information can be found on the company's website."
          - **Images:** Incorporate relevant information from alt text if available.
          - **Emphasis:** Use sparingly and only when crucial.
      5. Maintain a neutral and objective tone.
      6. Ensure factual accuracy and avoid hallucinations.
      7. Exclude unnecessary Markdown or HTML content such as headers, footers, and breadcrumbs.

      **Output:** Summary (string) with paragraphs separated by double line breaks (\n\n).

      ** Input:** Markdown formatted webpage content (string):\n\n

      # Webpage Title
      ${title}

      # Webpage Content
      ${markdownContent}
    `,
  });

  return result.toDataStreamResponse();
}
