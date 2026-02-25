export type WorkoutToolName = 'create_workout' | 'modify_workout';

export interface CreateWorkoutInput {
  workout_type: 'push' | 'pull' | 'legs';
  exercises: Array<{
    name: string;
    sets: number;
    target_reps: number;
    target_weight: number;
    rest_seconds: number;
    superset_with?: string;
    notes?: string;
  }>;
  reasoning: string;
  estimated_duration: number;
}

export interface ModifyWorkoutInput {
  workout_id: number;
  operations: WorkoutOperation[];
  summary: string;
}

export type WorkoutOperation =
  | { op: 'remove'; workout_exercise_id: number; exercise_name: string }
  | {
      op: 'update';
      workout_exercise_id: number;
      exercise_name: string;
      target_sets?: number;
      target_reps?: number;
      suggested_weight?: number;
      rest_seconds?: number;
    }
  | {
      op: 'add';
      exercise_name: string;
      sets: number;
      target_reps: number;
      target_weight: number;
      rest_seconds: number;
      notes?: string;
    };

export interface ChatAPIResponse {
  reply: string;
  toolCall?: {
    name: WorkoutToolName;
    input: CreateWorkoutInput | ModifyWorkoutInput;
  };
}

export type PendingAction =
  | { type: 'create'; input: CreateWorkoutInput }
  | { type: 'modify'; input: ModifyWorkoutInput };
