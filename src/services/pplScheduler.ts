import type { PPLType } from '../utils/constants';
import { getPPLTypeForDate } from '../utils/pplUtils';
import { toISODate } from '../utils/dateUtils';
import { db } from '../db';

export function getTodayPPLType(
  pplStartDate: string,
  workoutDays?: number[],
): PPLType | 'rest' {
  return getPPLTypeForDate(pplStartDate, toISODate(new Date()), workoutDays);
}

export function getWeekSchedule(
  pplStartDate: string,
  weekDates: Date[],
  workoutDays?: number[],
): Array<{ date: Date; type: PPLType | 'rest' }> {
  return weekDates.map((date) => ({
    date,
    type: getPPLTypeForDate(pplStartDate, toISODate(date), workoutDays),
  }));
}

export function getMonthSchedule(
  pplStartDate: string,
  year: number,
  month: number,
  workoutDays?: number[],
): Array<{ date: Date; type: PPLType | 'rest' }> {
  const days: Array<{ date: Date; type: PPLType | 'rest' }> = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    days.push({
      date: new Date(d),
      type: getPPLTypeForDate(pplStartDate, toISODate(d), workoutDays),
    });
  }

  return days;
}

// --- Last Workout By Type ---

export type LastWorkoutDates = Record<PPLType, string | null>;

/**
 * Returns the most recent completed-workout date for each PPL type.
 * Full-body workouts count toward push, pull, AND legs — completing one
 * resets all three counters.
 */
export async function getLastWorkoutByType(): Promise<LastWorkoutDates> {
  const completed = await db.workouts
    .where('status')
    .equals('completed')
    .toArray();

  // Newest first
  completed.sort((a, b) => b.date.localeCompare(a.date));

  const lastDone: LastWorkoutDates = { push: null, pull: null, legs: null };

  for (const w of completed) {
    if (w.type === 'full-body') {
      if (!lastDone.push) lastDone.push = w.date;
      if (!lastDone.pull) lastDone.pull = w.date;
      if (!lastDone.legs) lastDone.legs = w.date;
    } else if (w.type === 'push' || w.type === 'pull' || w.type === 'legs') {
      if (!lastDone[w.type]) lastDone[w.type] = w.date;
    }
    if (lastDone.push && lastDone.pull && lastDone.legs) break;
  }

  return lastDone;
}

/**
 * Formats a last-done date into a short human label: "today", "yesterday",
 * "3d ago", "2w ago", or "never".
 */
export function formatDaysSince(date: string | null, todayStr: string = toISODate(new Date())): string {
  if (!date) return 'never';
  const days = Math.floor(
    (new Date(todayStr).getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24),
  );
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 14) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 9) return `${weeks}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}
