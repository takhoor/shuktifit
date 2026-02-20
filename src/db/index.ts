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
  WorkoutTemplate,
  TemplateExercise,
  CustomDataSeries,
  CustomDataPoint,
  ChatConversation,
  ChatMessage,
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
  workoutTemplates!: Table<WorkoutTemplate>;
  templateExercises!: Table<TemplateExercise>;
  customDataSeries!: Table<CustomDataSeries>;
  customDataPoints!: Table<CustomDataPoint>;
  chatConversations!: Table<ChatConversation>;
  chatMessages!: Table<ChatMessage>;

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

    this.version(2).stores({
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
      workoutTemplates: '++id, type, duration, equipmentProfile, *tags, isUserCreated',
      templateExercises: '++id, templateId, exerciseId, order',
      customDataSeries: '++id, title, createdAt',
      customDataPoints: '++id, seriesId, date, [seriesId+date]',
      chatConversations: '++id, createdAt',
      chatMessages: '++id, conversationId, role, createdAt',
    });

    this.version(3).stores({
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
      workoutTemplates: '++id, type, duration, equipmentProfile, *tags, isUserCreated',
      templateExercises: '++id, templateId, exerciseId, order',
      customDataSeries: '++id, title, createdAt, trackerMode, showOnDashboard',
      customDataPoints: '++id, seriesId, date, [seriesId+date]',
      chatConversations: '++id, createdAt',
      chatMessages: '++id, conversationId, role, createdAt',
    }).upgrade(tx => {
      return tx.table('customDataSeries').toCollection().modify(series => {
        if (series.trackerMode === undefined) {
          series.trackerMode = 'standard';
          series.showOnDashboard = false;
          series.dashboardOrder = 999;
        }
      });
    });
  }
}

export const db = new ShuktiFitDB();
