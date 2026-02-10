import { useState, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { getExerciseImageUrl } from '../../utils/imageUrl';
import type { Exercise } from '../../types/database';

interface ExercisePickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
  excludeIds?: string[];
}

export function ExercisePickerModal({
  open,
  onClose,
  onSelect,
  excludeIds = [],
}: ExercisePickerModalProps) {
  const [search, setSearch] = useState('');
  const [muscleFilter, setMuscleFilter] = useState<string | null>(null);

  const exercises = useLiveQuery(() => db.exercises.toArray(), []);

  const filtered = useMemo(() => {
    if (!exercises) return [];
    let result = exercises.filter((e) => !excludeIds.includes(e.id));
    if (search) {
      const lower = search.toLowerCase();
      result = result.filter((e) => e.name.toLowerCase().includes(lower));
    }
    if (muscleFilter) {
      result = result.filter((e) => e.primaryMuscles.includes(muscleFilter));
    }
    return result.sort((a, b) => a.name.localeCompare(b.name)).slice(0, 50);
  }, [exercises, search, muscleFilter, excludeIds]);

  const muscles = useMemo(() => {
    if (!exercises) return [];
    const set = new Set<string>();
    for (const e of exercises) {
      for (const m of e.primaryMuscles) set.add(m);
    }
    return Array.from(set).sort();
  }, [exercises]);

  const handleSelect = (exercise: Exercise) => {
    onSelect(exercise);
    setSearch('');
    setMuscleFilter(null);
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Exercise">
      <div className="px-4 py-3 space-y-3">
        <Input
          placeholder="Search exercises..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          <button
            onClick={() => setMuscleFilter(null)}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium ${
              !muscleFilter
                ? 'bg-accent text-white'
                : 'bg-bg-elevated text-text-secondary'
            }`}
          >
            All
          </button>
          {muscles.map((m) => (
            <button
              key={m}
              onClick={() => setMuscleFilter(m === muscleFilter ? null : m)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium capitalize ${
                muscleFilter === m
                  ? 'bg-accent text-white'
                  : 'bg-bg-elevated text-text-secondary'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
      <div className="pb-8">
        {filtered.length === 0 ? (
          <p className="text-center text-text-muted py-8 text-sm">
            No exercises found
          </p>
        ) : (
          filtered.map((exercise) => (
            <PickerItem
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

function PickerItem({
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
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </button>
  );
}
