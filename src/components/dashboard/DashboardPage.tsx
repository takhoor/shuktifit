import { getGreeting, formatDate } from '../../utils/dateUtils';
import { useUserProfile } from '../../hooks/useUserProfile';
import { getTodayPPLType } from '../../services/pplScheduler';
import { DailyWorkoutCard } from './DailyWorkoutCard';
import { StatsRibbon } from './StatsRibbon';
import { WeekCalendarStrip } from './WeekCalendarStrip';
import { Card } from '../ui/Card';

export function DashboardPage() {
  const profile = useUserProfile();
  const todayType = profile?.pplStartDate
    ? getTodayPPLType(profile.pplStartDate)
    : 'push';

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
        <DailyWorkoutCard todayType={todayType} />
        <Card>
          <h3 className="text-xs font-semibold text-text-muted uppercase mb-3">
            This Week
          </h3>
          <WeekCalendarStrip pplStartDate={profile?.pplStartDate || new Date().toISOString().split('T')[0]} />
        </Card>
      </div>
    </div>
  );
}
