import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { toast } from '../ui/Toast';
import { useLatestMeasurement, saveMeasurement } from '../../hooks/useBodyMeasurements';

export function QuickLogWeight() {
  const navigate = useNavigate();
  const latest = useLatestMeasurement();
  const [open, setOpen] = useState(false);
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const w = parseFloat(weight);
    if (isNaN(w) || w <= 0) {
      toast('Enter a valid weight', 'error');
      return;
    }
    setSaving(true);
    const data: Record<string, number> = { weight: w };
    const bf = parseFloat(bodyFat);
    if (!isNaN(bf) && bf > 0) data.bodyFatPercent = bf;
    await saveMeasurement(data);
    toast('Weight logged', 'success');
    setWeight('');
    setBodyFat('');
    setOpen(false);
    setSaving(false);
  };

  if (open) {
    return (
      <Card>
        <h3 className="text-xs font-semibold text-text-muted uppercase mb-3">
          Log Weight
        </h3>
        <div className="flex gap-3 mb-3">
          <div className="flex-1">
            <label className="text-[10px] text-text-muted block mb-1">
              Weight (lbs)
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              autoFocus
              placeholder={latest?.weight ? String(latest.weight) : 'lbs'}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full bg-bg-elevated rounded-lg px-3 py-2.5 text-sm text-text-primary border border-border outline-none focus:border-accent"
            />
          </div>
          <div className="flex-1">
            <label className="text-[10px] text-text-muted block mb-1">
              Body Fat % (optional)
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              placeholder={latest?.bodyFatPercent ? String(latest.bodyFatPercent) : '%'}
              value={bodyFat}
              onChange={(e) => setBodyFat(e.target.value)}
              className="w-full bg-bg-elevated rounded-lg px-3 py-2.5 text-sm text-text-primary border border-border outline-none focus:border-accent"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setOpen(false); setWeight(''); setBodyFat(''); }}
            className="flex-1 py-2 rounded-lg text-xs font-medium text-text-secondary active:opacity-70"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2 rounded-lg text-xs font-medium bg-accent text-white disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold text-text-muted uppercase">
            Weight
          </h3>
          {latest?.weight ? (
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-bold text-text-primary">
                {latest.weight}
              </span>
              <span className="text-xs text-text-muted">lbs</span>
              {latest.bodyFatPercent ? (
                <span className="text-xs text-text-muted ml-2">
                  {latest.bodyFatPercent}% BF
                </span>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-text-secondary mt-1">No data yet</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setOpen(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-accent text-white active:opacity-80"
          >
            + Log
          </button>
          <button
            onClick={() => navigate('/progress?tab=weight')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-bg-elevated text-text-secondary active:opacity-80"
          >
            Chart
          </button>
        </div>
      </div>
    </Card>
  );
}
