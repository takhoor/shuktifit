import { useFilterStore } from '../../stores/useFilterStore';
import { MUSCLE_GROUPS, EXERCISE_LEVELS, EXERCISE_CATEGORIES } from '../../utils/constants';

const EQUIPMENT_VALUES = [
  'body only',
  'dumbbell',
  'cable',
  'kettlebell',
  'barbell',
  'machine',
  'other',
  'e-z curl bar',
  'medicine ball',
  'exercise ball',
  'foam roll',
  'bands',
];

export function ExerciseFilterBar() {
  const {
    muscleFilter,
    equipmentFilter,
    levelFilter,
    categoryFilter,
    setMuscleFilter,
    setEquipmentFilter,
    setLevelFilter,
    setCategoryFilter,
    clearFilters,
  } = useFilterStore();

  const hasFilters = muscleFilter || equipmentFilter || levelFilter || categoryFilter;

  return (
    <div className="flex flex-col gap-2 px-4">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        <FilterSelect
          value={muscleFilter}
          onChange={setMuscleFilter}
          placeholder="Muscle"
          options={MUSCLE_GROUPS.map((m) => ({ value: m, label: capitalize(m) }))}
        />
        <FilterSelect
          value={equipmentFilter}
          onChange={setEquipmentFilter}
          placeholder="Equipment"
          options={EQUIPMENT_VALUES.map((e) => ({ value: e, label: capitalize(e) }))}
        />
        <FilterSelect
          value={levelFilter}
          onChange={setLevelFilter}
          placeholder="Level"
          options={EXERCISE_LEVELS.map((l) => ({ value: l, label: capitalize(l) }))}
        />
        <FilterSelect
          value={categoryFilter}
          onChange={setCategoryFilter}
          placeholder="Category"
          options={EXERCISE_CATEGORIES.map((c) => ({ value: c, label: capitalize(c) }))}
        />
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium text-accent bg-bg-elevated border border-accent"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string | null;
  onChange: (val: string | null) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value || null)}
      className={`shrink-0 appearance-none rounded-full px-3 py-1.5 text-xs font-medium border outline-none ${
        value
          ? 'bg-accent/20 border-accent text-accent'
          : 'bg-bg-elevated border-border text-text-secondary'
      }`}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
