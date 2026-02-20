import { getGreeting, formatDate, toISODate } from '../../utils/dateUtils';
import { useUserProfile } from '../../hooks/useUserProfile';
import { getTodayPPLType, suggestOffDayWorkout } from '../../services/pplScheduler';
import { DailyWorkoutCard } from './DailyWorkoutCard';
import { DashboardTrackers } from './DashboardTrackers';
import { StatsRibbon } from './StatsRibbon';
import { WeekCalendarStrip } from './WeekCalendarStrip';
import { WithingsWidget } from './WithingsWidget';
import { Card } from '../ui/Card';

export function DashboardPage() {
  const profile = useUserProfile();
  const todayType = profile?.pplStartDate
    ? getTodayPPLType(profile.pplStartDate, profile.workoutDays)
    : 'push';

  const offDaySuggestion =
    todayType === 'rest' && profile?.pplStartDate
      ? suggestOffDayWorkout(toISODate(new Date()), profile.pplStartDate, profile.workoutDays)
      : null;

  return (
    <div className="flex flex-col h-full">
      <div className="safe-top px-4 pt-4 pb-2">
        <h1 className="text-2xl font-bold text-text-primary">
          {getGreeting()}, {profile?.name || 'Athlete'}
        </h1>
        <p className="text-sm text-text-secondary">{formatDate(new Date())}</p>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-8 space-y-4">
        <StatsRibbon />
        <DashboardTrackers />
        <DailyWorkoutCard todayType={todayType} offDaySuggestion={offDaySuggestion} />
        <WithingsWidget />
        <Card>
          <h3 className="text-xs font-semibold text-text-muted uppercase mb-3">
            This Week
          </h3>
          <WeekCalendarStrip
            pplStartDate={profile?.pplStartDate || toISODate(new Date())}
            workoutDays={profile?.workoutDays}
          />
        </Card>
      </div>
    </div>
  );
}
