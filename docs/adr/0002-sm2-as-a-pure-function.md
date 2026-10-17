# 0002. Implement SM-2 as a pure function with an injectable clock

Status: Accepted

## Context

The review queue is the core learning mechanic. Scheduling bugs are silent: the
app keeps working, the learner just sees words at the wrong time. They are also
slow to notice, since a wrong interval only shows up days later.

## Decision

`src/lib/srs.ts` exposes `nextSchedule(prev, grade, now = new Date())`, a pure
function over `{ ease, interval, reps, lapses }`. It does no database access
and takes the clock as a parameter.

- Grades follow SM-2: `>= 3` is a pass, below is a lapse.
- Pass: `reps` increments; interval is 1 day, then 3 days, then
  `round(interval * ease)`. Ease moves by `+0.1 / 0 / -0.15` for grades 5 / 4 / 3.
- Lapse: `reps` resets, the item returns in 10 minutes, ease drops by 0.2.
- Ease is clamped to `[1.3, 2.8]`. The classic algorithm has no upper bound; a
  cap stops an item from drifting to multi-month intervals after a lucky streak.

New items are scheduled by lesson accuracy (`freshSrsState`): perfect lesson
maps to grade 5, 60% or better to 4, otherwise 3.

## Alternatives considered

- **Leitner boxes.** Simpler, but a fixed ladder ignores how hard an individual
  item is for this learner.
- **FSRS.** Better retention in published comparisons, but it needs per-user
  parameter fitting and a review log. Overkill for the current data volume.
  The pure-function boundary means swapping it in later touches one file.

## Consequences

- Behaviour is covered by deterministic unit tests: no fake timers, no sleeps.
- The 10-minute relearn step is a constant in code, not a user setting.
