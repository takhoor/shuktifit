import type { PPLType } from '../utils/constants';
import { PPL_TYPES } from '../utils/constants';
import { getPPLTypeForDate, isWorkoutDay } from '../utils/pplUtils';
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

// --- Smart Off-Day Suggestions ---

export interface OffDaySuggestion {
  type: PPLType;
  reason: string;
  conflictScore: number;
  alternatives: Array<{ type: PPLType; score: number }>;
}

/**
 * Suggest the best workout type for a rest/off day by analyzing
 * the nearest scheduled workouts and minimizing muscle overlap.
 */
export function suggestOffDayWorkout(
  dateStr: string,
  pplStartDate: string,
  workoutDays?: number[],
): OffDaySuggestion {
  const targetDate = new Date(dateStr);

  // Find nearest workout day BEFORE this date (up to 7 days back)
  let prevType: PPLType | null = null;
  let prevDistance = 0;
  for (let i = 1; i <= 7; i++) {
    const d = new Date(targetDate);
    d.setDate(d.getDate() - i);
    if (isWorkoutDay(d, workoutDays)) {
      const t = getPPLTypeForDate(pplStartDate, toISODate(d), workoutDays);
      if (t !== 'rest') {
        prevType = t;
        prevDistance = i;
        break;
      }
    }
  }

  // Find nearest workout day AFTER this date (up to 7 days forward)
  let nextType: PPLType | null = null;
  let nextDistance = 0;
  for (let i = 1; i <= 7; i++) {
    const d = new Date(targetDate);
    d.setDate(d.getDate() + i);
    if (isWorkoutDay(d, workoutDays)) {
      const t = getPPLTypeForDate(pplStartDate, toISODate(d), workoutDays);
      if (t !== 'rest') {
        nextType = t;
        nextDistance = i;
        break;
      }
    }
  }

  // Score each PPL type for conflict
  const scores = PPL_TYPES.map((type) => {
    let score = 0;

    if (prevType) {
      if (type === prevType) {
        // Same muscle group as adjacent day — high conflict
        score += prevDistance === 1 ? 3 : prevDistance === 2 ? 1 : 0;
      }
    }

    if (nextType) {
      if (type === nextType) {
        score += nextDistance === 1 ? 3 : nextDistance === 2 ? 1 : 0;
      }
    }

    return { type, score };
  });

  scores.sort((a, b) => a.score - b.score);

  const best = scores[0];
  const reason = buildReason(best.type, prevType, prevDistance, nextType, nextDistance);

  return {
    type: best.type,
    reason,
    conflictScore: best.score,
    alternatives: scores.slice(1),
  };
}

function buildReason(
  suggested: PPLType,
  prevType: PPLType | null,
  prevDist: number,
  nextType: PPLType | null,
  nextDist: number,
): string {
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const parts: string[] = [];

  if (prevType && prevDist <= 2) {
    parts.push(`${capitalize(prevType)} was ${prevDist === 1 ? 'yesterday' : '2 days ago'}`);
  }
  if (nextType && nextDist <= 2) {
    parts.push(`${capitalize(nextType)} is ${nextDist === 1 ? 'tomorrow' : 'in 2 days'}`);
  }

  if (parts.length === 0) {
    return `${capitalize(suggested)} is a great choice for today`;
  }

  return `${capitalize(suggested)} — ${parts.join(' and ')}, so ${suggested} won't interfere with recovery`;
}

// --- Smart Next-Workout Based on Completion History ---

/**
 * Determines the best next workout type by looking at recently completed workouts.
 * Rules:
 * 1. Don't repeat the same type as yesterday (back-to-back avoidance)
 * 2. Prioritize the type with the longest gap since last completion
 * 3. If nothing done recently, default to legs (lower body/core priority)
 */
export async function getSmartNextType(): Promise<{ type: PPLType; reason: string }> {
  const recentWorkouts = await db.workouts
    .where('status')
    .equals('completed')
    .reverse()
    .sortBy('date');

  // Find the most recent completion date for each type
  const lastDone: Record<PPLType, string | null> = { push: null, pull: null, legs: null };
  for (const w of recentWorkouts) {
    const t = w.type as PPLType;
    if (t in lastDone && !lastDone[t]) {
      lastDone[t] = w.date;
    }
    // Stop once we've found all three
    if (lastDone.push && lastDone.pull && lastDone.legs) break;
  }

  const todayStr = toISODate(new Date());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = toISODate(yesterdayDate);

  // Find what was done yesterday (avoid back-to-back)
  const yesterdayTypes = recentWorkouts
    .filter((w) => w.date === yesterdayStr)
    .map((w) => w.type);

  // Score each type — higher = more neglected = should do next
  const scored = PPL_TYPES.map((type) => {
    const last = lastDone[type];
    let daysSince: number;
    if (!last) {
      daysSince = 999; // Never done
    } else {
      daysSince = Math.floor(
        (new Date(todayStr).getTime() - new Date(last).getTime()) / (1000 * 60 * 60 * 24),
      );
    }

    // Penalize if done yesterday (back-to-back avoidance)
    const backToBackPenalty = yesterdayTypes.includes(type) ? -100 : 0;

    return { type, daysSince, score: daysSince + backToBackPenalty };
  });

  scored.sort((a, b) => b.score - a.score);

  const best = scored[0];
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  let reason: string;
  if (best.daysSince >= 999) {
    reason = `${capitalize(best.type)} — you haven't done this yet, time to start`;
  } else if (best.daysSince >= 7) {
    reason = `${capitalize(best.type)} — it's been ${best.daysSince} days since your last ${best.type} workout`;
  } else if (best.daysSince >= 3) {
    reason = `${capitalize(best.type)} — last done ${best.daysSince} days ago, muscles are recovered`;
  } else {
    reason = `${capitalize(best.type)} — best fit based on your recent schedule`;
  }

  return { type: best.type, reason };
}
