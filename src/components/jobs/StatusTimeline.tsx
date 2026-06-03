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
    <div className="flex flex-wrap items-start gap-3">
      {pipelineStages.map((status, index) => {
        const apps = grouped[status];
        const count = apps.length;
        const isTerminal = status === 'accepted' || status === 'rejected';

        return (
          <div key={status} className="flex items-start gap-3">
            {/* Stage card */}
            <div className={`min-w-[160px] flex-1 rounded-lg border border-dark-border p-4 border-l-4 ${stageColors[status]}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`h-2.5 w-2.5 rounded-full ${dotColors[status]}`} />
                <span className="text-sm font-medium text-white">
                  {APPLICATION_STATUS_LABELS[status]}
                </span>
                <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-dark-hover px-1.5 text-xs font-semibold text-dark-muted">
                  {count}
                </span>
              </div>

              {count > 0 ? (
                <ul className="space-y-1">
                  {apps.slice(0, 4).map((app) => (
                    <li
                      key={app.id}
                      className="truncate text-xs text-dark-muted"
                      title={`${app.company} - ${app.position}`}
                    >
                      {app.company}
                    </li>
                  ))}
                  {count > 4 && (
                    <li className="text-xs text-dark-muted/60">
                      +{count - 4} lainnya
                    </li>
                  )}
                </ul>
              ) : (
                <p className="text-xs text-dark-muted/40 italic">Kosong</p>
              )}

              {isTerminal && count > 0 && (
                <p className="mt-2 text-[10px] font-medium uppercase tracking-wider text-dark-muted/50">
                  {status === 'accepted' ? '✅ Diterima' : '❌ Ditolak'}
                </p>
              )}
            </div>

            {/* Arrow connector */}
            {index < pipelineStages.length - 1 && (
              <div className="hidden sm:flex items-center self-center pt-6">
                <svg
                  width="20"
                  height="20"
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
