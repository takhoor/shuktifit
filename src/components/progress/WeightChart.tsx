import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useWeightHistory } from '../../hooks/useBodyMeasurements';
import { EmptyState } from '../ui/EmptyState';

export function WeightChart() {
  const measurements = useWeightHistory();

  if (!measurements || measurements.length === 0) {
    return (
      <EmptyState
        icon="⚖️"
        title="No weight data yet"
        description="Log your weight in the Body tab to see your trend"
      />
    );
  }

  const data = measurements.map((m) => ({
    date: m.date,
    label: formatChartDate(m.date),
    weight: m.weight,
  }));

  const weights = data.map((d) => d.weight!);
  const min = Math.floor(Math.min(...weights) - 5);
  const max = Math.ceil(Math.max(...weights) + 5);

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-text-secondary">Body Weight</h3>
        <p className="text-xs text-text-muted">{data.length} entries</p>
      </div>
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
              domain={[min, max]}
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
              formatter={(value) => [`${value} lbs`, 'Weight']}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#FF922B"
              strokeWidth={2}
              dot={{ fill: '#FF922B', r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {data.length >= 2 && (
        <TrendSummary first={weights[0]} last={weights[weights.length - 1]} />
      )}
    </div>
  );
}

function TrendSummary({ first, last }: { first: number; last: number }) {
  const diff = last - first;
  const isLoss = diff < 0;
  const color = isLoss ? 'text-green-400' : diff > 0 ? 'text-red-400' : 'text-text-muted';

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-text-muted">Trend:</span>
      <span className={color}>
        {diff > 0 ? '+' : ''}{diff.toFixed(1)} lbs
      </span>
      <span className="text-text-muted">
        ({first} → {last} lbs)
      </span>
    </div>
  );
}

function formatChartDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
