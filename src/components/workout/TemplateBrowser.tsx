import { useState } from 'react';
import { Card } from '../ui/Card';
import { useTemplateList, type TemplateFilters } from '../../hooks/useTemplates';
import { TemplateDetailModal } from './TemplateDetailModal';
import {
  WORKOUT_TYPES,
  TEMPLATE_DURATIONS,
  EQUIPMENT_PROFILES,
  WORKOUT_TYPE_LABELS,
  WORKOUT_TYPE_COLORS,
} from '../../utils/constants';
import type { WorkoutType, TemplateDuration, EquipmentProfile } from '../../types/database';

interface TemplateBrowserProps {
  preFilterType?: WorkoutType;
}

export function TemplateBrowser({ preFilterType }: TemplateBrowserProps) {
  const [filters, setFilters] = useState<TemplateFilters>({
    type: preFilterType,
  });
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);

  const templates = useTemplateList(filters);

  const toggleFilter = <K extends keyof TemplateFilters>(
    key: K,
    value: TemplateFilters[K],
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key] === value ? undefined : value,
    }));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-xl font-bold text-text-primary mb-3">Workout Templates</h1>

        {/* Type filter */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {WORKOUT_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => toggleFilter('type', t as WorkoutType)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                filters.type === t
                  ? 'text-white border-transparent'
                  : 'bg-bg-elevated text-text-secondary border-border'
              }`}
              style={filters.type === t ? { backgroundColor: WORKOUT_TYPE_COLORS[t] } : undefined}
            >
              {WORKOUT_TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Duration filter */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mt-2">
          {TEMPLATE_DURATIONS.map((d) => (
            <button
              key={d}
              onClick={() => toggleFilter('duration', d as TemplateDuration)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold ${
                filters.duration === d
                  ? 'bg-accent text-white'
                  : 'bg-bg-elevated text-text-secondary'
              }`}
            >
              {d} min
            </button>
          ))}
        </div>

        {/* Equipment filter */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mt-2">
          {EQUIPMENT_PROFILES.map((ep) => (
            <button
              key={ep}
              onClick={() => toggleFilter('equipmentProfile', ep as EquipmentProfile)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold ${
                filters.equipmentProfile === ep
                  ? 'bg-accent text-white'
                  : 'bg-bg-elevated text-text-secondary'
              }`}
            >
              {ep === 'full' ? 'Full Equipment' : 'Bodyweight Only'}
            </button>
          ))}
        </div>
      </div>

      {/* Template grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {!templates ? (
          <p className="text-center text-text-muted py-8 text-sm">Loading...</p>
        ) : templates.length === 0 ? (
          <p className="text-center text-text-muted py-8 text-sm">
            No templates match these filters
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 mt-2">
            {templates.map((t) => (
              <Card
                key={t.id}
                className="active:bg-bg-elevated transition-colors cursor-pointer"
                onClick={() => setSelectedTemplateId(t.id!)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="inline-block w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: WORKOUT_TYPE_COLORS[t.type] }}
                      />
                      <span className="text-xs font-medium text-text-secondary uppercase">
                        {WORKOUT_TYPE_LABELS[t.type]}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-text-primary truncate">
                      {t.name}
                    </h3>
                    {t.description && (
                      <p className="text-xs text-text-muted mt-1 line-clamp-2">
                        {t.description}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0 ml-3">
                    <span className="text-xs font-medium text-accent">{t.duration} min</span>
                    <span className="text-xs text-text-muted">
                      {t.equipmentProfile === 'full' ? 'Equipment' : 'Bodyweight'}
                    </span>
                    {t.isUserCreated && (
                      <span className="text-xs text-text-muted italic">Custom</span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <TemplateDetailModal
        templateId={selectedTemplateId}
        open={selectedTemplateId !== null}
        onClose={() => setSelectedTemplateId(null)}
      />
    </div>
  );
}
