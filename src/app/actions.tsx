"use server";

import { ImageSearchResult } from "@/lib/types";

export async function searchImage(
  query: string
): Promise<{ data?: ImageSearchResult[]; error?: string }> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?q=${query.trim()}&cx=${process
        .env.GOOGLE_SEARCH_ENGINE_ID!}&key=${process.env
        .GOOGLE_SEARCH_API_KEY!}&searchType=image&num=10`
    );
    if (!response.ok) {
      throw new Error(`Error fetching images: ${response.status}`);
    }
    const { items } = await response.json();
    if (items) {
      return { data: items };
    } else {
      return { error: "Failed to find any images" };
    }
  } catch (error) {
    console.error(error);
    return { error: JSON.stringify(error) };
  }
}
