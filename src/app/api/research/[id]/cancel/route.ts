import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const userId = request.headers.get('X-User-Id');
  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 401 });
  }
  await query(
    'UPDATE research_sessions SET status = $1 WHERE id = $2 AND user_id = $3',
    ['canceled', id, userId]
  );
  return NextResponse.json({ success: true });
}