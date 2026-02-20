import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { db } from '../../db';
import { EmptyState } from '../ui/EmptyState';

interface ExerciseOption {
  exerciseId: string;
  name: string;
  count: number;
}

export function StrengthChart() {
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  // Get top exercises by number of history entries
  const exerciseOptions = useLiveQuery(async (): Promise<ExerciseOption[]> => {
    const all = await db.exerciseHistory.toArray();
    const counts = new Map<string, { name: string; count: number }>();
    for (const h of all) {
      const existing = counts.get(h.exerciseId);
      if (existing) {
        existing.count++;
      } else {
        counts.set(h.exerciseId, { name: h.exerciseName, count: 1 });
      }
    }
    return Array.from(counts.entries())
      .map(([exerciseId, { name, count }]) => ({ exerciseId, name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  });

  const activeId = selectedExercise ?? exerciseOptions?.[0]?.exerciseId ?? null;

  const historyData = useLiveQuery(
    () =>
      activeId
        ? db.exerciseHistory
            .where('exerciseId')
            .equals(activeId)
            .sortBy('date')
        : [],
    [activeId],
  );

  if (!exerciseOptions || exerciseOptions.length === 0) {
    return (
      <EmptyState
        icon="💪"
        title="No strength data yet"
        description="Complete workouts to track your strength progress"
      />
    );
  }

  const data = (historyData ?? []).map((h) => ({
    date: h.date,
    label: formatChartDate(h.date),
    oneRM: h.oneRepMaxEstimate,
    bestWeight: h.bestWeight,
    bestReps: h.bestReps,
  }));

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-text-secondary">Estimated 1RM Over Time</h3>

      {/* Exercise Selector */}
      <select
        value={activeId ?? ''}
        onChange={(e) => setSelectedExercise(e.target.value)}
        className="w-full bg-bg-elevated rounded-xl px-4 py-2.5 text-sm text-text-primary border border-border outline-none focus:border-accent"
      >
        {exerciseOptions.map((opt) => (
          <option key={opt.exerciseId} value={opt.exerciseId}>
            {opt.name} ({opt.count} sessions)
          </option>
        ))}
      </select>

      {data.length === 0 ? (
        <p className="text-xs text-text-muted text-center py-8">
          No history for this exercise yet
        </p>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid stroke="#2A2A4A" strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tick={{ fill: '#8899AA', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: '#2A2A4A' }}
              />
              <YAxis
                tick={{ fill: '#8899AA', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: '#2A2A4A' }}
                unit=" lbs"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#16213E',
                  border: '1px solid #2A2A4A',
                  borderRadius: '12px',
                  fontSize: 12,
                }}
                labelStyle={{ color: '#8899AA' }}
                formatter={(value, name) => {
                  if (name === 'oneRM') return [`${value} lbs`, 'Est. 1RM'];
                  return [`${value} lbs`, String(name)];
                }}
              />
              <Line
                type="monotone"
                dataKey="oneRM"
                stroke="#4DABF7"
                strokeWidth={2}
                dot={{ fill: '#4DABF7', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Best Set Summary */}
      {data.length > 0 && (
        <div className="flex gap-3">
          <div className="flex-1 bg-bg-elevated rounded-xl p-3 text-center">
            <p className="text-xs text-text-muted">Best 1RM</p>
            <p className="text-lg font-bold text-text-primary">
              {Math.max(...data.map((d) => d.oneRM))} lbs
            </p>
          </div>
          <div className="flex-1 bg-bg-elevated rounded-xl p-3 text-center">
            <p className="text-xs text-text-muted">Latest</p>
            <p className="text-lg font-bold text-text-primary">
              {data[data.length - 1].bestWeight} x {data[data.length - 1].bestReps}
            </p>
          </div>
          <div className="flex-1 bg-bg-elevated rounded-xl p-3 text-center">
            <p className="text-xs text-text-muted">Sessions</p>
            <p className="text-lg font-bold text-text-primary">{data.length}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function formatChartDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
