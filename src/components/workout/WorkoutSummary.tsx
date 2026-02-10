import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { formatVolume, formatDuration } from '../../utils/formatUtils';
import { PPL_COLORS, PPL_LABELS } from '../../utils/constants';
import type { PPLType } from '../../utils/constants';

interface WorkoutSummaryProps {
  summary: {
    totalVolume: number;
    durationMinutes: number;
    exerciseCount: number;
    setCount: number;
    prCount: number;
  };
  workoutType: string;
  onDone: () => void;
}

export function WorkoutSummary({ summary, workoutType, onDone }: WorkoutSummaryProps) {
  const pplType = workoutType as PPLType;
  const color = PPL_COLORS[pplType] ?? PPL_COLORS.push;

  return (
    <div className="flex flex-col h-full items-center justify-center px-6">
      <div className="text-6xl mb-4">
        {summary.prCount > 0 ? '🏆' : '💪'}
      </div>
      <h1 className="text-2xl font-bold text-text-primary mb-1">
        Workout Complete!
      </h1>
      <p className="text-sm text-text-secondary mb-8" style={{ color }}>
        {PPL_LABELS[pplType] ?? 'Custom Workout'}
      </p>

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm mb-8">
        <StatCard label="Duration" value={formatDuration(summary.durationMinutes)} />
        <StatCard label="Volume" value={formatVolume(summary.totalVolume)} />
        <StatCard label="Exercises" value={String(summary.exerciseCount)} />
        <StatCard label="Sets" value={String(summary.setCount)} />
      </div>

      {summary.prCount > 0 && (
        <Card className="w-full max-w-sm mb-8 text-center bg-yellow-900/20 border-yellow-600/30">
          <span className="text-2xl block mb-1">🏆</span>
          <p className="text-sm font-bold text-success">
            {summary.prCount} Personal Record{summary.prCount > 1 ? 's' : ''}!
          </p>
        </Card>
      )}

      <Button size="lg" className="w-full max-w-sm" onClick={onDone}>
        Done
      </Button>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="text-center">
      <p className="text-2xl font-bold text-text-primary">{value}</p>
      <p className="text-xs text-text-secondary mt-0.5">{label}</p>
    </Card>
  );
}
