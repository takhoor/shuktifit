import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

export function useConversations() {
  return useLiveQuery(
    () => db.chatConversations.orderBy('createdAt').reverse().toArray(),
    [],
  );
}

export function useMessages(conversationId: number | null) {
  return useLiveQuery(
    () => {
      if (!conversationId) return [];
      return db.chatMessages
        .where('conversationId')
        .equals(conversationId)
        .sortBy('createdAt');
    },
    [conversationId],
  );
}
