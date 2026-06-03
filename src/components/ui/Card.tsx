import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function Card({ children, className, onClick, onMouseEnter, onMouseLeave }: CardProps) {
  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        'rounded-xl border border-dark-border bg-dark-card p-5',
        onClick && 'cursor-pointer transition-colors hover:border-dark-hover',
        className
      )}
    >
      {children}
    </div>
  );
}
