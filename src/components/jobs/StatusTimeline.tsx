import { useJobApplications } from '../../hooks/useJobApplications';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Card } from '../ui/Card';
import { APPLICATION_STATUS_LABELS } from '../../types';
import type { ApplicationStatus } from '../../types';

const pipelineStages: ApplicationStatus[] = ['saved', 'applied', 'interview', 'offer', 'accepted', 'rejected'];

const stageColors: Record<ApplicationStatus, string> = {
  saved: 'border-l-dark-muted bg-dark-hover',
  applied: 'border-l-primary bg-primary/5',
  interview: 'border-l-accent-orange bg-accent-orange/5',
  offer: 'border-l-secondary bg-secondary/5',
  accepted: 'border-l-secondary bg-secondary/5',
  rejected: 'border-l-accent-pink bg-accent-pink/5',
};

const dotColors: Record<ApplicationStatus, string> = {
  saved: 'bg-dark-muted',
  applied: 'bg-primary',
  interview: 'bg-accent-orange',
  offer: 'bg-secondary',
  accepted: 'bg-secondary',
  rejected: 'bg-accent-pink',
};

export function StatusTimeline() {
  const { data: applications, isLoading, error } = useJobApplications();

  if (isLoading) {
    return <LoadingSpinner className="py-8" size={28} />;
  }

  if (error || !applications) {
    return (
      <Card className="p-4 text-center">
        <p className="text-sm text-accent-pink">Gagal memuat pipeline.</p>
      </Card>
    );
  }

  const grouped = pipelineStages.reduce(
    (acc, status) => {
      acc[status] = applications.filter((app) => app.status === status);
      return acc;
    },
    {} as Record<ApplicationStatus, typeof applications>
  );

  return (
    <div className="flex flex-wrap items-start gap-2">
      {pipelineStages.map((status, index) => {
        const apps = grouped[status];
        const count = apps.length;
        const isTerminal = status === 'accepted' || status === 'rejected';

        return (
          <div key={status} className="flex items-start gap-1.5">
            {/* Stage card */}
            <div className={`min-w-[100px] flex-1 rounded-lg border border-dark-border p-2 border-l-4 ${stageColors[status]}`}>
              <div className="flex items-center gap-1.5">
                <span className={`h-2 w-2 shrink-0 rounded-full ${dotColors[status]}`} />
                <span className="truncate text-[11px] font-medium text-white">
                  {APPLICATION_STATUS_LABELS[status]}
                </span>
                <span className="ml-auto flex h-4 min-w-[18px] items-center justify-center rounded-full bg-dark-hover px-1 text-[10px] font-semibold text-dark-muted">
                  {count}
                </span>
              </div>

              {count > 0 && isTerminal && (
                <p className="mt-1 text-[9px] font-medium tracking-wider text-dark-muted/50">
                  {status === 'accepted' ? '✅ Diterima' : '❌ Ditolak'}
                </p>
              )}
            </div>

            {/* Arrow connector */}
            {index < pipelineStages.length - 1 && (
              <div className="hidden sm:flex items-center self-center">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="text-dark-border shrink-0"
                >
                  <path
                    d="M8 4L14 10L8 16"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
