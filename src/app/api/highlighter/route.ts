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

import { getHighlightingModel } from '@/lib/models';
import { checkRateLimit } from '@/lib/redis';
import { LanguageModel, streamText } from 'ai';
import { NextResponse } from 'next/server';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { prompt }: { prompt: string } = await req.json();

  let { passed, secondsLeft } = await checkRateLimit("/api/highlighter")
  if (!passed) {
    return NextResponse.json({
      error: `Rate Limited. ${secondsLeft && `${secondsLeft}s left`}.`
    }, { status: 429 })
  }

  let model: LanguageModel | null = null;
  try {
    model = getHighlightingModel()
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }

  const result = await streamText({
    model: model,
    prompt: prompt,
  });

  return result.toDataStreamResponse();
}
