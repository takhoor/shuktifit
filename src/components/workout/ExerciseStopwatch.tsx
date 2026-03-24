import { useState, useEffect, useRef, useCallback } from 'react';
import { formatTimer } from '../../utils/formatUtils';
import { playDing } from '../../utils/sound';

interface ExerciseStopwatchProps {
  /** Target duration in seconds (from targetReps) */
  targetSeconds: number;
  onClose: () => void;
}

export function ExerciseStopwatch({ targetSeconds, onClose }: ExerciseStopwatchProps) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);
  const dingedRef = useRef(false);

  const tick = useCallback(() => {
    if (startTimeRef.current == null) return;
    setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
  }, []);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(tick, 250);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, tick]);

  // Re-sync on visibility change
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && running) {
        tick();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [running, tick]);

  // Ding when target is reached
  useEffect(() => {
    if (targetSeconds > 0 && elapsed >= targetSeconds && !dingedRef.current) {
      dingedRef.current = true;
      playDing();
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    }
  }, [elapsed, targetSeconds]);

  const handleStart = () => {
    startTimeRef.current = Date.now();
    dingedRef.current = false;
    setElapsed(0);
    setRunning(true);
  };

  const handleStop = () => {
    setRunning(false);
  };

  const handleReset = () => {
    setRunning(false);
    startTimeRef.current = null;
    dingedRef.current = false;
    setElapsed(0);
  };

  const pastTarget = targetSeconds > 0 && elapsed >= targetSeconds;
  const progress = targetSeconds > 0 ? Math.min(elapsed / targetSeconds, 1) : 0;
  const circumference = 2 * Math.PI * 45;
  const offset = circumference * (1 - progress);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80">
      <div className="flex flex-col items-center">
        <div className="relative w-48 h-48">
          <svg width="192" height="192" viewBox="0 0 100 100" className="-rotate-90">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#2D3A5C" strokeWidth="6" />
            <circle
              cx="50" cy="50" r="45" fill="none"
              stroke={pastTarget ? '#51CF66' : '#FF922B'}
              strokeWidth="6" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-300 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold ${pastTarget ? 'text-green-400' : 'text-text-primary'}`}>
              {formatTimer(elapsed)}
            </span>
            {targetSeconds > 0 && (
              <span className="text-sm text-text-secondary mt-1">
                / {formatTimer(targetSeconds)}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          {!running ? (
            <>
              <button
                onClick={handleStart}
                className="px-8 py-3 rounded-xl bg-accent text-white font-semibold active:bg-accent-hover"
              >
                {elapsed > 0 ? 'Restart' : 'Start'}
              </button>
              {elapsed > 0 && (
                <button
                  onClick={handleReset}
                  className="px-6 py-3 rounded-xl bg-bg-elevated text-text-secondary font-semibold active:bg-bg-card"
                >
                  Reset
                </button>
              )}
            </>
          ) : (
            <button
              onClick={handleStop}
              className="px-8 py-3 rounded-xl bg-red-500 text-white font-semibold active:bg-red-600"
            >
              Stop
            </button>
          )}
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-bg-elevated text-text-secondary font-semibold active:bg-bg-card"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
