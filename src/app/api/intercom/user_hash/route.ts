import crypto from 'crypto';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'User ID is required and must be a string' }, { status: 400 });
    }

    const secretKey = process.env.INTERCOM_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: 'Server misconfiguration: Missing secret key' }, { status: 500 });
    }

    // Generate HMAC hash
    const hash = crypto.createHmac('sha256', secretKey).update(userId).digest('hex');

    return NextResponse.json({ user_hash: hash });
  } catch (error) {
    console.error('Error generating Intercom HMAC:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
