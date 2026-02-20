import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { toast } from '../ui/Toast';
import { db } from '../../db';
import { createWorkout, deleteWorkout, updateWorkoutDate } from '../../services/workoutEngine';
import { formatDate, toISODate } from '../../utils/dateUtils';
import { PPL_COLORS } from '../../utils/constants';
import { useUserProfile } from '../../hooks/useUserProfile';
import { suggestOffDayWorkout } from '../../services/pplScheduler';
import type { PPLType } from '../../utils/constants';
import type { Workout } from '../../types/database';

interface CalendarDayModalProps {
  open: boolean;
  onClose: () => void;
  date: string;
  pplType: PPLType | 'rest';
  movingWorkout: Workout | null;
  onClearMoving: () => void;
}

export function CalendarDayModal({ open, onClose, date, pplType, movingWorkout, onClearMoving }: CalendarDayModalProps) {
  const navigate = useNavigate();
  const profile = useUserProfile();
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const workouts = useLiveQuery(
    () => db.workouts.where('date').equals(date).toArray(),
    [date],
  );

  const suggestion = useMemo(() => {
    if (pplType !== 'rest' || !profile?.pplStartDate) return null;
    return suggestOffDayWorkout(date, profile.pplStartDate, profile.workoutDays);
  }, [pplType, date, profile?.pplStartDate, profile?.workoutDays]);

  const handleCreateWorkout = async (type: PPLType | 'custom') => {
    const id = await createWorkout(type);
    await updateWorkoutDate(id, date);
    onClose();
    navigate(`/workouts/new?type=${type}&edit=${id}`);
  };

  const handleMoveHere = async () => {
    if (!movingWorkout?.id) return;
    await updateWorkoutDate(movingWorkout.id, date);
    onClearMoving();
    toast(`Moved workout to ${formatDate(date)}`, 'success');
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      await deleteWorkout(deleteTarget);
      setDeleteTarget(null);
      toast('Workout deleted', 'success');
    }
  };

  const isRest = pplType === 'rest';
  const color = PPL_COLORS[pplType];
  const displayDate = formatDate(date);
  const isToday = date === toISODate(new Date());

  return (
    <>
      <Modal open={open} onClose={onClose} title={isToday ? 'Today' : displayDate}>
        <div className="px-4 py-4 space-y-4">
          {/* Day type indicator */}
          <div className="flex items-center gap-2">
            {isRest ? (
              <>
                <div className="w-3 h-1 rounded-full bg-border" />
                <span className="text-sm font-medium text-text-muted">Rest Day</span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-sm font-medium text-text-primary capitalize">{pplType} Day</span>
              </>
            )}
          </div>

          {/* Smart suggestion for rest days */}
          {isRest && suggestion && (
            <div className="p-3 rounded-xl bg-bg-elevated border border-border">
              <p className="text-xs text-text-muted mb-1">Suggested workout</p>
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: PPL_COLORS[suggestion.type] }}
                />
                <span className="text-sm font-semibold text-text-primary capitalize">
                  {suggestion.type}
                </span>
              </div>
              <p className="text-xs text-text-secondary mb-3">
                {suggestion.reason}
              </p>
              <Button size="sm" onClick={() => handleCreateWorkout(suggestion.type)}>
                Start {suggestion.type}
              </Button>
            </div>
          )}

          {/* Moving workout banner */}
          {movingWorkout && (
            <div className="p-3 rounded-xl bg-accent/10 border border-accent/30">
              <p className="text-xs text-text-secondary mb-2">
                Move "{movingWorkout.name || `${movingWorkout.type} workout`}" here?
              </p>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleMoveHere}>
                  Move Here
                </Button>
                <Button size="sm" variant="ghost" onClick={onClearMoving}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Existing workouts */}
          {workouts && workouts.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-text-muted uppercase mb-2">Workouts</h4>
              <div className="space-y-2">
                {workouts.map((w) => (
                  <WorkoutRow
                    key={w.id}
                    workout={w}
                    onDelete={() => setDeleteTarget(w.id!)}
                    onOpen={() => {
                      onClose();
                      if (w.status === 'in_progress') {
                        navigate(`/workouts/${w.id}/play`);
                      } else {
                        navigate(`/workouts/${w.id}`);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Create workout */}
          <div>
            <h4 className="text-xs font-semibold text-text-muted uppercase mb-2">Add Workout</h4>
            <div className="flex gap-2">
              {(['push', 'pull', 'legs'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => handleCreateWorkout(type)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold capitalize border border-border active:bg-bg-elevated"
                  style={{ color: PPL_COLORS[type] }}
                >
                  {type}
                </button>
              ))}
              <button
                onClick={() => handleCreateWorkout('custom')}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-border text-text-secondary active:bg-bg-elevated"
              >
                Custom
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Workout?"
        message="This will permanently delete the workout and all its data."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}

function WorkoutRow({
  workout,
  onOpen,
  onDelete,
}: {
  workout: Workout;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const color = PPL_COLORS[workout.type as PPLType] ?? '#888';
  const statusLabel =
    workout.status === 'completed' ? 'Done' :
    workout.status === 'in_progress' ? 'In Progress' :
    workout.status === 'skipped' ? 'Skipped' : 'Planned';

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-elevated border border-border">
      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <button onClick={onOpen} className="flex-1 min-w-0 text-left">
        <p className="text-sm font-medium text-text-primary truncate capitalize">
          {workout.name || `${workout.type} workout`}
        </p>
        <p className="text-[10px] text-text-muted">
          {statusLabel}
          {workout.durationMinutes ? ` · ${workout.durationMinutes}min` : ''}
          {workout.totalVolume ? ` · ${Math.round(workout.totalVolume).toLocaleString()} lbs` : ''}
        </p>
      </button>
      {workout.status !== 'completed' && (
        <button onClick={onDelete} className="p-1 text-text-muted active:text-red-400">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      )}
    </div>
  );
}
