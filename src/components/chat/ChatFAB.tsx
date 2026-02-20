import { ChatPanel } from './ChatPanel';
import { useChatStore } from '../../stores/useChatStore';

export function ChatFAB() {
  const { isOpen, openChat } = useChatStore();

  return (
    <>
      {!isOpen && (
        <button
          onClick={openChat}
          className="fixed right-4 bottom-20 z-40 w-14 h-14 rounded-full bg-accent text-white shadow-lg shadow-accent/30 flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Open AI Coach"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}
      <ChatPanel />
    </>
  );
}
