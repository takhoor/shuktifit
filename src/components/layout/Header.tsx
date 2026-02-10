import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  right?: ReactNode;
}

export function Header({ title, showBack = false, right }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="safe-top flex items-center justify-between px-4 py-3 bg-bg-primary">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="p-1 text-text-secondary active:text-text-primary"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}
        <h1 className="text-xl font-bold text-text-primary">{title}</h1>
      </div>
      {right && <div>{right}</div>}
    </header>
  );
}
