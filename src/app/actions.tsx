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

export async function searchImage(
  query: string,
): Promise<{ data?: ImageSearchResult[]; error?: string }> {
  try {
    let cacheKey = getAiTopicsImagesCacheKey(query);
    const cache: ImageSearchResult[] | null = await redis.get(cacheKey);
    if (cache) return { data: cache };

    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?q=${query.trim()}&cx=${process
        .env.GOOGLE_SEARCH_ENGINE_ID!}&key=${process.env
        .GOOGLE_SEARCH_API_KEY!}&searchType=image&num=10`,
    );
    if (!response.ok) {
      throw new Error(`Error fetching images: ${response.status}`);
    }
    const { items } = await response.json();
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
