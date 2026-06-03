import { Briefcase, Activity, Calendar, BarChart3 } from 'lucide-react';
import { StatCard } from '../ui/StatCard';

import { Card } from '../ui/Card';
import { useJobsStats } from '../../hooks/useJobApplications';

export function JobsStats() {
  const { data: stats, isLoading, error } = useJobsStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="h-24 animate-pulse"><div /></Card>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="h-24">
            <p className="text-sm text-accent-pink">Gagal memuat statistik</p>
          </Card>
        ))}
      </div>
    );
  }

  const offerRate = stats.total > 0 ? Math.round((stats.offer / stats.total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Dilamar"
        value={stats.total}
        icon={Briefcase}
        iconColor="#7C6AF7"
      />
      <StatCard
        title="Response Rate"
        value={`${stats.responseRate}%`}
        icon={Activity}
        iconColor="#3ECFA8"
      />
      <StatCard
        title="Interview Rate"
        value={`${stats.interviewRate}%`}
        icon={Calendar}
        iconColor="#F7A26A"
      />
      <StatCard
        title="Offer Rate"
        value={`${offerRate}%`}
        icon={BarChart3}
        iconColor="#F76A8A"
      />
    </div>
  );
}
