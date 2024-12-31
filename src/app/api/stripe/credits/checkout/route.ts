import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: "Missing user id" }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: process.env.STRIPE_100_CREDITS_PRICE_ID!,
          quantity: 1,
          adjustable_quantity: {
            enabled: false,
          }
        },
      ],
      mode: 'payment',
      metadata: { userId: userId, creditsPurchased: 100 },
      success_url: `${req.headers.get('origin')}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/?canceled=true&session_id={CHECKOUT_SESSION_ID}`,
    });

    // Return the session URL to the client
    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}