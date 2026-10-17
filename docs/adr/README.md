# Architecture Decision Records

Short records of the decisions that shaped Duoduo: what the problem was, what
was chosen, what was rejected and what it costs. Format follows
[Michael Nygard's template](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions).

| # | Decision | Status |
|---|---|---|
| [0001](0001-service-layer-over-route-handlers.md) | Keep business logic in a service layer, not in route handlers | Accepted |
| [0002](0002-sm2-as-a-pure-function.md) | Implement SM-2 as a pure function with an injectable clock | Accepted |
| [0003](0003-stateless-jwt-and-fail-fast-secret.md) | Stateless JWT sessions and a fail-fast secret check | Accepted |
| [0004](0004-switchable-database-provider.md) | One Prisma schema, SQLite or PostgreSQL chosen at build time | Accepted |
| [0005](0005-in-memory-rate-limiter.md) | In-memory sliding-window rate limiter behind a stable signature | Accepted, with known limits |
| [0006](0006-course-content-as-typed-code.md) | Course content as typed TypeScript, validated by tests | Accepted |
| [0007](0007-optional-ai-with-local-fallback.md) | Optional AI explanations with a guaranteed local fallback | Accepted |
| [0008](0008-server-issued-lesson-attempts.md) | Lesson results accepted only for server-issued, single-use attempts | Accepted |
| [0009](0009-revocable-sessions-with-token-version.md) | Revocable sessions through a per-user token version | Accepted, amends 0003 |
| [0010](0010-optional-shared-rate-limit-store.md) | Optional shared rate-limit store (Redis over REST) | Accepted, extends 0005 |

New decision? Copy the last file, bump the number, and add a row here. Do not
rewrite an accepted record: supersede it with a new one and update its status.
