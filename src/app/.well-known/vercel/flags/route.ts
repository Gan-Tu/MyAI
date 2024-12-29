import { verifyAccess, type ApiData } from '@vercel/flags';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const access = await verifyAccess(request.headers.get('Authorization'));
  if (!access) return NextResponse.json(null, { status: 401 });


  return NextResponse.json<ApiData>({
    definitions: {
      "show-login": {
        description: 'Whether to show login endpoint',
        // origin: 'https://app.launchdarkly.com/projects/default/flags/myai_show_login',
        options: [
          { value: false, label: 'on' },
          { value: true, label: 'off' },
        ],
      }
    }
  });
}