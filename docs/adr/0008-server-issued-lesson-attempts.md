# 0008. Lesson results are accepted only for server-issued, single-use attempts

Status: Accepted

## Context

`/api/lessons/complete` used to take `{ correct, total, seconds }` from the
client and trust it after clamping. Anyone could `curl` a perfect score and farm
XP, gems and league rank. The roadmap called for full server-side answer
verification, which would mean sending every answer to the server and
re-grading it there.

## Decision

Close the cheap cheating paths without re-grading every answer:

1. `POST /api/lessons/start` creates a `LessonAttempt` row (user, lesson,
   `startedAt`) and returns its id.
2. `POST /api/lessons/complete` must quote that id. `consumeAttempt` in
   `src/server/services/attempts.ts` then checks, before anything is written:
   - the attempt belongs to this user and this exact lesson;
   - it is not older than two hours;
   - `total` is a number the client could really have produced
     (non-boss: the lesson length up to six retries beyond it; boss: up to the
     26-question queue cap);
   - the server-measured time is at least 700 ms per answered question;
   - the attempt is closed with a conditional `updateMany(... finishedAt: null)`,
     so two parallel requests cannot both win.

## Consequences

- A result cannot be forged without a start, replayed, moved to another lesson,
  or submitted for a lesson that took less time than reading it.
- **This is not full verification.** A determined cheater can still wait out the
  minimum time and report `correct = total`. Closing that gap needs answers to be
  graded on the server (and the answer key not shipped to the browser), which is
  a larger change to the exercise components. The README keeps that as an open
  item.
- A failed `start` call means the lesson cannot be credited; the UI shows the
  local result screen without rewards, rather than blocking the lesson.
- Unfinished attempts older than the TTL are deleted opportunistically the next
  time the same user starts a lesson, so the table does not grow without bound.
