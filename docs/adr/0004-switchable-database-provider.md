# 0004. One Prisma schema, SQLite or PostgreSQL chosen at build time

Status: Accepted

## Context

Two deployment targets pull in opposite directions:

- A VPS or home server wants the simplest possible thing: a SQLite file on a
  volume, no database server to run.
- Vercel, Netlify and Cloud Run have an ephemeral filesystem. A SQLite file
  there is silently lost between invocations, so they need PostgreSQL.

Prisma requires the `provider` in `schema.prisma` to be a literal. It cannot be
read from an environment variable.

## Decision

Keep a single schema and rewrite the `provider` line with
`scripts/set-db-provider.mjs` before `prisma generate` and `prisma db push`.
The provider comes from `DATABASE_PROVIDER` if set, otherwise it is inferred
from the `DATABASE_URL` scheme. `npm run build`, `npm run db:push` and the
container entrypoint all run the script first. The schema is written using only
types both engines support (string ids, `DateTime`, `Int`, `Float`, `Boolean`),
and `YYYY-MM-DD` day keys are stored as strings rather than relying on
engine-specific date types.

## Alternatives considered

- **Two schema files.** Rejected: they drift apart, and every migration is done
  twice.
- **PostgreSQL only.** Rejected: it makes the "clone and run" path need Docker
  or a hosted database.

## Consequences

- The committed schema says `sqlite`; running against PostgreSQL modifies the
  working tree. This is stated in the README and the script is idempotent.
- No migration history yet: both engines use `prisma db push`. Fine for the
  current stage, but a real production upgrade path needs `prisma migrate`
  (listed in the roadmap).
