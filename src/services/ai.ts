import type { AIWorkoutRequest, AIWorkoutResponse, AISubstituteRequest, AISubstituteResponse } from '../types/ai';
import type { ChatAPIResponse } from '../types/chatActions';
import { db } from '../db';
import type { UserProfile } from '../types/database';

const API_BASE = '/api';

export async function generateAIWorkout(
  todayType: 'push' | 'pull' | 'legs',
  userNotes?: string,
): Promise<AIWorkoutResponse> {
  const context = await buildWorkoutContext(todayType, userNotes);
  const res = await fetch(`${API_BASE}/claude-workout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(context),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate workout');
  }
  return res.json();
}

export async function getSubstitutes(
  request: AISubstituteRequest,
): Promise<AISubstituteResponse> {
  const res = await fetch(`${API_BASE}/claude-substitute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to get substitutes');
  }
  return res.json();
}

async function buildWorkoutContext(
  todayType: 'push' | 'pull' | 'legs',
  userNotes?: string,
): Promise<AIWorkoutRequest> {
  const profile = await db.userProfile.toCollection().first();
  if (!profile) throw new Error('No user profile found');

  // Get recent workouts (last 14 days)
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const cutoffDate = `${twoWeeksAgo.getFullYear()}-${String(twoWeeksAgo.getMonth() + 1).padStart(2, '0')}-${String(twoWeeksAgo.getDate()).padStart(2, '0')}`;

  const recentWorkouts = await db.workouts
    .where('date')
    .aboveOrEqual(cutoffDate)
    .and((w) => w.status === 'completed')
    .toArray();

  const workoutsWithExercises = await Promise.all(
    recentWorkouts.map(async (w) => {
      const exercises = await db.workoutExercises
        .where('workoutId')
        .equals(w.id!)
        .toArray();

      const exerciseDetails = await Promise.all(
        exercises.map(async (ex) => {
          const history = await db.exerciseHistory
            .where('[exerciseId+date]')
            .equals([ex.exerciseId, w.date])
            .first();
          return {
            name: ex.exerciseName,
            bestWeight: history?.bestWeight ?? 0,
            bestReps: history?.bestReps ?? 0,
            totalSets: history?.totalSets ?? ex.targetSets,
          };
        }),
      );

      return {
        date: w.date,
        type: w.type,
        exercises: exerciseDetails,
      };
    }),
  );

  // Get unique exercise history (latest per exercise)
  const allHistory = await db.exerciseHistory.toArray();
  const latestByExercise = new Map<string, typeof allHistory[0]>();
  for (const h of allHistory) {
    const existing = latestByExercise.get(h.exerciseId);
    if (!existing || h.date > existing.date) {
      latestByExercise.set(h.exerciseId, h);
    }
  }

  const exerciseHistory = Array.from(latestByExercise.values()).map((h) => ({
    exerciseId: h.exerciseId,
    name: h.exerciseName,
    lastDate: h.date,
    bestWeight: h.bestWeight,
    bestReps: h.bestReps,
    oneRepMax: h.oneRepMaxEstimate,
  }));

  // Get excluded exercises
  const exclusions = await db.exerciseExclusions.toArray();
  const excludedNames = await Promise.all(
    exclusions.map(async (ex) => {
      const exercise = await db.exercises.get(ex.exerciseId);
      return exercise?.name ?? ex.exerciseId;
    }),
  );

  return {
    todayType,
    userProfile: profileToContext(profile),
    recentWorkouts: workoutsWithExercises,
    exerciseHistory,
    excludedExercises: excludedNames,
    userNotes,
  };
}

export async function sendChatMessage(
  message: string,
  context: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  todayWorkoutContext?: string,
): Promise<ChatAPIResponse> {
  const res = await fetch(`${API_BASE}/claude-chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, context, conversationHistory, todayWorkoutContext }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to get AI response');
  }
  const data: ChatAPIResponse = await res.json();
  return data;
}

function profileToContext(profile: UserProfile) {
  return {
    name: profile.name,
    age: profile.age,
    gender: profile.gender,
    experienceLevel: profile.experienceLevel,
    goals: profile.goals,
    equipment: profile.equipment,
    injuries: profile.injuries,
    trainingFrequency: profile.trainingFrequency,
  };
}
