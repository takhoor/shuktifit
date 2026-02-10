import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { Header } from '../layout/Header';
import { useUserProfile } from '../../hooks/useUserProfile';
import { getMonthSchedule } from '../../services/pplScheduler';
import { PPL_COLORS } from '../../utils/constants';
import { toISODate } from '../../utils/dateUtils';
import type { PPLType } from '../../utils/constants';

export function CalendarPage() {
  const profile = useUserProfile();
  const [viewDate, setViewDate] = useState(new Date());
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const schedule = useMemo(
    () =>
      profile?.pplStartDate
        ? getMonthSchedule(profile.pplStartDate, year, month)
        : [],
    [profile?.pplStartDate, year, month],
  );

  const workouts = useLiveQuery(async () => {
    const start = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const end = `${year}-${String(month + 1).padStart(2, '0')}-31`;
    return db.workouts
      .where('date')
      .between(start, end, true, true)
      .toArray();
  }, [year, month]);

  const completedDates = new Set(
    workouts?.filter((w) => w.status === 'completed').map((w) => w.date) ?? [],
  );

  const todayStr = toISODate(new Date());
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const paddedStart = (firstDayOfWeek + 6) % 7; // Monday start

  const prevMonth = () =>
    setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () =>
    setViewDate(new Date(year, month + 1, 1));

  const monthLabel = viewDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex flex-col h-full">
      <Header title="Calendar" showBack />
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-8">
        {/* Month navigator */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-2 text-text-secondary active:text-text-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h2 className="text-lg font-bold text-text-primary">{monthLabel}</h2>
          <button onClick={nextMonth} className="p-2 text-text-secondary active:text-text-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <div
              key={i}
              className="text-center text-[10px] font-medium text-text-muted py-1"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: paddedStart }).map((_, i) => (
            <div key={`pad-${i}`} />
          ))}
          {schedule.map(({ date, type }) => {
            const dateStr = toISODate(date);
            const isToday = dateStr === todayStr;
            const isDone = completedDates.has(dateStr);
            const color = PPL_COLORS[type as PPLType];

            return (
              <div
                key={dateStr}
                className={`aspect-square flex flex-col items-center justify-center rounded-xl ${
                  isToday ? 'ring-2 ring-accent' : ''
                }`}
                style={{
                  backgroundColor: isDone ? `${color}30` : 'transparent',
                }}
              >
                <span
                  className={`text-xs font-medium ${
                    isToday ? 'text-accent' : 'text-text-primary'
                  }`}
                >
                  {date.getDate()}
                </span>
                <div
                  className="w-1.5 h-1.5 rounded-full mt-0.5"
                  style={{ backgroundColor: color }}
                />
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-6">
          {(['push', 'pull', 'legs'] as const).map((type) => (
            <div key={type} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: PPL_COLORS[type] }}
              />
              <span className="text-xs text-text-secondary capitalize">
                {type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
