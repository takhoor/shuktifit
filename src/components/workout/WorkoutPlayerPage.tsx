import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkout, useWorkoutExercises, useExerciseSets } from '../../hooks/useWorkouts';
import { useWorkoutStore } from '../../stores/useWorkoutStore';
import { logSet, completeWorkout, addSetToExercise, getLastPerformance, removeExerciseFromWorkout, swapExerciseInWorkout, deleteSet, updateCompletedSet, updateExerciseTargets, undoCompleteWorkout, insertExerciseAtPosition } from '../../services/workoutEngine';
import { ExercisePickerModal } from './ExercisePickerModal';
import { db } from '../../db';
import { SetRow } from './SetRow';
import { RestTimer } from './RestTimer';
import { ExerciseStopwatch } from './ExerciseStopwatch';
import { ExerciseInfoModal } from './ExerciseInfoModal';
import { WorkoutSummary } from './WorkoutSummary';
import { SubstitutionPickerModal } from './SubstitutionPickerModal';
import { Spinner } from '../ui/Spinner';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { toast } from '../ui/Toast';
import { getExerciseImageUrl } from '../../utils/imageUrl';
import { formatWeight } from '../../utils/formatUtils';
import type { Exercise, ExerciseHistory, WorkoutExercise } from '../../types/database';

function getSupersetGroupIndices(exercises: WorkoutExercise[], group: number): number[] {
  const indices: number[] = [];
  exercises.forEach((ex, i) => {
    if (ex.supersetGroup === group) indices.push(i);
  });
  return indices;
}

export function WorkoutPlayerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const workoutId = id ? parseInt(id) : null;

  const workout = useWorkout(workoutId);
  const exercises = useWorkoutExercises(workoutId);
  const currentIndex = useWorkoutStore((s) => s.currentExerciseIndex);
  const goToExercise = useWorkoutStore((s) => s.goToExercise);
  const startRest = useWorkoutStore((s) => s.startRestTimer);
  const setSupersetReturn = useWorkoutStore((s) => s.setSupersetReturn);
  const finishSession = useWorkoutStore((s) => s.finishWorkout);

  const currentExercise = exercises?.[currentIndex];
  const sets = useExerciseSets(currentExercise?.id);
  const [lastPerf, setLastPerf] = useState<ExerciseHistory | undefined>();
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof completeWorkout>> | null>(null);
  const [quitOpen, setQuitOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [removeLastSetOpen, setRemoveLastSetOpen] = useState(false);
  const [confirmFinishOpen, setConfirmFinishOpen] = useState(false);
  const [addPickerOpen, setAddPickerOpen] = useState(false);
  const [pendingAddExercise, setPendingAddExercise] = useState<Exercise | null>(null);
  const [imgErr, setImgErr] = useState(false);
  const [showSubPicker, setShowSubPicker] = useState(false);
  const [subOriginal, setSubOriginal] = useState<{
    exerciseId: string;
    exerciseName: string;
    primaryMuscles: string[];
    equipment: string | null;
  } | null>(null);
  const [editingRest, setEditingRest] = useState(false);
  const [restInput, setRestInput] = useState('');
  const [showStopwatch, setShowStopwatch] = useState(false);
  const [isStaticExercise, setIsStaticExercise] = useState(false);
  const [showExerciseInfo, setShowExerciseInfo] = useState(false);
  const [fullExercise, setFullExercise] = useState<Exercise | null>(null);
  const prevExerciseIdRef = useRef<number | undefined>(undefined);

  const handleRestSave = async () => {
    if (!currentExercise?.id) return;
    const val = parseInt(restInput, 10);
    if (!isNaN(val) && val > 0 && val <= 600) {
      await updateExerciseTargets(currentExercise.id, { restSeconds: val });
    }
    setEditingRest(false);
  };

  // Reset visual state and load exercise data when switching exercises
  if (currentExercise?.id !== prevExerciseIdRef.current) {
    prevExerciseIdRef.current = currentExercise?.id;
    setImgErr(false);
    setShowStopwatch(false);
  }

  useEffect(() => {
    if (currentExercise) {
      getLastPerformance(currentExercise.exerciseId).then(setLastPerf);
      db.exercises.get(currentExercise.exerciseId).then((ex) => {
        setFullExercise(ex ?? null);
        setIsStaticExercise(ex?.force === 'static');
      });
    }
  }, [currentExercise]);

  if (!workout || !exercises) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
      </div>
    );
  }

  if (showSummary && summary) {
    return (
      <WorkoutSummary
        summary={summary}
        workoutType={workout.type}
        onDone={() => {
          finishSession();
          navigate('/workouts');
        }}
        onUndo={async () => {
          if (!workoutId) return;
          await undoCompleteWorkout(workoutId);
          setSummary(null);
          setShowSummary(false);
          toast('Workout reopened', 'info');
        }}
      />
    );
  }

  const handleCompleteSet = async (setId: number, reps: number, weight: number) => {
    const result = await logSet(setId, reps, weight);
    if (result.isPR) {
      toast('New Personal Record!', 'pr');
    }
    if (!currentExercise || !exercises) return;

    const group = currentExercise.supersetGroup;
    if (group != null) {
      const groupIndices = getSupersetGroupIndices(exercises, group);
      if (groupIndices.length > 1) {
        const posInGroup = groupIndices.indexOf(currentIndex);
        const isLast = posInGroup === groupIndices.length - 1;

        if (isLast) {
          // Last exercise in superset → rest, then return to first
          setSupersetReturn(groupIndices[0]);
          startRest(currentExercise.restSeconds);
        } else {
          // Not last → immediately go to next exercise in group (no rest)
          goToExercise(groupIndices[posInGroup + 1]);
        }
        return;
      }
    }

    // Normal exercise — rest as usual
    startRest(currentExercise.restSeconds);
  };

  const handleAddSet = async () => {
    if (currentExercise?.id) {
      await addSetToExercise(currentExercise.id);
    }
  };

  const handleDeleteSet = async (setId: number) => {
    const result = await deleteSet(setId);
    if (result.isLastSet) {
      setRemoveLastSetOpen(true);
    } else {
      toast('Set removed', 'success');
    }
  };

  const handleEditSet = async (setId: number, reps: number, weight: number) => {
    const result = await updateCompletedSet(setId, reps, weight);
    if (result.isPR) {
      toast('New Personal Record!', 'pr');
    } else {
      toast('Set updated', 'success');
    }
  };

  const handleFinishWorkout = async () => {
    if (!workoutId) return;
    const result = await completeWorkout(workoutId);
    setSummary(result);
    setShowSummary(true);
  };

  const handleQuit = () => {
    finishSession();
    navigate('/workouts');
  };

  const handleOpenSwap = async () => {
    if (!currentExercise) return;
    const dbExercise = await db.exercises.get(currentExercise.exerciseId);
    setSubOriginal({
      exerciseId: currentExercise.exerciseId,
      exerciseName: currentExercise.exerciseName,
      primaryMuscles: dbExercise?.primaryMuscles ?? [],
      equipment: dbExercise?.equipment ?? null,
    });
    setShowSubPicker(true);
  };

  const handleSwap = async (newExercise: Exercise) => {
    if (!currentExercise?.id) return;
    await swapExerciseInWorkout(currentExercise.id, newExercise.id, newExercise.name);
    setShowSubPicker(false);
    toast(`Swapped to ${newExercise.name}`, 'success');
  };

  const handleAddExercisePicked = (exercise: Exercise) => {
    setAddPickerOpen(false);
    setPendingAddExercise(exercise);
  };

  const handleInsertExercise = async (sessionOnly: boolean) => {
    if (!workoutId || !pendingAddExercise || !currentExercise) return;
    const position = currentExercise.order + 1;
    await insertExerciseAtPosition(
      workoutId,
      position,
      pendingAddExercise.id,
      pendingAddExercise.name,
      sessionOnly,
    );
    setPendingAddExercise(null);
    toast(
      sessionOnly
        ? `Added ${pendingAddExercise.name} (this session only)`
        : `Added ${pendingAddExercise.name}`,
      'success',
    );
  };

  const handleRemove = async () => {
    if (!currentExercise?.id || !exercises) return;
    if (exercises.length <= 1) {
      toast('Cannot remove the only exercise', 'error');
      return;
    }
    await removeExerciseFromWorkout(currentExercise.id);
    if (currentIndex >= exercises.length - 1) {
      goToExercise(Math.max(0, currentIndex - 1));
    }
    setRemoveOpen(false);
    toast('Exercise removed', 'success');
  };

  const allExercisesDone = exercises.every((e) => e.isCompleted);
  const exerciseImage =
    currentExercise && !imgErr
      ? getExerciseImageUrl(
          `${currentExercise.exerciseId}/0.jpg`,
        )
      : null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="safe-top flex items-center justify-between px-4 py-3 bg-bg-primary">
        <button
          onClick={() => setQuitOpen(true)}
          className="text-text-muted active:text-text-primary"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="text-center">
          <h1 className="text-sm font-bold text-text-primary capitalize">
            {workout.type === 'full-body' ? 'Full Body' : `${workout.type} Day`}
          </h1>
          <p className="text-xs text-text-secondary">
            {currentIndex + 1} / {exercises.length}
          </p>
        </div>
        <button
          onClick={() => setConfirmFinishOpen(true)}
          className="text-sm font-semibold text-accent active:text-accent-hover"
        >
          Finish
        </button>
      </div>

      {/* Exercise navigation dots */}
      <div className="flex items-center justify-center gap-1.5 py-2">
        {exercises.map((ex, i) => {
          const inSuperset = ex.supersetGroup != null;
          const prevSameGroup = i > 0 && exercises[i - 1].supersetGroup === ex.supersetGroup && inSuperset;

          return (
            <div key={ex.id} className="flex items-center">
              {prevSameGroup && (
                <div className="w-2 h-0.5 bg-accent/40 -mx-0.5" />
              )}
              <button
                onClick={() => goToExercise(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentIndex
                    ? 'w-6 bg-accent'
                    : ex.isCompleted
                      ? 'bg-green-500'
                      : inSuperset
                        ? 'bg-accent/40'
                        : 'bg-bg-elevated'
                }`}
              />
            </div>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-8">
        {/* Exercise Image (tap for info) */}
        {exerciseImage && (
          <button
            onClick={() => setShowExerciseInfo(true)}
            className="w-full h-40 rounded-xl bg-bg-card overflow-hidden mb-3"
          >
            <img
              src={exerciseImage}
              alt={currentExercise?.exerciseName}
              className="w-full h-full object-contain"
              onError={() => setImgErr(true)}
            />
          </button>
        )}

        {/* Exercise Info + Swap/Remove */}
        <div className="mb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <button
                onClick={() => setShowExerciseInfo(true)}
                className="text-left"
              >
                <h2 className="text-lg font-bold text-text-primary">
                  {currentExercise?.exerciseName}
                </h2>
              </button>
              {lastPerf && (
                <p className="text-xs text-text-secondary mt-1">
                  Last: {lastPerf.totalSets}x{lastPerf.bestReps} @ {formatWeight(lastPerf.bestWeight)}
                </p>
              )}
              {currentExercise && (
                <div className="flex items-center gap-1 mt-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                  {editingRest ? (
                    <input
                      type="number"
                      inputMode="numeric"
                      autoFocus
                      value={restInput}
                      onChange={(e) => setRestInput(e.target.value)}
                      onBlur={handleRestSave}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleRestSave(); }}
                      className="w-14 text-xs bg-bg-elevated text-text-primary px-1.5 py-0.5 rounded border border-border outline-none"
                    />
                  ) : (
                    <button
                      onClick={() => { setRestInput(String(currentExercise.restSeconds)); setEditingRest(true); }}
                      className="text-xs text-text-muted active:text-accent"
                    >
                      Rest: {currentExercise.restSeconds}s
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-1 ml-2 shrink-0">
              <button
                onClick={() => setAddPickerOpen(true)}
                className="p-2 rounded-lg text-text-muted active:text-accent active:bg-bg-elevated"
                title="Add exercise after this one"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
              <button
                onClick={handleOpenSwap}
                className="p-2 rounded-lg text-text-muted active:text-accent active:bg-bg-elevated"
                title="Swap exercise"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="8 7 3 12 8 17" />
                  <polyline points="16 7 21 12 16 17" />
                </svg>
              </button>
              {exercises.length > 1 && (
                <button
                  onClick={() => setRemoveOpen(true)}
                  className="p-2 rounded-lg text-text-muted active:text-red-400 active:bg-bg-elevated"
                  title="Remove exercise"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sets */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center px-3 text-[10px] text-text-muted uppercase">
            <span className="w-8 text-center">Set</span>
            <span className="w-16 text-center ml-3">Reps</span>
            <span className="ml-6 w-20 text-center">Weight</span>
          </div>
          {sets?.map((set) => (
            <SetRow
              key={set.id}
              set={set}
              onComplete={(reps, weight) =>
                handleCompleteSet(set.id!, reps, weight)
              }
              onDelete={() => handleDeleteSet(set.id!)}
              onEdit={(reps, weight) => handleEditSet(set.id!, reps, weight)}
            />
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleAddSet}
            className="flex-1 py-2.5 text-sm font-medium text-accent active:text-accent-hover"
          >
            + Add Set
          </button>
          {isStaticExercise && (
            <button
              onClick={() => setShowStopwatch(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-accent active:text-accent-hover"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              Timer
            </button>
          )}
        </div>

        {/* Nav Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => goToExercise(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="flex-1 py-3 rounded-xl bg-bg-elevated text-text-secondary font-medium text-sm disabled:opacity-30 active:bg-bg-card"
          >
            Previous
          </button>
          {currentIndex < exercises.length - 1 ? (
            <button
              onClick={() => goToExercise(currentIndex + 1)}
              className="flex-1 py-3 rounded-xl bg-bg-elevated text-text-primary font-medium text-sm active:bg-bg-card"
            >
              Next Exercise
            </button>
          ) : (
            <button
              onClick={() => setConfirmFinishOpen(true)}
              className={`flex-1 py-3 rounded-xl font-bold text-sm ${
                allExercisesDone
                  ? 'bg-accent text-white active:bg-accent-hover'
                  : 'bg-bg-elevated text-accent active:bg-bg-card'
              }`}
            >
              Complete Workout
            </button>
          )}
        </div>
      </div>

      <RestTimer />

      {showStopwatch && currentExercise && (
        <ExerciseStopwatch
          targetSeconds={currentExercise.targetReps}
          onClose={() => setShowStopwatch(false)}
        />
      )}

      <ExerciseInfoModal
        open={showExerciseInfo}
        onClose={() => setShowExerciseInfo(false)}
        exercise={fullExercise}
      />

      <SubstitutionPickerModal
        open={showSubPicker}
        onClose={() => setShowSubPicker(false)}
        onSelect={handleSwap}
        originalExercise={subOriginal}
      />

      <ConfirmDialog
        open={quitOpen}
        title="Leave Workout?"
        message="Your logged sets will be saved but the workout won't be marked as completed."
        confirmLabel="Leave"
        variant="danger"
        onConfirm={handleQuit}
        onCancel={() => setQuitOpen(false)}
      />

      <ConfirmDialog
        open={removeOpen}
        title="Remove Exercise?"
        message={`Remove ${currentExercise?.exerciseName} from this workout? Any logged sets will be lost.`}
        confirmLabel="Remove"
        variant="danger"
        onConfirm={handleRemove}
        onCancel={() => setRemoveOpen(false)}
      />

      <ConfirmDialog
        open={removeLastSetOpen}
        title="Remove Exercise?"
        message={`This is the only set. Remove ${currentExercise?.exerciseName} from the workout entirely?`}
        confirmLabel="Remove Exercise"
        variant="danger"
        onConfirm={() => {
          setRemoveLastSetOpen(false);
          handleRemove();
        }}
        onCancel={() => setRemoveLastSetOpen(false)}
      />

      <ConfirmDialog
        open={confirmFinishOpen}
        title="Finish workout?"
        message={
          allExercisesDone
            ? 'Mark this workout as complete?'
            : "Some exercises aren't finished yet. Complete the workout anyway?"
        }
        confirmLabel="Finish"
        cancelLabel="Keep going"
        onConfirm={() => {
          setConfirmFinishOpen(false);
          handleFinishWorkout();
        }}
        onCancel={() => setConfirmFinishOpen(false)}
      />

      <ExercisePickerModal
        open={addPickerOpen}
        onClose={() => setAddPickerOpen(false)}
        onSelect={handleAddExercisePicked}
        excludeIds={exercises?.map((e) => e.exerciseId) ?? []}
      />

      {pendingAddExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/60" onClick={() => setPendingAddExercise(null)} />
          <div className="relative bg-bg-card rounded-2xl border border-border p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-text-primary mb-1">
              Add {pendingAddExercise.name}?
            </h3>
            <p className="text-sm text-text-secondary mb-5">
              It'll be inserted after the current exercise. Save it just for today, or to this workout permanently?
            </p>
            <div className="space-y-2">
              <button
                onClick={() => handleInsertExercise(true)}
                className="w-full py-3 rounded-xl bg-bg-elevated text-text-primary text-sm font-semibold active:bg-bg-card"
              >
                This session only
              </button>
              <button
                onClick={() => handleInsertExercise(false)}
                className="w-full py-3 rounded-xl bg-accent text-white text-sm font-semibold active:bg-accent-hover"
              >
                Save to this workout
              </button>
              <button
                onClick={() => setPendingAddExercise(null)}
                className="w-full py-2 text-sm text-text-muted active:text-text-secondary"
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
