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
      "whsec_5b9d2d3b725e493da74d6a4211aa4c4f7e70e93f1b3625bdc8998dba0d7b65f8"
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const creditsPurchased = parseInt(session.metadata?.creditsPurchased || '0');
      console.log("session", session)
      console.log("userId", userId)
      console.log("creditsPurchased", creditsPurchased)
      console.log("event", event)
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    let errorMsg = (error as Error).message
    console.error('Webhook error:', errorMsg);
    return NextResponse.json({ error: `Webhook Error: ${errorMsg}` }, { status: 400 });
  }
}