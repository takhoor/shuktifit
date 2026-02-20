import type { WorkoutType, TemplateDuration, EquipmentProfile } from '../types/database';

export interface TemplateDefinition {
  name: string;
  description: string;
  type: WorkoutType;
  duration: TemplateDuration;
  equipmentProfile: EquipmentProfile;
  tags: string[];
  exercises: Array<{
    exerciseId: string;
    exerciseName: string;
    targetSets: number;
    targetReps: number;
    suggestedWeight: number;
    restSeconds: number;
    supersetGroup: number | null;
    notes?: string;
  }>;
}

// ──────────────────────────────────────────────
//  PUSH TEMPLATES — Full Equipment
// ──────────────────────────────────────────────

const pushFull20: TemplateDefinition = {
  name: 'Quick Push',
  description: 'Fast chest, shoulders & triceps session with cables and dumbbells.',
  type: 'push',
  duration: 20,
  equipmentProfile: 'full',
  tags: ['push', 'quick', 'compound-focus'],
  exercises: [
    { exerciseId: 'Dumbbell_Bench_Press', exerciseName: 'Dumbbell Bench Press', targetSets: 3, targetReps: 10, suggestedWeight: 0, restSeconds: 90, supersetGroup: null },
    { exerciseId: 'Dumbbell_Shoulder_Press', exerciseName: 'Dumbbell Shoulder Press', targetSets: 3, targetReps: 10, suggestedWeight: 0, restSeconds: 90, supersetGroup: null },
    { exerciseId: 'Cable_Crossover', exerciseName: 'Cable Crossover', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Triceps_Pushdown_-_Rope_Attachment', exerciseName: 'Triceps Pushdown - Rope Attachment', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
  ],
};

const pushFull30: TemplateDefinition = {
  name: 'Standard Push',
  description: 'Balanced push workout hitting chest, shoulders and triceps.',
  type: 'push',
  duration: 30,
  equipmentProfile: 'full',
  tags: ['push', 'standard', 'balanced'],
  exercises: [
    { exerciseId: 'Dumbbell_Bench_Press', exerciseName: 'Dumbbell Bench Press', targetSets: 4, targetReps: 8, suggestedWeight: 0, restSeconds: 90, supersetGroup: null },
    { exerciseId: 'Incline_Dumbbell_Flyes', exerciseName: 'Incline Dumbbell Flyes', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Dumbbell_Shoulder_Press', exerciseName: 'Dumbbell Shoulder Press', targetSets: 3, targetReps: 10, suggestedWeight: 0, restSeconds: 90, supersetGroup: null },
    { exerciseId: 'Side_Lateral_Raise', exerciseName: 'Side Lateral Raise', targetSets: 3, targetReps: 15, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Triceps_Pushdown_-_Rope_Attachment', exerciseName: 'Triceps Pushdown - Rope Attachment', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Cable_Crossover', exerciseName: 'Cable Crossover', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
  ],
};

const pushFull45: TemplateDefinition = {
  name: 'Full Push Session',
  description: 'Comprehensive push day — heavy compounds followed by isolation work.',
  type: 'push',
  duration: 45,
  equipmentProfile: 'full',
  tags: ['push', 'long', 'hypertrophy'],
  exercises: [
    { exerciseId: 'Dumbbell_Bench_Press', exerciseName: 'Dumbbell Bench Press', targetSets: 4, targetReps: 8, suggestedWeight: 0, restSeconds: 120, supersetGroup: null },
    { exerciseId: 'Hammer_Grip_Incline_DB_Bench_Press', exerciseName: 'Hammer Grip Incline DB Bench Press', targetSets: 3, targetReps: 10, suggestedWeight: 0, restSeconds: 90, supersetGroup: null },
    { exerciseId: 'Dumbbell_Flyes', exerciseName: 'Dumbbell Flyes', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Dumbbell_Shoulder_Press', exerciseName: 'Dumbbell Shoulder Press', targetSets: 4, targetReps: 8, suggestedWeight: 0, restSeconds: 90, supersetGroup: null },
    { exerciseId: 'Side_Lateral_Raise', exerciseName: 'Side Lateral Raise', targetSets: 3, targetReps: 15, suggestedWeight: 0, restSeconds: 60, supersetGroup: 1, notes: 'Superset with front raise' },
    { exerciseId: 'Front_Dumbbell_Raise', exerciseName: 'Front Dumbbell Raise', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: 1 },
    { exerciseId: 'Triceps_Pushdown_-_Rope_Attachment', exerciseName: 'Triceps Pushdown - Rope Attachment', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Lying_Dumbbell_Tricep_Extension', exerciseName: 'Lying Dumbbell Tricep Extension', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
  ],
};

// ──────────────────────────────────────────────
//  PUSH TEMPLATES — Bodyweight
// ──────────────────────────────────────────────

const pushBW20: TemplateDefinition = {
  name: 'Quick Bodyweight Push',
  description: 'Fast push session using only your body weight.',
  type: 'push',
  duration: 20,
  equipmentProfile: 'bodyweight',
  tags: ['push', 'quick', 'bodyweight-only'],
  exercises: [
    { exerciseId: 'Pushups', exerciseName: 'Pushups', targetSets: 3, targetReps: 15, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Decline_Push-Up', exerciseName: 'Decline Push-Up', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Bench_Dips', exerciseName: 'Bench Dips', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Push-Ups_-_Close_Triceps_Position', exerciseName: 'Push-Ups - Close Triceps Position', targetSets: 3, targetReps: 10, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
  ],
};

const pushBW30: TemplateDefinition = {
  name: 'Bodyweight Push',
  description: 'No-equipment push workout with varied push-up angles.',
  type: 'push',
  duration: 30,
  equipmentProfile: 'bodyweight',
  tags: ['push', 'standard', 'bodyweight-only'],
  exercises: [
    { exerciseId: 'Pushups', exerciseName: 'Pushups', targetSets: 4, targetReps: 15, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Decline_Push-Up', exerciseName: 'Decline Push-Up', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Push-Up_Wide', exerciseName: 'Push-Up Wide', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Bench_Dips', exerciseName: 'Bench Dips', targetSets: 3, targetReps: 15, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Push-Ups_-_Close_Triceps_Position', exerciseName: 'Push-Ups - Close Triceps Position', targetSets: 3, targetReps: 10, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
  ],
};

const pushBW45: TemplateDefinition = {
  name: 'Full Bodyweight Push',
  description: 'Extended bodyweight push session with high volume and variety.',
  type: 'push',
  duration: 45,
  equipmentProfile: 'bodyweight',
  tags: ['push', 'long', 'bodyweight-only', 'endurance'],
  exercises: [
    { exerciseId: 'Pushups', exerciseName: 'Pushups', targetSets: 4, targetReps: 20, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Decline_Push-Up', exerciseName: 'Decline Push-Up', targetSets: 4, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Push-Up_Wide', exerciseName: 'Push-Up Wide', targetSets: 3, targetReps: 15, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Incline_Push-Up', exerciseName: 'Incline Push-Up', targetSets: 3, targetReps: 15, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Push_Up_to_Side_Plank', exerciseName: 'Push Up to Side Plank', targetSets: 3, targetReps: 10, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Bench_Dips', exerciseName: 'Bench Dips', targetSets: 4, targetReps: 15, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Push-Ups_-_Close_Triceps_Position', exerciseName: 'Push-Ups - Close Triceps Position', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Body_Tricep_Press', exerciseName: 'Body Tricep Press', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
  ],
};

// ──────────────────────────────────────────────
//  PULL TEMPLATES — Full Equipment
// ──────────────────────────────────────────────

const pullFull20: TemplateDefinition = {
  name: 'Quick Pull',
  description: 'Fast back and biceps session with cables and dumbbells.',
  type: 'pull',
  duration: 20,
  equipmentProfile: 'full',
  tags: ['pull', 'quick', 'compound-focus'],
  exercises: [
    { exerciseId: 'Wide-Grip_Lat_Pulldown', exerciseName: 'Wide-Grip Lat Pulldown', targetSets: 3, targetReps: 10, suggestedWeight: 0, restSeconds: 90, supersetGroup: null },
    { exerciseId: 'Bent_Over_Two-Dumbbell_Row', exerciseName: 'Bent Over Two-Dumbbell Row', targetSets: 3, targetReps: 10, suggestedWeight: 0, restSeconds: 90, supersetGroup: null },
    { exerciseId: 'Dumbbell_Bicep_Curl', exerciseName: 'Dumbbell Bicep Curl', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Face_Pull', exerciseName: 'Face Pull', targetSets: 3, targetReps: 15, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
  ],
};

const pullFull30: TemplateDefinition = {
  name: 'Standard Pull',
  description: 'Balanced pull workout for back width, thickness and arm strength.',
  type: 'pull',
  duration: 30,
  equipmentProfile: 'full',
  tags: ['pull', 'standard', 'balanced'],
  exercises: [
    { exerciseId: 'Wide-Grip_Lat_Pulldown', exerciseName: 'Wide-Grip Lat Pulldown', targetSets: 4, targetReps: 10, suggestedWeight: 0, restSeconds: 90, supersetGroup: null },
    { exerciseId: 'Bent_Over_Two-Dumbbell_Row', exerciseName: 'Bent Over Two-Dumbbell Row', targetSets: 3, targetReps: 10, suggestedWeight: 0, restSeconds: 90, supersetGroup: null },
    { exerciseId: 'Seated_One-arm_Cable_Pulley_Rows', exerciseName: 'Seated One-arm Cable Pulley Rows', targetSets: 3, targetReps: 10, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Cable_Hammer_Curls_-_Rope_Attachment', exerciseName: 'Cable Hammer Curls - Rope Attachment', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Dumbbell_Shrug', exerciseName: 'Dumbbell Shrug', targetSets: 3, targetReps: 15, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Face_Pull', exerciseName: 'Face Pull', targetSets: 3, targetReps: 15, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
  ],
};

const pullFull45: TemplateDefinition = {
  name: 'Full Pull Session',
  description: 'Comprehensive back and biceps — pulldowns, rows, curls and rear delts.',
  type: 'pull',
  duration: 45,
  equipmentProfile: 'full',
  tags: ['pull', 'long', 'hypertrophy'],
  exercises: [
    { exerciseId: 'Wide-Grip_Lat_Pulldown', exerciseName: 'Wide-Grip Lat Pulldown', targetSets: 4, targetReps: 10, suggestedWeight: 0, restSeconds: 90, supersetGroup: null },
    { exerciseId: 'Bent_Over_Two-Dumbbell_Row', exerciseName: 'Bent Over Two-Dumbbell Row', targetSets: 4, targetReps: 8, suggestedWeight: 0, restSeconds: 90, supersetGroup: null },
    { exerciseId: 'Seated_One-arm_Cable_Pulley_Rows', exerciseName: 'Seated One-arm Cable Pulley Rows', targetSets: 3, targetReps: 10, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Dumbbell_Incline_Row', exerciseName: 'Dumbbell Incline Row', targetSets: 3, targetReps: 10, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Cable_Hammer_Curls_-_Rope_Attachment', exerciseName: 'Cable Hammer Curls - Rope Attachment', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: 1 },
    { exerciseId: 'Incline_Dumbbell_Curl', exerciseName: 'Incline Dumbbell Curl', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: 1 },
    { exerciseId: 'Dumbbell_Shrug', exerciseName: 'Dumbbell Shrug', targetSets: 3, targetReps: 15, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Face_Pull', exerciseName: 'Face Pull', targetSets: 3, targetReps: 15, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
  ],
};

// ──────────────────────────────────────────────
//  PULL TEMPLATES — Bodyweight
// ──────────────────────────────────────────────

const pullBW20: TemplateDefinition = {
  name: 'Quick Bodyweight Pull',
  description: 'Minimal pull workout using the pull-up bar.',
  type: 'pull',
  duration: 20,
  equipmentProfile: 'bodyweight',
  tags: ['pull', 'quick', 'bodyweight-only'],
  exercises: [
    { exerciseId: 'Chin-Up', exerciseName: 'Chin-Up', targetSets: 3, targetReps: 8, suggestedWeight: 0, restSeconds: 90, supersetGroup: null },
    { exerciseId: 'Pullups', exerciseName: 'Pullups', targetSets: 3, targetReps: 6, suggestedWeight: 0, restSeconds: 90, supersetGroup: null },
    { exerciseId: 'Inverted_Row', exerciseName: 'Inverted Row', targetSets: 3, targetReps: 10, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Scapular_Pull-Up', exerciseName: 'Scapular Pull-Up', targetSets: 3, targetReps: 10, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
  ],
};

const pullBW30: TemplateDefinition = {
  name: 'Bodyweight Pull',
  description: 'Pull-up bar focused back and biceps session.',
  type: 'pull',
  duration: 30,
  equipmentProfile: 'bodyweight',
  tags: ['pull', 'standard', 'bodyweight-only'],
  exercises: [
    { exerciseId: 'Chin-Up', exerciseName: 'Chin-Up', targetSets: 4, targetReps: 8, suggestedWeight: 0, restSeconds: 90, supersetGroup: null },
    { exerciseId: 'Pullups', exerciseName: 'Pullups', targetSets: 3, targetReps: 6, suggestedWeight: 0, restSeconds: 90, supersetGroup: null },
    { exerciseId: 'Inverted_Row', exerciseName: 'Inverted Row', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Wide-Grip_Rear_Pull-Up', exerciseName: 'Wide-Grip Rear Pull-Up', targetSets: 3, targetReps: 6, suggestedWeight: 0, restSeconds: 90, supersetGroup: null },
    { exerciseId: 'Scapular_Pull-Up', exerciseName: 'Scapular Pull-Up', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
  ],
};

const pullBW45: TemplateDefinition = {
  name: 'Full Bodyweight Pull',
  description: 'High-volume bodyweight pull session with grip and back emphasis.',
  type: 'pull',
  duration: 45,
  equipmentProfile: 'bodyweight',
  tags: ['pull', 'long', 'bodyweight-only', 'endurance'],
  exercises: [
    { exerciseId: 'Chin-Up', exerciseName: 'Chin-Up', targetSets: 4, targetReps: 8, suggestedWeight: 0, restSeconds: 90, supersetGroup: null },
    { exerciseId: 'Pullups', exerciseName: 'Pullups', targetSets: 4, targetReps: 6, suggestedWeight: 0, restSeconds: 90, supersetGroup: null },
    { exerciseId: 'Wide-Grip_Rear_Pull-Up', exerciseName: 'Wide-Grip Rear Pull-Up', targetSets: 3, targetReps: 6, suggestedWeight: 0, restSeconds: 90, supersetGroup: null },
    { exerciseId: 'Inverted_Row', exerciseName: 'Inverted Row', targetSets: 4, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'V-Bar_Pullup', exerciseName: 'V-Bar Pullup', targetSets: 3, targetReps: 8, suggestedWeight: 0, restSeconds: 90, supersetGroup: null },
    { exerciseId: 'Scapular_Pull-Up', exerciseName: 'Scapular Pull-Up', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Gorilla_Chin_Crunch', exerciseName: 'Gorilla Chin/Crunch', targetSets: 3, targetReps: 8, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
  ],
};

// ──────────────────────────────────────────────
//  LEGS TEMPLATES — Full Equipment
// ──────────────────────────────────────────────

const legsFull20: TemplateDefinition = {
  name: 'Quick Legs',
  description: 'Fast lower body session targeting quads, hamstrings and calves.',
  type: 'legs',
  duration: 20,
  equipmentProfile: 'full',
  tags: ['legs', 'quick', 'compound-focus'],
  exercises: [
    { exerciseId: 'Dumbbell_Squat', exerciseName: 'Dumbbell Squat', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 90, supersetGroup: null },
    { exerciseId: 'Leg_Press', exerciseName: 'Leg Press', targetSets: 3, targetReps: 10, suggestedWeight: 0, restSeconds: 90, supersetGroup: null },
    { exerciseId: 'Lying_Leg_Curls', exerciseName: 'Lying Leg Curls', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Standing_Dumbbell_Calf_Raise', exerciseName: 'Standing Dumbbell Calf Raise', targetSets: 3, targetReps: 15, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
  ],
};

const legsFull30: TemplateDefinition = {
  name: 'Standard Legs',
  description: 'Balanced leg day covering quads, hamstrings, glutes and calves.',
  type: 'legs',
  duration: 30,
  equipmentProfile: 'full',
  tags: ['legs', 'standard', 'balanced'],
  exercises: [
    { exerciseId: 'Dumbbell_Squat', exerciseName: 'Dumbbell Squat', targetSets: 4, targetReps: 10, suggestedWeight: 0, restSeconds: 90, supersetGroup: null },
    { exerciseId: 'Leg_Press', exerciseName: 'Leg Press', targetSets: 3, targetReps: 10, suggestedWeight: 0, restSeconds: 90, supersetGroup: null },
    { exerciseId: 'Dumbbell_Lunges', exerciseName: 'Dumbbell Lunges', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Lying_Leg_Curls', exerciseName: 'Lying Leg Curls', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Seated_Calf_Raise', exerciseName: 'Seated Calf Raise', targetSets: 3, targetReps: 15, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'One-Legged_Cable_Kickback', exerciseName: 'One-Legged Cable Kickback', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
  ],
};

const legsFull45: TemplateDefinition = {
  name: 'Full Legs Session',
  description: 'Comprehensive leg day — squats, presses, curls and isolation.',
  type: 'legs',
  duration: 45,
  equipmentProfile: 'full',
  tags: ['legs', 'long', 'hypertrophy'],
  exercises: [
    { exerciseId: 'Dumbbell_Squat', exerciseName: 'Dumbbell Squat', targetSets: 4, targetReps: 10, suggestedWeight: 0, restSeconds: 120, supersetGroup: null },
    { exerciseId: 'Leg_Press', exerciseName: 'Leg Press', targetSets: 4, targetReps: 10, suggestedWeight: 0, restSeconds: 90, supersetGroup: null },
    { exerciseId: 'Dumbbell_Lunges', exerciseName: 'Dumbbell Lunges', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Leg_Extensions', exerciseName: 'Leg Extensions', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Lying_Leg_Curls', exerciseName: 'Lying Leg Curls', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Stiff-Legged_Dumbbell_Deadlift', exerciseName: 'Stiff-Legged Dumbbell Deadlift', targetSets: 3, targetReps: 10, suggestedWeight: 0, restSeconds: 90, supersetGroup: null },
    { exerciseId: 'One-Legged_Cable_Kickback', exerciseName: 'One-Legged Cable Kickback', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Standing_Dumbbell_Calf_Raise', exerciseName: 'Standing Dumbbell Calf Raise', targetSets: 4, targetReps: 15, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
  ],
};

// ──────────────────────────────────────────────
//  LEGS TEMPLATES — Bodyweight
// ──────────────────────────────────────────────

const legsBW20: TemplateDefinition = {
  name: 'Quick Bodyweight Legs',
  description: 'Fast lower body blast using only body weight.',
  type: 'legs',
  duration: 20,
  equipmentProfile: 'bodyweight',
  tags: ['legs', 'quick', 'bodyweight-only'],
  exercises: [
    { exerciseId: 'Bodyweight_Squat', exerciseName: 'Bodyweight Squat', targetSets: 3, targetReps: 20, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Bodyweight_Walking_Lunge', exerciseName: 'Bodyweight Walking Lunge', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Single_Leg_Glute_Bridge', exerciseName: 'Single Leg Glute Bridge', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Freehand_Jump_Squat', exerciseName: 'Freehand Jump Squat', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
  ],
};

const legsBW30: TemplateDefinition = {
  name: 'Bodyweight Legs',
  description: 'Bodyweight leg session with squats, lunges and glute work.',
  type: 'legs',
  duration: 30,
  equipmentProfile: 'bodyweight',
  tags: ['legs', 'standard', 'bodyweight-only'],
  exercises: [
    { exerciseId: 'Bodyweight_Squat', exerciseName: 'Bodyweight Squat', targetSets: 4, targetReps: 20, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Bodyweight_Walking_Lunge', exerciseName: 'Bodyweight Walking Lunge', targetSets: 3, targetReps: 15, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Single_Leg_Glute_Bridge', exerciseName: 'Single Leg Glute Bridge', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Freehand_Jump_Squat', exerciseName: 'Freehand Jump Squat', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Flutter_Kicks', exerciseName: 'Flutter Kicks', targetSets: 3, targetReps: 20, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Glute_Kickback', exerciseName: 'Glute Kickback', targetSets: 3, targetReps: 15, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
  ],
};

const legsBW45: TemplateDefinition = {
  name: 'Full Bodyweight Legs',
  description: 'High-volume bodyweight leg session — squats, lunges, glutes and hamstrings.',
  type: 'legs',
  duration: 45,
  equipmentProfile: 'bodyweight',
  tags: ['legs', 'long', 'bodyweight-only', 'endurance'],
  exercises: [
    { exerciseId: 'Bodyweight_Squat', exerciseName: 'Bodyweight Squat', targetSets: 4, targetReps: 20, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Freehand_Jump_Squat', exerciseName: 'Freehand Jump Squat', targetSets: 3, targetReps: 15, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Bodyweight_Walking_Lunge', exerciseName: 'Bodyweight Walking Lunge', targetSets: 4, targetReps: 15, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Flutter_Kicks', exerciseName: 'Flutter Kicks', targetSets: 3, targetReps: 20, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Single_Leg_Glute_Bridge', exerciseName: 'Single Leg Glute Bridge', targetSets: 3, targetReps: 15, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Glute_Kickback', exerciseName: 'Glute Kickback', targetSets: 3, targetReps: 15, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Natural_Glute_Ham_Raise', exerciseName: 'Natural Glute Ham Raise', targetSets: 3, targetReps: 10, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Step-up_with_Knee_Raise', exerciseName: 'Step-up with Knee Raise', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
  ],
};

// ──────────────────────────────────────────────
//  FULL-BODY TEMPLATES — Bodyweight
// ──────────────────────────────────────────────

const fullBodyBW20: TemplateDefinition = {
  name: 'Quick Full Body',
  description: 'Fast total-body workout using push, pull and leg movements.',
  type: 'full-body',
  duration: 20,
  equipmentProfile: 'bodyweight',
  tags: ['full-body', 'quick', 'bodyweight-only'],
  exercises: [
    { exerciseId: 'Pushups', exerciseName: 'Pushups', targetSets: 3, targetReps: 15, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Chin-Up', exerciseName: 'Chin-Up', targetSets: 3, targetReps: 8, suggestedWeight: 0, restSeconds: 90, supersetGroup: null },
    { exerciseId: 'Bodyweight_Squat', exerciseName: 'Bodyweight Squat', targetSets: 3, targetReps: 20, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Plank', exerciseName: 'Plank', targetSets: 3, targetReps: 30, suggestedWeight: 0, restSeconds: 60, supersetGroup: null, notes: 'Hold for 30 seconds per set' },
  ],
};

const fullBodyBW30: TemplateDefinition = {
  name: 'Full Body Bodyweight',
  description: 'Balanced total-body session covering all major movement patterns.',
  type: 'full-body',
  duration: 30,
  equipmentProfile: 'bodyweight',
  tags: ['full-body', 'standard', 'bodyweight-only'],
  exercises: [
    { exerciseId: 'Pushups', exerciseName: 'Pushups', targetSets: 3, targetReps: 15, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Chin-Up', exerciseName: 'Chin-Up', targetSets: 3, targetReps: 8, suggestedWeight: 0, restSeconds: 90, supersetGroup: null },
    { exerciseId: 'Bodyweight_Squat', exerciseName: 'Bodyweight Squat', targetSets: 3, targetReps: 20, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Bodyweight_Walking_Lunge', exerciseName: 'Bodyweight Walking Lunge', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Inverted_Row', exerciseName: 'Inverted Row', targetSets: 3, targetReps: 10, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Plank', exerciseName: 'Plank', targetSets: 3, targetReps: 45, suggestedWeight: 0, restSeconds: 60, supersetGroup: null, notes: 'Hold for 45 seconds per set' },
  ],
};

const fullBodyBW45: TemplateDefinition = {
  name: 'Full Body Complete',
  description: 'Extended total-body workout — push, pull, legs and core with high volume.',
  type: 'full-body',
  duration: 45,
  equipmentProfile: 'bodyweight',
  tags: ['full-body', 'long', 'bodyweight-only', 'endurance'],
  exercises: [
    { exerciseId: 'Pushups', exerciseName: 'Pushups', targetSets: 4, targetReps: 15, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Decline_Push-Up', exerciseName: 'Decline Push-Up', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Chin-Up', exerciseName: 'Chin-Up', targetSets: 4, targetReps: 8, suggestedWeight: 0, restSeconds: 90, supersetGroup: null },
    { exerciseId: 'Inverted_Row', exerciseName: 'Inverted Row', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Bodyweight_Squat', exerciseName: 'Bodyweight Squat', targetSets: 4, targetReps: 20, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Bodyweight_Walking_Lunge', exerciseName: 'Bodyweight Walking Lunge', targetSets: 3, targetReps: 15, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Single_Leg_Glute_Bridge', exerciseName: 'Single Leg Glute Bridge', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: null },
    { exerciseId: 'Plank', exerciseName: 'Plank', targetSets: 3, targetReps: 60, suggestedWeight: 0, restSeconds: 60, supersetGroup: null, notes: 'Hold for 60 seconds per set' },
  ],
};

// ──────────────────────────────────────────────
//  PUSH — Dumbbell Supersets
// ──────────────────────────────────────────────

const pushDBSuperset20: TemplateDefinition = {
  name: 'Push Superset Blitz',
  description: 'Fast chest & shoulders with back-to-back supersets. Dumbbells only.',
  type: 'push',
  duration: 20,
  equipmentProfile: 'full',
  tags: ['push', 'quick', 'superset', 'dumbbell'],
  exercises: [
    { exerciseId: 'Dumbbell_Bench_Press', exerciseName: 'Dumbbell Bench Press', targetSets: 3, targetReps: 10, suggestedWeight: 0, restSeconds: 0, supersetGroup: 1, notes: 'Superset — go straight to flyes' },
    { exerciseId: 'Dumbbell_Flyes', exerciseName: 'Dumbbell Flyes', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: 1 },
    { exerciseId: 'Arnold_Dumbbell_Press', exerciseName: 'Arnold Dumbbell Press', targetSets: 3, targetReps: 10, suggestedWeight: 0, restSeconds: 0, supersetGroup: 2, notes: 'Superset — go straight to laterals' },
    { exerciseId: 'Side_Lateral_Raise', exerciseName: 'Side Lateral Raise', targetSets: 3, targetReps: 15, suggestedWeight: 0, restSeconds: 60, supersetGroup: 2 },
  ],
};

const pushDBSuperset30: TemplateDefinition = {
  name: 'Push Superset Builder',
  description: 'Chest, shoulders & triceps paired in supersets for maximum pump.',
  type: 'push',
  duration: 30,
  equipmentProfile: 'full',
  tags: ['push', 'standard', 'superset', 'dumbbell', 'hypertrophy'],
  exercises: [
    { exerciseId: 'Incline_Dumbbell_Press', exerciseName: 'Incline Dumbbell Press', targetSets: 3, targetReps: 10, suggestedWeight: 0, restSeconds: 0, supersetGroup: 1, notes: 'Superset with incline flyes' },
    { exerciseId: 'Incline_Dumbbell_Flyes', exerciseName: 'Incline Dumbbell Flyes', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 75, supersetGroup: 1 },
    { exerciseId: 'Dumbbell_Floor_Press', exerciseName: 'Dumbbell Floor Press', targetSets: 3, targetReps: 10, suggestedWeight: 0, restSeconds: 0, supersetGroup: 2, notes: 'Superset with kickbacks' },
    { exerciseId: 'Tricep_Dumbbell_Kickback', exerciseName: 'Tricep Dumbbell Kickback', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: 2 },
    { exerciseId: 'Dumbbell_Shoulder_Press', exerciseName: 'Dumbbell Shoulder Press', targetSets: 3, targetReps: 10, suggestedWeight: 0, restSeconds: 0, supersetGroup: 3, notes: 'Superset with front raises' },
    { exerciseId: 'Front_Dumbbell_Raise', exerciseName: 'Front Dumbbell Raise', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: 3 },
  ],
};

// ──────────────────────────────────────────────
//  PUSH — Circuit
// ──────────────────────────────────────────────

const pushCircuit20: TemplateDefinition = {
  name: 'Push Circuit Burner',
  description: 'High-intensity circuit — cycle through all exercises with minimal rest.',
  type: 'push',
  duration: 20,
  equipmentProfile: 'full',
  tags: ['push', 'quick', 'circuit', 'dumbbell', 'bodyweight', 'conditioning'],
  exercises: [
    { exerciseId: 'Pushups', exerciseName: 'Pushups', targetSets: 3, targetReps: 15, suggestedWeight: 0, restSeconds: 0, supersetGroup: 1, notes: 'Circuit — move to next exercise immediately' },
    { exerciseId: 'Dumbbell_Shoulder_Press', exerciseName: 'Dumbbell Shoulder Press', targetSets: 3, targetReps: 10, suggestedWeight: 0, restSeconds: 0, supersetGroup: 1 },
    { exerciseId: 'Dumbbell_Flyes', exerciseName: 'Dumbbell Flyes', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 0, supersetGroup: 1 },
    { exerciseId: 'Bench_Dips', exerciseName: 'Bench Dips', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 0, supersetGroup: 1 },
    { exerciseId: 'Side_Lateral_Raise', exerciseName: 'Side Lateral Raise', targetSets: 3, targetReps: 15, suggestedWeight: 0, restSeconds: 90, supersetGroup: 1, notes: 'Rest 90s after completing full circuit, then repeat' },
  ],
};

// ──────────────────────────────────────────────
//  PULL — Dumbbell Supersets
// ──────────────────────────────────────────────

const pullDBSuperset20: TemplateDefinition = {
  name: 'Pull Superset Blitz',
  description: 'Fast back & biceps using paired dumbbell supersets.',
  type: 'pull',
  duration: 20,
  equipmentProfile: 'full',
  tags: ['pull', 'quick', 'superset', 'dumbbell'],
  exercises: [
    { exerciseId: 'Bent_Over_Two-Dumbbell_Row', exerciseName: 'Bent Over Two-Dumbbell Row', targetSets: 3, targetReps: 10, suggestedWeight: 0, restSeconds: 0, supersetGroup: 1, notes: 'Superset — go straight to curls' },
    { exerciseId: 'Dumbbell_Bicep_Curl', exerciseName: 'Dumbbell Bicep Curl', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: 1 },
    { exerciseId: 'Dumbbell_Incline_Row', exerciseName: 'Dumbbell Incline Row', targetSets: 3, targetReps: 10, suggestedWeight: 0, restSeconds: 0, supersetGroup: 2, notes: 'Superset — go straight to hammer curls' },
    { exerciseId: 'Hammer_Curls', exerciseName: 'Hammer Curls', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: 2 },
  ],
};

const pullDBSuperset30: TemplateDefinition = {
  name: 'Pull Superset Builder',
  description: 'Back thickness, width and arm size with paired dumbbell supersets.',
  type: 'pull',
  duration: 30,
  equipmentProfile: 'full',
  tags: ['pull', 'standard', 'superset', 'dumbbell', 'hypertrophy'],
  exercises: [
    { exerciseId: 'Bent_Over_Two-Dumbbell_Row', exerciseName: 'Bent Over Two-Dumbbell Row', targetSets: 4, targetReps: 8, suggestedWeight: 0, restSeconds: 0, supersetGroup: 1, notes: 'Superset with rear delts' },
    { exerciseId: 'Dumbbell_Lying_Rear_Lateral_Raise', exerciseName: 'Dumbbell Lying Rear Lateral Raise', targetSets: 4, targetReps: 15, suggestedWeight: 0, restSeconds: 75, supersetGroup: 1 },
    { exerciseId: 'Dumbbell_Incline_Row', exerciseName: 'Dumbbell Incline Row', targetSets: 3, targetReps: 10, suggestedWeight: 0, restSeconds: 0, supersetGroup: 2, notes: 'Superset with shrugs' },
    { exerciseId: 'Dumbbell_Shrug', exerciseName: 'Dumbbell Shrug', targetSets: 3, targetReps: 15, suggestedWeight: 0, restSeconds: 60, supersetGroup: 2 },
    { exerciseId: 'Incline_Dumbbell_Curl', exerciseName: 'Incline Dumbbell Curl', targetSets: 3, targetReps: 10, suggestedWeight: 0, restSeconds: 0, supersetGroup: 3, notes: 'Superset with hammer curls' },
    { exerciseId: 'Cross_Body_Hammer_Curl', exerciseName: 'Cross Body Hammer Curl', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: 3 },
  ],
};

// ──────────────────────────────────────────────
//  PULL — Circuit
// ──────────────────────────────────────────────

const pullCircuit20: TemplateDefinition = {
  name: 'Pull Circuit Burner',
  description: 'High-intensity pull circuit — dumbbells and pull-up bar.',
  type: 'pull',
  duration: 20,
  equipmentProfile: 'full',
  tags: ['pull', 'quick', 'circuit', 'dumbbell', 'bodyweight', 'conditioning'],
  exercises: [
    { exerciseId: 'Chin-Up', exerciseName: 'Chin-Up', targetSets: 3, targetReps: 8, suggestedWeight: 0, restSeconds: 0, supersetGroup: 1, notes: 'Circuit — move to next exercise immediately' },
    { exerciseId: 'Bent_Over_Two-Dumbbell_Row', exerciseName: 'Bent Over Two-Dumbbell Row', targetSets: 3, targetReps: 10, suggestedWeight: 0, restSeconds: 0, supersetGroup: 1 },
    { exerciseId: 'Dumbbell_Bicep_Curl', exerciseName: 'Dumbbell Bicep Curl', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 0, supersetGroup: 1 },
    { exerciseId: 'Dumbbell_Lying_Rear_Lateral_Raise', exerciseName: 'Dumbbell Lying Rear Lateral Raise', targetSets: 3, targetReps: 15, suggestedWeight: 0, restSeconds: 90, supersetGroup: 1, notes: 'Rest 90s after full circuit, then repeat' },
  ],
};

// ──────────────────────────────────────────────
//  LEGS — Dumbbell Supersets
// ──────────────────────────────────────────────

const legsDBSuperset20: TemplateDefinition = {
  name: 'Legs Superset Blitz',
  description: 'Fast lower body — quad/ham and glute/calf supersets with dumbbells.',
  type: 'legs',
  duration: 20,
  equipmentProfile: 'full',
  tags: ['legs', 'quick', 'superset', 'dumbbell'],
  exercises: [
    { exerciseId: 'Dumbbell_Squat', exerciseName: 'Dumbbell Squat', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 0, supersetGroup: 1, notes: 'Superset — go straight to RDL' },
    { exerciseId: 'Stiff-Legged_Dumbbell_Deadlift', exerciseName: 'Stiff-Legged Dumbbell Deadlift', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 75, supersetGroup: 1 },
    { exerciseId: 'Dumbbell_Lunges', exerciseName: 'Dumbbell Lunges', targetSets: 3, targetReps: 10, suggestedWeight: 0, restSeconds: 0, supersetGroup: 2, notes: 'Superset — go straight to calf raises' },
    { exerciseId: 'Standing_Dumbbell_Calf_Raise', exerciseName: 'Standing Dumbbell Calf Raise', targetSets: 3, targetReps: 20, suggestedWeight: 0, restSeconds: 60, supersetGroup: 2 },
  ],
};

const legsDBSuperset30: TemplateDefinition = {
  name: 'Legs Superset Builder',
  description: 'Quads, hams, glutes & calves — dumbbell pairs for maximum time efficiency.',
  type: 'legs',
  duration: 30,
  equipmentProfile: 'full',
  tags: ['legs', 'standard', 'superset', 'dumbbell', 'hypertrophy'],
  exercises: [
    { exerciseId: 'Dumbbell_Squat', exerciseName: 'Dumbbell Squat', targetSets: 4, targetReps: 10, suggestedWeight: 0, restSeconds: 0, supersetGroup: 1, notes: 'Superset with RDL' },
    { exerciseId: 'Stiff-Legged_Dumbbell_Deadlift', exerciseName: 'Stiff-Legged Dumbbell Deadlift', targetSets: 4, targetReps: 10, suggestedWeight: 0, restSeconds: 75, supersetGroup: 1 },
    { exerciseId: 'Split_Squat_with_Dumbbells', exerciseName: 'Split Squat with Dumbbells', targetSets: 3, targetReps: 10, suggestedWeight: 0, restSeconds: 0, supersetGroup: 2, notes: 'Superset with plie squats' },
    { exerciseId: 'Plie_Dumbbell_Squat', exerciseName: 'Plie Dumbbell Squat', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 60, supersetGroup: 2 },
    { exerciseId: 'Dumbbell_Step_Ups', exerciseName: 'Dumbbell Step Ups', targetSets: 3, targetReps: 10, suggestedWeight: 0, restSeconds: 0, supersetGroup: 3, notes: 'Superset with calf raises' },
    { exerciseId: 'Standing_Dumbbell_Calf_Raise', exerciseName: 'Standing Dumbbell Calf Raise', targetSets: 3, targetReps: 20, suggestedWeight: 0, restSeconds: 60, supersetGroup: 3 },
  ],
};

// ──────────────────────────────────────────────
//  LEGS — Circuit
// ──────────────────────────────────────────────

const legsCircuit20: TemplateDefinition = {
  name: 'Legs Circuit Burner',
  description: 'Lower body circuit — dumbbells and bodyweight for a cardio-strength combo.',
  type: 'legs',
  duration: 20,
  equipmentProfile: 'full',
  tags: ['legs', 'quick', 'circuit', 'dumbbell', 'bodyweight', 'conditioning'],
  exercises: [
    { exerciseId: 'Dumbbell_Squat', exerciseName: 'Dumbbell Squat', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 0, supersetGroup: 1, notes: 'Circuit — move to next exercise immediately' },
    { exerciseId: 'Dumbbell_Rear_Lunge', exerciseName: 'Dumbbell Rear Lunge', targetSets: 3, targetReps: 10, suggestedWeight: 0, restSeconds: 0, supersetGroup: 1 },
    { exerciseId: 'Freehand_Jump_Squat', exerciseName: 'Freehand Jump Squat', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 0, supersetGroup: 1 },
    { exerciseId: 'Single_Leg_Glute_Bridge', exerciseName: 'Single Leg Glute Bridge', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 0, supersetGroup: 1 },
    { exerciseId: 'Standing_Dumbbell_Calf_Raise', exerciseName: 'Standing Dumbbell Calf Raise', targetSets: 3, targetReps: 20, suggestedWeight: 0, restSeconds: 90, supersetGroup: 1, notes: 'Rest 90s after full circuit, then repeat' },
  ],
};

// ──────────────────────────────────────────────
//  FULL-BODY — Dumbbell Supersets & Circuits
// ──────────────────────────────────────────────

const fullBodyDBSuperset30: TemplateDefinition = {
  name: 'Full Body Superset Smash',
  description: 'Total body with push/pull and upper/lower supersets. Dumbbells + bodyweight.',
  type: 'full-body',
  duration: 30,
  equipmentProfile: 'full',
  tags: ['full-body', 'standard', 'superset', 'dumbbell', 'bodyweight'],
  exercises: [
    { exerciseId: 'Dumbbell_Bench_Press', exerciseName: 'Dumbbell Bench Press', targetSets: 3, targetReps: 10, suggestedWeight: 0, restSeconds: 0, supersetGroup: 1, notes: 'Superset — push + pull' },
    { exerciseId: 'Bent_Over_Two-Dumbbell_Row', exerciseName: 'Bent Over Two-Dumbbell Row', targetSets: 3, targetReps: 10, suggestedWeight: 0, restSeconds: 75, supersetGroup: 1 },
    { exerciseId: 'Dumbbell_Shoulder_Press', exerciseName: 'Dumbbell Shoulder Press', targetSets: 3, targetReps: 10, suggestedWeight: 0, restSeconds: 0, supersetGroup: 2, notes: 'Superset — upper + lower' },
    { exerciseId: 'Dumbbell_Squat', exerciseName: 'Dumbbell Squat', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 75, supersetGroup: 2 },
    { exerciseId: 'Hammer_Curls', exerciseName: 'Hammer Curls', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 0, supersetGroup: 3, notes: 'Superset — arms + calves' },
    { exerciseId: 'Standing_Dumbbell_Calf_Raise', exerciseName: 'Standing Dumbbell Calf Raise', targetSets: 3, targetReps: 20, suggestedWeight: 0, restSeconds: 60, supersetGroup: 3 },
  ],
};

const fullBodyCircuit20: TemplateDefinition = {
  name: 'Full Body Circuit Express',
  description: '20-minute total body circuit — dumbbells and bodyweight, no rest between exercises.',
  type: 'full-body',
  duration: 20,
  equipmentProfile: 'full',
  tags: ['full-body', 'quick', 'circuit', 'dumbbell', 'bodyweight', 'conditioning'],
  exercises: [
    { exerciseId: 'Dumbbell_Squat', exerciseName: 'Dumbbell Squat', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 0, supersetGroup: 1, notes: 'Circuit — cycle through all 6, rest at the end' },
    { exerciseId: 'Pushups', exerciseName: 'Pushups', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 0, supersetGroup: 1 },
    { exerciseId: 'Bent_Over_Two-Dumbbell_Row', exerciseName: 'Bent Over Two-Dumbbell Row', targetSets: 3, targetReps: 10, suggestedWeight: 0, restSeconds: 0, supersetGroup: 1 },
    { exerciseId: 'Dumbbell_Lunges', exerciseName: 'Dumbbell Lunges', targetSets: 3, targetReps: 10, suggestedWeight: 0, restSeconds: 0, supersetGroup: 1 },
    { exerciseId: 'Dumbbell_Shoulder_Press', exerciseName: 'Dumbbell Shoulder Press', targetSets: 3, targetReps: 10, suggestedWeight: 0, restSeconds: 0, supersetGroup: 1 },
    { exerciseId: 'Plank', exerciseName: 'Plank', targetSets: 3, targetReps: 30, suggestedWeight: 0, restSeconds: 90, supersetGroup: 1, notes: 'Hold 30s — rest 90s then repeat circuit' },
  ],
};

const fullBodyCircuit30: TemplateDefinition = {
  name: 'Full Body Circuit Crusher',
  description: '30-minute strength circuit — dumbbells and bodyweight hitting every muscle group.',
  type: 'full-body',
  duration: 30,
  equipmentProfile: 'full',
  tags: ['full-body', 'standard', 'circuit', 'dumbbell', 'bodyweight', 'conditioning'],
  exercises: [
    { exerciseId: 'Dumbbell_Squat', exerciseName: 'Dumbbell Squat', targetSets: 4, targetReps: 10, suggestedWeight: 0, restSeconds: 0, supersetGroup: 1, notes: 'Circuit A — 4 rounds' },
    { exerciseId: 'Dumbbell_Bench_Press', exerciseName: 'Dumbbell Bench Press', targetSets: 4, targetReps: 10, suggestedWeight: 0, restSeconds: 0, supersetGroup: 1 },
    { exerciseId: 'Bent_Over_Two-Dumbbell_Row', exerciseName: 'Bent Over Two-Dumbbell Row', targetSets: 4, targetReps: 10, suggestedWeight: 0, restSeconds: 0, supersetGroup: 1 },
    { exerciseId: 'Stiff-Legged_Dumbbell_Deadlift', exerciseName: 'Stiff-Legged Dumbbell Deadlift', targetSets: 4, targetReps: 10, suggestedWeight: 0, restSeconds: 90, supersetGroup: 1, notes: 'Rest 90s then repeat circuit A' },
    { exerciseId: 'Arnold_Dumbbell_Press', exerciseName: 'Arnold Dumbbell Press', targetSets: 3, targetReps: 10, suggestedWeight: 0, restSeconds: 0, supersetGroup: 2, notes: 'Circuit B — 3 rounds' },
    { exerciseId: 'Dumbbell_Bicep_Curl', exerciseName: 'Dumbbell Bicep Curl', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 0, supersetGroup: 2 },
    { exerciseId: 'Lying_Dumbbell_Tricep_Extension', exerciseName: 'Lying Dumbbell Tricep Extension', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 0, supersetGroup: 2 },
    { exerciseId: 'Standing_Dumbbell_Calf_Raise', exerciseName: 'Standing Dumbbell Calf Raise', targetSets: 3, targetReps: 20, suggestedWeight: 0, restSeconds: 75, supersetGroup: 2, notes: 'Rest 75s then repeat circuit B' },
  ],
};

const fullBodyDBStrength30: TemplateDefinition = {
  name: 'Dumbbell Strength 30',
  description: 'Compound dumbbell lifts — heavier weights, moderate rest, full body.',
  type: 'full-body',
  duration: 30,
  equipmentProfile: 'full',
  tags: ['full-body', 'standard', 'dumbbell', 'strength', 'compound-focus'],
  exercises: [
    { exerciseId: 'Dumbbell_Squat', exerciseName: 'Dumbbell Squat', targetSets: 4, targetReps: 8, suggestedWeight: 0, restSeconds: 90, supersetGroup: null },
    { exerciseId: 'Dumbbell_Bench_Press', exerciseName: 'Dumbbell Bench Press', targetSets: 4, targetReps: 8, suggestedWeight: 0, restSeconds: 90, supersetGroup: null },
    { exerciseId: 'Bent_Over_Two-Dumbbell_Row', exerciseName: 'Bent Over Two-Dumbbell Row', targetSets: 4, targetReps: 8, suggestedWeight: 0, restSeconds: 90, supersetGroup: null },
    { exerciseId: 'Dumbbell_Shoulder_Press', exerciseName: 'Dumbbell Shoulder Press', targetSets: 3, targetReps: 8, suggestedWeight: 0, restSeconds: 90, supersetGroup: null },
    { exerciseId: 'Stiff-Legged_Dumbbell_Deadlift', exerciseName: 'Stiff-Legged Dumbbell Deadlift', targetSets: 3, targetReps: 8, suggestedWeight: 0, restSeconds: 90, supersetGroup: null },
  ],
};

const fullBodyBWCircuit20: TemplateDefinition = {
  name: 'Bodyweight Circuit Express',
  description: 'No equipment needed — fast bodyweight circuit hitting all muscle groups.',
  type: 'full-body',
  duration: 20,
  equipmentProfile: 'bodyweight',
  tags: ['full-body', 'quick', 'circuit', 'bodyweight-only', 'conditioning'],
  exercises: [
    { exerciseId: 'Bodyweight_Squat', exerciseName: 'Bodyweight Squat', targetSets: 3, targetReps: 20, suggestedWeight: 0, restSeconds: 0, supersetGroup: 1, notes: 'Circuit — cycle through all exercises' },
    { exerciseId: 'Pushups', exerciseName: 'Pushups', targetSets: 3, targetReps: 15, suggestedWeight: 0, restSeconds: 0, supersetGroup: 1 },
    { exerciseId: 'Chin-Up', exerciseName: 'Chin-Up', targetSets: 3, targetReps: 8, suggestedWeight: 0, restSeconds: 0, supersetGroup: 1 },
    { exerciseId: 'Freehand_Jump_Squat', exerciseName: 'Freehand Jump Squat', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 0, supersetGroup: 1 },
    { exerciseId: 'Bench_Dips', exerciseName: 'Bench Dips', targetSets: 3, targetReps: 12, suggestedWeight: 0, restSeconds: 0, supersetGroup: 1 },
    { exerciseId: 'Plank', exerciseName: 'Plank', targetSets: 3, targetReps: 30, suggestedWeight: 0, restSeconds: 90, supersetGroup: 1, notes: 'Hold 30s — rest 90s then repeat circuit' },
  ],
};

// ──────────────────────────────────────────────
//  EXPORT
// ──────────────────────────────────────────────

export const CURATED_TEMPLATES: TemplateDefinition[] = [
  // Push
  pushFull20, pushFull30, pushFull45,
  pushBW20, pushBW30, pushBW45,
  pushDBSuperset20, pushDBSuperset30, pushCircuit20,
  // Pull
  pullFull20, pullFull30, pullFull45,
  pullBW20, pullBW30, pullBW45,
  pullDBSuperset20, pullDBSuperset30, pullCircuit20,
  // Legs
  legsFull20, legsFull30, legsFull45,
  legsBW20, legsBW30, legsBW45,
  legsDBSuperset20, legsDBSuperset30, legsCircuit20,
  // Full-body
  fullBodyBW20, fullBodyBW30, fullBodyBW45,
  fullBodyDBSuperset30, fullBodyCircuit20, fullBodyCircuit30,
  fullBodyDBStrength30, fullBodyBWCircuit20,
];
