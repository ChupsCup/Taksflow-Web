import {
  Circle,
  CheckCircle2,
  Clock,
  AlertCircle,
  Percent,
  ListTodo,
} from 'lucide-react';
import { StatCard } from '../ui/StatCard';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';
import { useTodosStats } from '../../hooks/useTodos';

export function TodoStats() {
  const { data: stats, isLoading } = useTodosStats();

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-10 w-10 rounded-lg bg-dark-hover" />
            <div className="mt-3 h-3 w-16 rounded bg-dark-hover" />
            <div className="mt-2 h-6 w-12 rounded bg-dark-hover" />
          </Card>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      title: 'Total',
      value: stats.total,
      icon: ListTodo,
      iconColor: '#6b6b80',
    },
    {
      title: 'Done',
      value: stats.done,
      icon: CheckCircle2,
      iconColor: '#3ECFA8',
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      icon: Clock,
      iconColor: '#F7A26A',
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: Circle,
      iconColor: '#6b6b80',
    },
    {
      title: 'Overdue',
      value: stats.overdue,
      icon: AlertCircle,
      iconColor: stats.overdue > 0 ? '#F76A8A' : '#6b6b80',
    },
    {
      title: 'Completion',
      value: `${stats.completionRate}%`,
      icon: Percent,
      iconColor: stats.completionRate >= 50 ? '#3ECFA8' : '#F7A26A',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-dark-muted">Overall Progress</span>
          <span className="text-sm font-semibold text-white">{stats.completionRate}%</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-dark-border">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-700 ease-out',
              stats.completionRate === 100
                ? 'bg-secondary'
                : stats.completionRate >= 50
                  ? 'bg-primary'
                  : stats.completionRate > 0
                    ? 'bg-accent-orange'
                    : 'bg-dark-border'
            )}
            style={{ width: `${stats.completionRate}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-xs text-dark-muted">
          <span>
            {stats.done}/{stats.total} completed
          </span>
          {stats.total > 0 && (
            <span>{stats.total - stats.done} remaining</span>
          )}
        </div>
      </Card>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {statItems.map((item) => (
          <StatCard
            key={item.title}
            title={item.title}
            value={item.value}
            icon={item.icon}
            iconColor={item.iconColor}
          />
        ))}
      </div>
    </div>
  );
}
