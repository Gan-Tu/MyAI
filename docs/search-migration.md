# Search provider migration

MyAI uses the existing OpenAI Responses API `web_search` integration instead of
Google Custom Search JSON API. No new provider, package, account or credential is
introduced. This change is motivated by the authenticated October 22, 2026 notice
requiring project `mycool-ai-1735156620455` to transition by January 1, 2027. The
checkout's mapping to that Google Cloud project and its live traffic have **not**
been verified.

## Configuration

- `OPENAI_API_KEY` is the existing server-side credential used by widget research
  and image search. Web search now uses it too, including when the topic generation
  model is from another provider. It must be valid and have access to Responses,
  the existing `defaultOpenAIResponsesModel` in `src/lib/models.ts`, and web search.
- `GOOGLE_SEARCH_API_KEY` and `GOOGLE_SEARCH_ENGINE_ID` are no longer read by MyAI.
  No credentials were changed or revoked. Check other applications before removing
  these deployment secrets; do not infer that the named Google project is unused.
- No Redis configuration changes. Topic response cache keys use an
  `openai-web-v2` namespace so old Google-grounded cards and earlier ungrounded
  fallback cards are bypassed. Successful topic cards expire after one hour.
  Existing image cache keys are unchanged. No cache data is deleted.
- OpenAI search/model usage incurs charges under the existing provider account.
  No service was purchased or account enrolled as part of this change.

## Behavior and consumers

- `GET /api/google/web?query=...` remains available for compatibility. There are
  no in-repository callers of this endpoint. It returns `{ data: [...] }` with up
  to ten deduplicated `title`, `link`, `displayLink`, and `snippet` entries.
  Missing/blank queries return 400; failed searches return 500 with a generic
  error; completed searches without sources return `{ data: [] }`.
- OpenAI web search is not a Google SERP clone. Ordering/counts can differ;
  snippets are summaries from cited response paragraphs, not Google's verbatim
  extracts. Sources without cited summaries have an empty snippet and a hostname
  title. Google-only fields such as `pagemap`/`htmlSnippet` are not fabricated.
  No Google engine domain restrictions were known or assumed.
- `POST /api/ai-topics` retains string input, model selection, rate limiting,
  streamed JSON and response caching. Search is required: timeouts/errors or a
  result without usable cited summaries return a retryable 503 error before
  generation. Failed grounding never produces or caches a card. Today's date is
  always supplied to the generation model.
- Search has a 60-second timeout covering both the hosted search and the model's
  cited summaries. The topic route has a 120-second execution budget, leaving
  time for generation; the standalone web-search route has a 75-second budget.
  The caller's cancellation signal is forwarded to search and generation.
- Source URLs come from provider citation annotations/source metadata, not model
  prose. Unsafe schemes and URL credentials are rejected. Provider-supplied source entries
  are injected into the streamed card and cache independently of the generation
  model. The card shows clickable source links; older cards without sources still
  render. Source links describe the search context, not verification of every
  generated claim.
- Deduplication ignores `utm_*` tracking parameters and URL fragments while
  retaining the original provider citation link and meaningful query parameters.
- Images already use `src/lib/openai-image-search.ts`: `searchImage` in
  `src/app/actions.tsx` serves topic images via Redis, `AiTopics` passes them to
  `AiCard`/`HeroCarousel`, and the widget route calls the same image helper.
  Image search and widget research remain unchanged. The regression suite covers
  image URL/thumbnail/source-page mapping and the topic image cache/error paths.

## Verification and rollout

Run `npm ci`, `npm run test:search`, `npm run test:security`, `npm run lint`,
`npx tsc --noEmit`, and `npm run build`. Search tests mock external requests and
Redis; they do not spend credits or write to live caches.

The October 22, 2026 investigation reproduced the original ten-second timeout
using the existing preview credentials. The same current-events request completed
in 22.84 seconds with five citations when allowed more time. A local credential
separately returned HTTP 401 because its OpenAI project had been archived; the
preview uses a different working credential. No credentials were changed.

After deployment, try a current-events query, check that the complete streamed
card has source links, and repeat the query to check caching. Search errors must
show a retryable failure rather than an ungrounded card. Also verify the unchanged
image flow. Review search quality, latency and usage costs; mocked tests alone do
not establish live acceptance.

Provider contract: [OpenAI web search documentation](https://developers.openai.com/api/docs/guides/tools-web-search)
(citations, source metadata, required tool choice and image results).
