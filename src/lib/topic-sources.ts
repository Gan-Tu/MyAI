import type { WebSearchResult } from "@/lib/openai-web-search";

// Add provider-supplied sources to the streamed object without asking the
// generation model to reproduce (or invent) source URLs.
export function withTopicSources(
  response: Response,
  sources: WebSearchResult[],
) {
  if (!response.body) return response;
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let started = false;
  let awaitingField = true;
  const body = response.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        let text = decoder.decode(chunk, { stream: true });
        let prefix = "";
        if (!started) {
          text = text.trimStart();
          if (!text) return;
          if (!text.startsWith("{"))
            throw new Error("Invalid topic object stream");
          prefix = `{"sources":${JSON.stringify(sources)}`;
          text = text.slice(1);
          started = true;
        }
        if (awaitingField && text.trimStart()) {
          if (!text.trimStart().startsWith("}")) prefix += ",";
          awaitingField = false;
        }
        controller.enqueue(encoder.encode(prefix + text));
      },
      flush(controller) {
        controller.enqueue(encoder.encode(decoder.decode()));
      },
    }),
  );
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(body, { status: response.status, headers });
}
