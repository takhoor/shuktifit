import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface WorkoutSessionState {
  activeWorkoutId: number | null;
  currentExerciseIndex: number;
  restTimerSeconds: number;
  restTimerRunning: boolean;
  restTimerTarget: number;
  supersetReturnIndex: number | null;

  startWorkout: (workoutId: number) => void;
  goToExercise: (index: number) => void;
  nextExercise: (total: number) => void;
  prevExercise: () => void;
  startRestTimer: (seconds: number) => void;
  tickTimer: () => void;
  stopTimer: () => void;
  skipTimer: () => void;
  setSupersetReturn: (index: number | null) => void;
  finishWorkout: () => void;
}

export const useWorkoutStore = create<WorkoutSessionState>()(
  persist(
    (set) => ({
      activeWorkoutId: null,
      currentExerciseIndex: 0,
      restTimerSeconds: 0,
      restTimerRunning: false,
      restTimerTarget: 0,
      supersetReturnIndex: null,

      startWorkout: (workoutId) =>
        set({ activeWorkoutId: workoutId, currentExerciseIndex: 0, supersetReturnIndex: null }),

      goToExercise: (index) =>
        set({ currentExerciseIndex: index, supersetReturnIndex: null }),

      nextExercise: (total) =>
        set((s) => ({
          currentExerciseIndex: Math.min(s.currentExerciseIndex + 1, total - 1),
          supersetReturnIndex: null,
        })),

      prevExercise: () =>
        set((s) => ({
          currentExerciseIndex: Math.max(s.currentExerciseIndex - 1, 0),
          supersetReturnIndex: null,
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

      setSupersetReturn: (index) => set({ supersetReturnIndex: index }),

      finishWorkout: () =>
        set({
          activeWorkoutId: null,
          currentExerciseIndex: 0,
          restTimerSeconds: 0,
          restTimerRunning: false,
          restTimerTarget: 0,
          supersetReturnIndex: null,
        }),
    }),
    {
      name: 'shuktifit-workout-session',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        activeWorkoutId: state.activeWorkoutId,
        currentExerciseIndex: state.currentExerciseIndex,
        supersetReturnIndex: state.supersetReturnIndex,
      }),
    },
  ),
);
