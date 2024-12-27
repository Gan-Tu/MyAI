import bing_search from '@/lib/agents';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const count = Number(searchParams.get('count')) || 10;

  if (!query) {
    return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 })
  } else if (!count || count <= 0) {
    return NextResponse.json({ error: 'Missing positive count parameter' }, { status: 400 })
  }

  try {
    const searchResults = await bing_search(query, count);
    return NextResponse.json(searchResults)
  } catch (error) {
    return NextResponse.json({ error: JSON.stringify(error) }, { status: 500 })
  }
}