import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { AggregationMethod } from '../types/database';

export function useCustomSeriesList() {
  return useLiveQuery(
    () => db.customDataSeries.filter((s) => !s.isArchived).toArray(),
    [],
  );
}

export function useCustomSeries(id: number | undefined) {
  return useLiveQuery(
    () => (id ? db.customDataSeries.get(id) : undefined),
    [id],
  );
}

export function useSeriesDataPoints(seriesId: number | undefined) {
  return useLiveQuery(
    () =>
      seriesId
        ? db.customDataPoints
            .where('seriesId')
            .equals(seriesId)
            .sortBy('timestamp')
        : [],
    [seriesId],
  );
}

export function useAggregatedSeries(seriesId: number | undefined, aggregation?: AggregationMethod) {
  return useLiveQuery(
    async () => {
      if (!seriesId) return [];
      const points = await db.customDataPoints
        .where('seriesId')
        .equals(seriesId)
        .sortBy('timestamp');

      const method = aggregation ?? (await db.customDataSeries.get(seriesId))?.aggregation ?? 'sum';

      const grouped = new Map<string, number[]>();
      for (const p of points) {
        const existing = grouped.get(p.date) ?? [];
        existing.push(p.value);
        grouped.set(p.date, existing);
      }

      return Array.from(grouped.entries())
        .map(([date, values]) => ({
          date,
          value:
            method === 'sum' ? values.reduce((a, b) => a + b, 0)
            : method === 'average' ? values.reduce((a, b) => a + b, 0) / values.length
            : method === 'max' ? Math.max(...values)
            : values[values.length - 1],
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
    },
    [seriesId, aggregation],
  );
}
