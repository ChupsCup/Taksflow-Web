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
    <Card className={cn('flex items-start gap-2 sm:gap-3', className)}>
      <div className="rounded-lg bg-dark-hover p-1.5 sm:p-2" style={iconColor ? { color: iconColor } : {}}>
        <Icon size={16} className="sm:hidden" />
        <Icon size={18} className="hidden sm:block" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-dark-muted sm:text-xs">{title}</p>
        <p className="mt-0.5 text-sm font-semibold text-white sm:text-lg">{value}</p>
        {trend && (
          <p className={cn('mt-0.5 text-xs', trend.positive ? 'text-secondary' : 'text-accent-pink')}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </p>
        )}
      </div>
    </Card>
  );
}
