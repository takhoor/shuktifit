import { db } from '../db';

export interface ChartDataSource {
  id: string;
  label: string;
  unit: string;
  category: 'withings' | 'workout' | 'custom' | 'body';
  color: string;
  getData: () => Promise<Array<{ date: string; value: number }>>;
}

const WITHINGS_LABELS: Record<string, string> = {
  weight: 'Weight (Withings)',
  fatRatio: 'Body Fat %',
  fatMass: 'Fat Mass',
  muscleMass: 'Muscle Mass',
  boneMass: 'Bone Mass',
  steps: 'Daily Steps',
  heartRate: 'Heart Rate',
  sleepScore: 'Sleep Score',
  sleepHours: 'Sleep Duration',
};

const WITHINGS_UNITS: Record<string, string> = {
  weight: 'lbs',
  fatRatio: '%',
  fatMass: 'lbs',
  muscleMass: 'lbs',
  boneMass: 'lbs',
  steps: 'steps',
  heartRate: 'bpm',
  sleepScore: 'score',
  sleepHours: 'hrs',
};

const WITHINGS_COLORS: Record<string, string> = {
  weight: '#FF922B',
  fatRatio: '#FF6B6B',
  fatMass: '#E599F7',
  muscleMass: '#51CF66',
  boneMass: '#748FFC',
  steps: '#20C997',
  heartRate: '#FF6B6B',
  sleepScore: '#845EF7',
  sleepHours: '#845EF7',
};

async function getWithingsChartData(type: string): Promise<Array<{ date: string; value: number }>> {
  const data = await db.withingsData
    .where('type')
    .equals(type)
    .sortBy('date');
  return data.map((d) => ({ date: d.date, value: d.value }));
}

async function getWeeklyVolumeData(): Promise<Array<{ date: string; value: number }>> {
  const workouts = await db.workouts
    .where('status')
    .equals('completed')
    .toArray();

  const byWeek = new Map<string, number>();
  for (const w of workouts) {
    if (w.totalVolume) {
      // Group by week start (Monday)
      const d = new Date(w.date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diff));
      const key = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
      byWeek.set(key, (byWeek.get(key) ?? 0) + w.totalVolume);
    }
  }

  return Array.from(byWeek.entries())
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

async function getExercise1RMData(exerciseId: string): Promise<Array<{ date: string; value: number }>> {
  const history = await db.exerciseHistory
    .where('exerciseId')
    .equals(exerciseId)
    .sortBy('date');
  return history.map((h) => ({ date: h.date, value: Math.round(h.oneRepMaxEstimate) }));
}

async function getBodyMeasurementData(field: string): Promise<Array<{ date: string; value: number }>> {
  const measurements = await db.bodyMeasurements.orderBy('date').toArray();
  return measurements
    .filter((m) => (m as unknown as Record<string, unknown>)[field] != null)
    .map((m) => ({ date: m.date, value: (m as unknown as Record<string, unknown>)[field] as number }));
}

async function getCustomSeriesData(seriesId: number): Promise<Array<{ date: string; value: number }>> {
  const series = await db.customDataSeries.get(seriesId);
  if (!series) return [];

  const points = await db.customDataPoints
    .where('seriesId')
    .equals(seriesId)
    .sortBy('date');

  const grouped = new Map<string, number[]>();
  for (const p of points) {
    const existing = grouped.get(p.date) ?? [];
    existing.push(p.value);
    grouped.set(p.date, existing);
  }

  const method = series.aggregation;
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
}

export async function getAllDataSources(): Promise<ChartDataSource[]> {
  const sources: ChartDataSource[] = [];

  // Withings data sources
  const withingsTypes = ['weight', 'fatRatio', 'fatMass', 'muscleMass', 'boneMass', 'steps', 'heartRate', 'sleepScore', 'sleepHours'];
  for (const type of withingsTypes) {
    const count = await db.withingsData.where('type').equals(type).count();
    if (count > 0) {
      sources.push({
        id: `withings:${type}`,
        label: WITHINGS_LABELS[type] ?? type,
        unit: WITHINGS_UNITS[type] ?? '',
        category: 'withings',
        color: WITHINGS_COLORS[type] ?? '#4DABF7',
        getData: () => getWithingsChartData(type),
      });
    }
  }

  // Weekly volume
  const workoutCount = await db.workouts.where('status').equals('completed').count();
  if (workoutCount > 0) {
    sources.push({
      id: 'workout:weeklyVolume',
      label: 'Weekly Volume',
      unit: 'lbs',
      category: 'workout',
      color: '#FF922B',
      getData: getWeeklyVolumeData,
    });
  }

  // Top exercise 1RMs
  const allHistory = await db.exerciseHistory.toArray();
  const exerciseCounts = new Map<string, { name: string; count: number }>();
  for (const h of allHistory) {
    const existing = exerciseCounts.get(h.exerciseId);
    exerciseCounts.set(h.exerciseId, {
      name: h.exerciseName,
      count: (existing?.count ?? 0) + 1,
    });
  }
  const topExercises = Array.from(exerciseCounts.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10);

  for (const [exerciseId, info] of topExercises) {
    sources.push({
      id: `exercise:${exerciseId}:1rm`,
      label: `${info.name} 1RM`,
      unit: 'lbs',
      category: 'workout',
      color: '#4DABF7',
      getData: () => getExercise1RMData(exerciseId),
    });
  }

  // Body measurements
  const bodyFields: { field: string; label: string; unit: string }[] = [
    { field: 'weight', label: 'Body Weight', unit: 'lbs' },
    { field: 'bodyFatPercent', label: 'Body Fat %', unit: '%' },
    { field: 'muscleMass', label: 'Muscle Mass', unit: 'lbs' },
    { field: 'boneMass', label: 'Bone Mass', unit: 'lbs' },
    { field: 'neck', label: 'Neck', unit: 'in' },
    { field: 'chest', label: 'Chest', unit: 'in' },
    { field: 'waist', label: 'Waist', unit: 'in' },
    { field: 'hips', label: 'Hips', unit: 'in' },
    { field: 'bicepR', label: 'Bicep (R)', unit: 'in' },
    { field: 'thighR', label: 'Thigh (R)', unit: 'in' },
  ];
  for (const bf of bodyFields) {
    sources.push({
      id: `body:${bf.field}`,
      label: bf.label,
      unit: bf.unit,
      category: 'body',
      color: '#FF922B',
      getData: () => getBodyMeasurementData(bf.field),
    });
  }

  // Custom data series
  const customSeries = await db.customDataSeries.filter((s) => !s.isArchived).toArray();
  for (const s of customSeries) {
    sources.push({
      id: `custom:${s.id}`,
      label: s.title,
      unit: s.unit,
      category: 'custom',
      color: s.color,
      getData: () => getCustomSeriesData(s.id!),
    });
  }

  return sources;
}

export function alignSeriesData(
  series: Array<{ data: Array<{ date: string; value: number }>; key: string }>,
): Array<Record<string, number | string | null>> {
  const allDates = new Set<string>();
  for (const s of series) {
    for (const d of s.data) allDates.add(d.date);
  }

  const sortedDates = Array.from(allDates).sort();

  return sortedDates.map((date) => {
    const point: Record<string, number | string | null> = { date };
    // Format label as M/D
    const d = new Date(date + 'T00:00:00');
    point.label = `${d.getMonth() + 1}/${d.getDate()}`;

    for (const s of series) {
      const match = s.data.find((d) => d.date === date);
      point[s.key] = match?.value ?? null;
    }
    return point;
  });
}
