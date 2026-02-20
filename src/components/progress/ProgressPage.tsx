import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '../layout/Header';
import { WeightChart } from './WeightChart';
import { StrengthChart } from './StrengthChart';
import { VolumeChart } from './VolumeChart';
import { MuscleFrequencyChart } from './MuscleFrequencyChart';
import { BodyMeasurementsForm } from './BodyMeasurementsForm';
import { CustomSeriesPage } from './CustomSeriesPage';
import { OverlayChart } from './OverlayChart';

const TABS = [
  { key: 'strength', label: 'Strength' },
  { key: 'volume', label: 'Volume' },
  { key: 'weight', label: 'Weight' },
  { key: 'muscles', label: 'Muscles' },
  { key: 'body', label: 'Body' },
  { key: 'custom', label: 'Custom' },
  { key: 'compare', label: 'Compare' },
] as const;

type TabKey = typeof TABS[number]['key'];

const VALID_TABS = new Set<string>(TABS.map((t) => t.key));

export function ProgressPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const initialTab = tabParam && VALID_TABS.has(tabParam) ? (tabParam as TabKey) : 'strength';
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setSearchParams({ tab }, { replace: true });
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Progress" />

      {/* Tab Bar */}
      <div className="px-4 pb-2">
        <div className="flex gap-1 bg-bg-card rounded-xl p-1 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`shrink-0 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === tab.key
                  ? 'bg-accent text-white'
                  : 'text-text-muted active:text-text-secondary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-8">
        {activeTab === 'strength' && <StrengthChart />}
        {activeTab === 'volume' && <VolumeChart />}
        {activeTab === 'weight' && <WeightChart />}
        {activeTab === 'muscles' && <MuscleFrequencyChart />}
        {activeTab === 'body' && <BodyMeasurementsForm />}
        {activeTab === 'custom' && <CustomSeriesPage />}
        {activeTab === 'compare' && <OverlayChart />}
      </div>
    </div>
  );
}
