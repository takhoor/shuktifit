import { useState } from 'react';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { PPL_COLORS } from '../../utils/constants';
import type { PendingAction, CreateWorkoutInput, ModifyWorkoutInput, WorkoutOperation } from '../../types/chatActions';

interface WorkoutActionCardProps {
  action: PendingAction;
  status: 'idle' | 'applying' | 'success' | 'error';
  error: string | null;
  onConfirm: (mode?: 'add' | 'start') => void;
  onDismiss: () => void;
}

export function WorkoutActionCard({
  action,
  status,
  error,
  onConfirm,
  onDismiss,
}: WorkoutActionCardProps) {
  const isCreate = action.type === 'create';
  const accentColor = isCreate
    ? PPL_COLORS[(action.input as CreateWorkoutInput).workout_type]
    : '#4DABF7';

  return (
    <div className="flex justify-start my-2 px-1">
      <div className="w-full bg-bg-card border border-border rounded-2xl overflow-hidden">
        {/* PPL color stripe */}
        <div className="h-1" style={{ backgroundColor: accentColor }} />

        <div className="p-3 space-y-2.5">
          {/* Header */}
          <div className="flex items-center gap-2">
            <span className="text-lg">{isCreate ? '✨' : '✏️'}</span>
            <div>
              <p className="text-sm font-bold text-text-primary leading-tight">
                {isCreate
                  ? `Create ${capitalize((action.input as CreateWorkoutInput).workout_type)} Workout`
                  : 'Modify Today\'s Workout'}
              </p>
              <p className="text-xs text-text-muted">
                {isCreate
                  ? `${(action.input as CreateWorkoutInput).exercises.length} exercises · ~${(action.input as CreateWorkoutInput).estimated_duration} min`
                  : (action.input as ModifyWorkoutInput).summary}
              </p>
            </div>
          </div>

          {/* Body */}
          {status !== 'success' && (
            isCreate
              ? <CreatePreview input={action.input as CreateWorkoutInput} />
              : <ModifyPreview input={action.input as ModifyWorkoutInput} />
          )}

          {/* Success */}
          {status === 'success' && (
            <div className="flex items-center gap-2 py-1 text-green-400">
              <span>✓</span>
              <span className="text-sm font-medium">
                {isCreate ? 'Workout created!' : 'Changes applied!'}
              </span>
            </div>
          )}

          {/* Error */}
          {status === 'error' && error && (
            <p className="text-xs text-red-400 leading-snug">{error}</p>
          )}

          {/* Buttons */}
          {status === 'idle' && (
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <Button variant="ghost" size="sm" onClick={onDismiss} className="text-text-muted">
                Dismiss
              </Button>
              {isCreate ? (
                <>
                  <Button variant="secondary" size="sm" onClick={() => onConfirm('add')}>
                    Add to Workouts
                  </Button>
                  <Button size="sm" onClick={() => onConfirm('start')} style={{ backgroundColor: accentColor }}>
                    Start Now
                  </Button>
                </>
              ) : (
                <Button size="sm" onClick={() => onConfirm()}>
                  Apply Changes
                </Button>
              )}
            </div>
          )}

          {status === 'applying' && (
            <div className="flex items-center gap-2 py-1">
              <Spinner size={16} />
              <span className="text-xs text-text-muted">Applying...</span>
            </div>
          )}

          {status === 'error' && (
            <div className="flex gap-2 pt-1">
              <Button variant="ghost" size="sm" onClick={onDismiss} className="text-text-muted">
                Dismiss
              </Button>
              <Button size="sm" onClick={() => onConfirm()}>
                Retry
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CreatePreview({ input }: { input: CreateWorkoutInput }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? input.exercises : input.exercises.slice(0, 4);
  const hiddenCount = input.exercises.length - 4;

  return (
    <div className="space-y-1.5">
      {visible.map((ex, i) => (
        <div key={i} className="flex items-baseline justify-between gap-2 text-xs">
          <span className="text-text-primary font-medium truncate">
            {i + 1}. {ex.name}
          </span>
          <span className="text-text-muted shrink-0">
            {ex.sets}×{ex.target_reps} @ {ex.target_weight > 0 ? `${ex.target_weight} lbs` : 'BW'}
          </span>
        </div>
      ))}
      {!expanded && hiddenCount > 0 && (
        <button
          className="text-xs text-accent"
          onClick={() => setExpanded(true)}
        >
          +{hiddenCount} more
        </button>
      )}
      {input.reasoning && (
        <p className="text-xs text-text-muted leading-snug pt-1 border-t border-border mt-1">
          {input.reasoning}
        </p>
      )}
    </div>
  );
}

function ModifyPreview({ input }: { input: ModifyWorkoutInput }) {
  return (
    <div className="space-y-1">
      {input.operations.map((op, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className={opIconClass(op.op)}>{opIcon(op.op)}</span>
          <span className="text-text-primary">{opLabel(op)}</span>
        </div>
      ))}
    </div>
  );
}

function opIcon(op: string) {
  if (op === 'remove') return '✕';
  if (op === 'update') return '↑';
  return '+';
}

function opIconClass(op: string) {
  if (op === 'remove') return 'text-red-400 font-bold w-4 text-center';
  if (op === 'update') return 'text-blue-400 font-bold w-4 text-center';
  return 'text-green-400 font-bold w-4 text-center';
}

function opLabel(op: WorkoutOperation): string {
  if (op.op === 'remove') return `Remove: ${op.exercise_name}`;
  if (op.op === 'update') {
    const parts: string[] = [];
    if (op.target_sets != null) parts.push(`${op.target_sets} sets`);
    if (op.target_reps != null) parts.push(`${op.target_reps} reps`);
    if (op.suggested_weight != null) parts.push(`${op.suggested_weight} lbs`);
    if (op.rest_seconds != null) parts.push(`rest ${op.rest_seconds}s`);
    return `Update ${op.exercise_name}${parts.length ? ': ' + parts.join(', ') : ''}`;
  }
  if (op.op === 'add') {
    return `Add: ${op.exercise_name} ${op.sets}×${op.target_reps} @ ${op.target_weight > 0 ? `${op.target_weight} lbs` : 'BW'}`;
  }
  return '';
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
