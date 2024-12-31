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