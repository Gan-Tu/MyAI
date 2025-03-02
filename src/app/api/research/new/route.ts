import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { topic } = await request.json();
  const userId = request.headers.get('X-User-Id');
  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 401 });
  }
  if (!topic) {
    return NextResponse.json({ error: 'Topic required' }, { status: 400 });
  }
  const res = await query(
    'INSERT INTO research_sessions (user_id, topic) VALUES ($1, $2) RETURNING id',
    [userId, topic]
  );
  const id = res.rows[0].id;

  // Trigger the first step immediately
  await fetch(`${request.nextUrl.origin}/api/research/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'user-id': userId },
    body: JSON.stringify({ id }),
  });

  return NextResponse.json({ id });
}