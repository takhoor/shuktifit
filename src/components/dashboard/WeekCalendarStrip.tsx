import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { getWeekDates, getDayLabel, toISODate } from '../../utils/dateUtils';
import { PPL_COLORS } from '../../utils/constants';
import { getWeekSchedule } from '../../services/pplScheduler';

interface WeekCalendarStripProps {
  pplStartDate: string;
}

export function WeekCalendarStrip({ pplStartDate }: WeekCalendarStripProps) {
  const weekDates = useMemo(() => getWeekDates(), []);
  const schedule = useMemo(
    () => getWeekSchedule(pplStartDate, weekDates),
    [pplStartDate, weekDates],
  );

  const todayStr = toISODate(new Date());

  const workouts = useLiveQuery(async () => {
    const startDate = toISODate(weekDates[0]);
    const endDate = toISODate(weekDates[6]);
    return db.workouts
      .where('date')
      .between(startDate, endDate, true, true)
      .toArray();
  }, [weekDates]);

  const completedDates = new Set(
    workouts?.filter((w) => w.status === 'completed').map((w) => w.date) ?? [],
  );

  return (
    <div className="flex items-center justify-between px-2">
      {schedule.map(({ date, type }) => {
        const dateStr = toISODate(date);
        const isToday = dateStr === todayStr;
        const isDone = completedDates.has(dateStr);
        const color = PPL_COLORS[type];

        return (
          <div
            key={dateStr}
            className={`flex flex-col items-center gap-1 py-2 px-2 rounded-xl ${
              isToday ? 'bg-bg-elevated' : ''
            }`}
          >
            <span className="text-[10px] text-text-muted">
              {getDayLabel(date)}
            </span>
            <span
              className={`text-xs font-bold ${
                isToday ? 'text-text-primary' : 'text-text-secondary'
              }`}
            >
              {date.getDate()}
            </span>
            <div
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: isDone ? color : `${color}40`,
                boxShadow: isDone ? `0 0 6px ${color}80` : 'none',
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
