import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { WorkoutType, TemplateDuration, EquipmentProfile } from '../types/database';

export interface TemplateFilters {
  type?: WorkoutType;
  duration?: TemplateDuration;
  equipmentProfile?: EquipmentProfile;
}

export function useTemplateList(filters?: TemplateFilters) {
  return useLiveQuery(async () => {
    let collection = db.workoutTemplates.toCollection();

    const templates = await collection.toArray();

    return templates.filter((t) => {
      if (filters?.type && t.type !== filters.type) return false;
      if (filters?.duration && t.duration !== filters.duration) return false;
      if (filters?.equipmentProfile && t.equipmentProfile !== filters.equipmentProfile) return false;
      return true;
    });
  }, [filters?.type, filters?.duration, filters?.equipmentProfile]);
}

export function useTemplate(id: number | undefined) {
  return useLiveQuery(
    () => (id ? db.workoutTemplates.get(id) : undefined),
    [id],
  );
}

export function useTemplateExercises(templateId: number | undefined) {
  return useLiveQuery(
    () =>
      templateId
        ? db.templateExercises
            .where('templateId')
            .equals(templateId)
            .sortBy('order')
        : [],
    [templateId],
  );
}
