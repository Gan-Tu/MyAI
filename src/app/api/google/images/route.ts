import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('query');;

  if (!query) {
    return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 })
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?q=${query.trim()}&cx=${process
        .env.GOOGLE_SEARCH_ENGINE_ID!}&key=${process.env
          .GOOGLE_SEARCH_API_KEY!}&searchType=image&num=10`
    );
    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch images: ${response.statusText}` }, { status: response.status })
    }
    const { items } = await response.json();
    return NextResponse.json({ data: items })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}