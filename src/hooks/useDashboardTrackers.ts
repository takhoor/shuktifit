import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { today } from '../utils/dateUtils';
import type { CustomDataPoint } from '../types/database';

export function useDashboardSeries() {
  return useLiveQuery(
    () =>
      db.customDataSeries
        .filter((s) => s.showOnDashboard && !s.isArchived)
        .sortBy('dashboardOrder'),
    [],
  );
}

export function useTodayDashboardData(seriesIds: number[]) {
  const todayStr = today();
  return useLiveQuery(
    async () => {
      if (seriesIds.length === 0) return new Map<number, { total: number; checkinPoint: CustomDataPoint | null }>();

      const allPoints = await db.customDataPoints
        .where('date')
        .equals(todayStr)
        .toArray();

      const idSet = new Set(seriesIds);
      const result = new Map<number, { total: number; checkinPoint: CustomDataPoint | null }>();

      for (const id of seriesIds) {
        result.set(id, { total: 0, checkinPoint: null });
      }

      for (const p of allPoints) {
        if (!idSet.has(p.seriesId)) continue;
        const entry = result.get(p.seriesId)!;
        entry.total += p.value;
        entry.checkinPoint = p;
      }

      return result;
    },
    [seriesIds.join(','), todayStr],
  );
}
