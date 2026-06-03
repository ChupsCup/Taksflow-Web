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
      <table className="w-full min-w-[700px] text-left text-sm">
        <thead>
          <tr className="border-b border-dark-border bg-dark-hover">
            <th className="px-4 py-3 font-medium text-dark-muted">Company</th>
            <th className="px-4 py-3 font-medium text-dark-muted">Posisi</th>
            <th className="px-4 py-3 font-medium text-dark-muted">Status</th>
            <th className="px-4 py-3 font-medium text-dark-muted">Tanggal Lamar</th>
            <th className="px-4 py-3 font-medium text-dark-muted">Respon</th>
            <th className="px-4 py-3 font-medium text-dark-muted">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dark-border">
          {applications.map((app) => (
            <tr key={app.id} className="bg-dark-card transition-colors hover:bg-dark-hover">
              <td className="px-4 py-3">
                <p className="font-medium text-white">{app.company}</p>
              </td>
              <td className="px-4 py-3 text-dark-muted">{app.position}</td>
              <td className="px-4 py-3">
                <Badge variant={statusVariant[app.status]}>
                  {APPLICATION_STATUS_LABELS[app.status]}
                </Badge>
              </td>
              <td className="px-4 py-3 text-dark-muted">
                {formatDate(app.applied_date)}
              </td>
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={app.response_received}
                  readOnly
                  className="h-4 w-4 rounded border-dark-border bg-dark-bg text-primary accent-primary outline-none"
                />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEdit(app)}
                    className="rounded-lg p-1.5 text-dark-muted transition-colors hover:bg-dark-hover hover:text-primary"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(app.id)}
                    disabled={deleteMutation.isPending && deleteId === app.id}
                    className="rounded-lg p-1.5 text-dark-muted transition-colors hover:bg-dark-hover hover:text-accent-pink disabled:opacity-50"
                    title="Hapus"
                  >
                    <Trash2 size={16} />
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
