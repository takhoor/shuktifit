import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../layout/Header';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { Spinner } from '../ui/Spinner';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { toast } from '../ui/Toast';
import { useWorkoutList } from '../../hooks/useWorkouts';
import { deleteWorkout } from '../../services/workoutEngine';
import { PPL_COLORS, PPL_LABELS } from '../../utils/constants';
import { formatShortDate } from '../../utils/dateUtils';
import { formatVolume, formatDuration } from '../../utils/formatUtils';
import type { PPLType } from '../../utils/constants';
import type { Workout } from '../../types/database';

export function WorkoutListPage() {
  const navigate = useNavigate();
  const workouts = useWorkoutList();
  const [deleteTarget, setDeleteTarget] = useState<Workout | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    await deleteWorkout(deleteTarget.id);
    setDeleteTarget(null);
    toast('Workout deleted', 'success');
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Workouts"
        right={
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigate('/workouts/templates')}
            >
              Templates
            </Button>
            <Button
              size="sm"
              onClick={() => navigate('/workouts/new?type=push')}
            >
              + New
            </Button>
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-8">
        {/* Quick start buttons */}
        <div className="flex gap-2 mb-4">
          {(['push', 'pull', 'legs'] as const).map((type) => (
            <button
              key={type}
              onClick={() => navigate(`/workouts/new?type=${type}`)}
              className="flex-1 py-3 rounded-xl text-center text-sm font-semibold active:opacity-80"
              style={{
                backgroundColor: `${PPL_COLORS[type]}20`,
                color: PPL_COLORS[type],
              }}
            >
              {PPL_LABELS[type]}
            </button>
          ))}
        </div>

        {workouts === undefined ? (
          <div className="flex items-center justify-center py-20">
            <Spinner />
          </div>
        ) : workouts.length === 0 ? (
          <EmptyState
            icon="🏋️"
            title="No workouts yet"
            description="Start your first workout to begin tracking your progress"
          />
        ) : (
          <div className="space-y-2">
            {workouts.map((w) => (
              <WorkoutRow key={w.id} workout={w} onDelete={setDeleteTarget} />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Workout?"
        message={`Delete "${deleteTarget?.name || PPL_LABELS[deleteTarget?.type as PPLType] || deleteTarget?.type}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function WorkoutRow({ workout, onDelete }: { workout: Workout; onDelete: (w: Workout) => void }) {
  const pplType = workout.type as PPLType;
  const color = PPL_COLORS[pplType] ?? PPL_COLORS.push;

  const [translateX, setTranslateX] = useState(0);
  const [touching, setTouching] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const swipingRef = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
    swipingRef.current = false;
    setTouching(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const dx = e.touches[0].clientX - touchStartRef.current.x;
    const dy = e.touches[0].clientY - touchStartRef.current.y;

    if (!swipingRef.current && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
      swipingRef.current = true;
    }

    if (swipingRef.current && dx < 0) {
      setTranslateX(Math.max(dx, -80));
    }
  };

  const handleTouchEnd = () => {
    if (translateX < -40) {
      setTranslateX(-80);
    } else {
      setTranslateX(0);
    }
    touchStartRef.current = null;
    swipingRef.current = false;
    setTouching(false);
  };

  const handleDeleteClick = () => {
    setTranslateX(0);
    onDelete(workout);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Delete button behind */}
      <button
        onClick={handleDeleteClick}
        className="absolute right-0 top-0 bottom-0 w-20 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-r-2xl"
      >
        Delete
      </button>

      {/* Swipeable content */}
      <div
        style={{
          transform: `translateX(${translateX}px)`,
          transition: touching ? 'none' : 'transform 0.2s ease-out',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Link to={`/workouts/${workout.id}`}>
          <Card className="active:bg-bg-elevated transition-colors">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
                style={{ backgroundColor: `${color}20`, color }}
              >
                {workout.type.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-text-primary capitalize">
                    {workout.name || PPL_LABELS[pplType] || workout.type}
                  </h3>
                  {workout.aiGenerated && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-900/30 text-purple-400">
                      AI
                    </span>
                  )}
                  <StatusBadge status={workout.status} />
                </div>
                <p className="text-xs text-text-secondary">
                  {formatShortDate(workout.date)}
                  {workout.durationMinutes ? ` · ${formatDuration(workout.durationMinutes)}` : ''}
                  {workout.totalVolume ? ` · ${formatVolume(workout.totalVolume)}` : ''}
                </p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: 'bg-green-900/30 text-green-400',
    in_progress: 'bg-yellow-900/30 text-yellow-400',
    planned: 'bg-bg-elevated text-text-muted',
    skipped: 'bg-red-900/30 text-red-400',
  };

  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded ${styles[status] ?? styles.planned}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
