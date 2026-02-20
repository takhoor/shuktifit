import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { db } from '../../db';
import { today } from '../../utils/dateUtils';
import type { CustomDataSeries } from '../../types/database';

interface CustomDataEntryModalProps {
  open: boolean;
  onClose: () => void;
  series: CustomDataSeries | undefined;
}

export function CustomDataEntryModal({ open, onClose, series }: CustomDataEntryModalProps) {
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = async () => {
    if (!series?.id || !value.trim()) return;

    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    await db.customDataPoints.add({
      seriesId: series.id,
      date: today(),
      value: numValue,
      timestamp: new Date().toISOString(),
      notes: notes.trim() || undefined,
    });

    setValue('');
    setNotes('');
    onClose();
  };

  const handleQuickAdjust = (delta: number) => {
    const current = parseFloat(value) || 0;
    setValue(String(current + delta));
  };

  if (!series) return null;

  return (
    <Modal open={open} onClose={onClose} title={`Log ${series.title}`}>
      <div className="px-4 py-4 space-y-4">
        <div>
          <label className="text-xs text-text-secondary font-medium block mb-2">
            Value ({series.unit})
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQuickAdjust(-1)}
              className="w-10 h-10 rounded-xl bg-bg-elevated text-text-primary font-bold text-lg active:bg-bg-card"
            >
              -
            </button>
            <input
              type="number"
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="0"
              className="flex-1 bg-bg-elevated rounded-xl px-4 py-3 text-center text-lg font-semibold text-text-primary border border-border outline-none focus:border-accent"
              autoFocus
            />
            <button
              onClick={() => handleQuickAdjust(1)}
              className="w-10 h-10 rounded-xl bg-bg-elevated text-text-primary font-bold text-lg active:bg-bg-card"
            >
              +
            </button>
          </div>
        </div>

        <Input
          label="Notes (optional)"
          placeholder="Any context..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <Button className="w-full" onClick={handleSave} disabled={!value.trim()}>
          Log Entry
        </Button>
      </div>
    </Modal>
  );
}
