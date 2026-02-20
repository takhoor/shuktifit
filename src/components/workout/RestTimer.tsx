import { useEffect, useRef } from 'react';
import { useWorkoutStore } from '../../stores/useWorkoutStore';
import { formatTimer } from '../../utils/formatUtils';

export function RestTimer() {
  const seconds = useWorkoutStore((s) => s.restTimerSeconds);
  const running = useWorkoutStore((s) => s.restTimerRunning);
  const target = useWorkoutStore((s) => s.restTimerTarget);
  const tick = useWorkoutStore((s) => s.tickTimer);
  const skip = useWorkoutStore((s) => s.skipTimer);
  const supersetReturnIndex = useWorkoutStore((s) => s.supersetReturnIndex);
  const goToExercise = useWorkoutStore((s) => s.goToExercise);
  const setSupersetReturn = useWorkoutStore((s) => s.setSupersetReturn);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(tick, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, tick]);

  // Vibrate and handle superset return when timer reaches 0
  useEffect(() => {
    if (!running && seconds === 0 && target > 0) {
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
      if (supersetReturnIndex != null) {
        goToExercise(supersetReturnIndex);
        setSupersetReturn(null);
      }
    }
  }, [running, seconds, target, supersetReturnIndex, goToExercise, setSupersetReturn]);

  if (!running && seconds === 0) return null;

  const progress = target > 0 ? (target - seconds) / target : 0;
  const circumference = 2 * Math.PI * 45;
  const offset = circumference * (1 - progress);

  const handleSkip = () => {
    if (supersetReturnIndex != null) {
      goToExercise(supersetReturnIndex);
      setSupersetReturn(null);
    }
    skip();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80">
      <div className="flex flex-col items-center">
        <div className="relative w-48 h-48">
          <svg width="192" height="192" viewBox="0 0 100 100" className="-rotate-90">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#2D3A5C"
              strokeWidth="6"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#FF922B"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-text-primary">
              {formatTimer(seconds)}
            </span>
            <span className="text-sm text-text-secondary mt-1">Rest</span>
          </div>
        </div>
        <button
          onClick={handleSkip}
          className="mt-8 px-8 py-3 rounded-xl bg-bg-elevated text-text-secondary font-semibold active:bg-bg-card"
        >
          Skip Rest
        </button>
      </div>
    </div>
  );
}
