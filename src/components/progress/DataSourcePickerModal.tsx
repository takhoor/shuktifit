import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { getAllDataSources, type ChartDataSource } from '../../services/dataSources';
import { MAX_OVERLAY_SERIES, OVERLAY_CHART_COLORS } from '../../utils/constants';

interface DataSourcePickerModalProps {
  open: boolean;
  onClose: () => void;
  selected: ChartDataSource[];
  onApply: (sources: ChartDataSource[]) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  withings: 'Withings Health Data',
  workout: 'Workout Stats',
  body: 'Body Measurements',
  custom: 'Custom Series',
};

export function DataSourcePickerModal({ open, onClose, selected, onApply }: DataSourcePickerModalProps) {
  const [allSources, setAllSources] = useState<ChartDataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getAllDataSources().then((sources) => {
      setAllSources(sources);
      setSelectedIds(new Set(selected.map((s) => s.id)));
      setLoading(false);
    });
  }, [open, selected]);

  const toggleSource = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < MAX_OVERLAY_SERIES) {
        next.add(id);
      }
      return next;
    });
  };

  const handleApply = () => {
    const sources = allSources
      .filter((s) => selectedIds.has(s.id))
      .map((s, i) => ({ ...s, color: OVERLAY_CHART_COLORS[i] ?? s.color }));
    onApply(sources);
    onClose();
  };

  // Group by category
  const grouped = allSources.reduce<Record<string, ChartDataSource[]>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  const atMax = selectedIds.size >= MAX_OVERLAY_SERIES;

  return (
    <Modal open={open} onClose={onClose} title="Select Data Sources">
      <div className="px-4 py-3">
        <p className="text-xs text-text-muted mb-3">
          Select up to {MAX_OVERLAY_SERIES} series to compare.
          {selectedIds.size > 0 && ` (${selectedIds.size} selected)`}
        </p>

        {loading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : (
          <div className="space-y-4 pb-4">
            {Object.entries(grouped).map(([category, sources]) => (
              <div key={category}>
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                  {CATEGORY_LABELS[category] ?? category}
                </h3>
                <div className="space-y-1">
                  {sources.map((source) => {
                    const isSelected = selectedIds.has(source.id);
                    const disabled = !isSelected && atMax;
                    return (
                      <button
                        key={source.id}
                        onClick={() => !disabled && toggleSource(source.id)}
                        disabled={disabled}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                          isSelected
                            ? 'bg-accent/10 border border-accent'
                            : disabled
                              ? 'bg-bg-elevated opacity-40 border border-transparent'
                              : 'bg-bg-elevated border border-transparent active:bg-bg-card'
                        }`}
                      >
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: source.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-text-primary truncate block">{source.label}</span>
                          <span className="text-[10px] text-text-muted">{source.unit}</span>
                        </div>
                        {isSelected && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-accent shrink-0">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <Button
          className="w-full mb-4"
          onClick={handleApply}
          disabled={selectedIds.size === 0}
        >
          Compare {selectedIds.size} Series
        </Button>
      </div>
    </Modal>
  );
}
