import { cn } from '../../lib/utils';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      <div className="mb-4 rounded-full bg-dark-hover p-4 text-dark-muted">
        <Icon size={40} />
      </div>
      <h3 className="text-lg font-medium text-white">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-dark-muted">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
