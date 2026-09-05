export interface SrsState {
  ease: number
  interval: number
  reps: number
  lapses: number
}

export interface ScheduledItem extends SrsState {
  dueAt: Date
}

const MIN_EASE = 1.3
const MAX_EASE = 2.8

export function nextSchedule(prev: SrsState, grade: number, now: Date = new Date()): ScheduledItem {
  let { ease, interval, reps, lapses } = prev
  if (grade >= 3) {
    reps += 1
    if (reps === 1) interval = 1
    else if (reps === 2) interval = 3
    else interval = Math.max(1, Math.round(interval * ease))
    ease += grade === 5 ? 0.1 : grade === 4 ? 0 : -0.15
  } else {
    lapses += 1
    reps = 0
    interval = 0
    ease -= 0.2
  }
  ease = Math.min(MAX_EASE, Math.max(MIN_EASE, ease))
  const dueAt =
    interval < 1
      ? new Date(now.getTime() + 10 * 60 * 1000)
      : new Date(now.getTime() + interval * 24 * 60 * 60 * 1000)
  return { ease, interval, reps, lapses, dueAt }
}

export function freshSrsState(gradeOnLearn: number, now: Date = new Date()): ScheduledItem {
  return nextSchedule({ ease: 2.5, interval: 0, reps: 0, lapses: 0 }, gradeOnLearn, now)
}
