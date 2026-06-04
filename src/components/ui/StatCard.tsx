import { cn } from '../../lib/utils';
import { Card } from './Card';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  className?: string;
  iconColor?: string;
}

export function StatCard({ title, value, icon: Icon, trend, className, iconColor }: StatCardProps) {
  return (
    <Card className={cn('flex items-start gap-3', className)}>
      <div className="rounded-lg bg-dark-hover p-2" style={iconColor ? { color: iconColor } : {}}>
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-dark-muted">{title}</p>
        <p className="mt-0.5 text-lg font-semibold text-white">{value}</p>
        {trend && (
          <p className={cn('mt-0.5 text-xs', trend.positive ? 'text-secondary' : 'text-accent-pink')}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </p>
        )}
      </div>
    </Card>
  );
}
