import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { useFilterStore } from '../stores/useFilterStore';
import type { Exercise } from '../types/database';

export function useExercises(): Exercise[] | undefined {
  const { searchTerm, muscleFilter, equipmentFilter, levelFilter, categoryFilter } =
    useFilterStore();

  return useLiveQuery(async () => {
    let collection = db.exercises.toCollection();

    if (levelFilter) {
      collection = db.exercises.where('level').equals(levelFilter);
    }

    let results = await collection.toArray();

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      results = results.filter((e) => e.name.toLowerCase().includes(lower));
    }

    if (muscleFilter) {
      results = results.filter((e) =>
        e.primaryMuscles.includes(muscleFilter),
      );
    }

    if (equipmentFilter) {
      results = results.filter((e) => e.equipment === equipmentFilter);
    }

    if (categoryFilter) {
      results = results.filter((e) => e.category === categoryFilter);
    }

    return results.sort((a, b) => a.name.localeCompare(b.name));
  }, [searchTerm, muscleFilter, equipmentFilter, levelFilter, categoryFilter]);
}

export function useExercise(id: string | undefined) {
  return useLiveQuery(
    () => (id ? db.exercises.get(id) : undefined),
    [id],
  );
}
