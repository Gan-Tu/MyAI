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
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('query');
  const count = Number(searchParams.get('count')) || 10;

  if (!query) {
    return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 })
  } else if (!count || count <= 0) {
    return NextResponse.json({ error: 'Missing positive count parameter' }, { status: 400 })
  }

  try {
    const searchResults = await bing_search(query, count);
    return NextResponse.json(searchResults.images)
  } catch (error) {
    return NextResponse.json({ error: JSON.stringify(error) }, { status: 500 })
  }
}