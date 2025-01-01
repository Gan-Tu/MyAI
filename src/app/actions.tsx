"use server";

import redis from "@/lib/redis";
import replicate from "@/lib/replicate";
import {
  ImageSearchResult,
  entityCardSchemaType,
  type PredictModelOptions,
  type PredictVersionOptions,
} from "@/lib/types";
import {
  getAiTopicsImagesCacheKey,
  getAiTopicsRespCacheKey,
} from "@/lib/utils";
import { type Prediction } from "replicate";

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
      // Initialize with 15 credits for new accounts
      await redis.set(key, 15);
      return { balance: 15 };
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

export async function predictWithModel(
  input: object,
  model: string,
): Promise<{ prediction?: Prediction; error?: unknown }> {
  try {
    let options: PredictModelOptions = { model, input };
    if (process.env.REPLICATE_WEBHOOK_URL) {
      options.webhook = process.env.REPLICATE_WEBHOOK_URL;
      options.webhook_events_filter = ["completed"];
    }
    const prediction = await replicate.predictions.create(options);
    if (prediction?.error) {
      return { error: prediction.error };
    }
    await redis.json.set(`myai:replicate:${prediction.id}`, "$", {
      input,
      prediction,
    });
    return { prediction };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export async function predictWithVersion(
  input: object,
  version: string,
): Promise<{ prediction?: Prediction; error?: unknown }> {
  try {
    let options: PredictVersionOptions = { version, input };
    if (process.env.REPLICATE_WEBHOOK_URL) {
      options.webhook = process.env.REPLICATE_WEBHOOK_URL;
      options.webhook_events_filter = ["completed"];
    }
    const prediction = await replicate.predictions.create(options);
    if (prediction?.error) {
      return { error: prediction.error };
    }
    await redis.json.set(`myai:replicate:${prediction.id}`, "$", {
      input,
      prediction,
    });
    return { prediction };
  } catch (error) {
    return { error: (error as Error).message };
  }
}
