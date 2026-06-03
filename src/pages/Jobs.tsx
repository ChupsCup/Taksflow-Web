import { useState } from 'react';
import { Plus, Briefcase } from 'lucide-react';
import { JobsStats } from '../components/jobs/JobsStats';
import { StatusTimeline } from '../components/jobs/StatusTimeline';
import { ApplicationTable } from '../components/jobs/ApplicationTable';
import { ApplicationForm } from '../components/jobs/ApplicationForm';
import { Card } from '../components/ui/Card';
import type { JobApplication } from '../types';

export default function Jobs() {
  const [formOpen, setFormOpen] = useState(false);
  const [editApp, setEditApp] = useState<JobApplication | null>(null);

  const handleAdd = () => {
    setEditApp(null);
    setFormOpen(true);
  };

  const handleEdit = (app: JobApplication) => {
    setEditApp(app);
    setFormOpen(true);
  };

  const handleClose = () => {
    setFormOpen(false);
    setEditApp(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Briefcase size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Lamaran Kerja</h1>
            <p className="text-sm text-dark-muted">Kelola dan pantau progres lamaran kerjamu</p>
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
        >
          <Plus size={18} />
          Tambah Lamaran
        </button>
      </div>

      {/* Stats */}
      <JobsStats />

      {/* Status Pipeline */}
      <Card className="p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-dark-muted">
          Pipeline Status
        </h2>
        <StatusTimeline />
      </Card>

      {/* Table */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-dark-muted">
          Daftar Lamaran
        </h2>
        <ApplicationTable onEdit={handleEdit} />
      </div>

      {/* Form Modal */}
      <ApplicationForm
        open={formOpen}
        onClose={handleClose}
        application={editApp}
      />
    </div>
  );
}
