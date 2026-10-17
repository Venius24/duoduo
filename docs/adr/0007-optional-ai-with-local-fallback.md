# 0007. Optional AI explanations with a guaranteed local fallback

Status: Accepted

## Context

An explanation of why an answer was wrong is a high-value feature, but making it
depend on a paid API would break the "no external services needed" promise and
turn an outage or a missing key into a broken lesson.

## Decision

`src/server/ai.ts` calls any OpenAI-compatible `/chat/completions` endpoint
(`AI_BASE_URL`, `AI_MODEL`, `OPENAI_API_KEY`). It always returns
`{ text, source: 'ai' | 'local' }` and never throws:

- no key configured -> local explanation;
- network error, non-2xx response, empty completion -> local explanation;
- the request is aborted after 15 seconds, with a 160-token cap.

The local text comes from the exercise's own `explainFallback`, falling back to
a generic message built from the correct answer. The endpoint is rate limited
per user (ADR 0005).

## Consequences

- The UI can always render an explanation; `source` lets it label AI output.
- Works with self-hosted or alternative providers by changing a base URL.
- The learner's prompt and answer are sent to whichever provider is configured.
  Operators should say so in their own privacy notice.
