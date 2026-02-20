import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { AIWorkoutGenerator } from '../ai/AIWorkoutGenerator';
import { TemplateBrowser } from '../workout/TemplateBrowser';
import { PPL_COLORS, PPL_LABELS, PPL_MUSCLE_FOCUS, PPL_TYPES } from '../../utils/constants';
import type { PPLType } from '../../utils/constants';
import type { OffDaySuggestion } from '../../services/pplScheduler';

interface DailyWorkoutCardProps {
  todayType: PPLType | 'rest';
  offDaySuggestion?: OffDaySuggestion | null;
}

export function DailyWorkoutCard({ todayType, offDaySuggestion }: DailyWorkoutCardProps) {
  const navigate = useNavigate();
  const [aiOpen, setAiOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [templateType, setTemplateType] = useState<PPLType>('push');
  const [showOptions, setShowOptions] = useState(false);

  const openTemplates = (type: PPLType) => {
    setTemplateType(type);
    setTemplatesOpen(true);
  };

  if (todayType === 'rest') {
    return (
      <>
        <RestDayCard
          suggestion={offDaySuggestion ?? null}
          onStartWorkout={(type) => navigate(`/workouts/new?type=${type}`)}
          onBrowseTemplates={(type) => openTemplates(type)}
          onShowOptions={() => setShowOptions(true)}
        />
        <WorkoutTypePickerModal
          open={showOptions}
          onClose={() => setShowOptions(false)}
          scheduledType={null}
          onSelectType={(type) => navigate(`/workouts/new?type=${type}`)}
          onSelectTemplates={(type) => openTemplates(type)}
        />
        <Modal
          open={templatesOpen}
          onClose={() => setTemplatesOpen(false)}
          title="Pick a Template"
        >
          <TemplateBrowser preFilterType={templateType} />
        </Modal>
      </>
    );
  }

  const color = PPL_COLORS[todayType];

  return (
    <>
      <Card className="relative overflow-hidden">
        {/* Colored top stripe */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: color }}
        />
        <div className="pt-2">
          <div
            className="flex items-center gap-2 mb-1 cursor-pointer"
            onClick={() => setShowOptions(true)}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span
              className="text-xs font-bold uppercase tracking-wide"
              style={{ color }}
            >
              Today
            </span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" className="ml-auto">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-text-primary">
            {PPL_LABELS[todayType]}
          </h2>
          <p className="text-sm text-text-secondary mb-4">
            {PPL_MUSCLE_FOCUS[todayType]}
          </p>
          <div className="flex gap-3">
            <Button
              className="flex-1"
              onClick={() => openTemplates(todayType)}
            >
              Browse Templates
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setAiOpen(true)}
            >
              AI
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/workouts/new?type=${todayType}`)}
            >
              Manual
            </Button>
          </div>
        </div>
      </Card>

      <WorkoutTypePickerModal
        open={showOptions}
        onClose={() => setShowOptions(false)}
        scheduledType={todayType}
        onSelectType={(type) => navigate(`/workouts/new?type=${type}`)}
        onSelectTemplates={(type) => openTemplates(type)}
      />

      {/* Template browser modal */}
      <Modal
        open={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        title="Pick a Template"
      >
        <TemplateBrowser preFilterType={templateType} />
      </Modal>

      <AIWorkoutGenerator
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        todayType={todayType}
      />
    </>
  );
}

function RestDayCard({
  suggestion,
  onStartWorkout,
  onBrowseTemplates,
  onShowOptions,
}: {
  suggestion: OffDaySuggestion | null;
  onStartWorkout: (type: PPLType) => void;
  onBrowseTemplates: (type: PPLType) => void;
  onShowOptions: () => void;
}) {
  const restColor = PPL_COLORS.rest;

  return (
    <Card className="relative overflow-hidden">
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: restColor }}
      />
      <div className="pt-2">
        <div
          className="flex items-center gap-2 mb-1 cursor-pointer"
          onClick={onShowOptions}
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: restColor }}
          />
          <span className="text-xs font-bold uppercase tracking-wide text-text-muted">
            Today
          </span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#868E96" strokeWidth="2.5" className="ml-auto">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-text-primary">Rest Day</h2>
        <p className="text-sm text-text-secondary mb-4">
          Recovery and regeneration
        </p>

        {suggestion && (
          <div className="p-3 rounded-xl bg-bg-elevated border border-border">
            <p className="text-xs text-text-muted mb-1">Want to train anyway?</p>
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: PPL_COLORS[suggestion.type] }}
              />
              <span className="text-sm font-semibold text-text-primary capitalize">
                {suggestion.type} recommended
              </span>
            </div>
            <p className="text-xs text-text-secondary mb-3">
              {suggestion.reason}
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => onStartWorkout(suggestion.type)}>
                Start {suggestion.type}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onBrowseTemplates(suggestion.type)}>
                Templates
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function WorkoutTypePickerModal({
  open,
  onClose,
  scheduledType,
  onSelectType,
  onSelectTemplates,
}: {
  open: boolean;
  onClose: () => void;
  scheduledType: PPLType | null;
  onSelectType: (type: PPLType | 'custom') => void;
  onSelectTemplates: (type: PPLType) => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Today's Workout">
      <div className="p-4 space-y-2">
        {PPL_TYPES.map((type) => (
          <div
            key={type}
            className="flex items-center gap-3 p-3 rounded-xl bg-bg-elevated active:bg-bg-card"
          >
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: PPL_COLORS[type] }}
            />
            <button
              className="flex-1 text-left"
              onClick={() => { onClose(); onSelectType(type); }}
            >
              <p className="text-sm font-semibold text-text-primary capitalize">
                {PPL_LABELS[type]}
                {type === scheduledType && (
                  <span className="text-xs font-normal text-accent ml-2">Scheduled</span>
                )}
              </p>
              <p className="text-xs text-text-secondary">{PPL_MUSCLE_FOCUS[type]}</p>
            </button>
            <button
              onClick={() => { onClose(); onSelectTemplates(type); }}
              className="px-2 py-1 text-xs text-accent active:text-accent-hover"
            >
              Templates
            </button>
          </div>
        ))}
        <button
          onClick={() => { onClose(); onSelectType('custom'); }}
          className="w-full flex items-center gap-3 p-3 rounded-xl bg-bg-elevated active:bg-bg-card"
        >
          <div className="w-3 h-3 rounded-full bg-purple-400 shrink-0" />
          <div className="text-left">
            <p className="text-sm font-semibold text-text-primary">Custom Workout</p>
            <p className="text-xs text-text-secondary">Build your own</p>
          </div>
        </button>
      </div>
    </Modal>
  );
}
