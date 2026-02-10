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
