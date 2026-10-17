# 0001. Keep business logic in a service layer, not in route handlers

Status: Accepted

## Context

Next.js route handlers are the natural place to put "just a bit of logic". For
a game-like product that quickly becomes a problem: completing a lesson touches
XP, gems, streaks, per-day stats, lesson progress, SRS scheduling and
achievements. Logic in handlers can only be tested by booting the framework and
issuing HTTP requests.

## Decision

Route handlers stay thin: authenticate, validate the body with zod, call a
function in `src/server/services/*`, map the result or error to a response.
Everything that decides anything lives in services (`lessons.ts`, `review.ts`,
`users.ts`, `leaderboard.ts`, `stats.ts`, `authService.ts`) or in pure helpers
under `src/lib` (`srs.ts`, `levels.ts`, `quests.ts`, `achievements.ts`,
`normalize.ts`).

## Consequences

- Services take a `User` and plain input and return plain data, so
  `src/tests/services.test.ts` exercises the full lesson flow against a real
  SQLite file with no HTTP layer at all.
- Pure helpers have no I/O and are tested in milliseconds (`core.test.ts`).
- Cost: one extra indirection for trivial endpoints. Accepted: the trivial
  endpoints are few, and the rule is easier to keep when it has no exceptions.
