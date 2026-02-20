import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { db } from '../../db';
import { today } from '../../utils/dateUtils';
import type { CustomDataSeries, CustomDataPoint } from '../../types/database';

interface CheckInBannerProps {
  series: CustomDataSeries;
  checkinPoint: CustomDataPoint | null;
}

export function CheckInBanner({ series, checkinPoint }: CheckInBannerProps) {
  // Already answered today — don't render
  if (checkinPoint) return null;

  const logValue = async (value: number, notes?: string) => {
    await db.customDataPoints.add({
      seriesId: series.id!,
      date: today(),
      value,
      timestamp: new Date().toISOString(),
      notes,
    });
  };

  return (
    <Card>
      <div className="flex items-start gap-3">
        <div
          className="w-2.5 h-2.5 rounded-full shrink-0 mt-1"
          style={{ backgroundColor: series.color }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary mb-3">
            {series.checkinPrompt || `Have you completed ${series.title} today?`}
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => logValue(1)}>
              Yes, done
            </Button>
            <Button size="sm" variant="ghost" onClick={() => logValue(0, 'skipped')}>
              Won't do today
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
