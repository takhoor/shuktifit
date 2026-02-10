import { useState, useEffect } from 'react';
import type { ExerciseSet } from '../../types/database';

interface SetRowProps {
  set: ExerciseSet;
  onComplete: (reps: number, weight: number) => void;
}

export function SetRow({ set, onComplete }: SetRowProps) {
  const [reps, setReps] = useState(set.actualReps ?? set.targetReps);
  const [weight, setWeight] = useState(set.actualWeight ?? set.targetWeight);

  useEffect(() => {
    setReps(set.actualReps ?? set.targetReps);
    setWeight(set.actualWeight ?? set.targetWeight);
  }, [set.actualReps, set.actualWeight, set.targetReps, set.targetWeight]);

  return (
    <div
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${
        set.isCompleted ? 'bg-green-900/20' : 'bg-bg-elevated'
      }`}
    >
      <span className="w-8 text-center text-xs font-bold text-text-muted">
        {set.setNumber}
      </span>
      <input
        type="number"
        inputMode="numeric"
        value={reps}
        onChange={(e) => setReps(parseInt(e.target.value) || 0)}
        disabled={set.isCompleted}
        className="w-16 bg-bg-card rounded-lg px-2 py-1.5 text-center text-sm text-text-primary border border-border outline-none focus:border-accent disabled:opacity-60"
      />
      <span className="text-text-muted text-xs">x</span>
      <input
        type="number"
        inputMode="decimal"
        value={weight}
        onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
        disabled={set.isCompleted}
        className="w-20 bg-bg-card rounded-lg px-2 py-1.5 text-center text-sm text-text-primary border border-border outline-none focus:border-accent disabled:opacity-60"
      />
      <span className="text-text-muted text-xs">lbs</span>
      {set.isCompleted ? (
        <div className="ml-auto flex items-center gap-1">
          {set.isPR && <span className="text-xs">🏆</span>}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-green-400">
            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      ) : (
        <button
          onClick={() => onComplete(reps, weight)}
          className="ml-auto px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-bold active:bg-accent-hover"
        >
          Done
        </button>
      )}
    </div>
  );
}
