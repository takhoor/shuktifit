import { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Spinner } from '../ui/Spinner';
import { DataSourcePickerModal } from './DataSourcePickerModal';
import { alignSeriesData, type ChartDataSource } from '../../services/dataSources';
import { OVERLAY_CHART_COLORS } from '../../utils/constants';

export function OverlayChart() {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selected, setSelected] = useState<ChartDataSource[]>([]);
  const [chartData, setChartData] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selected.length === 0) {
      setChartData([]);
      return;
    }

    setLoading(true);
    Promise.all(
      selected.map(async (s) => ({
        data: await s.getData(),
        key: s.id,
      })),
    ).then((seriesData) => {
      setChartData(alignSeriesData(seriesData));
      setLoading(false);
    });
  }, [selected]);

  // Determine Y-axis assignment: same unit → single axis, different units → dual axis
  const units = [...new Set(selected.map((s) => s.unit))];
  const hasRightAxis = units.length > 1;

  const getAxisId = (source: ChartDataSource) => {
    if (!hasRightAxis) return 'left';
    return source.unit === units[0] ? 'left' : 'right';
  };

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-text-primary">Compare</h2>
        <Button size="sm" onClick={() => setPickerOpen(true)}>
          {selected.length > 0 ? 'Change Data' : 'Select Data'}
        </Button>
      </div>

      {selected.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <span className="text-3xl block mb-2">📊</span>
            <p className="text-sm text-text-secondary mb-3">
              Select up to 3 data series to overlay on a single chart
            </p>
            <Button size="sm" onClick={() => setPickerOpen(true)}>
              Select Data Sources
            </Button>
          </div>
        </Card>
      ) : loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <>
          {/* Legend */}
          <div className="flex flex-wrap gap-3 mb-3">
            {selected.map((s, i) => (
              <div key={s.id} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: OVERLAY_CHART_COLORS[i] }}
                />
                <span className="text-xs text-text-secondary">
                  {s.label} ({s.unit})
                </span>
              </div>
            ))}
          </div>

          {/* Chart */}
          <Card padding={false}>
            <div className="h-64 p-3">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid stroke="#2A2A4A" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: '#8899AA', fontSize: 10 }}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fill: '#8899AA', fontSize: 10 }}
                    width={45}
                  />
                  {hasRightAxis && (
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fill: '#8899AA', fontSize: 10 }}
                      width={45}
                    />
                  )}
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#16213E',
                      border: '1px solid #2A2A4A',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: '#8899AA' }}
                  />
                  {selected.map((s, i) => (
                    <Line
                      key={s.id}
                      yAxisId={getAxisId(s)}
                      type="monotone"
                      dataKey={s.id}
                      name={`${s.label} (${s.unit})`}
                      stroke={OVERLAY_CHART_COLORS[i]}
                      strokeWidth={2}
                      dot={{ r: 2 }}
                      connectNulls
                    />
                  ))}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </>
      )}

      <DataSourcePickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        selected={selected}
        onApply={setSelected}
      />
    </div>
  );
}
