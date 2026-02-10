import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { PPL_COLORS, PPL_LABELS, PPL_MUSCLE_FOCUS } from '../../utils/constants';
import type { PPLType } from '../../utils/constants';

interface DailyWorkoutCardProps {
  todayType: PPLType;
}

export function DailyWorkoutCard({ todayType }: DailyWorkoutCardProps) {
  const navigate = useNavigate();
  const color = PPL_COLORS[todayType];

  return (
    <Card className="relative overflow-hidden">
      {/* Colored top stripe */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: color }}
      />
      <div className="pt-2">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span
            className="text-xs font-bold uppercase tracking-wide"
            style={{ color }}
          >
            Today
          </span>
        </div>
        <h2 className="text-xl font-bold text-text-primary">
          {PPL_LABELS[todayType]}
        </h2>
        <p className="text-sm text-text-secondary mb-4">
          {PPL_MUSCLE_FOCUS[todayType]}
        </p>
        <Button
          className="w-full"
          onClick={() => navigate(`/workouts/new?type=${todayType}`)}
        >
          Start Workout
        </Button>
      </div>
    </Card>
  );
}
