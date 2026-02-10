import { db } from '../db';
import type {
  Workout,
  WorkoutExercise,
  ExerciseSet,
  ExerciseHistory,
} from '../types/database';
import { today } from '../utils/dateUtils';
import { estimate1RM } from '../utils/formatUtils';
import { DEFAULT_REST_SECONDS } from '../utils/constants';
import type { PPLType } from '../utils/constants';

export async function createWorkout(
  type: PPLType | 'custom',
  name?: string,
): Promise<number> {
  const id = await db.workouts.add({
    date: today(),
    type,
    status: 'planned',
    name,
    aiGenerated: false,
    createdAt: new Date().toISOString(),
  } as Workout);
  return id as number;
}

export async function addExerciseToWorkout(
  workoutId: number,
  exerciseId: string,
  exerciseName: string,
  targetSets: number = 3,
  targetReps: number = 10,
  suggestedWeight: number = 0,
  restSeconds: number = DEFAULT_REST_SECONDS,
): Promise<number> {
  const existingCount = await db.workoutExercises
    .where('workoutId')
    .equals(workoutId)
    .count();

  const id = await db.workoutExercises.add({
    workoutId,
    exerciseId,
    exerciseName,
    order: existingCount,
    supersetGroup: null,
    targetSets,
    targetReps,
    suggestedWeight,
    restSeconds,
    isCompleted: false,
  } as WorkoutExercise);

  // Create the set rows
  for (let i = 1; i <= targetSets; i++) {
    await db.exerciseSets.add({
      workoutExerciseId: id as number,
      setNumber: i,
      targetReps,
      targetWeight: suggestedWeight,
      setType: 'working',
      isCompleted: false,
      isPR: false,
    } as ExerciseSet);
  }

  return id as number;
}

export async function removeExerciseFromWorkout(
  workoutExerciseId: number,
): Promise<void> {
  await db.exerciseSets
    .where('workoutExerciseId')
    .equals(workoutExerciseId)
    .delete();
  await db.workoutExercises.delete(workoutExerciseId);
}

export async function reorderExercises(
  _workoutId: number,
  orderedIds: number[],
): Promise<void> {
  await db.transaction('rw', db.workoutExercises, async () => {
    for (let i = 0; i < orderedIds.length; i++) {
      await db.workoutExercises.update(orderedIds[i], { order: i });
    }
  });
}

export async function updateExerciseTargets(
  workoutExerciseId: number,
  updates: Partial<Pick<WorkoutExercise, 'targetSets' | 'targetReps' | 'suggestedWeight' | 'restSeconds'>>,
): Promise<void> {
  await db.workoutExercises.update(workoutExerciseId, updates);
}

export async function setSupersetGroup(
  exerciseIds: number[],
  group: number | null,
): Promise<void> {
  await db.transaction('rw', db.workoutExercises, async () => {
    for (const id of exerciseIds) {
      await db.workoutExercises.update(id, { supersetGroup: group });
    }
  });
}

export async function addSetToExercise(
  workoutExerciseId: number,
): Promise<number> {
  const existing = await db.exerciseSets
    .where('workoutExerciseId')
    .equals(workoutExerciseId)
    .toArray();

  const last = existing[existing.length - 1];

  const id = await db.exerciseSets.add({
    workoutExerciseId,
    setNumber: existing.length + 1,
    targetReps: last?.targetReps ?? 10,
    targetWeight: last?.targetWeight ?? 0,
    setType: 'working',
    isCompleted: false,
    isPR: false,
  } as ExerciseSet);

  // Update target sets count
  const we = await db.workoutExercises.get(workoutExerciseId);
  if (we) {
    await db.workoutExercises.update(workoutExerciseId, {
      targetSets: existing.length + 1,
    });
  }

  return id as number;
}

export async function logSet(
  setId: number,
  actualReps: number,
  actualWeight: number,
): Promise<{ isPR: boolean }> {
  const set = await db.exerciseSets.get(setId);
  if (!set) return { isPR: false };

  const we = await db.workoutExercises.get(set.workoutExerciseId);
  if (!we) return { isPR: false };

  // Check if this is a PR
  const history = await db.exerciseHistory
    .where('exerciseId')
    .equals(we.exerciseId)
    .toArray();

  let isPR = false;
  if (history.length > 0) {
    const bestPrevious1RM = Math.max(
      ...history.map((h) => h.oneRepMaxEstimate),
    );
    const current1RM = estimate1RM(actualWeight, actualReps);
    isPR = current1RM > bestPrevious1RM && actualWeight > 0;
  } else if (actualWeight > 0) {
    isPR = true; // First time doing this exercise
  }

  await db.exerciseSets.update(setId, {
    actualReps,
    actualWeight,
    isCompleted: true,
    completedAt: new Date().toISOString(),
    isPR,
  });

  // Check if all sets for this exercise are done
  const allSets = await db.exerciseSets
    .where('workoutExerciseId')
    .equals(set.workoutExerciseId)
    .toArray();
  const allDone = allSets.every(
    (s) => s.id === setId ? true : s.isCompleted,
  );
  if (allDone) {
    await db.workoutExercises.update(set.workoutExerciseId, {
      isCompleted: true,
    });
  }

  return { isPR };
}

export async function startWorkout(workoutId: number): Promise<void> {
  await db.workouts.update(workoutId, {
    status: 'in_progress',
    startedAt: new Date().toISOString(),
  });
}

export async function completeWorkout(
  workoutId: number,
  notes?: string,
): Promise<{
  totalVolume: number;
  durationMinutes: number;
  exerciseCount: number;
  setCount: number;
  prCount: number;
}> {
  const workout = await db.workouts.get(workoutId);
  if (!workout) throw new Error('Workout not found');

  const exercises = await db.workoutExercises
    .where('workoutId')
    .equals(workoutId)
    .toArray();

  let totalVolume = 0;
  let setCount = 0;
  let prCount = 0;

  for (const ex of exercises) {
    const sets = await db.exerciseSets
      .where('workoutExerciseId')
      .equals(ex.id!)
      .toArray();

    let exVolume = 0;
    let bestWeight = 0;
    let bestReps = 0;
    let completedSets = 0;

    for (const s of sets) {
      if (s.isCompleted && s.actualWeight && s.actualReps) {
        const vol = s.actualWeight * s.actualReps;
        exVolume += vol;
        completedSets++;
        if (s.isPR) prCount++;
        if (s.actualWeight > bestWeight || (s.actualWeight === bestWeight && s.actualReps > bestReps)) {
          bestWeight = s.actualWeight;
          bestReps = s.actualReps;
        }
      }
    }

    totalVolume += exVolume;
    setCount += completedSets;

    // Record exercise history
    if (completedSets > 0) {
      await db.exerciseHistory.add({
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        date: workout.date,
        bestWeight,
        bestReps,
        totalVolume: exVolume,
        totalSets: completedSets,
        oneRepMaxEstimate: estimate1RM(bestWeight, bestReps),
      } as ExerciseHistory);
    }
  }

  const now = new Date();
  const startedAt = workout.startedAt ? new Date(workout.startedAt) : now;
  const durationMinutes = Math.round(
    (now.getTime() - startedAt.getTime()) / 60000,
  );

  await db.workouts.update(workoutId, {
    status: 'completed',
    completedAt: now.toISOString(),
    totalVolume,
    durationMinutes,
    notes: notes ?? workout.notes,
  });

  return {
    totalVolume,
    durationMinutes,
    exerciseCount: exercises.length,
    setCount,
    prCount,
  };
}

export async function getLastPerformance(
  exerciseId: string,
): Promise<ExerciseHistory | undefined> {
  const history = await db.exerciseHistory
    .where('exerciseId')
    .equals(exerciseId)
    .reverse()
    .sortBy('date');
  return history[0];
}

export async function deleteWorkout(workoutId: number): Promise<void> {
  const exercises = await db.workoutExercises
    .where('workoutId')
    .equals(workoutId)
    .toArray();

  await db.transaction(
    'rw',
    [db.workouts, db.workoutExercises, db.exerciseSets],
    async () => {
      for (const ex of exercises) {
        await db.exerciseSets
          .where('workoutExerciseId')
          .equals(ex.id!)
          .delete();
      }
      await db.workoutExercises.where('workoutId').equals(workoutId).delete();
      await db.workouts.delete(workoutId);
    },
  );
}
