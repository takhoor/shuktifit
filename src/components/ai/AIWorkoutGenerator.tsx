import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Spinner } from '../ui/Spinner';
import { generateAIWorkout } from '../../services/ai';
import { createAIWorkout, startWorkout } from '../../services/workoutEngine';
import { useWorkoutStore } from '../../stores/useWorkoutStore';
import { PPL_COLORS, PPL_LABELS, PPL_MUSCLE_FOCUS } from '../../utils/constants';
import type { PPLType } from '../../utils/constants';

interface AIWorkoutGeneratorProps {
  open: boolean;
  onClose: () => void;
  todayType: PPLType;
}

type GenerateState = 'idle' | 'generating' | 'success' | 'error';

const LOADING_MESSAGES = [
  'Analyzing your training history...',
  'Designing progressive overload...',
  'Selecting exercises for you...',
  'Optimizing rest periods...',
  'Building your perfect workout...',
];

export function AIWorkoutGenerator({ open, onClose, todayType }: AIWorkoutGeneratorProps) {
  const navigate = useNavigate();
  const [notes, setNotes] = useState('');
  const [state, setState] = useState<GenerateState>('idle');
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [error, setError] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [workoutId, setWorkoutId] = useState<number | null>(null);
  const startSession = useWorkoutStore((s) => s.startWorkout);

  const color = PPL_COLORS[todayType];

  const handleGenerate = async () => {
    setState('generating');
    setError('');
    setLoadingMsg(0);

    // Cycle through loading messages
    const interval = setInterval(() => {
      setLoadingMsg((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);

    try {
      const response = await generateAIWorkout(todayType, notes || undefined);
      clearInterval(interval);

      const id = await createAIWorkout(todayType, response);
      setWorkoutId(id);
      setReasoning(response.reasoning);
      setState('success');
    } catch (err) {
      clearInterval(interval);
      setError(err instanceof Error ? err.message : 'Failed to generate workout');
      setState('error');
    }
  };

  const handleReview = () => {
    if (workoutId) {
      onClose();
      navigate(`/workouts/new?type=${todayType}&ai=${workoutId}`);
    }
  };

  const handleStartNow = async () => {
    if (!workoutId) return;
    await startWorkout(workoutId);
    startSession(workoutId);
    onClose();
    navigate(`/workouts/${workoutId}/play`);
  };

  const handleClose = () => {
    if (state === 'generating') return; // Prevent closing during generation
    setState('idle');
    setNotes('');
    setError('');
    setReasoning('');
    setWorkoutId(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="AI Workout Generator">
      <div className="p-4">
      {state === 'idle' && (
        <div className="space-y-4">
          {/* Workout Type Header */}
          <Card className="relative overflow-hidden">
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{ backgroundColor: color }}
            />
            <div className="pt-1 flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ backgroundColor: `${color}20` }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-text-primary">{PPL_LABELS[todayType]}</h3>
                <p className="text-xs text-text-secondary">{PPL_MUSCLE_FOCUS[todayType]}</p>
              </div>
            </div>
          </Card>

          {/* Notes Input */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Notes for today (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Feeling tired today, focus on chest, skip overhead press..."
              rows={3}
              className="w-full bg-bg-elevated rounded-xl px-4 py-3 text-sm text-text-primary border border-border outline-none focus:border-accent resize-none placeholder:text-text-muted"
            />
          </div>

          {/* Info */}
          <p className="text-xs text-text-muted">
            Claude AI will generate a personalized workout based on your profile, equipment, training history, and progressive overload.
          </p>

          <Button className="w-full" onClick={handleGenerate}>
            Generate Workout
          </Button>
        </div>
      )}

      {state === 'generating' && (
        <div className="flex flex-col items-center justify-center py-12 space-y-6">
          <div className="relative">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: `${color}20` }}
            >
              <Spinner size={32} />
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold text-text-primary mb-2">
              Generating Your Workout
            </h3>
            <p className="text-sm text-text-secondary animate-pulse">
              {LOADING_MESSAGES[loadingMsg]}
            </p>
          </div>
          <p className="text-xs text-text-muted">This usually takes 5-10 seconds</p>
        </div>
      )}

      {state === 'success' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-green-600/20 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#51CF66" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-text-primary">Workout Generated!</h3>
              <p className="text-xs text-text-secondary">Ready for your review</p>
            </div>
          </div>

          {/* AI Reasoning */}
          {reasoning && (
            <Card className="bg-bg-elevated">
              <p className="text-xs text-text-muted uppercase font-semibold mb-1">AI Reasoning</p>
              <p className="text-sm text-text-secondary">{reasoning}</p>
            </Card>
          )}

          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={handleReview}>
              Review & Edit
            </Button>
            <Button className="flex-1" onClick={handleStartNow}>
              Start Now
            </Button>
          </div>
        </div>
      )}

      {state === 'error' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-text-primary">Generation Failed</h3>
              <p className="text-xs text-red-400">{error}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={handleClose}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleGenerate}>
              Try Again
            </Button>
          </div>
        </div>
      )}
      </div>
    </Modal>
  );
}
