import Dexie, { type Table } from 'dexie';
import type {
  UserProfile,
  Exercise,
  CustomExercise,
  ExerciseExclusion,
  Workout,
  WorkoutExercise,
  ExerciseSet,
  ExerciseHistory,
  BodyMeasurement,
  BodyAnalysis,
  WithingsData,
  Badge,
  Streak,
  DailyTodo,
} from '../types/database';

export class ShuktiFitDB extends Dexie {
  userProfile!: Table<UserProfile>;
  exercises!: Table<Exercise>;
  customExercises!: Table<CustomExercise>;
  exerciseExclusions!: Table<ExerciseExclusion>;
  workouts!: Table<Workout>;
  workoutExercises!: Table<WorkoutExercise>;
  exerciseSets!: Table<ExerciseSet>;
  exerciseHistory!: Table<ExerciseHistory>;
  bodyMeasurements!: Table<BodyMeasurement>;
  bodyAnalyses!: Table<BodyAnalysis>;
  withingsData!: Table<WithingsData>;
  badges!: Table<Badge>;
  streaks!: Table<Streak>;
  dailyTodos!: Table<DailyTodo>;

  constructor() {
    super('ShuktiFitDB');
    this.version(1).stores({
      userProfile: '++id',
      exercises: 'id, name, *primaryMuscles, equipment, category, level',
      customExercises: '++id, name, *primaryMuscles, equipment',
      exerciseExclusions: '++id, &exerciseId',
      workouts: '++id, date, type, status',
      workoutExercises: '++id, workoutId, exerciseId, order',
      exerciseSets: '++id, workoutExerciseId, setNumber',
      exerciseHistory: '++id, exerciseId, date, [exerciseId+date]',
      bodyMeasurements: '++id, date',
      bodyAnalyses: '++id, date',
      withingsData: '++id, type, date, [type+date]',
      badges: '++id, type',
      streaks: '++id, &type',
      dailyTodos: '++id, date, [date+completed]',
    });
  }
}

export const db = new ShuktiFitDB();
