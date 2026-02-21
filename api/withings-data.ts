import type { VercelRequest, VercelResponse } from './_types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { accessToken, refreshToken, dataType, startDate, endDate } = req.body;

  if (!accessToken) {
    return res.status(400).json({ error: 'Missing access token' });
  }

  try {
    let token = accessToken;
    let newTokens = null;

    // Fetch data with current token first
    let data;
    try {
      data = await fetchData(dataType, token, startDate, endDate);
    } catch (err) {
      // If 401, try refreshing the token and retry once
      if (refreshToken && err instanceof Error && err.message.includes('401')) {
        const refreshResult = await tryRefreshToken(refreshToken);
        if (refreshResult) {
          token = refreshResult.access_token;
          newTokens = refreshResult;
          data = await fetchData(dataType, token, startDate, endDate);
        } else {
          return res.status(401).json({ error: 'Token expired and refresh failed. Please reconnect Withings.' });
        }
      } else {
        throw err;
      }
    }

    return res.status(200).json({ data, newTokens });
  } catch (error) {
    console.error('Withings data error:', error);
    return res.status(500).json({
      error: 'Failed to fetch Withings data',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

async function fetchData(dataType: string, token: string, startDate?: string, endDate?: string) {
  if (dataType === 'weight' || dataType === 'body') {
    return fetchMeasurements(token, startDate, endDate);
  } else if (dataType === 'activity') {
    return fetchActivity(token, startDate, endDate);
  } else if (dataType === 'sleep') {
    return fetchSleep(token, startDate, endDate);
  }
  throw new Error(`Invalid dataType: ${dataType}`);
}

async function tryRefreshToken(refreshToken: string) {
  const clientId = process.env.WITHINGS_CLIENT_ID!;
  const clientSecret = process.env.WITHINGS_CLIENT_SECRET!;

  try {
    const res = await fetch('https://wbsapi.withings.net/v2/oauth2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        action: 'requesttoken',
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
      }),
    });

    const data = await res.json();
    if (data.status === 0 && data.body?.access_token) {
      return {
        access_token: data.body.access_token,
        refresh_token: data.body.refresh_token,
        expires_in: data.body.expires_in,
      };
    }
  } catch (err) {
    console.error('Withings token refresh failed:', err);
  }
  return null;
}

async function fetchMeasurements(token: string, startDate?: string, endDate?: string) {
  const params: Record<string, string> = {
    action: 'getmeas',
    meastypes: '1,6,8,76,77', // weight, fat ratio, fat mass, muscle mass, bone mass
  };

  if (startDate) params.startdate = String(Math.floor(new Date(startDate).getTime() / 1000));
  if (endDate) params.enddate = String(Math.floor(new Date(endDate).getTime() / 1000));

  const res = await fetch('https://wbsapi.withings.net/measure', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${token}`,
    },
    body: new URLSearchParams(params),
  });

  const data = await res.json();
  if (data.status !== 0) throw new Error(`Withings API error: ${data.status}`);

  // Parse measurements
  const measurements: Array<{
    date: string;
    type: string;
    value: number;
    unit: string;
  }> = [];

  for (const group of data.body?.measuregrps ?? []) {
    const date = new Date(group.date * 1000).toISOString().split('T')[0];
    for (const measure of group.measures) {
      const value = measure.value * Math.pow(10, measure.unit);
      const typeInfo = getMeasureType(measure.type);
      if (typeInfo) {
        measurements.push({
          date,
          type: typeInfo.type,
          value: typeInfo.convert(value),
          unit: typeInfo.unit,
        });
      }
    }
  }

  return measurements;
}

async function fetchActivity(token: string, startDate?: string, endDate?: string) {
  const today = new Date().toISOString().split('T')[0];
  const params: Record<string, string> = {
    action: 'getactivity',
    startdateymd: startDate ?? thirtyDaysAgo(),
    enddateymd: endDate ?? today,
    data_fields: 'steps,distance,calories,hr_average',
  };

  const res = await fetch('https://wbsapi.withings.net/v2/measure', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${token}`,
    },
    body: new URLSearchParams(params),
  });

  const data = await res.json();
  if (data.status !== 0) throw new Error(`Withings API error: ${data.status}`);

  return (data.body?.activities ?? []).map((a: Record<string, unknown>) => ({
    date: a.date,
    steps: a.steps ?? 0,
    distance: a.distance ?? 0,
    calories: a.calories ?? 0,
    heartRate: a.hr_average ?? 0,
  }));
}

async function fetchSleep(token: string, startDate?: string, endDate?: string) {
  const today = new Date().toISOString().split('T')[0];
  const params: Record<string, string> = {
    action: 'getsummary',
    startdateymd: startDate ?? sevenDaysAgo(),
    enddateymd: endDate ?? today,
    data_fields: 'nb_rem_episodes,sleep_efficiency,sleep_score,total_sleep_time',
  };

  const res = await fetch('https://wbsapi.withings.net/v2/sleep', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${token}`,
    },
    body: new URLSearchParams(params),
  });

  const data = await res.json();
  if (data.status !== 0) throw new Error(`Withings API error: ${data.status}`);

  return (data.body?.series ?? []).map((s: Record<string, unknown>) => ({
    date: s.date,
    sleepScore: (s.data as Record<string, unknown>)?.sleep_score ?? 0,
    totalSleepHours: ((s.data as Record<string, unknown>)?.total_sleep_time as number ?? 0) / 3600,
    efficiency: (s.data as Record<string, unknown>)?.sleep_efficiency ?? 0,
  }));
}

function getMeasureType(type: number) {
  const kgToLbs = (kg: number) => Math.round(kg * 2.20462 * 10) / 10;

  switch (type) {
    case 1: return { type: 'weight', unit: 'lbs', convert: kgToLbs };
    case 6: return { type: 'fatRatio', unit: '%', convert: (v: number) => Math.round(v * 10) / 10 };
    case 8: return { type: 'fatMass', unit: 'lbs', convert: kgToLbs };
    case 76: return { type: 'muscleMass', unit: 'lbs', convert: kgToLbs };
    case 77: return { type: 'boneMass', unit: 'lbs', convert: kgToLbs };
    default: return null;
  }
}

function thirtyDaysAgo(): string {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().split('T')[0];
}

function sevenDaysAgo(): string {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString().split('T')[0];
}
