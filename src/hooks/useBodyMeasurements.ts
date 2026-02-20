import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { BodyMeasurement } from '../types/database';
import { today } from '../utils/dateUtils';

export function useBodyMeasurements() {
  return useLiveQuery(() =>
    db.bodyMeasurements.orderBy('date').reverse().toArray(),
  );
}

export function useLatestMeasurement() {
  return useLiveQuery(async () => {
    const all = await db.bodyMeasurements.orderBy('date').reverse().toArray();
    return all[0] ?? null;
  });
}

export function useWeightHistory() {
  return useLiveQuery(() =>
    db.bodyMeasurements
      .orderBy('date')
      .filter((m) => m.weight != null && m.weight > 0)
      .toArray(),
  );
}

export async function saveMeasurement(
  data: Omit<BodyMeasurement, 'id' | 'date' | 'source'>,
): Promise<number> {
  const id = await db.bodyMeasurements.add({
    ...data,
    date: today(),
    source: 'manual',
  } as BodyMeasurement);
  return id as number;
}
