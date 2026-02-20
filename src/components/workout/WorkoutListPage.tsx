import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../layout/Header';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { Spinner } from '../ui/Spinner';
import { useWorkoutList } from '../../hooks/useWorkouts';
import { PPL_COLORS, PPL_LABELS } from '../../utils/constants';
import { formatShortDate } from '../../utils/dateUtils';
import { formatVolume, formatDuration } from '../../utils/formatUtils';
import type { PPLType } from '../../utils/constants';
import type { Workout } from '../../types/database';

export function WorkoutListPage() {
  const navigate = useNavigate();
  const workouts = useWorkoutList();

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
              <WorkoutRow key={w.id} workout={w} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function WorkoutRow({ workout }: { workout: Workout }) {
  const pplType = workout.type as PPLType;
  const color = PPL_COLORS[pplType] ?? PPL_COLORS.push;

  return (
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
                {PPL_LABELS[pplType] ?? workout.type}
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
