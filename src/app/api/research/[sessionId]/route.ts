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

import { deleteSession, getSession } from '@/lib/research';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const sessionId = (await params).sessionId
  if (!sessionId) {
    return NextResponse.json({ error: 'session id required' }, { status: 401 });
  }
  const res = await getSession(sessionId);
  if (!res) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }
  return NextResponse.json(res);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const sessionId = (await params).sessionId
  if (!sessionId) {
    return NextResponse.json({ error: 'session id required' }, { status: 401 });
  }
  const res = await deleteSession(sessionId);
  if (!res) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }
  return NextResponse.json(res);
}