import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { db } from '../../db';
import { CHART_SERIES_PALETTE } from '../../utils/constants';
import type { CustomDataSeries, AggregationMethod, TrackerMode, QuickAddPreset } from '../../types/database';

interface CustomSeriesFormModalProps {
  open: boolean;
  onClose: () => void;
  existingSeries?: CustomDataSeries;
}

const AGGREGATION_OPTIONS: { value: AggregationMethod; label: string; desc: string }[] = [
  { value: 'sum', label: 'Sum', desc: 'Add all entries for the day' },
  { value: 'average', label: 'Average', desc: 'Mean of all entries' },
  { value: 'last', label: 'Latest', desc: 'Use the most recent entry' },
  { value: 'max', label: 'Maximum', desc: 'Use the highest value' },
];

const MODE_OPTIONS: { value: TrackerMode; label: string; desc: string }[] = [
  { value: 'standard', label: 'Standard', desc: 'Manual data entry from Progress page' },
  { value: 'quickadd', label: 'Quick Add', desc: 'Preset buttons with running total' },
  { value: 'checkin', label: 'Check-in', desc: 'Daily yes/no prompt' },
];

export function CustomSeriesFormModal({ open, onClose, existingSeries }: CustomSeriesFormModalProps) {
  const [title, setTitle] = useState('');
  const [unit, setUnit] = useState('');
  const [color, setColor] = useState<string>(CHART_SERIES_PALETTE[0]);
  const [aggregation, setAggregation] = useState<AggregationMethod>('sum');
  const [trackerMode, setTrackerMode] = useState<TrackerMode>('standard');
  const [showOnDashboard, setShowOnDashboard] = useState(false);
  const [checkinPrompt, setCheckinPrompt] = useState('');
  const [presets, setPresets] = useState<QuickAddPreset[]>([]);
  const [newPresetLabel, setNewPresetLabel] = useState('');
  const [newPresetValue, setNewPresetValue] = useState('');
  const [dailyGoal, setDailyGoal] = useState('');

  useEffect(() => {
    if (existingSeries) {
      setTitle(existingSeries.title);
      setUnit(existingSeries.unit);
      setColor(existingSeries.color);
      setAggregation(existingSeries.aggregation);
      setTrackerMode(existingSeries.trackerMode ?? 'standard');
      setShowOnDashboard(existingSeries.showOnDashboard ?? false);
      setCheckinPrompt(existingSeries.checkinPrompt ?? '');
      setPresets(existingSeries.quickAddPresets ?? []);
      setDailyGoal(existingSeries.dailyGoal ? String(existingSeries.dailyGoal) : '');
    } else {
      setTitle('');
      setUnit('');
      setColor(CHART_SERIES_PALETTE[0]);
      setAggregation('sum');
      setTrackerMode('standard');
      setShowOnDashboard(false);
      setCheckinPrompt('');
      setPresets([]);
      setDailyGoal('');
    }
    setNewPresetLabel('');
    setNewPresetValue('');
  }, [existingSeries, open]);

  const handleModeChange = (mode: TrackerMode) => {
    setTrackerMode(mode);
    if (mode === 'quickadd' || mode === 'checkin') {
      setShowOnDashboard(true);
    }
    if (mode === 'checkin') {
      setAggregation('last');
      if (!unit) setUnit('done');
    }
    if (mode === 'quickadd') {
      setAggregation('sum');
    }
  };

  const addPreset = () => {
    const val = parseFloat(newPresetValue);
    if (!newPresetLabel.trim() || isNaN(val)) return;
    setPresets([...presets, { label: newPresetLabel.trim(), value: val }]);
    setNewPresetLabel('');
    setNewPresetValue('');
  };

  const removePreset = (index: number) => {
    setPresets(presets.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!title.trim() || !unit.trim()) return;

    const data = {
      title: title.trim(),
      unit: unit.trim(),
      color,
      aggregation,
      trackerMode,
      showOnDashboard,
      checkinPrompt: trackerMode === 'checkin' ? checkinPrompt.trim() || undefined : undefined,
      quickAddPresets: trackerMode === 'quickadd' ? presets : undefined,
      dailyGoal: trackerMode === 'quickadd' && dailyGoal ? parseFloat(dailyGoal) : undefined,
    };

    if (existingSeries?.id) {
      await db.customDataSeries.update(existingSeries.id, data);
    } else {
      await db.customDataSeries.add({
        ...data,
        isArchived: false,
        createdAt: new Date().toISOString(),
        dashboardOrder: 999,
      });
    }
    onClose();
  };

  const handleArchive = async () => {
    if (existingSeries?.id) {
      await db.customDataSeries.update(existingSeries.id, { isArchived: true });
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={existingSeries ? 'Edit Series' : 'New Data Series'}>
      <div className="px-4 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
        <Input
          label="Title"
          placeholder="e.g., Air Squats, Coffee"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
        <Input
          label="Unit"
          placeholder="e.g., reps, cups, minutes"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
        />

        {/* Tracker mode */}
        <div>
          <label className="text-xs text-text-secondary font-medium block mb-2">Tracker Mode</label>
          <div className="grid grid-cols-3 gap-2">
            {MODE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleModeChange(opt.value)}
                className={`px-2 py-2 rounded-xl text-center border transition-colors ${
                  trackerMode === opt.value
                    ? 'border-accent bg-accent/10'
                    : 'border-border bg-bg-elevated'
                }`}
              >
                <span className="text-xs font-medium text-text-primary block">{opt.label}</span>
                <span className="text-[9px] text-text-muted leading-tight block mt-0.5">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Check-in prompt (only for checkin mode) */}
        {trackerMode === 'checkin' && (
          <Input
            label="Check-in Prompt"
            placeholder="e.g., Have you taken your supplements today?"
            value={checkinPrompt}
            onChange={(e) => setCheckinPrompt(e.target.value)}
          />
        )}

        {/* Quick-add presets editor (only for quickadd mode) */}
        {trackerMode === 'quickadd' && (
          <div>
            <label className="text-xs text-text-secondary font-medium block mb-2">Preset Buttons</label>
            {presets.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {presets.map((p, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-bg-elevated border border-border text-xs text-text-primary"
                  >
                    {p.label}
                    <button
                      onClick={() => removePreset(i)}
                      className="text-text-muted hover:text-red-400 ml-1"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                className="flex-1 px-3 py-2 rounded-xl bg-bg-elevated border border-border text-sm text-text-primary placeholder:text-text-muted"
                placeholder="Label (e.g. +8oz)"
                value={newPresetLabel}
                onChange={(e) => setNewPresetLabel(e.target.value)}
              />
              <input
                className="w-20 px-3 py-2 rounded-xl bg-bg-elevated border border-border text-sm text-text-primary placeholder:text-text-muted"
                placeholder="Value"
                type="number"
                value={newPresetValue}
                onChange={(e) => setNewPresetValue(e.target.value)}
              />
              <button
                onClick={addPreset}
                className="px-3 py-2 rounded-xl bg-accent text-white text-sm font-medium"
              >
                Add
              </button>
            </div>
          </div>
        )}

        {/* Daily goal (only for quickadd mode) */}
        {trackerMode === 'quickadd' && (
          <Input
            label="Daily Goal (optional)"
            placeholder={`e.g., 180 ${unit || 'units'}`}
            type="number"
            value={dailyGoal}
            onChange={(e) => setDailyGoal(e.target.value)}
          />
        )}

        {/* Show on Dashboard toggle */}
        <div className="flex items-center justify-between">
          <label className="text-xs text-text-secondary font-medium">Show on Dashboard</label>
          <button
            onClick={() => setShowOnDashboard(!showOnDashboard)}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              showOnDashboard ? 'bg-accent' : 'bg-bg-elevated border border-border'
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                showOnDashboard ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* Color picker */}
        <div>
          <label className="text-xs text-text-secondary font-medium block mb-2">Color</label>
          <div className="flex gap-2 flex-wrap">
            {CHART_SERIES_PALETTE.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  color === c ? 'border-white scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Aggregation method */}
        <div>
          <label className="text-xs text-text-secondary font-medium block mb-2">
            Daily Aggregation
          </label>
          <div className="grid grid-cols-2 gap-2">
            {AGGREGATION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setAggregation(opt.value)}
                className={`px-3 py-2 rounded-xl text-left border transition-colors ${
                  aggregation === opt.value
                    ? 'border-accent bg-accent/10'
                    : 'border-border bg-bg-elevated'
                }`}
              >
                <span className="text-sm font-medium text-text-primary block">{opt.label}</span>
                <span className="text-[10px] text-text-muted">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <Button className="w-full" onClick={handleSave} disabled={!title.trim() || !unit.trim()}>
          {existingSeries ? 'Save Changes' : 'Create Series'}
        </Button>

        {existingSeries && (
          <Button variant="danger" className="w-full" onClick={handleArchive}>
            Archive Series
          </Button>
        )}
      </div>
    </Modal>
  );
}
