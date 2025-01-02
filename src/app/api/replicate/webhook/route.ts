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