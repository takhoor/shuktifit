import { create } from 'zustand';

interface WorkoutSessionState {
  activeWorkoutId: number | null;
  currentExerciseIndex: number;
  restTimerSeconds: number;
  restTimerRunning: boolean;
  restTimerTarget: number;

  startWorkout: (workoutId: number) => void;
  goToExercise: (index: number) => void;
  nextExercise: (total: number) => void;
  prevExercise: () => void;
  startRestTimer: (seconds: number) => void;
  tickTimer: () => void;
  stopTimer: () => void;
  skipTimer: () => void;
  finishWorkout: () => void;
}

export const useWorkoutStore = create<WorkoutSessionState>((set) => ({
  activeWorkoutId: null,
  currentExerciseIndex: 0,
  restTimerSeconds: 0,
  restTimerRunning: false,
  restTimerTarget: 0,

  startWorkout: (workoutId) =>
    set({ activeWorkoutId: workoutId, currentExerciseIndex: 0 }),

  goToExercise: (index) => set({ currentExerciseIndex: index }),

  nextExercise: (total) =>
    set((s) => ({
      currentExerciseIndex: Math.min(s.currentExerciseIndex + 1, total - 1),
    })),

  prevExercise: () =>
    set((s) => ({
      currentExerciseIndex: Math.max(s.currentExerciseIndex - 1, 0),
    })),

  startRestTimer: (seconds) =>
    set({ restTimerSeconds: seconds, restTimerRunning: true, restTimerTarget: seconds }),

  tickTimer: () =>
    set((s) => {
      if (s.restTimerSeconds <= 1) {
        return { restTimerSeconds: 0, restTimerRunning: false };
      }
      return { restTimerSeconds: s.restTimerSeconds - 1 };
    }),

  stopTimer: () => set({ restTimerRunning: false, restTimerSeconds: 0 }),

  skipTimer: () => set({ restTimerRunning: false, restTimerSeconds: 0 }),

  finishWorkout: () =>
    set({
      activeWorkoutId: null,
      currentExerciseIndex: 0,
      restTimerSeconds: 0,
      restTimerRunning: false,
      restTimerTarget: 0,
    }),
}));
