import { useState, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { getExerciseImageUrl } from '../../utils/imageUrl';
import { USER_EQUIPMENT_FILTER } from '../../utils/constants';
import type { Exercise } from '../../types/database';

interface SubstitutionPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
  originalExercise: {
    exerciseId: string;
    exerciseName: string;
    primaryMuscles: string[];
    equipment: string | null;
  } | null;
  bodyweightOnly?: boolean;
}

export function SubstitutionPickerModal({
  open,
  onClose,
  onSelect,
  originalExercise,
  bodyweightOnly = false,
}: SubstitutionPickerModalProps) {
  const [search, setSearch] = useState('');

  const exercises = useLiveQuery(() => db.exercises.toArray(), []);

  const equipmentFilter = bodyweightOnly
    ? ['body only', null]
    : USER_EQUIPMENT_FILTER;

  // Look up original exercise's muscles from DB if not provided
  const resolvedMuscles = useMemo(() => {
    if (originalExercise?.primaryMuscles.length) return originalExercise.primaryMuscles;
    if (!exercises || !originalExercise) return [];
    const dbEx = exercises.find((e) => e.id === originalExercise.exerciseId);
    return dbEx?.primaryMuscles ?? [];
  }, [exercises, originalExercise]);

  const filtered = useMemo(() => {
    if (!exercises || !originalExercise || !resolvedMuscles.length) return [];

    return exercises
      .filter((e) => e.id !== originalExercise.exerciseId)
      .filter((e) => e.category === 'strength')
      .filter((e) =>
        e.primaryMuscles.some((m) => resolvedMuscles.includes(m)),
      )
      .filter((e) => equipmentFilter.includes(e.equipment))
      .filter((e) => {
        if (!search) return true;
        return e.name.toLowerCase().includes(search.toLowerCase());
      })
      .sort((a, b) => {
        // Exact primary muscle match first
        const aExact = a.primaryMuscles[0] === resolvedMuscles[0] ? 0 : 1;
        const bExact = b.primaryMuscles[0] === resolvedMuscles[0] ? 0 : 1;
        if (aExact !== bExact) return aExact - bExact;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 50);
  }, [exercises, search, originalExercise, equipmentFilter, resolvedMuscles]);

  const handleSelect = (exercise: Exercise) => {
    onSelect(exercise);
    setSearch('');
  };

  if (!originalExercise) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Substitute for ${originalExercise.exerciseName}`}
    >
      <div className="px-4 py-3 space-y-3">
        <p className="text-xs text-text-secondary">
          Showing exercises targeting {resolvedMuscles.join(', ')} with your available equipment.
        </p>
        <Input
          placeholder="Search exercises..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
      </div>
      <div className="pb-8">
        {filtered.length === 0 ? (
          <p className="text-center text-text-muted py-8 text-sm">
            No matching exercises found
          </p>
        ) : (
          filtered.map((exercise) => (
            <SubPickerItem
              key={exercise.id}
              exercise={exercise}
              onSelect={() => handleSelect(exercise)}
            />
          ))
        )}
      </div>
    </Modal>
  );
}

function SubPickerItem({
  exercise,
  onSelect,
}: {
  exercise: Exercise;
  onSelect: () => void;
}) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center gap-3 px-4 py-3 active:bg-bg-elevated transition-colors text-left"
    >
      <div className="w-10 h-10 rounded-lg bg-bg-elevated flex items-center justify-center overflow-hidden shrink-0">
        {exercise.images[0] && !imgErr ? (
          <img
            src={getExerciseImageUrl(exercise.images[0])}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImgErr(true)}
          />
        ) : (
          <span className="text-lg">🏋️</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary truncate">
          {exercise.name}
        </p>
        <p className="text-xs text-text-secondary truncate">
          {exercise.primaryMuscles.join(', ')}
          {exercise.equipment ? ` · ${exercise.equipment}` : ''}
        </p>
      </div>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent shrink-0">
        <polyline points="8 7 3 12 8 17" />
        <polyline points="16 7 21 12 16 17" />
      </svg>
    </button>
  );
}
