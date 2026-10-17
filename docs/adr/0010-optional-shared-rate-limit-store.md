# 0010. Optional shared rate-limit store (Redis over REST)

Status: Accepted. Extends [0005](0005-in-memory-rate-limiter.md).

## Context

ADR 0005 said that with several instances the per-process limiter becomes
per-instance, and promised a Redis-backed implementation behind the same
signature. Serverless hosts, where the app can run on PostgreSQL, are exactly the
case where in-memory counters are useless: each invocation may see a fresh map.

## Decision

`checkRateLimit` in `src/server/rate-limit.ts` is the async entry point used by
routes (through `guard`). If `UPSTASH_REDIS_REST_URL` and
`UPSTASH_REDIS_REST_TOKEN` are set, it sends one atomic pipeline
(`INCR`, `PEXPIRE ... NX`, `PTTL`) over the Upstash REST API; otherwise it uses the
in-memory limiter exactly as before. REST over `fetch` was chosen over a TCP
Redis client so that it works on edge and serverless runtimes without a new
dependency.

On any Redis failure (timeout after 800 ms, non-2xx, command error) it logs a
warning and falls back to the in-memory limiter. A Redis outage therefore
degrades protection to per-instance, but never blocks logins.

## Consequences

- The Redis window is **fixed**, not sliding: a client can burst up to twice the
  limit across a window boundary. For brute-force throttling that is acceptable;
  the in-memory limiter remains a true sliding window.
- The Redis path is covered by tests against a mocked `fetch`; it has not been
  exercised against a live Upstash instance in this repository's CI.
- `clearRateLimit` (used after a successful login) deletes the key in both
  stores.
