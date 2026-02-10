import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../layout/Header';
import { Card } from '../ui/Card';
import { Spinner } from '../ui/Spinner';
import { useWorkout, useWorkoutExercises, useAllSetsForWorkout } from '../../hooks/useWorkouts';
import { PPL_COLORS, PPL_LABELS } from '../../utils/constants';
import { formatDate } from '../../utils/dateUtils';
import { formatVolume, formatDuration, formatWeight } from '../../utils/formatUtils';
import { useWorkoutStore } from '../../stores/useWorkoutStore';
import { startWorkout } from '../../services/workoutEngine';
import { Button } from '../ui/Button';
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
            <div>
              <h2 className="font-bold text-text-primary capitalize">
                {PPL_LABELS[pplType] ?? workout.type}
              </h2>
              <p className="text-xs text-text-secondary">
                {formatDate(workout.date)}
              </p>
            </div>
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
              </Card>
            );
          })}
        </div>
      </div>
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
