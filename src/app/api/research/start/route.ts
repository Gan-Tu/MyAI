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
import { checkRateLimit } from "@/lib/redis";
import { startSession } from '@/lib/research';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { topic, userId, model } = await request.json();

  if (!topic) {
    return NextResponse.json({ error: 'topic is required' }, { status: 400 });
  } else if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 401 });
  } else if (!model) {
    return NextResponse.json({ error: 'model is required' }, { status: 401 });
  }

  let { passed, secondsLeft } = await checkRateLimit("/api/research/start")
  if (!passed) {
    return NextResponse.json({
      error: `Rate Limited. ${secondsLeft && `${secondsLeft}s left`}.`
    }, { status: 429 })
  }

  const session_id = await startSession(userId, topic, model);
  revalidatePath('/research')

  // // Trigger the first step immediately
  // await fetch(`${request.nextUrl.origin}/api/research/process`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json', 'user-id': userId },
  //   body: JSON.stringify({ id }),
  // });

  return NextResponse.json({ session_id });
}