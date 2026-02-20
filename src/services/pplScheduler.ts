import type { PPLType } from '../utils/constants';
import { PPL_TYPES } from '../utils/constants';
import { getPPLTypeForDate, isWorkoutDay } from '../utils/pplUtils';
import { toISODate } from '../utils/dateUtils';

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
