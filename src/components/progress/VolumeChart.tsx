import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { EmptyState } from '../ui/EmptyState';

interface WeekData {
  weekLabel: string;
  volume: number;
  workouts: number;
}

export function VolumeChart() {
  const weeklyData = useLiveQuery(async (): Promise<WeekData[]> => {
    const completed = await db.workouts
      .where('status')
      .equals('completed')
      .sortBy('date');

    if (completed.length === 0) return [];

    // Group by week (ISO week starting Monday)
    const weekMap = new Map<string, { volume: number; workouts: number }>();

    for (const w of completed) {
      const weekStart = getWeekStart(w.date);
      const existing = weekMap.get(weekStart);
      if (existing) {
        existing.volume += w.totalVolume ?? 0;
        existing.workouts++;
      } else {
        weekMap.set(weekStart, {
          volume: w.totalVolume ?? 0,
          workouts: 1,
        });
      }
    }

    // Get last 12 weeks
    return Array.from(weekMap.entries())
      .map(([weekStart, data]) => ({
        weekLabel: formatWeekLabel(weekStart),
        volume: data.volume,
        workouts: data.workouts,
      }))
      .slice(-12);
  });

  if (!weeklyData || weeklyData.length === 0) {
    return (
      <EmptyState
        icon="📈"
        title="No volume data yet"
        description="Complete workouts to see your weekly training volume"
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-text-secondary">Weekly Volume</h3>
        <p className="text-xs text-text-muted">Last {weeklyData.length} weeks</p>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid stroke="#2A2A4A" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="weekLabel"
              tick={{ fill: '#8899AA', fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: '#2A2A4A' }}
            />
            <YAxis
              tick={{ fill: '#8899AA', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: '#2A2A4A' }}
              tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`)}
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
                if (name === 'volume') return [`${Number(value).toLocaleString()} lbs`, 'Total Volume'];
                return [String(value), String(name)];
              }}
            />
            <Bar
              dataKey="volume"
              fill="#FF922B"
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary */}
      <div className="flex gap-3">
        <div className="flex-1 bg-bg-elevated rounded-xl p-3 text-center">
          <p className="text-xs text-text-muted">Avg/Week</p>
          <p className="text-lg font-bold text-text-primary">
            {formatVolume(weeklyData.reduce((s, w) => s + w.volume, 0) / weeklyData.length)}
          </p>
        </div>
        <div className="flex-1 bg-bg-elevated rounded-xl p-3 text-center">
          <p className="text-xs text-text-muted">This Week</p>
          <p className="text-lg font-bold text-text-primary">
            {formatVolume(weeklyData[weeklyData.length - 1].volume)}
          </p>
        </div>
        <div className="flex-1 bg-bg-elevated rounded-xl p-3 text-center">
          <p className="text-xs text-text-muted">Workouts</p>
          <p className="text-lg font-bold text-text-primary">
            {weeklyData[weeklyData.length - 1].workouts}
          </p>
        </div>
      </div>
    </div>
  );
}

function getWeekStart(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  const monday = new Date(d);
  monday.setDate(diff);
  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
}

function formatWeekLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatVolume(vol: number): string {
  if (vol >= 1000) return `${(vol / 1000).toFixed(1)}k`;
  return `${Math.round(vol)}`;
}
