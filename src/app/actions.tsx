"use server";

import redis from "@/lib/redis";
import { ImageSearchResult, entityCardSchemaType } from "@/lib/types";
import { getAiTopicsImagesCacheKey, getAiTopicsRespCacheKey } from "@/lib/utils";

export async function searchImage(
  query: string
): Promise<{ data?: ImageSearchResult[]; error?: string }> {
  try {
    let cacheKey = getAiTopicsImagesCacheKey(query)
    const cache: ImageSearchResult[] | null = await redis.get(cacheKey);
    if (cache) return { data: cache };

    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?q=${query.trim()}&cx=${process
        .env.GOOGLE_SEARCH_ENGINE_ID!}&key=${process.env
        .GOOGLE_SEARCH_API_KEY!}&searchType=image&num=10`
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
  model: string
): Promise<{ data?: entityCardSchemaType; error?: string }> {
  try {
    const data: entityCardSchemaType | null = await redis.get(
      getAiTopicsRespCacheKey(query, model)
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
