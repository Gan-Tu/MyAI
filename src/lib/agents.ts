import { BingClient } from "@agentic/bing";

export default async function bing_search(query: string, count: number = 10) {
  const bing = new BingClient();
  return await bing.search({
    q: query,
    count: count
  });
}