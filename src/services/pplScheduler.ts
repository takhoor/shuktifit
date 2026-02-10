import type { PPLType } from '../utils/constants';
import { getPPLTypeForDate } from '../utils/pplUtils';

export function getTodayPPLType(pplStartDate: string): PPLType {
  const today = new Date().toISOString().split('T')[0];
  return getPPLTypeForDate(pplStartDate, today);
}

export function getWeekSchedule(
  pplStartDate: string,
  weekDates: Date[],
): Array<{ date: Date; type: PPLType }> {
  return weekDates.map((date) => ({
    date,
    type: getPPLTypeForDate(pplStartDate, date.toISOString().split('T')[0]),
  }));
}

export function getMonthSchedule(
  pplStartDate: string,
  year: number,
  month: number,
): Array<{ date: Date; type: PPLType }> {
  const days: Array<{ date: Date; type: PPLType }> = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    days.push({
      date: new Date(d),
      type: getPPLTypeForDate(pplStartDate, dateStr),
    });
  }

  return days;
}
