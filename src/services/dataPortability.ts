import { db } from '../db';

// Tables containing user data (excludes seeded exercises/templates)
const USER_DATA_TABLES = [
  'userProfile',
  'customExercises',
  'exerciseExclusions',
  'workouts',
  'workoutExercises',
  'exerciseSets',
  'exerciseHistory',
  'bodyMeasurements',
  'bodyAnalyses',
  'withingsData',
  'badges',
  'streaks',
  'dailyTodos',
  'customDataSeries',
  'customDataPoints',
  'chatConversations',
  'chatMessages',
] as const;

interface ExportData {
  version: number;
  exportedAt: string;
  appVersion: string;
  tables: Record<string, unknown[]>;
}

export async function exportAllData(): Promise<string> {
  const tables: Record<string, unknown[]> = {};

  for (const name of USER_DATA_TABLES) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const table = (db as any)[name];
    if (table?.toArray) {
      tables[name] = await table.toArray();
    }
  }

  // Export user-created templates only
  const allTemplates = await db.workoutTemplates.toArray();
  const userTemplates = allTemplates.filter((t) => t.isUserCreated);
  if (userTemplates.length > 0) {
    tables['workoutTemplates'] = userTemplates;
    const templateIds = new Set(userTemplates.map((t) => t.id!));
    const allTemplateExercises = await db.templateExercises.toArray();
    tables['templateExercises'] = allTemplateExercises.filter(
      (te) => templateIds.has(te.templateId),
    );
  }

  const exportData: ExportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    appVersion: '0.6.0',
    tables,
  };

  return JSON.stringify(exportData);
}

export function downloadExport(jsonStr: string): void {
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `shuktifit-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importData(jsonStr: string): Promise<{ tablesImported: number; recordsImported: number }> {
  const data: ExportData = JSON.parse(jsonStr);

  if (!data.version || !data.tables) {
    throw new Error('Invalid backup file format');
  }

  let tablesImported = 0;
  let recordsImported = 0;

  // Import user data tables
  for (const name of USER_DATA_TABLES) {
    const records = data.tables[name];
    if (!records || records.length === 0) continue;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const table = (db as any)[name];
    if (!table?.clear || !table?.bulkPut) continue;

    await table.clear();
    await table.bulkPut(records);
    tablesImported++;
    recordsImported += records.length;
  }

  // Import user-created templates separately (don't clear seeded ones)
  if (data.tables['workoutTemplates']) {
    const templates = data.tables['workoutTemplates'] as Array<{ id?: number; isUserCreated?: boolean }>;
    for (const t of templates) {
      if (t.isUserCreated) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await db.workoutTemplates.put(t as any);
        recordsImported++;
      }
    }
    tablesImported++;
  }
  if (data.tables['templateExercises']) {
    for (const te of data.tables['templateExercises']) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await db.templateExercises.put(te as any);
      recordsImported++;
    }
  }

  return { tablesImported, recordsImported };
}
