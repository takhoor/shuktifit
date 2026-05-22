import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { PPL_COLORS, PPL_TYPES } from '../../utils/constants';
import type { PPLType } from '../../utils/constants';
import { formatDaysSince } from '../../services/pplScheduler';

/**
 * Shows 3 chips — "Push · 3d ago", "Pull · today", "Legs · never".
 * Full-body workouts count toward all three.
 */
export function LastWorkoutSummary() {
  // Reactive read so the summary refreshes when a workout is completed.
  const completed = useLiveQuery(
    () => db.workouts.where('status').equals('completed').toArray(),
    [],
  );

  const lastDone: Record<PPLType, string | null> = { push: null, pull: null, legs: null };
  if (completed) {
    const sorted = [...completed].sort((a, b) => b.date.localeCompare(a.date));
    for (const w of sorted) {
      if (w.type === 'full-body') {
        if (!lastDone.push) lastDone.push = w.date;
        if (!lastDone.pull) lastDone.pull = w.date;
        if (!lastDone.legs) lastDone.legs = w.date;
      } else if (w.type === 'push' || w.type === 'pull' || w.type === 'legs') {
        if (!lastDone[w.type]) lastDone[w.type] = w.date;
      }
      if (lastDone.push && lastDone.pull && lastDone.legs) break;
    }
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {PPL_TYPES.map((type) => {
        const color = PPL_COLORS[type];
        const label = formatDaysSince(lastDone[type]);
        return (
          <div
            key={type}
            className="p-2 rounded-xl bg-bg-elevated border border-border flex flex-col items-center text-center"
          >
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span
                className="text-[10px] font-bold uppercase tracking-wide"
                style={{ color }}
              >
                {type}
              </span>
            </div>
            <span className="text-xs font-medium text-text-primary">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
