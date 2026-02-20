import { db } from './index';
import type { Exercise, WorkoutTemplate, TemplateExercise, CustomDataSeries } from '../types/database';
import exercisesData from '../data/exercises.json';
import { CURATED_TEMPLATES } from '../data/workoutTemplates';
import { TRACKER_PRESETS } from '../data/trackerPresets';
import { toISODate } from '../utils/dateUtils';

export async function seedExercises(): Promise<void> {
  const count = await db.exercises.count();
  if (count > 0) return;

  const exercises = exercisesData as Exercise[];
  await db.exercises.bulkAdd(exercises);
  console.log(`Seeded ${exercises.length} exercises`);
}

export async function seedTemplates(): Promise<void> {
  const existing = await db.workoutTemplates
    .filter((t) => !t.isUserCreated)
    .toArray();
  const existingNames = new Set(existing.map((t) => t.name));

  const toSeed = CURATED_TEMPLATES.filter((t) => !existingNames.has(t.name));
  if (toSeed.length === 0) return;

  for (const template of toSeed) {
    const { exercises, ...templateData } = template;
    const now = new Date().toISOString();

    const templateId = await db.workoutTemplates.add({
      ...templateData,
      isUserCreated: false,
      createdAt: now,
      updatedAt: now,
    } as WorkoutTemplate);

    for (let i = 0; i < exercises.length; i++) {
      await db.templateExercises.add({
        templateId: templateId as number,
        ...exercises[i],
        order: i,
      } as TemplateExercise);
    }
  }

  console.log(`Seeded ${toSeed.length} new workout templates`);
}

export async function seedTrackerPresets(): Promise<void> {
  const existing = await db.customDataSeries
    .filter((s) => s.showOnDashboard === true)
    .count();
  if (existing > 0) return;

  for (const preset of TRACKER_PRESETS) {
    await db.customDataSeries.add({
      ...preset,
      isArchived: false,
      isSystemPreset: true,
      createdAt: new Date().toISOString(),
    } as CustomDataSeries);
  }

  console.log(`Seeded ${TRACKER_PRESETS.length} dashboard tracker presets`);
}

/**
 * One-time migration: fix data points that were stored with UTC dates
 * instead of local dates (from the pre-fix toISODate bug).
 * Re-derives the date from each point's timestamp using local time.
 */
export async function migrateUTCDates(): Promise<void> {
  const migrated = localStorage.getItem('shuktifit_utc_migration');
  if (migrated) return;

  let fixedPoints = 0;
  let fixedWorkouts = 0;
  let fixedHistory = 0;

  // Fix customDataPoints
  const points = await db.customDataPoints.toArray();
  for (const p of points) {
    if (p.timestamp) {
      const correctDate = toISODate(new Date(p.timestamp));
      if (correctDate !== p.date) {
        await db.customDataPoints.update(p.id!, { date: correctDate });
        fixedPoints++;
      }
    }
  }

  // Fix workouts
  const workouts = await db.workouts.toArray();
  for (const w of workouts) {
    if (w.createdAt) {
      const correctDate = toISODate(new Date(w.createdAt));
      if (correctDate !== w.date) {
        await db.workouts.update(w.id!, { date: correctDate });
        fixedWorkouts++;
      }
    }
  }

  // Fix exercise history
  const history = await db.exerciseHistory.toArray();
  for (const h of history) {
    if (h.date) {
      // History dates don't have a timestamp, but check if the date looks like
      // it was generated from UTC (we can detect this by seeing if a workout
      // exists on the correct date instead)
      const workout = await db.workouts.where('date').equals(h.date).first();
      if (!workout) {
        // Try shifting by one day (the typical UTC offset error)
        const d = new Date(h.date + 'T12:00:00');
        d.setDate(d.getDate() - 1);
        const altDate = toISODate(d);
        const altWorkout = await db.workouts.where('date').equals(altDate).first();
        if (altWorkout) {
          await db.exerciseHistory.update(h.id!, { date: altDate });
          fixedHistory++;
        }
      }
    }
  }

  localStorage.setItem('shuktifit_utc_migration', 'done');
  if (fixedPoints || fixedWorkouts || fixedHistory) {
    console.log(`UTC date migration: fixed ${fixedPoints} data points, ${fixedWorkouts} workouts, ${fixedHistory} history entries`);
  }
}
