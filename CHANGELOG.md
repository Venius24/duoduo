# Changelog

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Security
- Lesson results are accepted only for a server-issued, single-use
  `LessonAttempt`: owner, lesson, age, plausible question count and minimum
  duration are checked, and the attempt is closed atomically (ADR 0008).
- Sessions are revocable: `User.tokenVersion` and `POST /api/auth/logout-all`,
  exposed in Settings as "Sign out on all devices" (ADR 0009).

### Added
- Optional shared rate-limit store through Upstash Redis REST, with automatic
  fallback to the in-memory limiter (ADR 0010).
- Playwright end-to-end suite that plays complete English and Chinese lessons,
  plus an `e2e` job in CI.
- Tests for language direction of course content and for speech recognition
  settling.
- English README, architecture overview and Architecture Decision Records.
- `CONTRIBUTING.md`, `SECURITY.md`, issue and pull request templates,
  Dependabot configuration.

### Fixed
- Chinese course: all 49 sentences had the Russian and Chinese text swapped, so
  sentence exercises asked for the answer in Russian. Found by the new e2e suite.
- The "Say it aloud" exercise hung forever on "Listening…" in browsers that
  expose `SpeechRecognition` but never fire an event (Brave, Electron, headless
  Chromium); recognition now times out after 10 s and the self-assessment
  buttons appear.

### Changed
- First-time SRS rows for a lesson are inserted with one `createMany` instead of
  one query pair per word.
- Rate-limit helpers (`guard`) are async.
- License text replaced with the canonical MIT text so tooling recognises it.
- The Russian README moved to `README.ru.md`.

## [1.0.0]

### Added
- English and Chinese courses with 10 exercise types, boss lessons and stars.
- SM-2 spaced repetition, streaks, gems, hearts, daily quests, achievements,
  weekly league.
- JWT sessions, bcrypt, zod validation, rate limiting, security headers,
  `/api/health`.
- Optional AI mistake explanations with a local fallback.
- Docker image (multi-stage, non-root), SQLite or PostgreSQL via build-time
  provider switch, GitHub Actions CI.
