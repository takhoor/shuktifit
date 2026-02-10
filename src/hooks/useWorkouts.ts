import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

export function useWorkoutList() {
  return useLiveQuery(() =>
    db.workouts.orderBy('date').reverse().toArray(),
  );
}

export function useWorkout(id: number | null | undefined) {
  return useLiveQuery(
    () => (id ? db.workouts.get(id) : undefined),
    [id],
  );
}

export function useWorkoutExercises(workoutId: number | null | undefined) {
  return useLiveQuery(
    () =>
      workoutId
        ? db.workoutExercises
            .where('workoutId')
            .equals(workoutId)
            .sortBy('order')
        : [],
    [workoutId],
  );
}

export function useExerciseSets(workoutExerciseId: number | null | undefined) {
  return useLiveQuery(
    () =>
      workoutExerciseId
        ? db.exerciseSets
            .where('workoutExerciseId')
            .equals(workoutExerciseId)
            .sortBy('setNumber')
        : [],
    [workoutExerciseId],
  );
}

export function useAllSetsForWorkout(workoutId: number | null | undefined) {
  return useLiveQuery(async () => {
    if (!workoutId) return [];
    const exercises = await db.workoutExercises
      .where('workoutId')
      .equals(workoutId)
      .toArray();
    const allSets: Record<number, Awaited<ReturnType<typeof db.exerciseSets.toArray>>> = {};
    for (const ex of exercises) {
      allSets[ex.id!] = await db.exerciseSets
        .where('workoutExerciseId')
        .equals(ex.id!)
        .sortBy('setNumber');
    }
    return allSets;
  }, [workoutId]);
}

export function useExerciseHistory(exerciseId: string | undefined) {
  return useLiveQuery(
    () =>
      exerciseId
        ? db.exerciseHistory
            .where('exerciseId')
            .equals(exerciseId)
            .reverse()
            .sortBy('date')
        : [],
    [exerciseId],
  );
}
