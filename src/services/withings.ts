import { db } from '../db';
import type { WithingsData } from '../types/database';

const API_BASE = '/api';

export function isWithingsConnected(profile: {
  withingsAccessToken?: string;
  withingsRefreshToken?: string;
}): boolean {
  return !!profile.withingsAccessToken && !!profile.withingsRefreshToken;
}

export function startWithingsAuth(): void {
  const origin = encodeURIComponent(window.location.origin);
  window.location.href = `${API_BASE}/withings-auth?origin=${origin}`;
}

export async function handleWithingsCallback(
  searchParams: URLSearchParams,
): Promise<boolean> {
  const status = searchParams.get('withings');
  if (!status) return false;

  if (status === 'success') {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const expiry = searchParams.get('expiry');
    const userid = searchParams.get('userid');

    if (accessToken && refreshToken) {
      const profile = await db.userProfile.toCollection().first();
      if (profile?.id) {
        await db.userProfile.update(profile.id, {
          withingsAccessToken: accessToken,
          withingsRefreshToken: refreshToken,
          withingsTokenExpiry: expiry ?? undefined,
          withingsUserId: userid ?? undefined,
          updatedAt: new Date().toISOString(),
        });
      }
      return true;
    }
  }

  return false;
}

export async function syncWithingsData(): Promise<{
  synced: boolean;
  weightCount: number;
  activityCount: number;
  error?: string;
}> {
  const profile = await db.userProfile.toCollection().first();
  if (!profile?.withingsAccessToken || !profile?.withingsRefreshToken) {
    return { synced: false, weightCount: 0, activityCount: 0 };
  }

  let weightCount = 0;
  let activityCount = 0;

  // Determine start date: last sync or 30 days ago
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const startDate = `${thirtyDaysAgo.getFullYear()}-${String(thirtyDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(thirtyDaysAgo.getDate()).padStart(2, '0')}`;

  // Track current tokens — may be refreshed during sync
  let currentAccessToken = profile.withingsAccessToken;
  let currentRefreshToken = profile.withingsRefreshToken;

  const updateTokensIfNeeded = async (newTokens: { access_token: string; refresh_token: string; expires_in: number } | null) => {
    if (newTokens && profile.id) {
      currentAccessToken = newTokens.access_token;
      currentRefreshToken = newTokens.refresh_token;
      await db.userProfile.update(profile.id, {
        withingsAccessToken: newTokens.access_token,
        withingsRefreshToken: newTokens.refresh_token,
        withingsTokenExpiry: new Date(
          Date.now() + newTokens.expires_in * 1000,
        ).toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  };

  try {
    // Fetch weight/body measurements
    const weightRes = await fetch(`${API_BASE}/withings-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accessToken: currentAccessToken,
        refreshToken: currentRefreshToken,
        dataType: 'weight',
        startDate,
      }),
    });

    if (weightRes.ok) {
      const { data, newTokens } = await weightRes.json();
      await updateTokensIfNeeded(newTokens);

      // Store weight data
      // Group measurements by date so we can batch-update bodyMeasurements
      const bodyCompByDate = new Map<string, { weight?: number; bodyFatPercent?: number; muscleMass?: number; boneMass?: number }>();

      for (const m of data ?? []) {
        const existing = await db.withingsData
          .where('[type+date]')
          .equals([m.type, m.date])
          .first();

        if (existing) {
          await db.withingsData.update(existing.id!, {
            value: m.value,
            unit: m.unit,
            syncedAt: new Date().toISOString(),
          });
        } else {
          await db.withingsData.add({
            type: m.type as WithingsData['type'],
            date: m.date,
            value: m.value,
            unit: m.unit,
            syncedAt: new Date().toISOString(),
          });
        }
        weightCount++;

        // Collect body composition fields for bodyMeasurements
        const fieldMap: Record<string, string> = {
          weight: 'weight',
          fatRatio: 'bodyFatPercent',
          muscleMass: 'muscleMass',
          boneMass: 'boneMass',
        };
        const field = fieldMap[m.type];
        if (field) {
          const entry = bodyCompByDate.get(m.date) ?? {};
          (entry as Record<string, number>)[field] = m.value;
          bodyCompByDate.set(m.date, entry);
        }
      }

      // Upsert bodyMeasurements with all available body composition data
      for (const [date, fields] of bodyCompByDate) {
        const existingMeasurement = await db.bodyMeasurements
          .where('date')
          .equals(date)
          .and((bm) => bm.source === 'withings')
          .first();

        if (existingMeasurement) {
          await db.bodyMeasurements.update(existingMeasurement.id!, fields);
        } else {
          await db.bodyMeasurements.add({
            date,
            ...fields,
            source: 'withings',
          });
        }
      }
    } else if (weightRes.status === 401) {
      return { synced: false, weightCount: 0, activityCount: 0, error: 'Token expired. Please reconnect Withings.' };
    }

    // Fetch activity data (steps, etc.) — uses refreshed tokens
    const activityRes = await fetch(`${API_BASE}/withings-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accessToken: currentAccessToken,
        refreshToken: currentRefreshToken,
        dataType: 'activity',
        startDate,
      }),
    });

    if (activityRes.ok) {
      const { data, newTokens } = await activityRes.json();
      await updateTokensIfNeeded(newTokens);

      for (const a of data ?? []) {
        if (a.steps > 0) {
          const existing = await db.withingsData
            .where('[type+date]')
            .equals(['steps', a.date])
            .first();

          if (existing) {
            await db.withingsData.update(existing.id!, {
              value: a.steps,
              syncedAt: new Date().toISOString(),
            });
          } else {
            await db.withingsData.add({
              type: 'steps',
              date: a.date,
              value: a.steps,
              unit: 'steps',
              syncedAt: new Date().toISOString(),
            });
          }
          activityCount++;
        }

        if (a.heartRate > 0) {
          const existing = await db.withingsData
            .where('[type+date]')
            .equals(['heartRate', a.date])
            .first();

          if (existing) {
            await db.withingsData.update(existing.id!, {
              value: a.heartRate,
              syncedAt: new Date().toISOString(),
            });
          } else {
            await db.withingsData.add({
              type: 'heartRate',
              date: a.date,
              value: a.heartRate,
              unit: 'bpm',
              syncedAt: new Date().toISOString(),
            });
          }
        }
      }
    }
    // Fetch sleep data
    const sleepRes = await fetch(`${API_BASE}/withings-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accessToken: currentAccessToken,
        refreshToken: currentRefreshToken,
        dataType: 'sleep',
        startDate,
      }),
    });

    if (sleepRes.ok) {
      const { data, newTokens } = await sleepRes.json();
      await updateTokensIfNeeded(newTokens);

      for (const s of data ?? []) {
        // Store sleep score
        if (s.sleepScore > 0) {
          const existing = await db.withingsData
            .where('[type+date]')
            .equals(['sleepScore', s.date])
            .first();
          if (existing) {
            await db.withingsData.update(existing.id!, { value: s.sleepScore, syncedAt: new Date().toISOString() });
          } else {
            await db.withingsData.add({ type: 'sleepScore', date: s.date, value: s.sleepScore, unit: 'score', syncedAt: new Date().toISOString() });
          }
        }

        // Store sleep hours
        if (s.totalSleepHours > 0) {
          const existing = await db.withingsData
            .where('[type+date]')
            .equals(['sleepHours', s.date])
            .first();
          if (existing) {
            await db.withingsData.update(existing.id!, { value: Math.round(s.totalSleepHours * 10) / 10, syncedAt: new Date().toISOString() });
          } else {
            await db.withingsData.add({ type: 'sleepHours', date: s.date, value: Math.round(s.totalSleepHours * 10) / 10, unit: 'hrs', syncedAt: new Date().toISOString() });
          }
        }
      }
    }
  } catch (error) {
    console.error('Withings sync error:', error);
    return { synced: false, weightCount, activityCount, error: error instanceof Error ? error.message : 'Sync failed' };
  }

  return { synced: true, weightCount, activityCount };
}

export async function disconnectWithings(): Promise<void> {
  const profile = await db.userProfile.toCollection().first();
  if (profile?.id) {
    await db.userProfile.update(profile.id, {
      withingsAccessToken: undefined,
      withingsRefreshToken: undefined,
      withingsTokenExpiry: undefined,
      withingsUserId: undefined,
      updatedAt: new Date().toISOString(),
    });
  }
  // Clear synced data
  await db.withingsData.clear();
}
