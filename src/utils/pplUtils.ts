import type { PPLType } from './constants';

export function getPPLTypeForDate(
  startDate: string,
  targetDate: string,
): PPLType {
  const start = new Date(startDate);
  const target = new Date(targetDate);
  const daysDiff = Math.floor(
    (target.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );
  const types: PPLType[] = ['push', 'pull', 'legs'];
  return types[((daysDiff % 3) + 3) % 3];
}
