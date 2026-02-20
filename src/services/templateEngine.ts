import { db } from '../db';
import type { Workout, WorkoutTemplate, TemplateExercise } from '../types/database';
import { addExerciseToWorkout, getProgressiveLoad } from './workoutEngine';
import { today } from '../utils/dateUtils';

export async function createWorkoutFromTemplate(
  templateId: number,
): Promise<number> {
  const template = await db.workoutTemplates.get(templateId);
  if (!template) throw new Error('Template not found');

  const templateExercises = await db.templateExercises
    .where('templateId')
    .equals(templateId)
    .sortBy('order');

  const workoutType = template.type === 'full-body' ? 'custom' : template.type;

  const workoutId = await db.workouts.add({
    date: today(),
    type: workoutType,
    status: 'planned',
    name: template.name,
    aiGenerated: false,
    templateId,
    createdAt: new Date().toISOString(),
  } as Workout);

  for (const te of templateExercises) {
    const progression = await getProgressiveLoad(te.exerciseId, te.targetReps);
    // Use progressive load if user has history, otherwise fall back to template suggestion
    const weight = progression.weight > 0 ? progression.weight : te.suggestedWeight;

    await addExerciseToWorkout(
      workoutId as number,
      te.exerciseId,
      te.exerciseName,
      te.targetSets,
      te.targetReps,
      weight,
      te.restSeconds,
    );
  }

  return workoutId as number;
}

export async function saveWorkoutAsTemplate(
  workoutId: number,
  name: string,
  description?: string,
): Promise<number> {
  const workout = await db.workouts.get(workoutId);
  if (!workout) throw new Error('Workout not found');

  const exercises = await db.workoutExercises
    .where('workoutId')
    .equals(workoutId)
    .sortBy('order');

  const duration = workout.durationMinutes
    ? (workout.durationMinutes <= 25 ? 20 : workout.durationMinutes <= 35 ? 30 : 45) as 20 | 30 | 45
    : 30 as const;

  const now = new Date().toISOString();

  const templateId = await db.workoutTemplates.add({
    name,
    description,
    type: workout.type === 'custom' ? 'full-body' : workout.type,
    duration,
    equipmentProfile: 'full',
    tags: [workout.type, 'user-created'],
    isUserCreated: true,
    sourceWorkoutId: workoutId,
    createdAt: now,
    updatedAt: now,
  } as WorkoutTemplate);

  for (const ex of exercises) {
    await db.templateExercises.add({
      templateId: templateId as number,
      exerciseId: ex.exerciseId,
      exerciseName: ex.exerciseName,
      order: ex.order,
      targetSets: ex.targetSets,
      targetReps: ex.targetReps,
      suggestedWeight: ex.suggestedWeight,
      restSeconds: ex.restSeconds,
      supersetGroup: ex.supersetGroup,
      notes: ex.notes,
    } as TemplateExercise);
  }

  return templateId as number;
}
