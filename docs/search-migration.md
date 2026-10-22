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
- No Redis configuration changes. Topic response cache keys use a new
  `openai-web-v1` namespace so old Google-grounded cards do not bypass the migration.
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
  streamed JSON and response caching. Search is mandatory within the provider
  request, but optional for topic generation: timeouts/errors/empty searches let
  generation continue without search grounding. Today's date is always supplied.
  A ten-second search timeout reserves part of the existing 30-second route budget
  for generation; the caller's cancellation signal is forwarded.
- Source URLs come from provider citation annotations/source metadata, not model
  prose. Unsafe schemes and URL credentials are rejected. Provider-supplied source entries
  are injected into the streamed card and cache independently of the generation
  model. The card shows clickable source links; older cards without sources still
  render. Source links describe the search context, not verification of every
  generated claim.
- Images already use `src/lib/openai-image-search.ts`: `searchImage` in
  `src/app/actions.tsx` serves topic images via Redis, `AiTopics` passes them to
  `AiCard`/`HeroCarousel`, and the widget route calls the same image helper.
  Image search and widget research remain unchanged. The regression suite covers
  image URL/thumbnail/source-page mapping and the topic image cache/error paths.

## Verification and rollout

Run `npm ci`, `npm run test:search`, `npm run test:security`, `npm run lint`,
`npx tsc --noEmit`, and `npm run build`. Search tests mock external requests and
Redis; they do not spend credits or write to live caches.

Local checks on October 22, 2026: all 16 search regression tests and all four
existing security tests passed; lint and `tsc --noEmit` passed. The production
build passed with a Dropbox dynamic-dependency warning in the unrelated backup
route. No Custom Search endpoint or credential references remain under `src/`.

The saved environment's live search attempt reached OpenAI through its required
proxy and returned **HTTP 401**. Its existing key is present but was not accepted;
no key value was printed, generated, or changed. Live provider success, image
search and full Redis-backed topic generation remain to be verified using valid
existing application credentials. Upstash Redis variables are absent from the
saved environment. Do not treat mocked test success as production acceptance.

Before a separately authorized deployment, verify the existing server credential,
try a current-events query and an image query, inspect clickable source links and
repeat a topic query to check caching. Review search quality, latency and usage
costs. This change does not merge, deploy, or prove live Google traffic has stopped.

Provider contract: [OpenAI web search documentation](https://developers.openai.com/api/docs/guides/tools-web-search)
(citations, source metadata, required tool choice and image results).
