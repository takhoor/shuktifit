import { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '../layout/Header';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { ExercisePickerModal } from './ExercisePickerModal';
import { SubstitutionPickerModal } from './SubstitutionPickerModal';
import { toast } from '../ui/Toast';
import { useWorkoutExercises, useAllSetsForWorkout } from '../../hooks/useWorkouts';
import {
  createWorkout,
  addExerciseToWorkout,
  removeExerciseFromWorkout,
  startWorkout,
  updateExerciseTargets,
  deleteWorkout,
  excludeExercise,
  getLastPerformance,
} from '../../services/workoutEngine';
import { useWorkoutStore } from '../../stores/useWorkoutStore';
import type { Exercise, WorkoutExercise } from '../../types/database';
import type { PPLType } from '../../utils/constants';
import { PPL_LABELS, PPL_MUSCLE_FOCUS, PPL_COLORS } from '../../utils/constants';

export function WorkoutBuilderPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const workoutType = (searchParams.get('type') as PPLType) || 'push';
  const aiWorkoutId = searchParams.get('ai');

  const editWorkoutId = searchParams.get('edit');
  const [workoutId, setWorkoutId] = useState<number | null>(
    aiWorkoutId ? parseInt(aiWorkoutId) : editWorkoutId ? parseInt(editWorkoutId) : null,
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<WorkoutExercise | null>(null);
  const [swapTarget, setSwapTarget] = useState<WorkoutExercise | null>(null);
  const isAI = !!aiWorkoutId;

  const exercises = useWorkoutExercises(workoutId);
  const allSets = useAllSetsForWorkout(workoutId);
  const startSession = useWorkoutStore((s) => s.startWorkout);

  const initWorkout = useCallback(async () => {
    if (!workoutId) {
      const id = await createWorkout(workoutType);
      setWorkoutId(id);
      return id;
    }
    return workoutId;
  }, [workoutId, workoutType]);

  const handleAddExercise = async (exercise: Exercise) => {
    const wId = await initWorkout();
    await addExerciseToWorkout(wId, exercise.id, exercise.name);
    setPickerOpen(false);
  };

  const handleRemoveExercise = (ex: WorkoutExercise) => {
    if (isAI) {
      setRemoveTarget(ex);
    } else {
      removeExerciseFromWorkout(ex.id!);
    }
  };

  const handleRemoveThisOnly = async () => {
    if (removeTarget) {
      await removeExerciseFromWorkout(removeTarget.id!);
      setRemoveTarget(null);
    }
  };

  const handleRemoveAndExclude = async () => {
    if (removeTarget) {
      await removeExerciseFromWorkout(removeTarget.id!);
      await excludeExercise(removeTarget.exerciseId, 'User excluded from AI workout');
      toast(`${removeTarget.exerciseName} will never be suggested again`, 'info');
      setRemoveTarget(null);
    }
  };

  const handleSwapExercise = async (newExercise: Exercise) => {
    if (!swapTarget || !workoutId) return;
    const oldSets = swapTarget.targetSets;
    const oldReps = swapTarget.targetReps;
    const oldRest = swapTarget.restSeconds;
    await removeExerciseFromWorkout(swapTarget.id!);
    const lastPerf = await getLastPerformance(newExercise.id);
    await addExerciseToWorkout(
      workoutId,
      newExercise.id,
      newExercise.name,
      oldSets,
      oldReps,
      lastPerf?.bestWeight ?? 0,
      oldRest,
    );
    toast(`Swapped to ${newExercise.name}`, 'info');
    setSwapTarget(null);
  };

  const handleUpdateTargets = async (
    weId: number,
    field: string,
    value: number,
  ) => {
    await updateExerciseTargets(weId, { [field]: value });
  };

  const handleStartWorkout = async () => {
    if (!workoutId || !exercises?.length) return;
    await startWorkout(workoutId);
    startSession(workoutId);
    navigate(`/workouts/${workoutId}/play`);
  };

  const handleDiscard = async () => {
    if (workoutId) {
      await deleteWorkout(workoutId);
    }
    navigate('/workouts');
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title={isAI ? 'AI Workout' : 'New Workout'}
        showBack
        right={
          workoutId ? (
            <button
              onClick={() => setDiscardOpen(true)}
              className="text-sm text-red-400 active:text-red-300"
            >
              Discard
            </button>
          ) : undefined
        }
      />
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-32">
        {/* Workout Type Banner */}
        <Card className="mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: PPL_COLORS[workoutType as PPLType] ?? PPL_COLORS.push }}
            />
            <div>
              <h2 className="font-bold text-text-primary">
                {PPL_LABELS[workoutType as PPLType] ?? 'Custom Workout'}
              </h2>
              <p className="text-xs text-text-secondary">
                {PPL_MUSCLE_FOCUS[workoutType as PPLType] ?? ''}
              </p>
            </div>
            {isAI && (
              <span className="ml-auto text-[10px] px-2 py-1 rounded-full bg-purple-900/30 text-purple-400 font-semibold">
                AI Generated
              </span>
            )}
          </div>
        </Card>

        {/* Exercise List */}
        {exercises && exercises.length > 0 ? (
          <div className="space-y-3">
            {exercises.map((ex) => (
              <BuilderExerciseCard
                key={ex.id}
                exercise={ex}
                sets={allSets && ex.id ? (allSets as Record<number, Array<{ id?: number }>>)[ex.id!] : undefined}
                onRemove={() => handleRemoveExercise(ex)}
                onSwap={() => setSwapTarget(ex)}
                onUpdateTargets={(field, val) =>
                  handleUpdateTargets(ex.id!, field, val)
                }
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <span className="text-4xl block mb-3">🏋️</span>
            <p className="text-text-secondary text-sm">
              Add exercises to build your workout
            </p>
          </div>
        )}

        {/* Add Exercise Button */}
        <Button
          variant="secondary"
          className="w-full mt-4"
          onClick={() => setPickerOpen(true)}
        >
          + Add Exercise
        </Button>
      </div>

      {/* Start Workout Sticky Footer */}
      {exercises && exercises.length > 0 && (
        <div className="safe-bottom absolute bottom-0 left-0 right-0 p-4 bg-bg-primary border-t border-border">
          <Button className="w-full" size="lg" onClick={handleStartWorkout}>
            Start Workout ({exercises.length} exercise{exercises.length !== 1 ? 's' : ''})
          </Button>
        </div>
      )}

      <ExercisePickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleAddExercise}
        excludeIds={exercises?.map((e) => e.exerciseId) ?? []}
      />

      <SubstitutionPickerModal
        open={swapTarget !== null}
        onClose={() => setSwapTarget(null)}
        onSelect={handleSwapExercise}
        originalExercise={swapTarget ? {
          exerciseId: swapTarget.exerciseId,
          exerciseName: swapTarget.exerciseName,
          primaryMuscles: [],  // Will be looked up by the modal
          equipment: null,
        } : null}
      />

      <ConfirmDialog
        open={discardOpen}
        title="Discard Workout?"
        message="This will delete the workout and all exercises you've added."
        confirmLabel="Discard"
        variant="danger"
        onConfirm={handleDiscard}
        onCancel={() => setDiscardOpen(false)}
      />

      {/* Exercise Exclusion Dialog (AI workouts only) */}
      {removeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setRemoveTarget(null)} />
          <div className="relative bg-bg-card rounded-2xl border border-border p-6 mx-6 max-w-sm w-full space-y-4">
            <h3 className="text-lg font-bold text-text-primary">
              Remove {removeTarget.exerciseName}?
            </h3>
            <p className="text-sm text-text-secondary">
              Would you like to remove it from this workout only, or never have it suggested again?
            </p>
            <div className="space-y-2">
              <Button
                variant="secondary"
                className="w-full"
                onClick={handleRemoveThisOnly}
              >
                This workout only
              </Button>
              <Button
                variant="danger"
                className="w-full"
                onClick={handleRemoveAndExclude}
              >
                Never suggest again
              </Button>
              <button
                className="w-full py-2 text-sm text-text-muted active:text-text-secondary"
                onClick={() => setRemoveTarget(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BuilderExerciseCard({
  exercise,
  sets,
  onRemove,
  onSwap,
  onUpdateTargets,
}: {
  exercise: WorkoutExercise;
  sets: Array<{ id?: number }> | undefined;
  onRemove: () => void;
  onSwap: () => void;
  onUpdateTargets: (field: string, value: number) => void;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-text-primary text-sm">
            {exercise.exerciseName}
          </h3>
          {exercise.notes && (
            <p className="text-xs text-text-muted mt-0.5">{exercise.notes}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onSwap}
            className="p-1 text-text-muted active:text-accent"
            title="Substitute exercise"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="17 1 21 5 17 9" />
              <path d="M3 11V9a4 4 0 0 1 4-4h14" />
              <polyline points="7 23 3 19 7 15" />
              <path d="M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
          </button>
          <button
            onClick={onRemove}
            className="p-1 text-text-muted active:text-red-400"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-[10px] text-text-muted uppercase">Sets</label>
          <input
            type="number"
            inputMode="numeric"
            value={exercise.targetSets}
            onChange={(e) =>
              onUpdateTargets('targetSets', parseInt(e.target.value) || 1)
            }
            className="w-full bg-bg-elevated rounded-lg px-3 py-2 text-center text-sm text-text-primary border border-border outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="text-[10px] text-text-muted uppercase">Reps</label>
          <input
            type="number"
            inputMode="numeric"
            value={exercise.targetReps}
            onChange={(e) =>
              onUpdateTargets('targetReps', parseInt(e.target.value) || 1)
            }
            className="w-full bg-bg-elevated rounded-lg px-3 py-2 text-center text-sm text-text-primary border border-border outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="text-[10px] text-text-muted uppercase">Weight</label>
          <input
            type="number"
            inputMode="decimal"
            value={exercise.suggestedWeight || ''}
            placeholder="lbs"
            onChange={(e) =>
              onUpdateTargets(
                'suggestedWeight',
                parseFloat(e.target.value) || 0,
              )
            }
            className="w-full bg-bg-elevated rounded-lg px-3 py-2 text-center text-sm text-text-primary border border-border outline-none focus:border-accent"
          />
        </div>
      </div>
      <p className="text-[10px] text-text-muted mt-2">
        {sets?.length ?? exercise.targetSets} sets · Rest: {exercise.restSeconds}s
      </p>
    </Card>
  );
}
