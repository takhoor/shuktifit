import { create } from 'zustand';

interface FilterState {
  searchTerm: string;
  muscleFilter: string | null;
  equipmentFilter: string | null;
  levelFilter: string | null;
  categoryFilter: string | null;
  setSearchTerm: (term: string) => void;
  setMuscleFilter: (muscle: string | null) => void;
  setEquipmentFilter: (equipment: string | null) => void;
  setLevelFilter: (level: string | null) => void;
  setCategoryFilter: (category: string | null) => void;
  clearFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  searchTerm: '',
  muscleFilter: null,
  equipmentFilter: null,
  levelFilter: null,
  categoryFilter: null,
  setSearchTerm: (term) => set({ searchTerm: term }),
  setMuscleFilter: (muscle) => set({ muscleFilter: muscle }),
  setEquipmentFilter: (equipment) => set({ equipmentFilter: equipment }),
  setLevelFilter: (level) => set({ levelFilter: level }),
  setCategoryFilter: (category) => set({ categoryFilter: category }),
  clearFilters: () =>
    set({
      searchTerm: '',
      muscleFilter: null,
      equipmentFilter: null,
      levelFilter: null,
      categoryFilter: null,
    }),
}));
