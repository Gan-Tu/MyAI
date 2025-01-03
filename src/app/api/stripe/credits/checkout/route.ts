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

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { userId, returnPathname } = await req.json();
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
      allow_promotion_codes: true,
      success_url: `${req.headers.get('origin')}/${returnPathname || ''}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/${returnPathname || ''}?canceled=true&session_id={CHECKOUT_SESSION_ID}`,
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