import { Link } from 'react-router-dom';
import type { Exercise } from '../../types/database';
import { getExerciseImageUrl } from '../../utils/imageUrl';
import { useState } from 'react';

interface ExerciseListItemProps {
  exercise: Exercise;
}

export function ExerciseListItem({ exercise }: ExerciseListItemProps) {
  const [imgError, setImgError] = useState(false);
  const imageUrl = exercise.images[0]
    ? getExerciseImageUrl(exercise.images[0])
    : null;

  return (
    <Link
      to={`/exercises/${exercise.id}`}
      className="flex items-center gap-3 px-4 py-3 active:bg-bg-elevated transition-colors"
    >
      <div className="w-14 h-14 rounded-xl bg-bg-elevated flex items-center justify-center overflow-hidden shrink-0">
        {imageUrl && !imgError ? (
          <img
            src={imageUrl}
            alt={exercise.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-2xl">🏋️</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-text-primary truncate">
          {exercise.name}
        </h3>
        <p className="text-xs text-text-secondary truncate">
          {exercise.primaryMuscles.join(', ')}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {exercise.equipment && (
            <span className="text-[10px] text-text-muted px-1.5 py-0.5 bg-bg-elevated rounded">
              {exercise.equipment}
            </span>
          )}
          <span className="text-[10px] text-text-muted px-1.5 py-0.5 bg-bg-elevated rounded">
            {exercise.level}
          </span>
        </div>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted shrink-0">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </Link>
  );
}
