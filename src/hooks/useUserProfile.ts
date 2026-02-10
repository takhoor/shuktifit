import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { UserProfile } from '../types/database';

export function useUserProfile(): UserProfile | undefined {
  return useLiveQuery(() => db.userProfile.toCollection().first());
}

export function useIsOnboarded(): boolean | undefined {
  const profile = useLiveQuery(() => db.userProfile.count());
  if (profile === undefined) return undefined;
  return profile > 0;
}

export async function saveUserProfile(
  data: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<void> {
  const existing = await db.userProfile.toCollection().first();
  const now = new Date().toISOString();
  if (existing?.id) {
    await db.userProfile.update(existing.id, { ...data, updatedAt: now });
  } else {
    await db.userProfile.add({
      ...data,
      createdAt: now,
      updatedAt: now,
    } as UserProfile);
  }
}
