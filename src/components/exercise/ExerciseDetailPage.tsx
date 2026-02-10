import { useParams } from 'react-router-dom';
import { Header } from '../layout/Header';
import { Spinner } from '../ui/Spinner';
import { Card } from '../ui/Card';
import { useExercise } from '../../hooks/useExercises';
import { getExerciseImageUrl } from '../../utils/imageUrl';
import { useState } from 'react';

export function ExerciseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const exercise = useExercise(id);
  const [activeImage, setActiveImage] = useState(0);

  if (exercise === undefined) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Exercise" showBack />
        <div className="flex items-center justify-center flex-1">
          <Spinner />
        </div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Exercise" showBack />
        <div className="flex items-center justify-center flex-1">
          <p className="text-text-secondary">Exercise not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header title={exercise.name} showBack />
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-8">
        {/* Image Gallery */}
        {exercise.images.length > 0 && (
          <div className="mb-4">
            <div className="w-full aspect-square rounded-2xl bg-bg-card overflow-hidden mb-2">
              <ExerciseImage
                src={getExerciseImageUrl(exercise.images[activeImage])}
                alt={exercise.name}
              />
            </div>
            {exercise.images.length > 1 && (
              <div className="flex gap-2 justify-center">
                {exercise.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      i === activeImage ? 'bg-accent' : 'bg-bg-elevated'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <InfoCard label="Level" value={exercise.level} />
          <InfoCard label="Equipment" value={exercise.equipment ?? 'None'} />
          <InfoCard label="Type" value={exercise.category} />
          <InfoCard label="Mechanic" value={exercise.mechanic ?? 'N/A'} />
        </div>

        {/* Muscles */}
        <Card className="mb-4">
          <h3 className="text-sm font-semibold text-text-secondary mb-2">
            Primary Muscles
          </h3>
          <div className="flex flex-wrap gap-2">
            {exercise.primaryMuscles.map((m) => (
              <span
                key={m}
                className="px-3 py-1 rounded-full text-xs font-medium bg-accent/20 text-accent"
              >
                {m}
              </span>
            ))}
          </div>
          {exercise.secondaryMuscles.length > 0 && (
            <>
              <h3 className="text-sm font-semibold text-text-secondary mt-3 mb-2">
                Secondary Muscles
              </h3>
              <div className="flex flex-wrap gap-2">
                {exercise.secondaryMuscles.map((m) => (
                  <span
                    key={m}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-bg-elevated text-text-secondary"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </>
          )}
        </Card>

        {/* Instructions */}
        {exercise.instructions.length > 0 && (
          <Card>
            <h3 className="text-sm font-semibold text-text-secondary mb-3">
              Instructions
            </h3>
            <ol className="space-y-2">
              {exercise.instructions.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-text-primary">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-bg-elevated flex items-center justify-center text-xs text-text-secondary font-medium">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </Card>
        )}
      </div>
    </div>
  );
}

function ExerciseImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);
  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-bg-elevated">
        <span className="text-6xl">🏋️</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-contain"
      onError={() => setError(true)}
    />
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="text-center">
      <p className="text-xs text-text-muted mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-text-primary capitalize">{value}</p>
    </Card>
  );
}
