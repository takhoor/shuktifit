import { useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { toast } from '../ui/Toast';
import {
  useBodyMeasurements,
  saveMeasurement,
} from '../../hooks/useBodyMeasurements';
import { formatShortDate } from '../../utils/dateUtils';

interface MeasurementField {
  key: string;
  label: string;
  unit: string;
  wide?: boolean;
}

const MEASUREMENT_FIELDS: MeasurementField[] = [
  { key: 'weight', label: 'Weight', unit: 'lbs', wide: true },
  { key: 'bodyFatPercent', label: 'Body Fat', unit: '%' },
  { key: 'muscleMass', label: 'Muscle Mass', unit: 'lbs' },
  { key: 'boneMass', label: 'Bone Mass', unit: 'lbs' },
  { key: 'neck', label: 'Neck', unit: 'in' },
  { key: 'shoulders', label: 'Shoulders', unit: 'in' },
  { key: 'chest', label: 'Chest', unit: 'in' },
  { key: 'waist', label: 'Waist', unit: 'in' },
  { key: 'hips', label: 'Hips', unit: 'in' },
  { key: 'bicepL', label: 'Bicep (L)', unit: 'in' },
  { key: 'bicepR', label: 'Bicep (R)', unit: 'in' },
  { key: 'forearmL', label: 'Forearm (L)', unit: 'in' },
  { key: 'forearmR', label: 'Forearm (R)', unit: 'in' },
  { key: 'thighL', label: 'Thigh (L)', unit: 'in' },
  { key: 'thighR', label: 'Thigh (R)', unit: 'in' },
  { key: 'calfL', label: 'Calf (L)', unit: 'in' },
  { key: 'calfR', label: 'Calf (R)', unit: 'in' },
];

export function BodyMeasurementsForm() {
  const measurements = useBodyMeasurements();
  const [values, setValues] = useState<Record<string, string>>({});
  const [showForm, setShowForm] = useState(false);

  const handleSave = async () => {
    const numericValues: Record<string, number> = {};
    for (const [key, val] of Object.entries(values)) {
      const num = parseFloat(val);
      if (!isNaN(num) && num > 0) {
        numericValues[key] = num;
      }
    }

    if (Object.keys(numericValues).length === 0) {
      toast('Enter at least one measurement', 'error');
      return;
    }

    await saveMeasurement(numericValues);
    toast('Measurements saved', 'success');
    setValues({});
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      {!showForm ? (
        <Button className="w-full" onClick={() => setShowForm(true)}>
          + Log Measurements
        </Button>
      ) : (
        <Card>
          <h3 className="text-sm font-semibold text-text-secondary mb-3">
            New Measurement
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {MEASUREMENT_FIELDS.map((field) => (
              <div
                key={field.key}
                className={field.wide ? 'col-span-2' : ''}
              >
                <label className="text-[10px] text-text-muted uppercase block mb-1">
                  {field.label} ({field.unit})
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  placeholder={field.unit}
                  value={values[field.key] ?? ''}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [field.key]: e.target.value }))
                  }
                  className="w-full bg-bg-elevated rounded-lg px-3 py-2 text-sm text-text-primary border border-border outline-none focus:border-accent"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => {
                setShowForm(false);
                setValues({});
              }}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSave}>
              Save
            </Button>
          </div>
        </Card>
      )}

      {/* History */}
      <h3 className="text-sm font-semibold text-text-secondary">History</h3>
      {!measurements || measurements.length === 0 ? (
        <p className="text-xs text-text-muted text-center py-6">
          No measurements recorded yet
        </p>
      ) : (
        <div className="space-y-2">
          {measurements.map((m) => (
            <Card key={m.id} className="py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-text-secondary">
                  {formatShortDate(m.date)}
                </span>
                <span className="text-[10px] text-text-muted capitalize">
                  {m.source}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {m.weight && (
                  <MeasurementPill label="Weight" value={`${m.weight} lbs`} />
                )}
                {m.bodyFatPercent && (
                  <MeasurementPill label="BF%" value={`${m.bodyFatPercent}%`} />
                )}
                {m.muscleMass && (
                  <MeasurementPill label="Muscle" value={`${m.muscleMass} lbs`} />
                )}
                {m.chest && (
                  <MeasurementPill label="Chest" value={`${m.chest}"`} />
                )}
                {m.waist && (
                  <MeasurementPill label="Waist" value={`${m.waist}"`} />
                )}
                {m.bicepR && (
                  <MeasurementPill label="Bicep R" value={`${m.bicepR}"`} />
                )}
                {m.thighR && (
                  <MeasurementPill label="Thigh R" value={`${m.thighR}"`} />
                )}
                {m.shoulders && (
                  <MeasurementPill label="Shoulders" value={`${m.shoulders}"`} />
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function MeasurementPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="text-xs text-text-primary">
      <span className="text-text-muted">{label}:</span> {value}
    </span>
  );
}
