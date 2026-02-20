import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { Card } from '../ui/Card';
import { useUserProfile } from '../../hooks/useUserProfile';
import { isWithingsConnected, syncWithingsData } from '../../services/withings';

const METRIC_TAB_MAP: Record<string, string> = {
  Weight: 'weight',
  'Body Fat': 'body',
  Muscle: 'body',
  Bone: 'body',
  Steps: 'custom',
  HR: 'custom',
  Sleep: 'custom',
};

function useLatestWithings(type: string) {
  return useLiveQuery(
    () =>
      db.withingsData
        .where('[type+date]')
        .between([type, ''], [type, '\uffff'])
        .last(),
    [type],
  );
}

export function WithingsWidget() {
  const profile = useUserProfile();
  const navigate = useNavigate();
  const syncedRef = useRef(false);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState(false);

  const connected = profile ? isWithingsConnected(profile) : false;

  // Auto-sync on mount (once per app open)
  useEffect(() => {
    if (!connected || syncedRef.current) return;
    syncedRef.current = true;
    setSyncing(true);
    setSyncError(false);
    syncWithingsData()
      .then((result) => {
        if (result.error) setSyncError(true);
      })
      .catch(() => setSyncError(true))
      .finally(() => setSyncing(false));
  }, [connected]);

  const latestWeight = useLatestWithings('weight');
  const latestFat = useLatestWithings('fatRatio');
  const latestMuscle = useLatestWithings('muscleMass');
  const latestBone = useLatestWithings('boneMass');
  const latestSteps = useLatestWithings('steps');
  const latestHR = useLatestWithings('heartRate');
  const latestSleep = useLatestWithings('sleepScore');
  const latestSleepHrs = useLatestWithings('sleepHours');

  if (!connected) return null;

  const handleMetricClick = (label: string) => {
    const tab = METRIC_TAB_MAP[label] || 'weight';
    navigate(`/progress?tab=${tab}`);
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-text-muted uppercase">
          Withings
        </h3>
        {syncing && (
          <span className="text-[10px] text-accent animate-pulse">
            Syncing...
          </span>
        )}
        {!syncing && syncError && (
          <span className="text-[10px] text-red-400">
            Sync failed
          </span>
        )}
      </div>

      {/* Row 1: Weight, Body Fat, Muscle Mass */}
      <div className="flex gap-3 mb-3">
        <MetricCard
          label="Weight"
          value={latestWeight ? `${latestWeight.value}` : '--'}
          unit="lbs"
          date={latestWeight?.date}
          onClick={() => handleMetricClick('Weight')}
        />
        <MetricCard
          label="Body Fat"
          value={latestFat ? `${latestFat.value}` : '--'}
          unit="%"
          date={latestFat?.date}
          onClick={() => handleMetricClick('Body Fat')}
        />
        <MetricCard
          label="Muscle"
          value={latestMuscle ? `${latestMuscle.value}` : '--'}
          unit="lbs"
          date={latestMuscle?.date}
          onClick={() => handleMetricClick('Muscle')}
        />
      </div>

      {/* Row 2: Bone Mass, Steps, Heart Rate, Sleep */}
      <div className="flex gap-3">
        <MetricCard
          label="Bone"
          value={latestBone ? `${latestBone.value}` : '--'}
          unit="lbs"
          date={latestBone?.date}
          onClick={() => handleMetricClick('Bone')}
        />
        <MetricCard
          label="Steps"
          value={latestSteps ? formatSteps(latestSteps.value) : '--'}
          unit=""
          date={latestSteps?.date}
          onClick={() => handleMetricClick('Steps')}
        />
        <MetricCard
          label="HR"
          value={latestHR ? `${latestHR.value}` : '--'}
          unit="bpm"
          date={latestHR?.date}
          onClick={() => handleMetricClick('HR')}
        />
        <MetricCard
          label="Sleep"
          value={latestSleepHrs ? `${latestSleepHrs.value}` : latestSleep ? `${latestSleep.value}` : '--'}
          unit={latestSleepHrs ? 'hrs' : 'score'}
          date={latestSleepHrs?.date ?? latestSleep?.date}
          onClick={() => handleMetricClick('Sleep')}
        />
      </div>
    </Card>
  );
}

function MetricCard({
  label,
  value,
  unit,
  date,
  onClick,
}: {
  label: string;
  value: string;
  unit: string;
  date?: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={`flex-1 text-center ${onClick ? 'cursor-pointer active:opacity-70' : ''}`}
      onClick={onClick}
    >
      <p className="text-[10px] text-text-muted">{label}</p>
      <p className="text-lg font-bold text-text-primary">
        {value}
        {unit && <span className="text-xs font-normal text-text-muted ml-0.5">{unit}</span>}
      </p>
      {date && (
        <p className="text-[10px] text-text-muted">
          {formatRelativeDate(date)}
        </p>
      )}
    </div>
  );
}

function formatSteps(steps: number): string {
  if (steps >= 1000) return `${(steps / 1000).toFixed(1)}k`;
  return String(steps);
}

function formatRelativeDate(dateStr: string): string {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  if (dateStr === todayStr) return 'Today';
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
  if (dateStr === yesterdayStr) return 'Yesterday';
  return dateStr.slice(5); // MM-DD
}
