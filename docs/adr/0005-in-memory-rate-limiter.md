# 0005. In-memory sliding-window rate limiter behind a stable signature

Status: Accepted, with known limits

## Context

`/api/auth/*` originally had no throttling, so passwords could be brute-forced
at network speed. The AI endpoint forwards to a paid API and needs a cap too.

## Decision

`src/server/rate-limit.ts` keeps a `Map<string, { count, resetAt }>` per
process and exposes `rateLimit(key, limit, windowMs, now?)`. Routes call the
`guard()` helper in `src/server/http.ts`, which returns a ready `429` response
with a `Retry-After` header, or `null`.

| Scope | Limit | Key |
|---|---|---|
| login | 10 / 10 min | client IP |
| register | 5 / hour | client IP |
| AI explain | 30 / 5 min | user |

Design details worth knowing:

- The clock is a parameter, so the tests never sleep.
- The map is swept only once it passes 10,000 entries, so the hot path stays
  O(1) and memory stays bounded.
- When no proxy header is present, all anonymous clients share one `unknown`
  bucket. That fails closed (strict) rather than open.

## Consequences

- Correct for a single instance, which is the documented primary deployment.
- With several instances the limit applies per instance. The fix is a shared
  store such as Redis, behind the same function signature, so no call site
  changes.
- `x-forwarded-for` is trusted as sent. Behind an untrusted edge a client could
  rotate it to dodge the limit; the proxy must overwrite that header.
