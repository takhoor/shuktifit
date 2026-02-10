import { Header } from '../layout/Header';
import { Input } from '../ui/Input';
import { Spinner } from '../ui/Spinner';
import { EmptyState } from '../ui/EmptyState';
import { ExerciseFilterBar } from './ExerciseFilterBar';
import { ExerciseListItem } from './ExerciseListItem';
import { useExercises } from '../../hooks/useExercises';
import { useFilterStore } from '../../stores/useFilterStore';

export function ExerciseCatalogPage() {
  const exercises = useExercises();
  const { searchTerm, setSearchTerm } = useFilterStore();

  return (
    <div className="flex flex-col h-full">
      <Header title="Exercises" />
      <div className="px-4 pb-3">
        <Input
          placeholder="Search exercises..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <ExerciseFilterBar />
      <div className="flex-1 overflow-y-auto scrollbar-hide mt-2">
        {exercises === undefined ? (
          <div className="flex items-center justify-center py-20">
            <Spinner />
          </div>
        ) : exercises.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No exercises found"
            description="Try adjusting your search or filters"
          />
        ) : (
          <div>
            <div className="px-4 pb-2">
              <span className="text-xs text-text-muted">
                {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
              </span>
            </div>
            {exercises.map((exercise) => (
              <ExerciseListItem key={exercise.id} exercise={exercise} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
