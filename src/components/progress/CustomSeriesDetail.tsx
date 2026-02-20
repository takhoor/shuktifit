import { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { CustomDataEntryModal } from './CustomDataEntryModal';
import { CustomSeriesFormModal } from './CustomSeriesFormModal';
import { useAggregatedSeries, useSeriesDataPoints } from '../../hooks/useCustomData';
import { db } from '../../db';
import type { CustomDataSeries } from '../../types/database';
import { formatShortDate } from '../../utils/dateUtils';

interface CustomSeriesDetailProps {
  series: CustomDataSeries;
  onBack: () => void;
}

export function CustomSeriesDetail({ series, onBack }: CustomSeriesDetailProps) {
  const [entryOpen, setEntryOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const chartData = useAggregatedSeries(series.id);
  const rawPoints = useSeriesDataPoints(series.id);

  const handleDeletePoint = async (pointId: number) => {
    await db.customDataPoints.delete(pointId);
  };

  return (
    <div className="px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 text-text-secondary active:text-text-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: series.color }} />
            <h2 className="text-lg font-bold text-text-primary">{series.title}</h2>
          </div>
        </div>
        <button
          onClick={() => setEditOpen(true)}
          className="p-2 text-text-muted active:text-text-primary"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>

      {/* Chart */}
      {chartData && chartData.length > 1 ? (
        <Card className="mb-4" padding={false}>
          <div className="h-48 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.map((d) => ({ ...d, label: formatShortDate(d.date) }))}>
                <CartesianGrid stroke="#2A2A4A" strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fill: '#8899AA', fontSize: 10 }} />
                <YAxis tick={{ fill: '#8899AA', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#16213E', border: '1px solid #2A2A4A', borderRadius: 8 }}
                  labelStyle={{ color: '#8899AA' }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={series.color}
                  strokeWidth={2}
                  dot={{ r: 3, fill: series.color }}
                  name={`${series.title} (${series.unit})`}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      ) : (
        <Card className="mb-4">
          <p className="text-sm text-text-muted text-center py-6">
            Log at least 2 entries to see a chart
          </p>
        </Card>
      )}

      {/* Log button */}
      <Button className="w-full mb-4" onClick={() => setEntryOpen(true)}>
        Log Entry
      </Button>

      {/* Recent entries */}
      <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">
        Recent Entries
      </h3>
      {rawPoints && rawPoints.length > 0 ? (
        <div className="space-y-1">
          {[...rawPoints].reverse().slice(0, 50).map((p) => (
            <div key={p.id} className="flex items-center justify-between px-3 py-2 bg-bg-elevated rounded-lg">
              <div>
                <span className="text-sm font-medium text-text-primary">
                  {p.value} {series.unit}
                </span>
                {p.notes && (
                  <span className="text-xs text-text-muted ml-2">{p.notes}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted">
                  {formatShortDate(p.date)}
                </span>
                <button
                  onClick={() => handleDeletePoint(p.id!)}
                  className="text-text-muted active:text-red-400 p-1"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-text-muted text-center py-4">No entries yet</p>
      )}

      <CustomDataEntryModal
        open={entryOpen}
        onClose={() => setEntryOpen(false)}
        series={series}
      />

      <CustomSeriesFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        existingSeries={series}
      />
    </div>
  );
}
