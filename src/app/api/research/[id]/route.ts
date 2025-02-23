import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const userId = request.headers.get('user-id'); // Extract from header
  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 401 });
  }
  const res = await query(
    'SELECT * FROM research_sessions WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  if (res.rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(res.rows[0]);
}