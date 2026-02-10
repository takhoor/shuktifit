import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const variantClasses = {
  primary: 'bg-accent text-white active:bg-accent-hover',
  secondary: 'bg-bg-elevated text-text-primary border border-border active:bg-bg-card',
  ghost: 'bg-transparent text-text-secondary active:bg-bg-elevated',
  danger: 'bg-red-600 text-white active:bg-red-700',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-base',
  lg: 'px-6 py-3.5 text-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`rounded-xl font-semibold transition-colors ${variantClasses[variant]} ${sizeClasses[size]} ${className} disabled:opacity-50`}
      {...props}
    >
      {children}
    </button>
  );
}
