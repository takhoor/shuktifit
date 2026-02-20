import { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { CustomSeriesFormModal } from './CustomSeriesFormModal';
import { CustomSeriesDetail } from './CustomSeriesDetail';
import { useCustomSeriesList } from '../../hooks/useCustomData';
import type { CustomDataSeries } from '../../types/database';

export function CustomSeriesPage() {
  const series = useCustomSeriesList();
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState<CustomDataSeries | null>(null);

  if (selectedSeries) {
    return (
      <CustomSeriesDetail
        series={selectedSeries}
        onBack={() => setSelectedSeries(null)}
      />
    );
  }

  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-text-primary">Custom Data</h2>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          + New
        </Button>
      </div>

      {!series || series.length === 0 ? (
        <EmptyState
          icon="📊"
          title="No custom series"
          description="Track anything — air squats, coffee intake, sleep hours, and more."
        />
      ) : (
        <div className="space-y-2">
          {series.map((s) => (
            <SeriesCard
              key={s.id}
              series={s}
              onClick={() => setSelectedSeries(s)}
            />
          ))}
        </div>
      )}

      <CustomSeriesFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
}

function SeriesCard({
  series,
  onClick,
}: {
  series: CustomDataSeries;
  onClick: () => void;
}) {
  return (
    <Card className="active:bg-bg-elevated transition-colors cursor-pointer" onClick={onClick}>
      <div className="flex items-center gap-3">
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: series.color }}
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-text-primary">{series.title}</h3>
          <p className="text-xs text-text-muted">{series.unit} · {series.aggregation}</p>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </Card>
  );
}
