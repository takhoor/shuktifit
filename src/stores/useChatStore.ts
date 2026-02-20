import { create } from 'zustand';

interface ChatStoreState {
  activeConversationId: number | null;
  isOpen: boolean;
  isLoading: boolean;

  openChat: () => void;
  closeChat: () => void;
  setActiveConversation: (id: number | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useChatStore = create<ChatStoreState>((set) => ({
  activeConversationId: null,
  isOpen: false,
  isLoading: false,

  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false }),
  setActiveConversation: (id) => set({ activeConversationId: id }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
