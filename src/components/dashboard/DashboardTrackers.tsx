import { useMemo, useState } from 'react';
import { CheckInBanner } from './CheckInBanner';
import { QuickAddTracker } from './QuickAddTracker';
import { TrackerConfigModal } from './TrackerConfigModal';
import { useDashboardSeries, useTodayDashboardData } from '../../hooks/useDashboardTrackers';

export function DashboardTrackers() {
  const series = useDashboardSeries();
  const [showConfig, setShowConfig] = useState(false);

  const seriesIds = useMemo(
    () => (series ?? []).map((s) => s.id!).filter(Boolean),
    [series],
  );

  const todayData = useTodayDashboardData(seriesIds);

  if (!series || series.length === 0 || !todayData) return null;

  const checkins = series.filter((s) => s.trackerMode === 'checkin');
  const quickadds = series.filter((s) => s.trackerMode === 'quickadd');

  // Only show checkins that haven't been answered today
  const unansweredCheckins = checkins.filter((s) => {
    const data = todayData.get(s.id!);
    return !data?.checkinPoint;
  });

  return (
    <div className="space-y-3">
      {unansweredCheckins.map((s) => (
        <CheckInBanner
          key={s.id}
          series={s}
          checkinPoint={todayData.get(s.id!)?.checkinPoint ?? null}
        />
      ))}

      {quickadds.map((s) => (
        <QuickAddTracker
          key={s.id}
          series={s}
          todayTotal={todayData.get(s.id!)?.total ?? 0}
        />
      ))}

      <button
        onClick={() => setShowConfig(true)}
        className="text-xs text-text-muted active:text-accent w-full text-center py-1"
      >
        Manage Trackers
      </button>

      <TrackerConfigModal open={showConfig} onClose={() => setShowConfig(false)} />
    </div>
  );
}
