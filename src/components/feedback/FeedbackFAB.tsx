import { useState } from 'react';
import { FeedbackModal } from './FeedbackModal';

export function FeedbackFAB() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed right-5 bottom-36 z-40 w-11 h-11 rounded-full bg-bg-elevated border border-border text-text-secondary shadow-md flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Send feedback"
          title="Send feedback"
        >
          {/* megaphone / flag icon */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 11l18-8v18L3 13z" />
            <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
          </svg>
        </button>
      )}
      <FeedbackModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
