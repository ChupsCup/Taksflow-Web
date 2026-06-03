import { cn } from '../../lib/utils';

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'orange' | 'pink' | 'success' | 'warning' | 'danger';

interface BadgeProps {
  children: string;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-dark-border text-dark-muted',
  primary: 'bg-primary/15 text-primary',
  secondary: 'bg-secondary/15 text-secondary',
  orange: 'bg-accent-orange/15 text-accent-orange',
  pink: 'bg-accent-pink/15 text-accent-pink',
  success: 'bg-secondary/15 text-secondary',
  warning: 'bg-accent-orange/15 text-accent-orange',
  danger: 'bg-red-500/15 text-red-400',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
