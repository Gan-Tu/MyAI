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

import redis from '@/lib/redis';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  try {
    const sig = req.headers.get('stripe-signature');
    if (!sig) {
      return NextResponse.json({ error: "Missing stripe signature" });
    }
    const payload = await req.text(); // Stripe expects the raw body
    const event = stripe.webhooks.constructEvent(
      payload,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const creditsPurchased = parseInt(session.metadata?.creditsPurchased || '0');
      if (!userId) {
        return NextResponse.json({ error: `Missing user id` }, { status: 500 });
      } else if (!creditsPurchased) {
        return NextResponse.json({ error: `Missing credits purchased` }, { status: 500 });
      }
      const processed = await redis.sadd(`myai:payments:${userId}`, session.payment_intent)
      if (processed > 0) {
        await redis.incrby(`myai:credits:${userId}`, creditsPurchased)
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    let errorMsg = (error as Error).message
    console.error('Webhook error:', errorMsg);
    return NextResponse.json({ error: `Webhook Error: ${errorMsg}` }, { status: 400 });
  }
}