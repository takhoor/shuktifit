export const EQUIPMENT_OPTIONS = [
  'body only',
  'dumbbell',
  'cable',
  'kettlebell',
  'pull-up bar',
  'flat bench',
] as const;

export type EquipmentOption = typeof EQUIPMENT_OPTIONS[number];

export const MUSCLE_GROUPS = [
  'abdominals',
  'adductors',
  'abductors',
  'biceps',
  'calves',
  'chest',
  'forearms',
  'glutes',
  'hamstrings',
  'lats',
  'lower back',
  'middle back',
  'neck',
  'quadriceps',
  'shoulders',
  'traps',
  'triceps',
] as const;

export type MuscleGroup = typeof MUSCLE_GROUPS[number];

export const PPL_TYPES = ['push', 'pull', 'legs'] as const;
export type PPLType = typeof PPL_TYPES[number];

export const PPL_COLORS: Record<PPLType | 'rest', string> = {
  push: '#FF6B6B',
  pull: '#4DABF7',
  legs: '#51CF66',
  rest: '#868E96',
};

export const PPL_LABELS: Record<PPLType, string> = {
  push: 'Push Day',
  pull: 'Pull Day',
  legs: 'Leg Day',
};

export const PPL_MUSCLE_FOCUS: Record<PPLType, string> = {
  push: 'Chest, Shoulders, Triceps',
  pull: 'Back, Biceps, Rear Delts',
  legs: 'Quads, Hamstrings, Glutes, Calves',
};

export const PPL_PRIMARY_MUSCLES: Record<PPLType, string[]> = {
  push: ['chest', 'shoulders', 'triceps'],
  pull: ['lats', 'middle back', 'biceps', 'traps', 'forearms'],
  legs: ['quadriceps', 'hamstrings', 'glutes', 'calves', 'adductors', 'abductors'],
};

export const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
export const DAY_LABELS_SHORT = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;

export const EXPERIENCE_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
export type ExperienceLevel = typeof EXPERIENCE_LEVELS[number];

export const FITNESS_GOALS = [
  'Muscle Gain',
  'Fat Loss',
  'Strength',
  'General Fitness',
  'Endurance',
] as const;

export const EXERCISE_CATEGORIES = [
  'strength',
  'stretching',
  'plyometrics',
  'strongman',
  'powerlifting',
  'cardio',
  'olympic weightlifting',
] as const;

export const EXERCISE_LEVELS = ['beginner', 'intermediate', 'expert'] as const;

export const DEFAULT_REST_SECONDS = 90;

// --- Workout Templates ---

export const TEMPLATE_DURATIONS = [20, 30, 45] as const;
export type TemplateDurationOption = typeof TEMPLATE_DURATIONS[number];

export const EQUIPMENT_PROFILES = ['full', 'bodyweight'] as const;
export type EquipmentProfileOption = typeof EQUIPMENT_PROFILES[number];

export const WORKOUT_TYPES = ['push', 'pull', 'legs', 'full-body'] as const;
export type WorkoutTypeOption = typeof WORKOUT_TYPES[number];

// Maps the user's physical equipment to exercises.json equipment values
export const USER_EQUIPMENT_FILTER: (string | null)[] = [
  'body only',
  'cable',
  'dumbbell',
  'machine',
  null,
];

export const WORKOUT_TYPE_LABELS: Record<WorkoutTypeOption, string> = {
  push: 'Push',
  pull: 'Pull',
  legs: 'Legs',
  'full-body': 'Full Body',
};

export const WORKOUT_TYPE_COLORS: Record<WorkoutTypeOption, string> = {
  push: '#FF6B6B',
  pull: '#4DABF7',
  legs: '#51CF66',
  'full-body': '#E599F7',
};

// --- Overlay Charts ---

export const OVERLAY_CHART_COLORS = ['#4DABF7', '#FF922B', '#51CF66'] as const;
export const MAX_OVERLAY_SERIES = 3;

export const CHART_SERIES_PALETTE = [
  '#4DABF7', '#FF922B', '#51CF66', '#E599F7',
  '#FF6B6B', '#FFD43B', '#20C997', '#748FFC',
] as const;
