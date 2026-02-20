import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { Card } from '../ui/Card';
import { toISODate } from '../../utils/dateUtils';

export function StatsRibbon() {
  const stats = useLiveQuery(async () => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekStr = toISODate(weekAgo);

    const thisWeekWorkouts = await db.workouts
      .where('date')
      .aboveOrEqual(weekStr)
      .and((w) => w.status === 'completed')
      .count();

    const totalWorkouts = await db.workouts
      .where('status')
      .equals('completed')
      .count();

    const streak = await db.streaks.where('type').equals('workout').first();

    return {
      thisWeek: thisWeekWorkouts,
      total: totalWorkouts,
      streak: streak?.currentCount ?? 0,
    };
  });

  return (
    <div className="flex gap-3">
      <StatCard
        icon="🔥"
        value={String(stats?.streak ?? 0)}
        label="Streak"
      />
      <StatCard
        icon="💪"
        value={`${stats?.thisWeek ?? 0}`}
        label="This Week"
      />
      <StatCard
        icon="🏋️"
        value={String(stats?.total ?? 0)}
        label="Total"
      />
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: string;
  value: string;
  label: string;
}) {
  return (
    <Card className="flex-1 text-center py-3">
      <span className="text-lg block">{icon}</span>
      <p className="text-lg font-bold text-text-primary">{value}</p>
      <p className="text-[10px] text-text-muted">{label}</p>
    </Card>
  );
}
