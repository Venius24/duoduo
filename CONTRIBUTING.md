# Contributing

Thanks for taking an interest. This is a small project, so the process is too.

## Setup

```bash
git clone https://github.com/Venius24/duoduo.git && cd duoduo
cp .env.example .env
npm run gen:secret        # paste the line into .env
npm run setup             # install, create the SQLite DB, seed
npm run dev
```

Node.js 20 or newer. `nvm use` picks the right version from `.nvmrc`.

## Before you open a pull request

```bash
npm run verify            # typecheck + tests + production build
```

CI runs the same thing plus a Docker image build, and a PR needs it green.

## Ground rules

- **Keep the layers.** Route handlers stay thin; rules go in `src/server/services`
  or in I/O-free code under `src/lib`. See [docs/architecture.md](docs/architecture.md).
- **Test the behaviour you change.** Pure logic gets a unit test; anything that
  writes to the database goes through `services.test.ts`.
- **Don't rename content ids.** Learner progress and SRS rows reference them
  ([ADR 0006](docs/adr/0006-course-content-as-typed-code.md)).
- **Significant design change? Write an ADR.** Copy the latest file in
  `docs/adr/`, bump the number, add it to the index.
- **No secrets in the repo.** `.env` is ignored; only `.env.example` is tracked.

## Commits and PRs

- Small, focused commits with an imperative subject (`Add ...`, `Fix ...`). A
  `type:` prefix such as `docs:` or `fix:` is welcome but not required.
- Describe *why* in the body when it is not obvious from the diff.
- One logical change per PR.

## Adding course content

Add a unit object to `units` in `src/content/en.ts` or `src/content/zh.ts`
using the helpers in `builders.ts`. `npm test` runs `content.test.ts`, which
checks the structure.

## Reporting bugs

Open an issue with steps to reproduce, what you expected, what happened, and
your Node version and database (SQLite or PostgreSQL). For security problems
use [SECURITY.md](SECURITY.md) instead of a public issue.
