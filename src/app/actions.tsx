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

"use server";

import redis from "@/lib/redis";
import replicate from "@/lib/replicate";
import {
  ImageSearchResult,
  PredictionWithInput,
  entityCardSchemaType,
} from "@/lib/types";
import {
  getAiTopicsImagesCacheKey,
  getAiTopicsRespCacheKey,
} from "@/lib/utils";

type OpenAIImageSearchResult = {
  type?: string;
  image_url?: string;
  thumbnail_url?: string;
  source_website_url?: string;
  caption?: string | null;
};

function collectOpenAIImageResults(
  value: unknown,
  results: OpenAIImageSearchResult[] = [],
) {
  if (!value || typeof value !== "object") return results;

  if (Array.isArray(value)) {
    for (const item of value) {
      collectOpenAIImageResults(item, results);
    }
    return results;
  }

  const item = value as Record<string, unknown>;
  if (
    item.type === "image_result" ||
    typeof item.image_url === "string" ||
    typeof item.thumbnail_url === "string"
  ) {
    results.push(item as OpenAIImageSearchResult);
  }

  for (const child of Object.values(item)) {
    collectOpenAIImageResults(child, results);
  }

  return results;
}

function toImageSearchResult(
  result: OpenAIImageSearchResult,
): ImageSearchResult | null {
  const link = result.image_url || result.thumbnail_url;
  if (!link) return null;

  return {
    link,
    title: result.caption || "Image result",
    image: result.source_website_url
      ? {
          contextLink: result.source_website_url,
        }
      : undefined,
  };
}

export async function searchImage(
  query: string,
): Promise<{ data?: ImageSearchResult[]; error?: string }> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return { error: "Missing OPENAI_API_KEY" };
    }

    let cacheKey = getAiTopicsImagesCacheKey(query);
    const cache: ImageSearchResult[] | null = await redis.get(cacheKey);
    if (cache) return { data: cache };

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5.5",
        reasoning: { effort: "low" },
        tools: [
          {
            type: "web_search",
            search_content_types: ["image"],
            image_settings: {
              max_results: 10,
              caption: true,
            },
          },
        ],
        include: ["web_search_call.results"],
        input: `Find image results for ${query.trim()}.`,
      }),
    });
    if (!response.ok) {
      throw new Error(`Error fetching images: ${response.status}`);
    }
    const body = await response.json();
    const items = collectOpenAIImageResults(body)
      .map(toImageSearchResult)
      .filter((item): item is ImageSearchResult => Boolean(item));

    if (items && query) {
      await redis.set(cacheKey, items);
      return { data: items };
    } else {
      return { error: "Failed to find any images" };
    }
  } catch (error) {
    console.error(error);
    return { error: JSON.stringify(error) };
  }
}

export async function getCachedAiTopics(
  query: string,
  model: string,
): Promise<{ data?: entityCardSchemaType; error?: string }> {
  try {
    const data: entityCardSchemaType | null = await redis.get(
      getAiTopicsRespCacheKey(query, model),
    );
    if (data) {
      return { data };
    }
    return { error: "Failed to find any response cache" };
  } catch (error) {
    console.error(error);
    return { error: JSON.stringify(error) };
  }
}

export async function getOrInitCreditsBalance(
  uid: string,
): Promise<{ balance?: number; error?: string }> {
  try {
    const key = `myai:credits:${uid}`;
    if (!(await redis.exists(key))) {
      // Initialize with 20 credits for new accounts
      await redis.set(key, 20);
      return { balance: 20 };
    } else {
      let value = await redis.get(key);
      return { balance: Number(value) };
    }
  } catch (error) {
    console.error(error);
    return { error: JSON.stringify(error) };
  }
}

export async function deductCreditsBalanceBy(
  uid: string,
  amount: number,
): Promise<{ balance?: number; error?: string }> {
  try {
    const key = `myai:credits:${uid}`;
    let curBalance = Number((await redis.get(key)) || "0");
    if (!curBalance) {
      return { error: "Insufficient balance" };
    }
    if (curBalance < amount) {
      return {
        error: `You have insufficient balance!\n${amount} credits needed, you have ${curBalance}`,
      };
    }
    let balance = await redis.decrby(key, amount);
    if (balance < 0) {
      // Race condition hit. Deposit money back.
      balance = await redis.incrby(key, amount);
      return {
        error: `You have insufficient balance!\n${amount} credits needed, you have ${balance}`,
        balance,
      };
    }
    return { balance };
  } catch (error) {
    console.error(error);
    return { error: JSON.stringify(error) };
  }
}

export async function setCreditsBalance(
  uid: string,
  balance: number,
): Promise<{ balance?: number; error?: string }> {
  try {
    const key = `myai:credits:${uid}`;
    await redis.set(key, balance);
    return { balance };
  } catch (error) {
    console.error(error);
    return { error: JSON.stringify(error) };
  }
}

export async function predictWithReplicate(
  input: object,
  model?: string,
  version?: string,
): Promise<{ prediction?: PredictionWithInput; error?: unknown }> {
  if (!model && !version) {
    return { error: "At least model or version is required" };
  } else if (!process.env.REPLICATE_WEBHOOK_URL) {
    return { error: "Missing REPLICATE_WEBHOOK_URL" };
  }
  try {
    let prediction = null;
    if (model) {
      prediction = await replicate.predictions.create({
        model,
        input,
        webhook: process.env.REPLICATE_WEBHOOK_URL,
        webhook_events_filter: ["completed"],
      });
    } else if (version) {
      prediction = await replicate.predictions.create({
        version,
        input,
        webhook: process.env.REPLICATE_WEBHOOK_URL,
        webhook_events_filter: ["completed"],
      });
    }
    if (prediction) {
      if (prediction?.error) {
        return { error: prediction.error };
      }
      await redis.json.set(`myai:replicate:${prediction.id}`, "$", {
        input,
        prediction,
      });
      return { prediction };
    }
    return { error: "Failed to create prediction" };
  } catch (error) {
    return { error: (error as Error).message };
  }
}
