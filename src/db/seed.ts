import { db } from './index';
import type { Exercise } from '../types/database';
import exercisesData from '../data/exercises.json';

export async function seedExercises(): Promise<void> {
  const count = await db.exercises.count();
  if (count > 0) return;

  const exercises = exercisesData as Exercise[];
  await db.exercises.bulkAdd(exercises);
  console.log(`Seeded ${exercises.length} exercises`);
}
