import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { CustomSeriesFormModal } from '../progress/CustomSeriesFormModal';
import { useDashboardSeries } from '../../hooks/useDashboardTrackers';
import { db } from '../../db';
import type { CustomDataSeries } from '../../types/database';

interface TrackerConfigModalProps {
  open: boolean;
  onClose: () => void;
}

const MODE_BADGE: Record<string, string> = {
  quickadd: 'Quick Add',
  checkin: 'Check-in',
  standard: 'Standard',
};

export function TrackerConfigModal({ open, onClose }: TrackerConfigModalProps) {
  const series = useDashboardSeries();
  const [editSeries, setEditSeries] = useState<CustomDataSeries | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);

  const moveOrder = async (s: CustomDataSeries, direction: -1 | 1) => {
    if (!series || !s.id) return;
    const idx = series.findIndex((x) => x.id === s.id);
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= series.length) return;
    const other = series[swapIdx];
    if (!other.id) return;
    await db.customDataSeries.update(s.id, { dashboardOrder: other.dashboardOrder });
    await db.customDataSeries.update(other.id, { dashboardOrder: s.dashboardOrder });
  };

  const toggleDashboard = async (s: CustomDataSeries) => {
    if (!s.id) return;
    await db.customDataSeries.update(s.id, { showOnDashboard: !s.showOnDashboard });
  };

  const openEdit = (s: CustomDataSeries) => {
    setEditSeries(s);
    setShowForm(true);
  };

  const openNew = () => {
    setEditSeries(undefined);
    setShowForm(true);
  };

  return (
    <>
      <Modal open={open} onClose={onClose} title="Manage Trackers">
        <div className="px-4 py-4 space-y-3">
          {(!series || series.length === 0) && (
            <p className="text-sm text-text-muted text-center py-4">
              No dashboard trackers yet. Add one below.
            </p>
          )}

          {series?.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-bg-elevated border border-border"
            >
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: s.color }}
              />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-text-primary block truncate">
                  {s.title}
                </span>
                <span className="text-[10px] text-text-muted">
                  {MODE_BADGE[s.trackerMode] ?? s.trackerMode}
                </span>
              </div>

              {/* Reorder arrows */}
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => moveOrder(s, -1)}
                  className="text-text-muted active:text-text-primary p-0.5"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                </button>
                <button
                  onClick={() => moveOrder(s, 1)}
                  className="text-text-muted active:text-text-primary p-0.5"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              </div>

              {/* Toggle visibility */}
              <button
                onClick={() => toggleDashboard(s)}
                className={`w-9 h-5 rounded-full transition-colors relative ${
                  s.showOnDashboard ? 'bg-accent' : 'bg-bg-card border border-border'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    s.showOnDashboard ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>

              {/* Edit */}
              <button
                onClick={() => openEdit(s)}
                className="text-text-muted active:text-accent p-1"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </div>
          ))}

          <Button className="w-full" onClick={openNew}>
            Add New Tracker
          </Button>
        </div>
      </Modal>

      <CustomSeriesFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        existingSeries={editSeries}
      />
    </>
  );
}
