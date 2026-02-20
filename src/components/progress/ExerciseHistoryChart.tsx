import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useExerciseHistory } from '../../hooks/useWorkouts';
import { Card } from '../ui/Card';

interface ExerciseHistoryChartProps {
  exerciseId: string;
}

export function ExerciseHistoryChart({ exerciseId }: ExerciseHistoryChartProps) {
  const history = useExerciseHistory(exerciseId);

  if (!history || history.length === 0) {
    return null;
  }

  // Sort chronologically for the chart (useExerciseHistory returns reverse)
  const sorted = [...history].reverse();

  const data = sorted.map((h) => ({
    date: h.date,
    label: formatChartDate(h.date),
    oneRM: h.oneRepMaxEstimate,
    volume: h.totalVolume,
    bestWeight: h.bestWeight,
    bestReps: h.bestReps,
  }));

  const best1RM = Math.max(...data.map((d) => d.oneRM));
  const latest = data[data.length - 1];

  return (
    <Card>
      <h3 className="text-sm font-semibold text-text-secondary mb-3">
        Performance History
      </h3>

      {/* Stats Row */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 bg-bg-elevated rounded-xl p-2.5 text-center">
          <p className="text-[10px] text-text-muted">Best 1RM</p>
          <p className="text-sm font-bold text-accent">{best1RM} lbs</p>
        </div>
        <div className="flex-1 bg-bg-elevated rounded-xl p-2.5 text-center">
          <p className="text-[10px] text-text-muted">Latest</p>
          <p className="text-sm font-bold text-text-primary">
            {latest.bestWeight} x {latest.bestReps}
          </p>
        </div>
        <div className="flex-1 bg-bg-elevated rounded-xl p-2.5 text-center">
          <p className="text-[10px] text-text-muted">Sessions</p>
          <p className="text-sm font-bold text-text-primary">{data.length}</p>
        </div>
      </div>

      {/* 1RM Chart */}
      {data.length >= 2 && (
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
              <CartesianGrid stroke="#2A2A4A" strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tick={{ fill: '#8899AA', fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: '#2A2A4A' }}
              />
              <YAxis
                tick={{ fill: '#8899AA', fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: '#2A2A4A' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#16213E',
                  border: '1px solid #2A2A4A',
                  borderRadius: '12px',
                  fontSize: 11,
                }}
                labelStyle={{ color: '#8899AA' }}
                formatter={(value, name) => {
                  if (name === 'oneRM') return [`${value} lbs`, 'Est. 1RM'];
                  return [`${value}`, String(name)];
                }}
              />
              <Line
                type="monotone"
                dataKey="oneRM"
                stroke="#FF922B"
                strokeWidth={2}
                dot={{ fill: '#FF922B', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Session History List */}
      <div className="mt-4 space-y-1.5">
        <p className="text-xs text-text-muted">Recent Sessions</p>
        {history.slice(0, 5).map((h) => (
          <div
            key={h.id}
            className="flex items-center justify-between text-xs py-1.5 border-b border-border last:border-0"
          >
            <span className="text-text-secondary">{formatFullDate(h.date)}</span>
            <span className="text-text-primary font-medium">
              {h.bestWeight} x {h.bestReps}
              <span className="text-text-muted ml-1">
                ({h.totalSets} sets · {h.totalVolume.toLocaleString()} lbs)
              </span>
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function formatChartDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatFullDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
