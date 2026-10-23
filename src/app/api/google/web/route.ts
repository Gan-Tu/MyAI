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

import { NextResponse, type NextRequest } from 'next/server';
import { searchWebWithOpenAI } from '@/lib/openai-web-search';

// The helper can spend up to 60 seconds searching and summarizing sources.
export const maxDuration = 75;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('query')?.trim();

  if (!query) {
    return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 })
  }

  try {
    const items = await searchWebWithOpenAI(query, { signal: request.signal });
    return NextResponse.json({ data: items })
  } catch (error) {
    console.warn('Web search unavailable', {
      name: error instanceof Error ? error.name : 'UnknownError',
    });
    return NextResponse.json({ error: 'Web search is temporarily unavailable' }, { status: 500 })
  }
}
