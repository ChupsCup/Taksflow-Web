import { useState } from 'react';
import { Pencil, Trash2, Briefcase } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Card } from '../ui/Card';
import { useJobApplications, useDeleteJobApplication } from '../../hooks/useJobApplications';
import { formatDate } from '../../lib/utils';
import { APPLICATION_STATUS_LABELS } from '../../types';
import type { ApplicationStatus, JobApplication } from '../../types';

interface ApplicationTableProps {
  onEdit: (app: JobApplication) => void;
}

const statusVariant: Record<ApplicationStatus, 'default' | 'primary' | 'orange' | 'secondary' | 'success' | 'danger'> = {
  saved: 'default',
  applied: 'primary',
  interview: 'orange',
  offer: 'secondary',
  accepted: 'success',
  rejected: 'danger',
};

export function ApplicationTable({ onEdit }: ApplicationTableProps) {
  const { data: applications, isLoading, error } = useJobApplications();
  const deleteMutation = useDeleteJobApplication();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    const confirmed = window.confirm('Yakin ingin menghapus lamaran ini?');
    if (!confirmed) {
      setDeleteId(null);
      return;
    }
    try {
      await deleteMutation.mutateAsync(id);
    } catch {
      // Error handled by mutation
    }
    setDeleteId(null);
  };

  if (isLoading) {
    return <LoadingSpinner className="py-16" size={36} />;
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-accent-pink">Gagal memuat data lamaran kerja.</p>
      </Card>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        title="Belum ada lamaran"
        description="Mulai catat lamaran kerja kamu dengan menekan tombol Tambah Lamaran"
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-dark-border">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-dark-border bg-dark-hover">
            <th className="px-1.5 py-1.5 text-[10px] font-medium text-dark-muted sm:px-3 sm:py-2 sm:text-xs">Company</th>
            <th className="px-1.5 py-1.5 text-[10px] font-medium text-dark-muted sm:px-3 sm:py-2 sm:text-xs">Posisi</th>
            <th className="px-1.5 py-1.5 text-[10px] font-medium text-dark-muted sm:px-3 sm:py-2 sm:text-xs">Status</th>
            <th className="hidden px-1.5 py-1.5 text-[10px] font-medium text-dark-muted sm:table-cell sm:px-3 sm:py-2 sm:text-xs">Tanggal Lamar</th>
            <th className="hidden px-1.5 py-1.5 text-[10px] font-medium text-dark-muted sm:table-cell sm:px-3 sm:py-2 sm:text-xs">Respon</th>
            <th className="px-1.5 py-1.5 text-center text-[10px] font-medium text-dark-muted sm:px-3 sm:py-2 sm:text-xs">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dark-border">
          {applications.map((app) => (
            <tr key={app.id} className="bg-dark-card transition-colors hover:bg-dark-hover">
              <td className="px-1.5 py-1.5 sm:px-3 sm:py-2">
                <p className="max-w-[80px] truncate text-[10px] font-medium text-white sm:max-w-none sm:text-xs sm:overflow-visible sm:whitespace-normal">{app.company}</p>
              </td>
              <td className="max-w-[80px] truncate px-1.5 py-1.5 text-[10px] text-dark-muted sm:max-w-none sm:px-3 sm:py-2 sm:text-xs sm:overflow-visible sm:whitespace-normal">{app.position}</td>
              <td className="px-1.5 py-1.5 sm:px-3 sm:py-2">
                <Badge variant={statusVariant[app.status]} className="text-[9px] sm:text-[10px]">
                  {APPLICATION_STATUS_LABELS[app.status]}
                </Badge>
              </td>
              <td className="hidden px-1.5 py-1.5 text-[10px] text-dark-muted sm:table-cell sm:px-3 sm:py-2 sm:text-xs">
                {formatDate(app.applied_date)}
              </td>
              <td className="hidden px-1.5 py-1.5 sm:table-cell sm:px-3 sm:py-2">
                <input
                  type="checkbox"
                  checked={app.response_received}
                  readOnly
                  className="h-3.5 w-3.5 rounded border-dark-border bg-dark-bg text-primary accent-primary outline-none sm:h-4 sm:w-4"
                />
              </td>
              <td className="whitespace-nowrap px-1.5 py-1.5 sm:px-3 sm:py-2">
                <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                  <button
                    onClick={() => onEdit(app)}
                    className="rounded-lg p-1.5 text-dark-muted transition-colors hover:bg-dark-hover hover:text-primary sm:p-2"
                    title="Edit"
                  >
                    <Pencil size={16} className="sm:hidden" />
                    <Pencil size={20} className="hidden sm:block" />
                  </button>
                  <button
                    onClick={() => handleDelete(app.id)}
                    disabled={deleteMutation.isPending && deleteId === app.id}
                    className="rounded-lg p-1.5 text-dark-muted transition-colors hover:bg-dark-hover hover:text-accent-pink disabled:opacity-50 sm:p-2"
                    title="Hapus"
                  >
                    <Trash2 size={16} className="sm:hidden" />
                    <Trash2 size={20} className="hidden sm:block" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
