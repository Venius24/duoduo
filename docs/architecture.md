# Architecture

Duoduo is a single Next.js 15 application (App Router) that serves both the UI
and a JSON API, backed by Prisma. There is no separate backend process.

```mermaid
flowchart LR
    subgraph Browser
        UI[React 19 UI<br/>Tailwind] --> Store[Zustand store<br/>me-store.ts]
        UI --> Web[Web Speech API<br/>Web Audio]
    end

    subgraph Next["Next.js server"]
        MW[middleware.ts<br/>JWT check on page routes]
        API[Route handlers<br/>src/app/api/*]
        SVC[Services<br/>src/server/services/*]
        LIB[Pure domain logic<br/>src/lib/*]
        CONTENT[Typed course content<br/>src/content/*]
    end

    DB[(SQLite or PostgreSQL<br/>via Prisma)]
    AI[OpenAI-compatible API<br/>optional]

    Store -->|fetch| API
    UI --> MW
    API --> SVC
    SVC --> LIB
    SVC --> CONTENT
    SVC --> DB
    API -.->|explain, optional| AI
```

## Layers and their rules

| Layer | Path | May depend on | Must not |
|---|---|---|---|
| Pages and components | `src/app`, `src/components` | `lib`, `content` | import `server/*` |
| Route handlers | `src/app/api` | `server/*` | contain business rules |
| Services | `src/server/services` | `lib`, `content`, `db` | know about HTTP |
| Domain logic | `src/lib` | nothing but types | do I/O |
| Content | `src/content` | its own types | touch the database |

The domain layer (`src/lib`) is where the rules live: SM-2 scheduling, XP and
levels, quests, achievements and answer checking. Keeping it free of I/O is what
makes it cheap to test (see ADR 0001 and 0002).

## Request lifecycle: completing a lesson

1. When the lesson opens, the client calls `POST /api/lessons/start`; the server
   stores a `LessonAttempt` and returns its id (ADR 0008).
2. The client finishes and `POST`s `/api/lessons/complete` with
   `{ attemptId, courseId, unitId, lessonId, correct, total, seconds }`.
3. The handler loads the session user (`getSessionUser`: verify JWT, check its
   token version, load the row), validates the body with zod and calls
   `completeLesson`.
4. `completeLesson` looks the lesson up in the content tree and clamps the
   numbers. `consumeAttempt` then verifies and atomically closes the attempt
   (owner, lesson, age, plausible `total`, minimum elapsed time).
5. It decides pass or fail (bosses have a `passScore`) and computes XP, gems,
   stars and the streak.
6. Counters, per-day stats and lesson progress are written in one
   `db.$transaction`.
7. Words from the lesson that the user has not seen get a first SRS schedule,
   inserted with a single `createMany`.
8. Achievements are re-evaluated; newly unlocked ones are inserted.
9. The result (XP gained, level-up, unlocked achievements) is returned to the UI.

## Data model

```mermaid
erDiagram
    User ||--o{ LessonProgress : has
    User ||--o{ SrsItem : schedules
    User ||--o{ Achievement : unlocks
    User ||--o{ DayStat : accumulates
    User ||--o{ LessonAttempt : starts
    User {
        string id PK
        string email UK
        int xp
        int gems
        int hearts
        int streak
        int weeklyXp
        string weekKey
        int tokenVersion
    }
    LessonAttempt {
        string courseId
        string unitId
        string lessonId
        datetime startedAt
        datetime finishedAt
    }
    LessonProgress {
        string courseId
        string unitId
        string lessonId
        int stars
        int bestPercent
    }
    SrsItem {
        string itemId
        float ease
        int interval
        int reps
        int lapses
        datetime dueAt
    }
```

Every child row cascades on user deletion. `SrsItem` is indexed on
`(userId, dueAt)` because "what is due now" is the hottest query. Rows reference
course content by stable string ids, not foreign keys (ADR 0006).

## Time-derived state

Hearts and the weekly league are derived from time rather than ticked by a cron
job. `refreshUserState` runs on each `/api/me` read and:

- grants one heart per 20 minutes elapsed (`HEART_REGEN_MS`), capped at the
  maximum, and advances `heartsUpdated` by whole intervals only so partial
  progress is not lost;
- resets `weeklyXp` when the stored `weekKey` is not the current week.

This keeps the app free of background workers, which is what lets it run on
serverless platforms.

## The league

League opponents are seeded bot users. A bot's displayed score is
`weeklyXp * factor`, where `factor` is a deterministic hash of the bot id, week
and date, scaled by how far into the week it is. Scores therefore grow during
the week and are stable between page loads, without storing any extra state.

## Security surface

See ADR 0003 and 0009 (sessions, secret, revocation), ADR 0005 and 0010 (rate
limits), ADR 0008 (lesson attempts) and
[SECURITY.md](../SECURITY.md). Response headers are set in `next.config.mjs`,
and all `/api/*` responses are `Cache-Control: no-store`.

## Deployment shapes

| Target | Database | Notes |
|---|---|---|
| Docker or VPS | SQLite file on a volume | Multi-stage image on Next's `standalone` output, non-root user, `HEALTHCHECK` on `/api/health` |
| Vercel, Netlify, Cloud Run | PostgreSQL | Filesystem is ephemeral; the provider switch is automatic (ADR 0004) |

`/api/health` returns `200` with DB latency when the database answers and `503`
with `status: degraded` when it does not, so a load balancer can tell a live
process from a usable one.
