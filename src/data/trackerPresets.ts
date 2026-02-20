import type { AggregationMethod, TrackerMode, QuickAddPreset } from '../types/database';

export interface TrackerPresetDefinition {
  title: string;
  unit: string;
  color: string;
  aggregation: AggregationMethod;
  trackerMode: TrackerMode;
  showOnDashboard: boolean;
  dashboardOrder: number;
  quickAddPresets?: QuickAddPreset[];
  checkinPrompt?: string;
  dailyGoal?: number;
}

export const TRACKER_PRESETS: TrackerPresetDefinition[] = [
  {
    title: 'Water',
    unit: 'oz',
    color: '#4DABF7',
    aggregation: 'sum',
    trackerMode: 'quickadd',
    showOnDashboard: true,
    dashboardOrder: 0,
    dailyGoal: 100,
    quickAddPresets: [
      { label: '+8oz', value: 8 },
      { label: '+20oz', value: 20 },
      { label: '+40oz', value: 40 },
    ],
  },
  {
    title: 'Protein',
    unit: 'g',
    color: '#FF922B',
    aggregation: 'sum',
    trackerMode: 'quickadd',
    showOnDashboard: true,
    dashboardOrder: 1,
    dailyGoal: 180,
    quickAddPresets: [
      { label: '+5g', value: 5 },
      { label: '+10g', value: 10 },
      { label: '+20g', value: 20 },
    ],
  },
  {
    title: 'Supplements',
    unit: 'done',
    color: '#51CF66',
    aggregation: 'last',
    trackerMode: 'checkin',
    showOnDashboard: true,
    dashboardOrder: 2,
    checkinPrompt: 'Have you taken your supplements today?',
  },
];
