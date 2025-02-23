import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const userId = request.headers.get('user-id'); // Extract from header
  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 401 });
  }
  const res = await query(
    'SELECT id, topic, status FROM research_sessions WHERE user_id = $1',
    [userId]
  );
  return NextResponse.json(res.rows);
}