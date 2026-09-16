import { db } from '../db';
import { toISODate } from '../utils/dateUtils';
import { isWorkoutDay } from '../utils/pplUtils';

// Scheduled workout days you may miss per week without breaking the streak.
const FREE_PASSES_PER_WEEK = 1;
// Gaps larger than this always break the streak (guards the day-by-day scan).
const MAX_GAP_DAYS = 60;

function mondayOf(dateStr: string): string {
  const d = new Date(dateStr);
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return toISODate(monday);
}

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000);
}

/** Scheduled workout days strictly between `from` and `to` (both exclusive). */
function missedWorkoutDays(from: string, to: string, workoutDays?: number[]): number {
  const gap = daysBetween(from, to);
  if (gap <= 1) return 0;
  if (gap > MAX_GAP_DAYS) return Number.MAX_SAFE_INTEGER;
  const base = new Date(from);
  let missed = 0;
  for (let i = 1; i < gap; i++) {
    const day = new Date(base);
    day.setDate(base.getDate() + i);
    if (isWorkoutDay(day, workoutDays)) missed++;
  }
  return missed;
}

/**
 * Update the 'workout' streak when a workout is completed on `date` (YYYY-MM-DD).
 *
 * Fixes bug B2 (nothing ever wrote to the streaks table). Rules:
 *  - Increments on consecutive scheduled workout days.
 *  - Rest days (non-workout days per the user's schedule) are free.
 *  - Up to FREE_PASSES_PER_WEEK missed *scheduled* days per week are forgiven.
 *  - Larger gaps reset the streak to 1.
 *
 * Idempotent per day; never throws to the caller.
 */
export async function recordWorkoutCompletion(date: string): Promise<void> {
  try {
    const profile = await db.userProfile.toCollection().first();
    const workoutDays = profile?.workoutDays;
    const week = mondayOf(date);
    const existing = await db.streaks.where('type').equals('workout').first();

    if (!existing) {
      await db.streaks.add({
        type: 'workout',
        currentCount: 1,
        longestCount: 1,
        lastActivityDate: date,
        freeRestDaysUsedThisWeek: 0,
        weekStartDate: week,
      });
      return;
    }

    // Already counted for this day, or completing an older/backfilled date — leave as-is.
    if (daysBetween(existing.lastActivityDate, date) <= 0) return;

    let passesUsed = existing.weekStartDate === week ? existing.freeRestDaysUsedThisWeek : 0;
    const available = FREE_PASSES_PER_WEEK - passesUsed;
    const missed = missedWorkoutDays(existing.lastActivityDate, date, workoutDays);

    let currentCount: number;
    if (missed === 0) {
      currentCount = existing.currentCount + 1;
    } else if (missed <= available) {
      currentCount = existing.currentCount + 1;
      passesUsed += missed;
    } else {
      currentCount = 1;
      passesUsed = 0;
    }

    await db.streaks.update(existing.id!, {
      currentCount,
      longestCount: Math.max(existing.longestCount, currentCount),
      lastActivityDate: date,
      freeRestDaysUsedThisWeek: passesUsed,
      weekStartDate: week,
    });
  } catch (err) {
    console.error('[streakService] failed to update workout streak', err);
  }
}
