import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { Header } from '../layout/Header';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { DayPicker } from '../ui/DayPicker';
import { useUserProfile, saveUserProfile } from '../../hooks/useUserProfile';
import { getMonthSchedule } from '../../services/pplScheduler';
import { PPL_COLORS } from '../../utils/constants';
import { toISODate } from '../../utils/dateUtils';
import { toast } from '../ui/Toast';
import { CalendarDayModal } from './CalendarDayModal';
import type { PPLType } from '../../utils/constants';

export function CalendarPage() {
  const profile = useUserProfile();
  const [viewDate, setViewDate] = useState(new Date());
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Day modal state
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedPPL, setSelectedPPL] = useState<PPLType | 'rest'>('push');

  // PPL settings editor
  const [editingPPL, setEditingPPL] = useState(false);
  const [pplStartInput, setPplStartInput] = useState('');
  const [workoutDaysInput, setWorkoutDaysInput] = useState<number[]>([]);

  const schedule = useMemo(
    () =>
      profile?.pplStartDate
        ? getMonthSchedule(profile.pplStartDate, year, month, profile.workoutDays)
        : [],
    [profile?.pplStartDate, profile?.workoutDays, year, month],
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
  const inProgressDates = new Set(
    workouts?.filter((w) => w.status === 'in_progress').map((w) => w.date) ?? [],
  );

  const todayStr = toISODate(new Date());
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const paddedStart = (firstDayOfWeek + 6) % 7;

  const prevMonth = () =>
    setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () =>
    setViewDate(new Date(year, month + 1, 1));

  const monthLabel = viewDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const handleDayTap = (dateStr: string, type: PPLType | 'rest') => {
    setSelectedDate(dateStr);
    setSelectedPPL(type);
  };

  const handleStartEditing = () => {
    setPplStartInput(profile?.pplStartDate ?? '');
    setWorkoutDaysInput(profile?.workoutDays ?? []);
    setEditingPPL(true);
  };

  const handleSaveSettings = async () => {
    if (!pplStartInput || !profile) return;
    const { id, createdAt, updatedAt, ...rest } = profile;
    await saveUserProfile({
      ...rest,
      pplStartDate: pplStartInput,
      workoutDays: workoutDaysInput.length > 0 && workoutDaysInput.length < 7
        ? workoutDaysInput
        : undefined,
    });
    setEditingPPL(false);
    toast('Schedule updated', 'success');
  };

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
            const isActive = inProgressDates.has(dateStr);
            const isRest = type === 'rest';
            const color = PPL_COLORS[type];

            return (
              <button
                key={dateStr}
                onClick={() => handleDayTap(dateStr, type)}
                className={`aspect-square flex flex-col items-center justify-center rounded-xl transition-colors active:bg-bg-elevated ${
                  isToday ? 'ring-2 ring-accent' : ''
                }`}
                style={{
                  backgroundColor: isDone
                    ? `${color}30`
                    : isActive
                      ? `${color}15`
                      : 'transparent',
                }}
              >
                <span
                  className={`text-xs font-medium ${
                    isRest
                      ? 'text-text-muted'
                      : isToday
                        ? 'text-accent'
                        : 'text-text-primary'
                  }`}
                >
                  {date.getDate()}
                </span>
                {isRest ? (
                  <div className="w-1.5 h-0.5 rounded-full mt-0.5 bg-border" />
                ) : (
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-0.5"
                    style={{ backgroundColor: color }}
                  />
                )}
              </button>
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
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-1 rounded-full bg-border" />
            <span className="text-xs text-text-muted">Rest</span>
          </div>
        </div>

        {/* PPL Schedule Settings */}
        <Card className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-text-muted uppercase">PPL Schedule</h3>
            {!editingPPL && (
              <button
                onClick={handleStartEditing}
                className="text-xs text-accent"
              >
                Edit
              </button>
            )}
          </div>
          {editingPPL ? (
            <div className="space-y-4">
              <Input
                label="Cycle Start Date"
                type="date"
                value={pplStartInput}
                onChange={(e) => setPplStartInput(e.target.value)}
              />
              <div>
                <label className="text-sm text-text-secondary mb-1.5 block">
                  Training Days
                </label>
                <DayPicker
                  selectedDays={workoutDaysInput}
                  onChange={setWorkoutDaysInput}
                />
                <p className="text-[10px] text-text-muted mt-1">
                  {workoutDaysInput.length === 0
                    ? 'No days selected — will default to every day'
                    : workoutDaysInput.length === 7
                      ? 'Every day — no rest days'
                      : `${workoutDaysInput.length} days/week · PPL cycles only on training days`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveSettings}>Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingPPL(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm text-text-secondary">
                Cycle starts: <span className="font-medium text-text-primary">{profile?.pplStartDate ?? 'Not set'}</span>
              </p>
              <p className="text-sm text-text-secondary">
                Training days: <span className="font-medium text-text-primary">
                  {profile?.workoutDays && profile.workoutDays.length > 0
                    ? profile.workoutDays.map((d) => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][d]).join(', ')
                    : 'Every day'}
                </span>
              </p>
            </div>
          )}
        </Card>
      </div>

      {selectedDate && (
        <CalendarDayModal
          open={!!selectedDate}
          onClose={() => setSelectedDate(null)}
          date={selectedDate}
          pplType={selectedPPL}
          movingWorkout={null}
          onClearMoving={() => {}}
        />
      )}
    </div>
  );
}
