import type { PPLType } from './constants';

/**
 * Convert a JS Date weekday (0=Sun..6=Sat) to our format (0=Mon..6=Sun).
 */
function jsWeekdayToOurs(jsDay: number): number {
  return (jsDay + 6) % 7;
}

/**
 * Check if a date falls on a designated workout day.
 * If workoutDays is undefined/empty, every day is a workout day.
 */
export function isWorkoutDay(date: Date, workoutDays?: number[]): boolean {
  if (!workoutDays || workoutDays.length === 0) return true;
  return workoutDays.includes(jsWeekdayToOurs(date.getDay()));
}

/**
 * Count workout days between startDate (inclusive) and targetDate (inclusive)
 * using an O(1) algorithm based on full weeks + remainder.
 */
function countWorkoutDaysBetween(
  start: Date,
  target: Date,
  workoutDays: number[],
): number {
  const totalDays = Math.floor(
    (target.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (totalDays < 0) {
    // Target is before start — count negatively
    return -countWorkoutDaysBetween(target, start, workoutDays);
  }

  const fullWeeks = Math.floor(totalDays / 7);
  const remainder = totalDays % 7;

  let count = fullWeeks * workoutDays.length;

  // Count remaining days
  const startWeekday = jsWeekdayToOurs(start.getDay());
  for (let i = 0; i < remainder; i++) {
    const dayOfWeek = (startWeekday + i) % 7;
    if (workoutDays.includes(dayOfWeek)) {
      count++;
    }
  }

  return count;
}

/**
 * Get the PPL type for a given date.
 *
 * If workoutDays is provided, only those weekdays are training days.
 * The PPL cycle advances only on training days. Non-training days return 'rest'.
 *
 * If workoutDays is empty/undefined, every day is a training day (original behavior).
 */
export function getPPLTypeForDate(
  startDate: string,
  targetDate: string,
  workoutDays?: number[],
): PPLType | 'rest' {
  const target = new Date(targetDate);

  // If workout days are specified and today isn't one, it's a rest day
  if (workoutDays && workoutDays.length > 0) {
    if (!isWorkoutDay(target, workoutDays)) {
      return 'rest';
    }

    // Count how many workout days have elapsed since start
    const start = new Date(startDate);
    const workoutDayCount = countWorkoutDaysBetween(start, target, workoutDays);
    const types: PPLType[] = ['push', 'pull', 'legs'];
    return types[((workoutDayCount % 3) + 3) % 3];
  }

  // Original behavior: cycle every day
  const start = new Date(startDate);
  const daysDiff = Math.floor(
    (target.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );
  const types: PPLType[] = ['push', 'pull', 'legs'];
  return types[((daysDiff % 3) + 3) % 3];
}
