import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../layout/Header';
import { Card } from '../ui/Card';
import { Spinner } from '../ui/Spinner';
import { Button } from '../ui/Button';
import { SetRow } from './SetRow';
import { useWorkout, useWorkoutExercises, useAllSetsForWorkout } from '../../hooks/useWorkouts';
import { PPL_COLORS, PPL_LABELS } from '../../utils/constants';
import { formatDate } from '../../utils/dateUtils';
import { formatVolume, formatDuration, formatWeight } from '../../utils/formatUtils';
import { useWorkoutStore } from '../../stores/useWorkoutStore';
import {
  startWorkout,
  logSet,
  deleteSet,
  updateCompletedSet,
  addSetToExercise,
  recalculateWorkoutStats,
  removeExerciseFromWorkout,
} from '../../services/workoutEngine';
import { toast } from '../ui/Toast';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import type { PPLType } from '../../utils/constants';
import type { ExerciseSet } from '../../types/database';

export function WorkoutDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const workoutId = id ? parseInt(id) : null;

  const workout = useWorkout(workoutId);
  const exercises = useWorkoutExercises(workoutId);
  const allSets = useAllSetsForWorkout(workoutId);
  const startSession = useWorkoutStore((s) => s.startWorkout);

  const [isEditing, setIsEditing] = useState(false);
  const [removeExId, setRemoveExId] = useState<number | null>(null);
  const [removeExName, setRemoveExName] = useState('');

  if (!workout || !exercises || !allSets) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Workout" showBack />
        <div className="flex items-center justify-center flex-1">
          <Spinner />
        </div>
      </div>
    );
  }

  const pplType = workout.type as PPLType;
  const color = PPL_COLORS[pplType] ?? PPL_COLORS.push;

  const handleResume = async () => {
    if (!workoutId) return;
    if (workout.status === 'planned') {
      await startWorkout(workoutId);
    }
    startSession(workoutId);
    navigate(`/workouts/${workoutId}/play`);
  };

  const handleSaveEdits = async () => {
    if (!workoutId) return;
    await recalculateWorkoutStats(workoutId);
    setIsEditing(false);
    toast('Workout updated', 'success');
  };

  const handleEditSetComplete = async (setId: number, reps: number, weight: number) => {
    await logSet(setId, reps, weight);
  };

  const handleEditSet = async (setId: number, reps: number, weight: number) => {
    await updateCompletedSet(setId, reps, weight);
  };

  const handleDeleteSet = async (setId: number, exerciseId: number, exerciseName: string) => {
    const result = await deleteSet(setId);
    if (result.isLastSet) {
      setRemoveExId(exerciseId);
      setRemoveExName(exerciseName);
    }
  };

  const handleRemoveExercise = async () => {
    if (!removeExId) return;
    await removeExerciseFromWorkout(removeExId);
    setRemoveExId(null);
    toast('Exercise removed', 'success');
  };

  const setsMap = allSets as Record<number, ExerciseSet[]>;

  return (
    <div className="flex flex-col h-full">
      <Header title="Workout Details" showBack />
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-8">
        {/* Workout Header */}
        <Card className="mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
              style={{ backgroundColor: `${color}20`, color }}
            >
              {workout.type.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-text-primary capitalize">
                {PPL_LABELS[pplType] ?? workout.type}
              </h2>
              <p className="text-xs text-text-secondary">
                {formatDate(workout.date)}
              </p>
            </div>
            {workout.status === 'completed' && (
              isEditing ? (
                <Button size="sm" onClick={handleSaveEdits}>
                  Done
                </Button>
              ) : (
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              )
            )}
          </div>
          {workout.status === 'completed' && (
            <div className="grid grid-cols-3 gap-3">
              <MiniStat label="Duration" value={formatDuration(workout.durationMinutes ?? 0)} />
              <MiniStat label="Volume" value={formatVolume(workout.totalVolume ?? 0)} />
              <MiniStat label="Exercises" value={String(exercises.length)} />
            </div>
          )}
          {workout.notes && (
            <p className="text-sm text-text-secondary mt-3 italic">
              "{workout.notes}"
            </p>
          )}
        </Card>

        {/* Resume button for in-progress/planned */}
        {(workout.status === 'in_progress' || workout.status === 'planned') && (
          <Button className="w-full mb-4" onClick={handleResume}>
            {workout.status === 'in_progress' ? 'Resume Workout' : 'Start Workout'}
          </Button>
        )}

        {/* Exercises */}
        <div className="space-y-3">
          {exercises.map((ex) => {
            const sets = setsMap[ex.id!] ?? [];
            return (
              <Card key={ex.id}>
                <h3 className="font-semibold text-text-primary text-sm mb-2">
                  {ex.exerciseName}
                </h3>
                {isEditing ? (
                  <>
                    <div className="space-y-2">
                      {sets.map((set) => (
                        <SetRow
                          key={set.id}
                          set={set}
                          onComplete={(reps, weight) =>
                            handleEditSetComplete(set.id!, reps, weight)
                          }
                          onDelete={() =>
                            handleDeleteSet(set.id!, ex.id!, ex.exerciseName)
                          }
                          onEdit={(reps, weight) =>
                            handleEditSet(set.id!, reps, weight)
                          }
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => addSetToExercise(ex.id!)}
                      className="w-full py-2 text-sm font-medium text-accent active:text-accent-hover mt-2"
                    >
                      + Add Set
                    </button>
                  </>
                ) : (
                  <div className="space-y-1">
                    {sets.map((set) => (
                      <div
                        key={set.id}
                        className={`flex items-center gap-2 text-xs ${
                          set.isCompleted ? 'text-text-primary' : 'text-text-muted'
                        }`}
                      >
                        <span className="w-6 text-text-muted">S{set.setNumber}</span>
                        {set.isCompleted ? (
                          <>
                            <span>
                              {set.actualReps} x {formatWeight(set.actualWeight ?? 0)}
                            </span>
                            {set.isPR && <span className="text-success">PR</span>}
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-green-400 ml-auto">
                              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </>
                        ) : (
                          <span className="text-text-muted">
                            {set.targetReps} x {formatWeight(set.targetWeight)} (target)
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      <ConfirmDialog
        open={removeExId !== null}
        title="Remove Exercise?"
        message={`This is the only set. Remove ${removeExName} from the workout entirely?`}
        confirmLabel="Remove Exercise"
        variant="danger"
        onConfirm={handleRemoveExercise}
        onCancel={() => setRemoveExId(null)}
      />
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-sm font-bold text-text-primary">{value}</p>
      <p className="text-[10px] text-text-muted">{label}</p>
    </div>
  );
}
