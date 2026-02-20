import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { useTemplate, useTemplateExercises } from '../../hooks/useTemplates';
import { createWorkoutFromTemplate } from '../../services/templateEngine';
import { startWorkout } from '../../services/workoutEngine';
import { useWorkoutStore } from '../../stores/useWorkoutStore';
import { WORKOUT_TYPE_LABELS, WORKOUT_TYPE_COLORS } from '../../utils/constants';
import { getExerciseImageUrl } from '../../utils/imageUrl';

interface TemplateDetailModalProps {
  templateId: number | null;
  open: boolean;
  onClose: () => void;
}

export function TemplateDetailModal({ templateId, open, onClose }: TemplateDetailModalProps) {
  const navigate = useNavigate();
  const template = useTemplate(templateId ?? undefined);
  const exercises = useTemplateExercises(templateId ?? undefined);
  const [loading, setLoading] = useState(false);
  const startWorkoutSession = useWorkoutStore((s) => s.startWorkout);

  const handleStart = async () => {
    if (!templateId) return;
    setLoading(true);
    try {
      const workoutId = await createWorkoutFromTemplate(templateId);
      await startWorkout(workoutId);
      startWorkoutSession(workoutId);
      onClose();
      navigate(`/workouts/${workoutId}/play`);
    } catch (err) {
      console.error('Failed to start template workout:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomize = async () => {
    if (!templateId) return;
    setLoading(true);
    try {
      const workoutId = await createWorkoutFromTemplate(templateId);
      onClose();
      navigate(`/workouts/new?type=${template?.type === 'full-body' ? 'custom' : template?.type}&edit=${workoutId}`);
    } catch (err) {
      console.error('Failed to create workout from template:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!template || !exercises) return null;

  return (
    <Modal open={open} onClose={onClose} title={template.name}>
      <div className="px-4 py-3">
        {/* Header info */}
        <div className="flex items-center gap-3 mb-4">
          <span
            className="px-2.5 py-1 rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: WORKOUT_TYPE_COLORS[template.type] }}
          >
            {WORKOUT_TYPE_LABELS[template.type]}
          </span>
          <span className="text-sm text-text-secondary">{template.duration} min</span>
          <span className="text-sm text-text-muted">
            {template.equipmentProfile === 'full' ? 'Full Equipment' : 'Bodyweight'}
          </span>
        </div>

        {template.description && (
          <p className="text-sm text-text-secondary mb-4">{template.description}</p>
        )}

        {/* Exercise list */}
        <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">
          Exercises ({exercises.length})
        </h3>
        <div className="space-y-2 mb-6">
          {exercises.map((ex, i) => (
            <ExerciseRow key={ex.id ?? i} exercise={ex} index={i} />
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pb-4">
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleStart}
            disabled={loading}
          >
            {loading ? <Spinner /> : 'Start Workout'}
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={handleCustomize}
            disabled={loading}
          >
            Customize First
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function ExerciseRow({
  exercise,
  index,
}: {
  exercise: { exerciseName: string; targetSets: number; targetReps: number; restSeconds: number; notes?: string; exerciseId: string };
  index: number;
}) {
  const [imgErr, setImgErr] = useState(false);
  const imgUrl = getExerciseImageUrl(`${exercise.exerciseId}/0.jpg`);

  return (
    <div className="flex items-center gap-3 bg-bg-elevated rounded-xl p-3">
      <span className="text-xs font-bold text-text-muted w-5 text-center shrink-0">
        {index + 1}
      </span>
      <div className="w-9 h-9 rounded-lg bg-bg-card flex items-center justify-center overflow-hidden shrink-0">
        {!imgErr ? (
          <img
            src={imgUrl}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImgErr(true)}
          />
        ) : (
          <span className="text-sm">🏋️</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">
          {exercise.exerciseName}
        </p>
        <p className="text-xs text-text-secondary">
          {exercise.targetSets} × {exercise.targetReps}
          {exercise.restSeconds !== 90 && ` · ${exercise.restSeconds}s rest`}
        </p>
        {exercise.notes && (
          <p className="text-xs text-text-muted italic mt-0.5">{exercise.notes}</p>
        )}
      </div>
    </div>
  );
}
