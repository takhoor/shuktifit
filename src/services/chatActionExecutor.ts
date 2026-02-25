import { db } from '../db';
import {
  createAIWorkout,
  addExerciseToWorkout,
  removeExerciseFromWorkout,
  updateExerciseTargets,
  findExerciseByName,
} from './workoutEngine';
import type { CreateWorkoutInput, ModifyWorkoutInput } from '../types/chatActions';
import type { AIWorkoutResponse } from '../types/ai';
import { today } from '../utils/dateUtils';

export async function executeCreateWorkout(input: CreateWorkoutInput): Promise<number> {
  // Guard: refuse if a non-completed workout already exists for today
  const todayStr = today();
  const existing = await db.workouts
    .where('date')
    .equals(todayStr)
    .and((w) => w.status === 'planned' || w.status === 'in_progress')
    .first();
  if (existing) {
    throw new Error(
      "A workout already exists for today — ask me to modify it instead, or go to your workouts list to delete it first.",
    );
  }

  // Convert snake_case tool input to the AIWorkoutResponse camelCase shape
  const aiResponse: AIWorkoutResponse = {
    exercises: input.exercises.map((ex) => ({
      name: ex.name,
      sets: ex.sets,
      targetReps: ex.target_reps,
      targetWeight: ex.target_weight,
      restSeconds: ex.rest_seconds,
      supersetWith: ex.superset_with,
      notes: ex.notes,
    })),
    reasoning: input.reasoning,
    estimatedDuration: input.estimated_duration,
  };

  const workoutId = await createAIWorkout(input.workout_type, aiResponse);
  return workoutId;
}

export async function executeModifyWorkout(input: ModifyWorkoutInput): Promise<void> {
  // Pre-flight: verify all referenced workoutExercise IDs actually exist
  for (const op of input.operations) {
    if ((op.op === 'remove' || op.op === 'update') && op.workout_exercise_id != null) {
      const exists = await db.workoutExercises.get(op.workout_exercise_id);
      if (!exists || exists.workoutId !== input.workout_id) {
        throw new Error(
          `Exercise "${op.exercise_name}" (ID ${op.workout_exercise_id}) was not found in this workout. Please try again.`,
        );
      }
    }
  }

  for (const op of input.operations) {
    if (op.op === 'remove') {
      await removeExerciseFromWorkout(op.workout_exercise_id);
    } else if (op.op === 'update') {
      await updateExerciseTargets(op.workout_exercise_id, {
        ...(op.target_sets !== undefined && { targetSets: op.target_sets }),
        ...(op.target_reps !== undefined && { targetReps: op.target_reps }),
        ...(op.suggested_weight !== undefined && { suggestedWeight: op.suggested_weight }),
        ...(op.rest_seconds !== undefined && { restSeconds: op.rest_seconds }),
      });
    } else if (op.op === 'add') {
      const match = await findExerciseByName(op.exercise_name);
      const exerciseId = match?.id ?? `ai_${op.exercise_name.toLowerCase().replace(/\s+/g, '_')}`;
      const exerciseName = match?.name ?? op.exercise_name;
      await addExerciseToWorkout(
        input.workout_id,
        exerciseId,
        exerciseName,
        op.sets,
        op.target_reps,
        op.target_weight,
        op.rest_seconds,
      );
    }
  }
}
