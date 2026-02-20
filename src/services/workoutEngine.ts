import { db } from '../db';
import type {
  Workout,
  WorkoutExercise,
  ExerciseSet,
  ExerciseHistory,
} from '../types/database';
import type { AIWorkoutResponse } from '../types/ai';
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

export async function swapExerciseInWorkout(
  workoutExerciseId: number,
  newExerciseId: string,
  newExerciseName: string,
): Promise<void> {
  const we = await db.workoutExercises.get(workoutExerciseId);
  if (!we) return;

  // Get progressive load for the new exercise
  const load = await getProgressiveLoad(newExerciseId, we.targetReps);

  // Delete old sets
  await db.exerciseSets
    .where('workoutExerciseId')
    .equals(workoutExerciseId)
    .delete();

  // Update the workout exercise record
  await db.workoutExercises.update(workoutExerciseId, {
    exerciseId: newExerciseId,
    exerciseName: newExerciseName,
    suggestedWeight: load.weight,
    isCompleted: false,
  });

  // Recreate sets
  for (let i = 1; i <= we.targetSets; i++) {
    await db.exerciseSets.add({
      workoutExerciseId,
      setNumber: i,
      targetReps: we.targetReps,
      targetWeight: load.weight,
      setType: 'working',
      isCompleted: false,
      isPR: false,
    } as ExerciseSet);
  }
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

/**
 * Suggests progressive weight/reps for an exercise based on last performance.
 * - If user hit targetReps at their last weight → bump weight by increment
 * - If not → keep same weight (user still needs to hit the reps)
 * - Compounds get +5 lbs, isolation gets +2.5 lbs
 */
export async function getProgressiveLoad(
  exerciseId: string,
  targetReps: number,
): Promise<{ weight: number; reps: number }> {
  const last = await getLastPerformance(exerciseId);
  if (!last || last.bestWeight === 0) {
    return { weight: 0, reps: targetReps };
  }

  // Determine increment based on exercise type (compound vs isolation)
  const exercise = await db.exercises.get(exerciseId);
  const isCompound = exercise?.mechanic === 'compound';
  const increment = isCompound ? 5 : 2.5;

  // Did the user hit the target reps at their best weight last time?
  if (last.bestReps >= targetReps) {
    // Ready to increase weight
    return { weight: last.bestWeight + increment, reps: targetReps };
  }

  // Not yet hitting target reps — keep same weight, same target
  return { weight: last.bestWeight, reps: targetReps };
}

export async function deleteSet(setId: number): Promise<{ isLastSet: boolean }> {
  const set = await db.exerciseSets.get(setId);
  if (!set) return { isLastSet: false };

  const remaining = await db.exerciseSets
    .where('workoutExerciseId')
    .equals(set.workoutExerciseId)
    .toArray();

  if (remaining.length <= 1) {
    return { isLastSet: true };
  }

  await db.exerciseSets.delete(setId);

  const updated = remaining
    .filter((s) => s.id !== setId)
    .sort((a, b) => a.setNumber - b.setNumber);

  await db.transaction('rw', db.exerciseSets, db.workoutExercises, async () => {
    for (let i = 0; i < updated.length; i++) {
      await db.exerciseSets.update(updated[i].id!, { setNumber: i + 1 });
    }
    const allDone = updated.every((s) => s.isCompleted);
    await db.workoutExercises.update(set.workoutExerciseId, {
      targetSets: updated.length,
      isCompleted: updated.length > 0 && allDone,
    });
  });

  return { isLastSet: false };
}

export async function updateCompletedSet(
  setId: number,
  newReps: number,
  newWeight: number,
): Promise<{ isPR: boolean }> {
  const set = await db.exerciseSets.get(setId);
  if (!set || !set.isCompleted) return { isPR: false };

  const we = await db.workoutExercises.get(set.workoutExerciseId);
  if (!we) return { isPR: false };

  const history = await db.exerciseHistory
    .where('exerciseId')
    .equals(we.exerciseId)
    .toArray();

  let isPR = false;
  if (history.length > 0) {
    const bestPrevious1RM = Math.max(
      ...history.map((h) => h.oneRepMaxEstimate),
    );
    const current1RM = estimate1RM(newWeight, newReps);
    isPR = current1RM > bestPrevious1RM && newWeight > 0;
  } else if (newWeight > 0) {
    isPR = true;
  }

  await db.exerciseSets.update(setId, {
    actualReps: newReps,
    actualWeight: newWeight,
    isPR,
  });

  return { isPR };
}

export async function recalculateWorkoutStats(
  workoutId: number,
): Promise<void> {
  const workout = await db.workouts.get(workoutId);
  if (!workout || workout.status !== 'completed') return;

  const exercises = await db.workoutExercises
    .where('workoutId')
    .equals(workoutId)
    .toArray();

  let totalVolume = 0;

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
        exVolume += s.actualWeight * s.actualReps;
        completedSets++;
        if (
          s.actualWeight > bestWeight ||
          (s.actualWeight === bestWeight && s.actualReps > bestReps)
        ) {
          bestWeight = s.actualWeight;
          bestReps = s.actualReps;
        }
      }
    }

    totalVolume += exVolume;

    const existingHistory = await db.exerciseHistory
      .where('[exerciseId+date]')
      .equals([ex.exerciseId, workout.date])
      .first();

    if (existingHistory && completedSets > 0) {
      await db.exerciseHistory.update(existingHistory.id!, {
        bestWeight,
        bestReps,
        totalVolume: exVolume,
        totalSets: completedSets,
        oneRepMaxEstimate: estimate1RM(bestWeight, bestReps),
      });
    } else if (!existingHistory && completedSets > 0) {
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
    } else if (existingHistory && completedSets === 0) {
      await db.exerciseHistory.delete(existingHistory.id!);
    }
  }

  await db.workouts.update(workoutId, { totalVolume });
}

export async function updateWorkoutDate(
  workoutId: number,
  newDate: string,
): Promise<void> {
  await db.workouts.update(workoutId, { date: newDate });
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

async function findExerciseByName(name: string): Promise<{ id: string; name: string } | null> {
  const normalized = name.toLowerCase().trim();

  // Try exact match first
  const exact = await db.exercises.where('name').equalsIgnoreCase(normalized).first();
  if (exact) return { id: exact.id, name: exact.name };

  // Fallback: search all exercises for best substring match
  const all = await db.exercises.toArray();
  const match = all.find((e) => e.name.toLowerCase() === normalized);
  if (match) return { id: match.id, name: match.name };

  // Partial match: AI name contained in DB name or vice versa
  const partial = all.find(
    (e) =>
      e.name.toLowerCase().includes(normalized) ||
      normalized.includes(e.name.toLowerCase()),
  );
  if (partial) return { id: partial.id, name: partial.name };

  return null;
}

export async function createAIWorkout(
  type: PPLType,
  aiResponse: AIWorkoutResponse,
): Promise<number> {
  const workoutId = await db.workouts.add({
    date: today(),
    type,
    status: 'planned',
    name: `AI ${type.charAt(0).toUpperCase() + type.slice(1)} Day`,
    aiGenerated: true,
    aiReasoning: aiResponse.reasoning,
    createdAt: new Date().toISOString(),
  } as Workout);

  for (let i = 0; i < aiResponse.exercises.length; i++) {
    const aiEx = aiResponse.exercises[i];
    const dbExercise = await findExerciseByName(aiEx.name);

    const exerciseId = dbExercise?.id ?? `ai_${aiEx.name.toLowerCase().replace(/\s+/g, '_')}`;
    const exerciseName = dbExercise?.name ?? aiEx.name;

    const weId = await db.workoutExercises.add({
      workoutId: workoutId as number,
      exerciseId,
      exerciseName,
      order: i,
      supersetGroup: aiEx.supersetWith ? i : null,
      targetSets: aiEx.sets,
      targetReps: aiEx.targetReps,
      suggestedWeight: aiEx.targetWeight,
      restSeconds: aiEx.restSeconds,
      isCompleted: false,
      notes: aiEx.notes,
    } as WorkoutExercise);

    for (let s = 1; s <= aiEx.sets; s++) {
      await db.exerciseSets.add({
        workoutExerciseId: weId as number,
        setNumber: s,
        targetReps: aiEx.targetReps,
        targetWeight: aiEx.targetWeight,
        setType: 'working',
        isCompleted: false,
        isPR: false,
      } as ExerciseSet);
    }
  }

  return workoutId as number;
}

export async function excludeExercise(
  exerciseId: string,
  reason?: string,
): Promise<void> {
  const existing = await db.exerciseExclusions
    .where('exerciseId')
    .equals(exerciseId)
    .first();
  if (existing) return;

  await db.exerciseExclusions.add({
    exerciseId,
    reason,
    excludedAt: new Date().toISOString(),
  });
}
