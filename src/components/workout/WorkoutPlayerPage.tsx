import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkout, useWorkoutExercises, useExerciseSets } from '../../hooks/useWorkouts';
import { useWorkoutStore } from '../../stores/useWorkoutStore';
import { logSet, completeWorkout, addSetToExercise, getLastPerformance } from '../../services/workoutEngine';
import { SetRow } from './SetRow';
import { RestTimer } from './RestTimer';
import { WorkoutSummary } from './WorkoutSummary';
import { Spinner } from '../ui/Spinner';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { toast } from '../ui/Toast';
import { getExerciseImageUrl } from '../../utils/imageUrl';
import { formatWeight } from '../../utils/formatUtils';
import type { ExerciseHistory } from '../../types/database';

export function WorkoutPlayerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const workoutId = id ? parseInt(id) : null;

  const workout = useWorkout(workoutId);
  const exercises = useWorkoutExercises(workoutId);
  const currentIndex = useWorkoutStore((s) => s.currentExerciseIndex);
  const goToExercise = useWorkoutStore((s) => s.goToExercise);
  const startRest = useWorkoutStore((s) => s.startRestTimer);
  const finishSession = useWorkoutStore((s) => s.finishWorkout);

  const currentExercise = exercises?.[currentIndex];
  const sets = useExerciseSets(currentExercise?.id);
  const [lastPerf, setLastPerf] = useState<ExerciseHistory | undefined>();
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof completeWorkout>> | null>(null);
  const [quitOpen, setQuitOpen] = useState(false);
  const [imgErr, setImgErr] = useState(false);

  useEffect(() => {
    if (currentExercise) {
      setImgErr(false);
      getLastPerformance(currentExercise.exerciseId).then(setLastPerf);
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
      />
    );
  }

  const handleCompleteSet = async (setId: number, reps: number, weight: number) => {
    const result = await logSet(setId, reps, weight);
    if (result.isPR) {
      toast('New Personal Record!', 'pr');
    }
    // Start rest timer
    if (currentExercise) {
      startRest(currentExercise.restSeconds);
    }
  };

  const handleAddSet = async () => {
    if (currentExercise?.id) {
      await addSetToExercise(currentExercise.id);
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

  const allExercisesDone = exercises.every((e) => e.isCompleted);
  const exerciseImage =
    currentExercise && !imgErr
      ? getExerciseImageUrl(
          // We need the exercise images from the DB
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
            {workout.type} Day
          </h1>
          <p className="text-xs text-text-secondary">
            {currentIndex + 1} / {exercises.length}
          </p>
        </div>
        <button
          onClick={handleFinishWorkout}
          className="text-sm font-semibold text-accent active:text-accent-hover"
        >
          Finish
        </button>
      </div>

      {/* Exercise navigation dots */}
      <div className="flex items-center justify-center gap-1.5 py-2">
        {exercises.map((ex, i) => (
          <button
            key={ex.id}
            onClick={() => goToExercise(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === currentIndex
                ? 'w-6 bg-accent'
                : ex.isCompleted
                  ? 'bg-green-500'
                  : 'bg-bg-elevated'
            }`}
          />
        ))}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-8">
        {/* Exercise Image */}
        {exerciseImage && (
          <div className="w-full h-40 rounded-xl bg-bg-card overflow-hidden mb-3">
            <img
              src={exerciseImage}
              alt={currentExercise?.exerciseName}
              className="w-full h-full object-contain"
              onError={() => setImgErr(true)}
            />
          </div>
        )}

        {/* Exercise Info */}
        <div className="mb-4">
          <h2 className="text-lg font-bold text-text-primary">
            {currentExercise?.exerciseName}
          </h2>
          {lastPerf && (
            <p className="text-xs text-text-secondary mt-1">
              Last: {lastPerf.totalSets}x{lastPerf.bestReps} @ {formatWeight(lastPerf.bestWeight)}
            </p>
          )}
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
            />
          ))}
        </div>

        <button
          onClick={handleAddSet}
          className="w-full py-2.5 text-sm font-medium text-accent active:text-accent-hover"
        >
          + Add Set
        </button>

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
              onClick={handleFinishWorkout}
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

      <ConfirmDialog
        open={quitOpen}
        title="Leave Workout?"
        message="Your logged sets will be saved but the workout won't be marked as completed."
        confirmLabel="Leave"
        variant="danger"
        onConfirm={handleQuit}
        onCancel={() => setQuitOpen(false)}
      />
    </div>
  );
}
