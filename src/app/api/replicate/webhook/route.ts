import redis from "@/lib/redis";
import { NextResponse } from 'next/server';
import { validateWebhook, type Prediction } from 'replicate';

export async function POST(request: Request) {
  try {
    const secret = process.env.REPLICATE_WEBHOOK_SIGNING_SECRET;
    if (secret && !await validateWebhook(request.clone(), secret)) {
      return NextResponse.json({ error: "Failed to validate webhook signing secret" }, { status: 401 });
    }
    console.log("Webhook is valid!");
    const prediction: Prediction = await request.json();
    if (prediction.id) {
      await redis.json.set(`myai:replicate:${prediction.id}`, "$.prediction", { ...prediction });
      console.log("Updated redis prediction!");
    }
    console.log("Webhook processed!");
    return NextResponse.json({ detail: "Webhook processed" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}