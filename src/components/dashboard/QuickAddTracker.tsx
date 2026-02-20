import { Card } from '../ui/Card';
import { db } from '../../db';
import { today } from '../../utils/dateUtils';
import type { CustomDataSeries } from '../../types/database';

interface QuickAddTrackerProps {
  series: CustomDataSeries;
  todayTotal: number;
}

export function QuickAddTracker({ series, todayTotal }: QuickAddTrackerProps) {
  const presets = series.quickAddPresets ?? [];
  const goal = series.dailyGoal;
  const progress = goal ? Math.min(todayTotal / goal, 1) : 0;
  const goalMet = goal ? todayTotal >= goal : false;

  const logValue = async (value: number) => {
    await db.customDataPoints.add({
      seriesId: series.id!,
      date: today(),
      value,
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: series.color }}
          />
          <span className="text-sm font-medium text-text-primary">{series.title}</span>
        </div>
        <span className="text-lg font-bold text-text-primary">
          {todayTotal}
          {goal ? (
            <span className="text-xs font-normal text-text-muted">/{goal} {series.unit}</span>
          ) : (
            <span className="text-xs font-normal text-text-muted"> {series.unit}</span>
          )}
        </span>
      </div>

      {goal && (
        <div className="mb-2">
          <div className="h-2 rounded-full bg-bg-elevated overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progress * 100}%`,
                backgroundColor: goalMet ? '#51CF66' : series.color,
              }}
            />
          </div>
          <div className="flex justify-between mt-0.5">
            <span className="text-[10px] text-text-muted">
              {Math.round(progress * 100)}%
            </span>
            {goalMet && (
              <span className="text-[10px] font-medium" style={{ color: '#51CF66' }}>
                Goal reached!
              </span>
            )}
            {!goalMet && goal - todayTotal > 0 && (
              <span className="text-[10px] text-text-muted">
                {goal - todayTotal} {series.unit} to go
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {presets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => logValue(preset.value)}
            className="flex-1 py-2 rounded-xl text-xs font-semibold transition-colors bg-bg-elevated active:bg-bg-card border border-border"
            style={{ color: series.color }}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </Card>
  );
}
