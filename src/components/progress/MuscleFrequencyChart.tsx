import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { EmptyState } from '../ui/EmptyState';
import { MUSCLE_GROUPS } from '../../utils/constants';

interface MuscleFrequency {
  muscle: string;
  count: number;
}

export function MuscleFrequencyChart() {
  const muscleData = useLiveQuery(async (): Promise<MuscleFrequency[]> => {
    // Get completed workouts from last 30 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const cutoffStr = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, '0')}-${String(cutoff.getDate()).padStart(2, '0')}`;

    const recentWorkouts = await db.workouts
      .where('date')
      .aboveOrEqual(cutoffStr)
      .and((w) => w.status === 'completed')
      .toArray();

    if (recentWorkouts.length === 0) return [];

    // Get all workout exercises for these workouts
    const muscleCount = new Map<string, number>();

    for (const workout of recentWorkouts) {
      const exercises = await db.workoutExercises
        .where('workoutId')
        .equals(workout.id!)
        .toArray();

      for (const we of exercises) {
        const exercise = await db.exercises.get(we.exerciseId);
        if (exercise) {
          for (const muscle of exercise.primaryMuscles) {
            muscleCount.set(muscle, (muscleCount.get(muscle) ?? 0) + 1);
          }
          for (const muscle of exercise.secondaryMuscles) {
            muscleCount.set(muscle, (muscleCount.get(muscle) ?? 0) + 0.5);
          }
        }
      }
    }

    return MUSCLE_GROUPS
      .map((muscle) => ({
        muscle,
        count: Math.round((muscleCount.get(muscle) ?? 0) * 10) / 10,
      }))
      .sort((a, b) => b.count - a.count);
  });

  if (!muscleData || muscleData.every((m) => m.count === 0)) {
    return (
      <EmptyState
        icon="🎯"
        title="No muscle data yet"
        description="Complete workouts to see your muscle group frequency"
      />
    );
  }

  const maxCount = Math.max(...muscleData.map((m) => m.count));

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-text-secondary">Muscle Frequency</h3>
        <p className="text-xs text-text-muted">Last 30 days</p>
      </div>

      <div className="space-y-2">
        {muscleData.map((m) => (
          <MuscleBar
            key={m.muscle}
            muscle={m.muscle}
            count={m.count}
            max={maxCount}
          />
        ))}
      </div>
    </div>
  );
}

function MuscleBar({
  muscle,
  count,
  max,
}: {
  muscle: string;
  count: number;
  max: number;
}) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  const intensity = max > 0 ? count / max : 0;

  // Color from cold (low frequency) to hot (high frequency)
  const hue = intensity > 0.6 ? 25 : intensity > 0.3 ? 40 : 210;
  const saturation = Math.max(30, intensity * 100);
  const lightness = 50;
  const bgColor = count > 0
    ? `hsl(${hue}, ${saturation}%, ${lightness}%)`
    : '#2A2A4A';

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-text-secondary w-24 shrink-0 capitalize truncate">
        {muscle}
      </span>
      <div className="flex-1 h-6 bg-bg-elevated rounded-lg overflow-hidden">
        <div
          className="h-full rounded-lg transition-all duration-500"
          style={{
            width: `${Math.max(pct, count > 0 ? 4 : 0)}%`,
            backgroundColor: bgColor,
          }}
        />
      </div>
      <span className="text-xs text-text-muted w-8 text-right">
        {count > 0 ? count : '-'}
      </span>
    </div>
  );
}
