import { db } from '../db';

export async function buildChatContext(): Promise<string> {
  const parts: string[] = [];

  // User profile
  const profile = await db.userProfile.toCollection().first();
  if (profile) {
    parts.push(
      `## User Profile\n` +
      `Name: ${profile.name}, Age: ${profile.age}, Gender: ${profile.gender}\n` +
      `Experience: ${profile.experienceLevel}, Frequency: ${profile.trainingFrequency}x/week\n` +
      `Goals: ${profile.goals.join(', ')}\n` +
      `Equipment: ${profile.equipment.join(', ')}\n` +
      (profile.injuries ? `Injuries/limitations: ${profile.injuries}` : ''),
    );
  }

  // Recent workouts (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoff = `${thirtyDaysAgo.getFullYear()}-${String(thirtyDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(thirtyDaysAgo.getDate()).padStart(2, '0')}`;

  const recentWorkouts = await db.workouts
    .where('date')
    .aboveOrEqual(cutoff)
    .and((w) => w.status === 'completed')
    .toArray();

  if (recentWorkouts.length > 0) {
    const typeCounts: Record<string, number> = {};
    let totalVolume = 0;
    for (const w of recentWorkouts) {
      typeCounts[w.type] = (typeCounts[w.type] ?? 0) + 1;
      totalVolume += w.totalVolume ?? 0;
    }
    const breakdown = Object.entries(typeCounts)
      .map(([t, c]) => `${t}: ${c}`)
      .join(', ');

    parts.push(
      `## Recent Workouts (30 days)\n` +
      `Total: ${recentWorkouts.length} sessions (${breakdown})\n` +
      `Total volume: ${Math.round(totalVolume).toLocaleString()} lbs`,
    );
  }

  // Top exercise trends (1RM progression)
  const allHistory = await db.exerciseHistory.toArray();
  const byExercise = new Map<string, { name: string; entries: Array<{ date: string; orm: number }> }>();
  for (const h of allHistory) {
    let ex = byExercise.get(h.exerciseId);
    if (!ex) {
      ex = { name: h.exerciseName, entries: [] };
      byExercise.set(h.exerciseId, ex);
    }
    ex.entries.push({ date: h.date, orm: h.oneRepMaxEstimate });
  }

  const topExercises = Array.from(byExercise.values())
    .filter((e) => e.entries.length >= 3)
    .sort((a, b) => b.entries.length - a.entries.length)
    .slice(0, 5);

  if (topExercises.length > 0) {
    const lines = topExercises.map((e) => {
      const sorted = e.entries.sort((a, b) => a.date.localeCompare(b.date));
      const first = sorted[0].orm;
      const last = sorted[sorted.length - 1].orm;
      const trend = last > first ? `+${Math.round(last - first)}` : `${Math.round(last - first)}`;
      return `- ${e.name}: ${Math.round(last)} lbs est. 1RM (${trend} lbs over ${sorted.length} sessions)`;
    });
    parts.push(`## Top Exercise Trends\n${lines.join('\n')}`);
  }

  // Body measurements (latest)
  const latestBody = await db.bodyMeasurements.orderBy('date').last();
  if (latestBody) {
    const fields: Array<[string, string]> = [
      ['weight', 'Weight'],
      ['bodyFatPercent', 'Body Fat %'],
      ['muscleMass', 'Muscle Mass'],
      ['boneMass', 'Bone Mass'],
      ['neck', 'Neck'],
      ['chest', 'Chest'],
      ['waist', 'Waist'],
      ['hips', 'Hips'],
      ['bicepR', 'Bicep (R)'],
      ['thighR', 'Thigh (R)'],
    ];
    const bodyRecord = latestBody as unknown as Record<string, unknown>;
    const vals = fields
      .filter(([f]) => bodyRecord[f] != null)
      .map(([f, label]) => `${label}: ${bodyRecord[f]}`)
      .join(', ');
    if (vals) {
      parts.push(`## Body Measurements (${latestBody.date})\n${vals}`);
    }
  }

  // Withings data (latest per type)
  const withingsTypes = ['weight', 'fatRatio', 'muscleMass', 'boneMass', 'steps', 'heartRate', 'sleepScore', 'sleepHours'];
  const withingsLines: string[] = [];
  for (const type of withingsTypes) {
    const latest = await db.withingsData
      .where('type')
      .equals(type)
      .reverse()
      .sortBy('date')
      .then((arr) => arr[0]);
    if (latest) {
      withingsLines.push(`- ${type}: ${latest.value} (${latest.date})`);
    }
  }
  if (withingsLines.length > 0) {
    parts.push(`## Withings Health Data\n${withingsLines.join('\n')}`);
  }

  // Custom series (latest value each)
  const customSeries = await db.customDataSeries.filter((s) => !s.isArchived).toArray();
  if (customSeries.length > 0) {
    const customLines: string[] = [];
    for (const s of customSeries) {
      const latest = await db.customDataPoints
        .where('seriesId')
        .equals(s.id!)
        .reverse()
        .sortBy('date')
        .then((arr) => arr[0]);
      if (latest) {
        customLines.push(`- ${s.title}: ${latest.value} ${s.unit} (${latest.date})`);
      }
    }
    if (customLines.length > 0) {
      parts.push(`## Custom Tracked Data\n${customLines.join('\n')}`);
    }
  }

  return parts.filter(Boolean).join('\n\n');
}
