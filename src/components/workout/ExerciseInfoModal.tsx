import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { getExerciseImageUrl } from '../../utils/imageUrl';
import type { Exercise } from '../../types/database';

interface ExerciseInfoModalProps {
  open: boolean;
  onClose: () => void;
  exercise: Exercise | null;
  actionLabel?: string;
  onAction?: () => void;
}

/** Animating image that flips between start/end position frames */
function AnimatedExercise({ images, name }: { images: string[]; name: string }) {
  const [frame, setFrame] = useState(0);
  const [errored, setErrored] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (images.length < 2) return;
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % images.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [images.length]);

  const validImages = images.filter((_, i) => !errored.has(i));
  if (validImages.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-bg-elevated">
        <span className="text-6xl">🏋️</span>
      </div>
    );
  }

  const currentImage = images[frame % images.length];
  const currentIdx = images.indexOf(currentImage);

  return (
    <img
      src={getExerciseImageUrl(currentImage)}
      alt={`${name} — frame ${frame + 1}`}
      className="w-full h-full object-contain"
      onError={() => setErrored((s) => new Set(s).add(currentIdx))}
    />
  );
}

export function ExerciseInfoModal({ open, onClose, exercise, actionLabel, onAction }: ExerciseInfoModalProps) {
  if (!exercise) return null;

  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent('how to do ' + exercise.name + ' exercise')}`;

  return (
    <Modal open={open} onClose={onClose} title={exercise.name}>
      <div className="px-4 pb-6 pt-2">
        {/* Animated exercise images */}
        {exercise.images.length > 0 && (
          <div className="w-full aspect-square rounded-xl bg-bg-card overflow-hidden mb-4 max-h-64">
            <AnimatedExercise images={exercise.images} name={exercise.name} />
          </div>
        )}

        {/* Quick info pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {exercise.equipment && (
            <span className="px-2.5 py-1 rounded-full text-xs bg-bg-elevated text-text-secondary capitalize">
              {exercise.equipment}
            </span>
          )}
          <span className="px-2.5 py-1 rounded-full text-xs bg-bg-elevated text-text-secondary capitalize">
            {exercise.level}
          </span>
          {exercise.primaryMuscles.map((m) => (
            <span
              key={m}
              className="px-2.5 py-1 rounded-full text-xs bg-accent/20 text-accent capitalize"
            >
              {m}
            </span>
          ))}
        </div>

        {/* Instructions */}
        {exercise.instructions.length > 0 ? (
          <div>
            <h3 className="text-sm font-semibold text-text-secondary mb-2">
              How to perform
            </h3>
            <ol className="space-y-2">
              {exercise.instructions.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-text-primary">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-bg-elevated flex items-center justify-center text-[10px] text-text-muted font-medium mt-0.5">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <div className="rounded-xl bg-bg-elevated p-4 text-center">
            <p className="text-sm text-text-secondary mb-3">
              No instructions for this exercise yet.
            </p>
            <a
              href={googleSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-accent active:text-accent-hover"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Search Google for "{exercise.name}"
            </a>
          </div>
        )}

        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="w-full mt-5 py-3 rounded-xl bg-accent text-white text-sm font-semibold active:bg-accent-hover"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </Modal>
  );
}
