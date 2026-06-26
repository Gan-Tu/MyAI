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
import { NextResponse } from "next/server";
import { z } from "zod";

const creditsRequestSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("getOrInit"),
    uid: z.string().min(1),
  }),
  z.object({
    action: z.literal("deduct"),
    uid: z.string().min(1),
    amount: z.number().int().positive(),
  }),
]);

function getCreditsKey(uid: string) {
  return `myai:credits:${uid}`;
}

export async function POST(req: Request) {
  try {
    const body = creditsRequestSchema.parse(await req.json());
    const key = getCreditsKey(body.uid);

    if (body.action === "getOrInit") {
      if (!(await redis.exists(key))) {
        await redis.set(key, 20);
        return NextResponse.json({ balance: 20 });
      }

      const value = await redis.get(key);
      return NextResponse.json({ balance: Number(value) });
    }

    const currentBalance = Number((await redis.get(key)) || "0");
    if (!currentBalance) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 },
      );
    }
    if (currentBalance < body.amount) {
      return NextResponse.json(
        {
          error: `You have insufficient balance!\n${body.amount} credits needed, you have ${currentBalance}`,
        },
        { status: 400 },
      );
    }

    let balance = await redis.decrby(key, body.amount);
    if (balance < 0) {
      balance = await redis.incrby(key, body.amount);
      return NextResponse.json(
        {
          error: `You have insufficient balance!\n${body.amount} credits needed, you have ${balance}`,
          balance,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ balance });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to update credits",
      },
      { status: 500 },
    );
  }
}
