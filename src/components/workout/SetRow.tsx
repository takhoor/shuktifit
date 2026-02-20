import { useState, useEffect, useRef } from 'react';
import type { ExerciseSet } from '../../types/database';

interface SetRowProps {
  set: ExerciseSet;
  onComplete: (reps: number, weight: number) => void;
  onDelete?: () => void;
  onEdit?: (reps: number, weight: number) => void;
}

export function SetRow({ set, onComplete, onDelete, onEdit }: SetRowProps) {
  const [reps, setReps] = useState(set.actualReps ?? set.targetReps);
  const [weight, setWeight] = useState(set.actualWeight ?? set.targetWeight);
  const [isEditing, setIsEditing] = useState(false);

  // Swipe state
  const [translateX, setTranslateX] = useState(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const swipingRef = useRef(false);

  useEffect(() => {
    setReps(set.actualReps ?? set.targetReps);
    setWeight(set.actualWeight ?? set.targetWeight);
  }, [set.actualReps, set.actualWeight, set.targetReps, set.targetWeight]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
    swipingRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const dx = e.touches[0].clientX - touchStartRef.current.x;
    const dy = e.touches[0].clientY - touchStartRef.current.y;

    // Only swipe horizontally if movement is more horizontal than vertical
    if (!swipingRef.current && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
      swipingRef.current = true;
    }

    if (swipingRef.current && dx < 0) {
      setTranslateX(Math.max(dx, -80));
    }
  };

  const handleTouchEnd = () => {
    if (translateX < -40) {
      setTranslateX(-80);
    } else {
      setTranslateX(0);
    }
    touchStartRef.current = null;
    swipingRef.current = false;
  };

  const handleDelete = () => {
    setTranslateX(0);
    onDelete?.();
  };

  const handleStartEdit = () => {
    if (!set.isCompleted || !onEdit) return;
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    onEdit?.(reps, weight);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setReps(set.actualReps ?? set.targetReps);
    setWeight(set.actualWeight ?? set.targetWeight);
    setIsEditing(false);
  };

  const inputsDisabled = set.isCompleted && !isEditing;

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Delete button behind */}
      {onDelete && (
        <button
          onClick={handleDelete}
          className="absolute right-0 top-0 bottom-0 w-20 flex items-center justify-center bg-red-500 text-white text-xs font-bold"
        >
          Delete
        </button>
      )}

      {/* Swipeable content */}
      <div
        className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl ${
          set.isCompleted && !isEditing ? 'bg-green-900/20' : 'bg-bg-elevated'
        }`}
        style={{
          transform: `translateX(${translateX}px)`,
          transition: touchStartRef.current ? 'none' : 'transform 0.2s ease-out',
        }}
        onTouchStart={onDelete ? handleTouchStart : undefined}
        onTouchMove={onDelete ? handleTouchMove : undefined}
        onTouchEnd={onDelete ? handleTouchEnd : undefined}
      >
        <span className="w-8 text-center text-xs font-bold text-text-muted">
          {set.setNumber}
        </span>
        <input
          type="number"
          inputMode="numeric"
          value={reps}
          onChange={(e) => setReps(parseInt(e.target.value) || 0)}
          disabled={inputsDisabled}
          className="w-16 bg-bg-card rounded-lg px-2 py-1.5 text-center text-sm text-text-primary border border-border outline-none focus:border-accent disabled:opacity-60"
        />
        <span className="text-text-muted text-xs">x</span>
        <input
          type="number"
          inputMode="decimal"
          value={weight}
          onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
          disabled={inputsDisabled}
          className="w-20 bg-bg-card rounded-lg px-2 py-1.5 text-center text-sm text-text-primary border border-border outline-none focus:border-accent disabled:opacity-60"
        />
        <span className="text-text-muted text-xs">lbs</span>

        {set.isCompleted && !isEditing ? (
          <div
            className="ml-auto flex items-center gap-1"
            onClick={handleStartEdit}
          >
            {set.isPR && <span className="text-xs">🏆</span>}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-green-400">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        ) : set.isCompleted && isEditing ? (
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={handleSaveEdit}
              className="px-2.5 py-1 rounded-lg bg-accent text-white text-xs font-bold active:bg-accent-hover"
            >
              Save
            </button>
            <button
              onClick={handleCancelEdit}
              className="px-2 py-1 text-text-muted text-xs active:text-text-secondary"
            >
              ✕
            </button>
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
    </div>
  );
}
