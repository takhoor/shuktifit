import { DAY_LABELS } from '../../utils/constants';

interface DayPickerProps {
  selectedDays: number[];
  onChange: (days: number[]) => void;
}

export function DayPicker({ selectedDays, onChange }: DayPickerProps) {
  const toggle = (day: number) => {
    if (selectedDays.includes(day)) {
      onChange(selectedDays.filter((d) => d !== day));
    } else {
      onChange([...selectedDays, day].sort((a, b) => a - b));
    }
  };

  return (
    <div className="flex gap-1.5">
      {DAY_LABELS.map((label, i) => {
        const selected = selectedDays.includes(i);
        return (
          <button
            key={i}
            type="button"
            onClick={() => toggle(i)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${
              selected
                ? 'bg-accent text-white'
                : 'bg-bg-elevated text-text-muted border border-border'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
