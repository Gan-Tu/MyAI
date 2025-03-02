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
// 
import { query } from '@/lib/db';
import { checkRateLimit } from "@/lib/redis";
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { topic } = await request.json();
  const userId = request.headers.get('X-User-Id');
  const modelChoice = request.headers.get('X-AI-Model') || 'gpt-4o-mini'

  if (!topic) {
    return NextResponse.json({ error: 'Topic required' }, { status: 400 });
  }
  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 401 });
  }
  if (!modelChoice) {
    return NextResponse.json({ error: 'modelChoice is required' }, { status: 401 });
  }

  let { passed, secondsLeft } = await checkRateLimit("/api/ai-topics")
  if (!passed) {
    return NextResponse.json({
      error: `Rate Limited. ${secondsLeft && `${secondsLeft}s left`}.`
    }, { status: 429 })
  }

  const res = await query(
    'INSERT INTO research_sessions (user_id, topic, model) VALUES ($1, $2, $3) RETURNING id',
    [userId, topic, modelChoice]
  );
  const id = res.rows[0].id;

  // // Trigger the first step immediately
  // await fetch(`${request.nextUrl.origin}/api/research/process`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json', 'user-id': userId },
  //   body: JSON.stringify({ id }),
  // });

  return NextResponse.json({ id });
}