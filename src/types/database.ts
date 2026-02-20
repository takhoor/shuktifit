export interface UserProfile {
  id?: number;
  name: string;
  age: number;
  heightInches: number;
  gender: 'male' | 'female' | 'other';
  goals: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  trainingSplit: 'ppl';
  equipment: string[];
  trainingFrequency: number;
  injuries: string;
  goalWeight?: number;
  goalBodyFat?: number;
  pplStartDate: string;
  workoutDays?: number[]; // 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
  withingsAccessToken?: string;
  withingsRefreshToken?: string;
  withingsTokenExpiry?: string;
  withingsUserId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Exercise {
  id: string;
  name: string;
  force: 'push' | 'pull' | 'static' | null;
  level: 'beginner' | 'intermediate' | 'expert';
  mechanic: 'compound' | 'isolation' | null;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: string;
  images: string[];
}

export interface CustomExercise {
  id?: number;
  name: string;
  force: 'push' | 'pull' | 'static' | null;
  level: 'beginner' | 'intermediate' | 'expert';
  mechanic: 'compound' | 'isolation' | null;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: string;
  isCustom: true;
  createdAt: string;
}

export interface ExerciseExclusion {
  id?: number;
  exerciseId: string;
  reason?: string;
  excludedAt: string;
}

export interface Workout {
  id?: number;
  date: string;
  type: 'push' | 'pull' | 'legs' | 'custom';
  status: 'planned' | 'in_progress' | 'completed' | 'skipped';
  name?: string;
  notes?: string;
  startedAt?: string;
  completedAt?: string;
  durationMinutes?: number;
  totalVolume?: number;
  aiGenerated: boolean;
  aiReasoning?: string;
  templateId?: number;
  createdAt: string;
}

export interface WorkoutExercise {
  id?: number;
  workoutId: number;
  exerciseId: string;
  exerciseName: string;
  order: number;
  supersetGroup: number | null;
  targetSets: number;
  targetReps: number;
  suggestedWeight: number;
  restSeconds: number;
  isCompleted: boolean;
  notes?: string;
}

export interface ExerciseSet {
  id?: number;
  workoutExerciseId: number;
  setNumber: number;
  targetReps: number;
  targetWeight: number;
  actualReps?: number;
  actualWeight?: number;
  setType: 'working' | 'warmup' | 'dropset' | 'failure';
  isCompleted: boolean;
  completedAt?: string;
  isPR: boolean;
}

export interface ExerciseHistory {
  id?: number;
  exerciseId: string;
  exerciseName: string;
  date: string;
  bestWeight: number;
  bestReps: number;
  totalVolume: number;
  totalSets: number;
  oneRepMaxEstimate: number;
}

export interface BodyMeasurement {
  id?: number;
  date: string;
  weight?: number;
  bodyFatPercent?: number;
  muscleMass?: number;
  boneMass?: number;
  neck?: number;
  shoulders?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  bicepL?: number;
  bicepR?: number;
  forearmL?: number;
  forearmR?: number;
  thighL?: number;
  thighR?: number;
  calfL?: number;
  calfR?: number;
  notes?: string;
  source: 'manual' | 'withings';
}

export interface BodyAnalysis {
  id?: number;
  date: string;
  photoFrontBlob?: Blob;
  photoSideBlob?: Blob;
  estimatedBodyFatRange?: string;
  muscleAssessment?: Record<string, string>;
  postureNotes?: string;
  recommendations?: string[];
  comparisonToPrevious?: string;
  createdAt: string;
}

export interface WithingsData {
  id?: number;
  type: 'weight' | 'fatRatio' | 'fatMass' | 'muscleMass' | 'boneMass' | 'steps' | 'heartRate' | 'sleepScore' | 'sleepHours';
  date: string;
  value: number;
  unit: string;
  syncedAt: string;
}

export interface Badge {
  id?: number;
  type: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export interface Streak {
  id?: number;
  type: 'workout' | 'logging';
  currentCount: number;
  longestCount: number;
  lastActivityDate: string;
  freeRestDaysUsedThisWeek: number;
  weekStartDate: string;
}

export interface DailyTodo {
  id?: number;
  date: string;
  title: string;
  todoType: 'workout' | 'weight' | 'photo' | 'measurement' | 'custom';
  completed: boolean;
  completedAt?: string;
  order: number;
}

// --- Workout Templates ---

export type WorkoutType = 'push' | 'pull' | 'legs' | 'full-body';
export type TemplateDuration = 20 | 30 | 45;
export type EquipmentProfile = 'full' | 'bodyweight';

export interface WorkoutTemplate {
  id?: number;
  name: string;
  description?: string;
  type: WorkoutType;
  duration: TemplateDuration;
  equipmentProfile: EquipmentProfile;
  tags: string[];
  isUserCreated: boolean;
  sourceWorkoutId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateExercise {
  id?: number;
  templateId: number;
  exerciseId: string;
  exerciseName: string;
  order: number;
  targetSets: number;
  targetReps: number;
  suggestedWeight: number;
  restSeconds: number;
  supersetGroup: number | null;
  notes?: string;
}

// --- Custom Data Series ---

export type AggregationMethod = 'sum' | 'average' | 'last' | 'max';
export type TrackerMode = 'standard' | 'checkin' | 'quickadd';

export interface QuickAddPreset {
  label: string;
  value: number;
}

export interface CustomDataSeries {
  id?: number;
  title: string;
  unit: string;
  color: string;
  aggregation: AggregationMethod;
  isArchived: boolean;
  createdAt: string;
  // Dashboard tracker fields
  trackerMode: TrackerMode;
  showOnDashboard: boolean;
  dashboardOrder: number;
  quickAddPresets?: QuickAddPreset[];
  checkinPrompt?: string;
  dailyGoal?: number;
  isSystemPreset?: boolean;
}

export interface CustomDataPoint {
  id?: number;
  seriesId: number;
  date: string;
  value: number;
  timestamp: string;
  notes?: string;
}

// --- AI Chat ---

export interface ChatConversation {
  id?: number;
  title?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id?: number;
  conversationId: number;
  role: 'user' | 'assistant';
  content: string;
  contextSummary?: string;
  createdAt: string;
}
