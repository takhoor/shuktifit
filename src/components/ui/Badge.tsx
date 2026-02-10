import type { ReactNode } from 'react';

interface BadgeProps {
  color?: string;
  children: ReactNode;
}

export function Badge({ color = 'bg-bg-elevated', children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${color} text-text-secondary`}
    >
      {children}
    </span>
  );
}
