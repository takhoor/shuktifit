export interface AIWorkoutRequest {
  todayType: 'push' | 'pull' | 'legs';
  userProfile: {
    name: string;
    age: number;
    gender: string;
    experienceLevel: string;
    goals: string[];
    equipment: string[];
    injuries: string;
    trainingFrequency: number;
  };
  recentWorkouts: Array<{
    date: string;
    type: string;
    exercises: Array<{
      name: string;
      bestWeight: number;
      bestReps: number;
      totalSets: number;
    }>;
  }>;
  exerciseHistory: Array<{
    exerciseId: string;
    name: string;
    lastDate: string;
    bestWeight: number;
    bestReps: number;
    oneRepMax: number;
  }>;
  excludedExercises: string[];
  userNotes?: string;
}

export interface AIWorkoutResponse {
  exercises: Array<{
    exerciseId?: string;
    name: string;
    sets: number;
    targetReps: number;
    targetWeight: number;
    restSeconds: number;
    supersetWith?: string;
    notes?: string;
  }>;
  reasoning: string;
  estimatedDuration: number;
}

export interface AISubstituteRequest {
  exerciseName: string;
  exerciseId: string;
  primaryMuscles: string[];
  equipment: string[];
  experienceLevel: string;
  reason?: string;
}

export interface AISubstituteResponse {
  alternatives: Array<{
    exerciseId?: string;
    name: string;
    equipment: string;
    reasoning: string;
  }>;
}
