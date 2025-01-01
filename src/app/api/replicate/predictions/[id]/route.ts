import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) {
    return NextResponse.json(
      { error: "Missing required parameter 'id'" }, { status: 400 }
    );
  }
  const prediction = await replicate.predictions.get(id);
  if (prediction?.error) {
    return NextResponse.json({ error: prediction.error }, { status: 500 });
  }
  return NextResponse.json(prediction);
}