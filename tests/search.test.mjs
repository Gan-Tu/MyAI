import assert from "node:assert/strict";
import test, { afterEach, beforeEach } from "node:test";
import { loadTs } from "./helpers/load-ts.mjs";

const models = {
  defaultOpenAIResponsesModel: "existing-model",
  defaultLanguageModel: "openai/existing-model",
};
const { searchWebWithOpenAI } = loadTs("src/lib/openai-web-search.ts", {
  "@/lib/models": models,
});
const { withTopicSources } = loadTs("src/lib/topic-sources.ts");
const { GET } = loadTs("src/app/api/google/web/route.ts", {
  "@/lib/models": models,
});
const { searchImagesWithOpenAI } = loadTs("src/lib/openai-image-search.ts", {
  "@/lib/models": models,
});
const originalFetch = globalThis.fetch;
const originalKey = process.env.OPENAI_API_KEY;
beforeEach(() => {
  process.env.OPENAI_API_KEY = "test-key";
});
afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalKey === undefined) delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY = originalKey;
});

function fixture() {
  const text = "A useful fact about the topic. [1]\nAnother useful fact. [2]";
  return {
    status: "completed",
    output: [
      {
        type: "web_search_call",
        status: "completed",
        action: {
          sources: [
            { url: "https://example.com/a" },
            { url: "https://example.org/b" },
            { url: "https://example.net/extra" },
            { url: "javascript:alert(1)" },
          ],
        },
      },
      {
        type: "message",
        content: [
          {
            type: "output_text",
            text,
            annotations: [
              {
                type: "url_citation",
                url: "https://example.com/a",
                title: "First source",
                start_index: text.indexOf("[1]"),
                end_index: text.indexOf("[1]") + 3,
              },
              {
                type: "url_citation",
                url: "https://example.org/b",
                title: "Second source",
                start_index: text.indexOf("[2]"),
                end_index: text.indexOf("[2]") + 3,
              },
              {
                type: "url_citation",
                url: "data:text/html,nope",
                title: "Unsafe",
              },
            ],
          },
        ],
      },
    ],
  };
}
const respond = (body) => {
  globalThis.fetch = async () => Response.json(body);
};
const request = (query) => {
  const url = new URL("http://localhost/api/google/web");
  if (query !== undefined) url.searchParams.set("query", query);
  return { nextUrl: url, signal: new AbortController().signal };
};

test("web search uses the existing provider, requires search, and preserves special characters", async () => {
  let input;
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "https://api.openai.com/v1/responses");
    input = JSON.parse(options.body);
    assert.equal(options.headers.Authorization, "Bearer test-key");
    assert.equal(options.signal.aborted, false);
    assert.equal(options.cache, "no-store");
    return Response.json(fixture());
  };
  const results = await searchWebWithOpenAI("  C++ & cats? 日本語 #tag  ");
  assert.equal(input.input, "C++ & cats? 日本語 #tag");
  assert.equal(input.model, models.defaultOpenAIResponsesModel);
  assert.equal(input.tool_choice, "required");
  assert.deepEqual(input.include, ["web_search_call.action.sources"]);
  assert.deepEqual(results, [
    {
      title: "First source",
      link: "https://example.com/a",
      displayLink: "example.com",
      snippet: "A useful fact about the topic.",
    },
    {
      title: "Second source",
      link: "https://example.org/b",
      displayLink: "example.org",
      snippet: "Another useful fact.",
    },
    {
      title: "example.net",
      link: "https://example.net/extra",
      displayLink: "example.net",
      snippet: "",
    },
  ]);
});

test("results deduplicate and cap at ten without accepting generated URLs", async () => {
  const body = fixture();
  body.output[0].action.sources.push(
    ...Array.from({ length: 20 }, (_, i) => ({
      url: `https://example.net/${i}`,
    })),
  );
  body.output[1].content[0].text += "\nhttps://made-up.invalid";
  respond(body);
  const results = await searchWebWithOpenAI("topic");
  assert.equal(results.length, 10);
  assert.equal(new Set(results.map((r) => r.link)).size, 10);
  assert.ok(!results.some((r) => r.link.includes("made-up")));
});

test("citation tracking parameters do not duplicate pages or discard distinct query results", async () => {
  const body = fixture();
  body.output[1].content[0].annotations[0].url =
    "https://example.com/a?utm_source=openai#summary";
  body.output[0].action.sources.push(
    { url: "https://example.com/a?utm_campaign=search" },
    { url: "https://example.com/a?page=2" },
  );
  respond(body);
  const results = await searchWebWithOpenAI("topic");
  assert.equal(results.length, 4);
  assert.equal(results[0].title, "First source");
  assert.equal(results[0].snippet, "A useful fact about the topic.");
  assert.equal(results[0].link, "https://example.com/a?utm_source=openai#summary");
  assert.ok(results.some((result) => result.link === "https://example.com/a?page=2"));
});

test("completed empty search returns an empty list; incomplete or missing search fails", async () => {
  respond({
    status: "completed",
    output: [
      { type: "web_search_call", status: "completed", action: { sources: [] } },
    ],
  });
  assert.deepEqual(await searchWebWithOpenAI("topic"), []);
  for (const body of [
    {},
    { status: "failed" },
    { status: "completed", output: [] },
    { status: "incomplete", output: fixture().output },
  ]) {
    respond(body);
    await assert.rejects(searchWebWithOpenAI("topic"), /did not complete/);
  }
});

test("missing configuration and blank queries fail without a network request", async () => {
  globalThis.fetch = () => {
    assert.fail("must not call provider");
  };
  await assert.rejects(searchWebWithOpenAI("  "), /Missing search query/);
  delete process.env.OPENAI_API_KEY;
  await assert.rejects(searchWebWithOpenAI("topic"), /Missing OPENAI_API_KEY/);
});

test("provider failures and malformed JSON fail safely", async () => {
  for (const status of [401, 429, 500]) {
    globalThis.fetch = async () =>
      new Response("secret provider details", { status });
    await assert.rejects(searchWebWithOpenAI("topic"), {
      message: `Web search failed (${status})`,
    });
  }
  globalThis.fetch = async () => new Response("not JSON");
  await assert.rejects(searchWebWithOpenAI("topic"));
});

test("caller cancellation is propagated", async () => {
  const controller = new AbortController();
  controller.abort();
  globalThis.fetch = async (_, options) => {
    options.signal.throwIfAborted();
    assert.fail("must be aborted");
  };
  await assert.rejects(
    searchWebWithOpenAI("topic", { signal: controller.signal }),
    { name: "AbortError" },
  );
});

test("web endpoint retains response contract and handles empty, invalid and failed queries", async () => {
  respond(fixture());
  const response = await GET(request("topic"));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).data[0].title, "First source");
  for (const query of [undefined, "", "  "])
    assert.equal((await GET(request(query))).status, 400);
  respond({
    status: "completed",
    output: [{ type: "web_search_call", status: "completed" }],
  });
  assert.deepEqual(await (await GET(request("topic"))).json(), { data: [] });
  globalThis.fetch = async () => {
    throw new Error("secret");
  };
  const failed = await GET(request("topic"));
  assert.equal(failed.status, 500);
  assert.deepEqual(await failed.json(), {
    error: "Web search is temporarily unavailable",
  });
});

test("sources are inserted into streamed JSON across UTF-8 and object boundaries", async () => {
  const bytes = new TextEncoder().encode('  {"title":"日本語","facts":[]}');
  const stream = new ReadableStream({
    start(controller) {
      for (const byte of bytes) controller.enqueue(new Uint8Array([byte]));
      controller.close();
    },
  });
  const source = {
    title: "Source",
    link: "https://example.com/",
    snippet: "Summary",
    displayLink: "example.com",
  };
  const response = withTopicSources(
    new Response(stream, {
      headers: {
        "X-RateLimit-Limit": "",
        "Content-Type": "text/plain",
        "Content-Length": "5",
      },
    }),
    [source],
  );
  assert.equal(response.headers.get("Content-Length"), null);
  assert.equal(response.headers.get("Content-Type"), "text/plain");
  assert.deepEqual(await response.json(), {
    sources: [source],
    title: "日本語",
    facts: [],
  });
});

function topicRoute({ search = searchWebWithOpenAI, passed = true } = {}) {
  let generated, cached;
  const { POST } = loadTs("src/app/api/ai-topics/route.ts", {
    "@/lib/models": models,
    "@/lib/openai-web-search": { searchWebWithOpenAI: search },
    "@/lib/language-model": { getLanguageModel: (name) => name },
    "@/lib/redis": {
      __esModule: true,
      default: {
        set: async (...args) => {
          cached = args;
        },
      },
      checkRateLimit: async () => ({ passed, secondsLeft: 7 }),
    },
    ai: {
      streamObject: (options) => {
        generated = options;
        return {
          toTextStreamResponse: () => new Response('{"title":"Topic"}'),
        };
      },
    },
  });
  return { POST, generated: () => generated, cached: () => cached };
}
const topicRequest = (body) =>
  new Request("http://localhost/api/ai-topics", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "X-AI-Model": "selected-model" },
  });

test("topic generation uses search summaries and keeps model, stream, provenance and cache", async () => {
  respond(fixture());
  const route = topicRoute();
  const response = await route.POST(topicRequest(" topic "));
  const body = await response.json();
  assert.equal(body.title, "Topic");
  assert.equal(body.sources.length, 3);
  const generated = route.generated();
  assert.equal(generated.model, "selected-model");
  assert.equal(generated.prompt, "topic");
  assert.match(generated.system, /A useful fact about the topic/);
  assert.match(generated.system, /Today is/);
  assert.equal(generated.schema.shape.sources, undefined);
  await generated.onFinish({ object: { title: "Topic" } });
  assert.equal(
    route.cached()[0],
    "ai-topics:resp:openai-web-v2:selected-model:topic",
  );
  assert.deepEqual(route.cached()[1].sources, body.sources);
  assert.deepEqual(route.cached()[2], { ex: 3600 });
});

test("failed or unusable grounding returns a retryable error without generating or caching a card", async () => {
  for (const search of [
    async () => {
      throw new Error("secret");
    },
    async () => {
      throw new DOMException("Search timed out", "TimeoutError");
    },
    async () => [],
    async () => [{ title: "Uncited page", link: "https://example.com", displayLink: "example.com", snippet: "" }],
  ]) {
    const route = topicRoute({ search });
    const response = await route.POST(topicRequest("topic"));
    assert.equal(response.status, 503);
    const body = await response.json();
    assert.match(body.error, /Web search/);
    assert.ok(!body.error.includes("secret"));
    assert.equal(route.generated(), undefined);
    assert.equal(route.cached(), undefined);
  }
});

test("topic rejects invalid input and enforces rate limits before search or generation", async () => {
  const search = async () => {
    assert.fail("must not search");
  };
  for (const body of [null, {}, 7, "", "   "]) {
    const route = topicRoute({ search });
    assert.equal((await route.POST(topicRequest(body))).status, 400);
    assert.equal(route.generated(), undefined);
  }
  const route = topicRoute({ search, passed: false });
  assert.equal(
    (
      await route.POST(
        new Request("http://localhost", { method: "POST", body: "{" }),
      )
    ).status,
    400,
  );
  assert.equal((await route.POST(topicRequest("topic"))).status, 429);
  assert.equal(route.generated(), undefined);
});

test("existing image provider still maps canonical URL, thumbnail fallback and source page", async () => {
  globalThis.fetch = async (_, options) => {
    const body = JSON.parse(options.body);
    assert.deepEqual(body.tools[0].search_content_types, ["image"]);
    assert.equal(body.tools[0].image_settings.max_results, 3);
    return Response.json({
      output: [
        {
          type: "web_search_call",
          results: [
            {
              type: "image_result",
              image_url: "https://example.com/a.jpg",
              thumbnail_url: "https://example.com/thumb.jpg",
              source_website_url: "https://example.com/article",
              caption: "Caption",
            },
            {
              type: "image_result",
              thumbnail_url: "https://example.com/b.jpg",
            },
            { type: "image_result", caption: "No URL" },
          ],
        },
      ],
    });
  };
  assert.deepEqual(await searchImagesWithOpenAI("topic", 3), [
    {
      link: "https://example.com/a.jpg",
      title: "Caption",
      image: { contextLink: "https://example.com/article" },
    },
    {
      link: "https://example.com/b.jpg",
      title: "Image result",
      image: undefined,
    },
  ]);
});

test("existing image action preserves cache hits, misses and error handling", async () => {
  let cached = null,
    written,
    searches = 0;
  const { searchImage } = loadTs("src/app/actions.tsx", {
    "@/lib/redis": {
      __esModule: true,
      default: {
        get: async () => cached,
        set: async (...args) => {
          written = args;
        },
      },
    },
    "@/lib/replicate": { __esModule: true, default: {} },
    "@/lib/models": models,
    "@/lib/openai-image-search": {
      searchImagesWithOpenAI: async () => {
        searches++;
        return [{ link: "https://example.com/image.jpg" }];
      },
    },
  });
  const first = await searchImage(" Topic ");
  assert.equal(searches, 1);
  assert.equal(written[0], "ai-topics:images:openai-web-v1:topic");
  cached = first.data;
  assert.deepEqual(await searchImage("topic"), first);
  assert.equal(searches, 1);
  const { searchImage: failed } = loadTs("src/app/actions.tsx", {
    "@/lib/redis": { __esModule: true, default: { get: async () => null } },
    "@/lib/replicate": { __esModule: true, default: {} },
    "@/lib/openai-image-search": {
      searchImagesWithOpenAI: async () => {
        throw new Error("Unavailable");
      },
    },
  });
  assert.equal(typeof (await failed("topic")).error, "string");
});

test("search timeout bounds the provider request", async (t) => {
  t.mock.method(AbortSignal, "timeout", (milliseconds) => {
    assert.equal(milliseconds, 60_000);
    return AbortSignal.abort(new DOMException("Timed out", "TimeoutError"));
  });
  globalThis.fetch = async (_, options) => {
    options.signal.throwIfAborted();
  };
  await assert.rejects(searchWebWithOpenAI("topic"), { name: "TimeoutError" });
});

test("source injection supports an empty generated object", async () => {
  assert.deepEqual(await withTopicSources(new Response("{}"), []).json(), {
    sources: [],
  });
});

test("topic UI renders clickable sources and supports cards without sources", async () => {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { createElement } = await import("react");
  const noop = { __esModule: true, default: () => null };
  const { default: AiCard } = loadTs("src/app/_components/ai-card.tsx", {
    "@/components/credit-footer": noop,
    "./description": noop,
    "./fact-list": noop,
    "./header": noop,
    "./hero-carousel": noop,
  });
  const html = renderToStaticMarkup(
    createElement(AiCard, {
      card: {
        sources: [
          { title: "Source", link: "https://example.com/page" },
          { title: "Unsafe", link: "javascript:alert(1)" },
        ],
      },
      hideHero: true,
    }),
  );
  assert.match(html, /href="https:\/\/example.com\/page"/);
  assert.match(html, /rel="noopener noreferrer"/);
  assert.ok(!html.includes("javascript:"));
  const legacy = renderToStaticMarkup(
    createElement(AiCard, { card: { title: "Cached card" }, hideHero: true }),
  );
  assert.ok(!legacy.includes("Web sources"));
});
