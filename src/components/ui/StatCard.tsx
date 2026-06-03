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
    <Card className={cn('flex items-start gap-4', className)}>
      <div className="rounded-lg bg-dark-hover p-3" style={iconColor ? { color: iconColor } : {}}>
        <Icon size={22} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-dark-muted truncate">{title}</p>
        <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
        {trend && (
          <p className={cn('mt-1 text-xs', trend.positive ? 'text-secondary' : 'text-accent-pink')}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </p>
        )}
      </div>
    </Card>
  );
}
