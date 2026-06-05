import { useState, useEffect, type FormEvent } from 'react';
import { X, Building2, MapPin, DollarSign, ExternalLink, Calendar, Send } from 'lucide-react';
import { Card } from '../ui/Card';
import { useCreateJobApplication, useUpdateJobApplication } from '../../hooks/useJobApplications';
import { APPLICATION_STATUS_LABELS } from '../../types';
import type { ApplicationStatus, JobApplication } from '../../types';

interface ApplicationFormProps {
  open: boolean;
  onClose: () => void;
  application?: JobApplication | null;
}

const statusOptions: ApplicationStatus[] = ['saved', 'applied', 'interview', 'offer', 'accepted', 'rejected'];

export function ApplicationForm({ open, onClose, application }: ApplicationFormProps) {
  const createMutation = useCreateJobApplication();
  const updateMutation = useUpdateJobApplication();
  const isEdit = !!application;

  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [location, setLocation] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [status, setStatus] = useState<ApplicationStatus>('saved');
  const [appliedDate, setAppliedDate] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [offerDate, setOfferDate] = useState('');
  const [responseReceived, setResponseReceived] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (application) {
      setCompany(application.company);
      setPosition(application.position);
      setLocation(application.location || '');
      setSalaryRange(application.salary_range || '');
      setJobUrl(application.job_url || '');
      setStatus(application.status);
      setAppliedDate(application.applied_date || '');
      setInterviewDate(application.interview_date || '');
      setOfferDate(application.offer_date || '');
      setResponseReceived(application.response_received);
      setNotes(application.notes || '');
    } else {
      setCompany('');
      setPosition('');
      setLocation('');
      setSalaryRange('');
      setJobUrl('');
      setStatus('saved');
      setAppliedDate('');
      setInterviewDate('');
      setOfferDate('');
      setResponseReceived(false);
      setNotes('');
    }
    setError(null);
  }, [application, open]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!company.trim() || !position.trim()) {
      setError('Company dan Position wajib diisi');
      return;
    }

    const payload = {
      company: company.trim(),
      position: position.trim(),
      location: location.trim(),
      salary_range: salaryRange.trim(),
      job_url: jobUrl.trim(),
      status,
      applied_date: appliedDate || null,
      interview_date: interviewDate || null,
      offer_date: offerDate || null,
      response_received: responseReceived,
      notes: notes.trim(),
    };

    try {
      if (isEdit && application) {
        await updateMutation.mutateAsync({ id: application.id, ...payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch {
      setError('Gagal menyimpan data. Silakan coba lagi.');
    }
  };

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex sm:items-center sm:justify-center sm:p-4">
      {/* Backdrop (desktop only) */}
      <div
        className="hidden sm:block absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal: full-screen on mobile, centered card on desktop */}
      <Card className="relative z-10 flex flex-col w-full min-h-dvh sm:min-h-0 sm:h-auto sm:max-w-lg sm:max-h-[85vh] rounded-none sm:rounded-xl border-0 sm:border sm:border-dark-border p-4 sm:p-6 overflow-x-hidden overflow-y-auto overscroll-contain">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Building2 size={16} className="sm:hidden" />
              <Building2 size={20} className="hidden sm:block" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-white">
                {isEdit ? 'Edit Lamaran' : 'Tambah Lamaran'}
              </h2>
              <p className="hidden sm:block text-xs text-dark-muted">
                {isEdit ? 'Perbarui detail lamaran kerja' : 'Catat lamaran kerja baru'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-dark-muted transition-colors hover:bg-dark-hover hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {/* Company & Position */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <div>
              <label className="mb-1 block text-xs sm:text-sm font-medium text-dark-muted">
                Company <span className="text-accent-pink">*</span>
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Nama perusahaan"
                className="w-full rounded-lg border border-dark-border bg-dark-bg px-3 py-2 sm:py-2.5 text-base sm:text-sm text-white placeholder-dark-muted outline-none transition-colors focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs sm:text-sm font-medium text-dark-muted">
                Position <span className="text-accent-pink">*</span>
              </label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Posisi yang dilamar"
                className="w-full rounded-lg border border-dark-border bg-dark-bg px-3 py-2 sm:py-2.5 text-base sm:text-sm text-white placeholder-dark-muted outline-none transition-colors focus:border-primary"
              />
            </div>
          </div>

          {/* Location & Salary Range */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <div>
              <label className="mb-1 block text-xs sm:text-sm font-medium text-dark-muted">
                <MapPin size={12} className="inline mr-1 sm:hidden" />
                <MapPin size={14} className="hidden sm:inline mr-1" />
                Lokasi
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Kota atau remote"
                className="w-full rounded-lg border border-dark-border bg-dark-bg px-3 py-2 sm:py-2.5 text-base sm:text-sm text-white placeholder-dark-muted outline-none transition-colors focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs sm:text-sm font-medium text-dark-muted">
                <DollarSign size={12} className="inline mr-1 sm:hidden" />
                <DollarSign size={14} className="hidden sm:inline mr-1" />
                Rentang Gaji
              </label>
              <input
                type="text"
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                placeholder="Rp 5-10 juta"
                className="w-full rounded-lg border border-dark-border bg-dark-bg px-3 py-2 sm:py-2.5 text-base sm:text-sm text-white placeholder-dark-muted outline-none transition-colors focus:border-primary"
              />
            </div>
          </div>

          {/* Job URL & Status */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <div>
              <label className="mb-1 block text-xs sm:text-sm font-medium text-dark-muted">
                <ExternalLink size={12} className="inline mr-1 sm:hidden" />
                <ExternalLink size={14} className="hidden sm:inline mr-1" />
                URL Lowongan
              </label>
              <input
                type="url"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-dark-border bg-dark-bg px-3 py-2 sm:py-2.5 text-base sm:text-sm text-white placeholder-dark-muted outline-none transition-colors focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs sm:text-sm font-medium text-dark-muted">
                <Send size={12} className="inline mr-1 sm:hidden" />
                <Send size={14} className="hidden sm:inline mr-1" />
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                className="w-full rounded-lg border border-dark-border bg-dark-bg px-3 py-2 sm:py-2.5 text-base sm:text-sm text-white outline-none transition-colors focus:border-primary"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {APPLICATION_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Applied Date & Interview Date */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <div>
              <label className="mb-1 block text-xs sm:text-sm font-medium text-dark-muted">
                <Calendar size={12} className="inline mr-1 sm:hidden" />
                <Calendar size={14} className="hidden sm:inline mr-1" />
                Tanggal Lamar
              </label>
              <input
                type="date"
                value={appliedDate}
                onChange={(e) => setAppliedDate(e.target.value)}
                className="w-full rounded-lg border border-dark-border bg-dark-bg px-3 py-2 sm:py-2.5 text-base sm:text-sm text-white outline-none transition-colors focus:border-primary [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs sm:text-sm font-medium text-dark-muted">
                <Calendar size={12} className="inline mr-1 sm:hidden" />
                <Calendar size={14} className="hidden sm:inline mr-1" />
                Tanggal Interview
              </label>
              <input
                type="date"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                className="w-full rounded-lg border border-dark-border bg-dark-bg px-3 py-2 sm:py-2.5 text-base sm:text-sm text-white outline-none transition-colors focus:border-primary [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Offer Date & Response Received */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <div>
              <label className="mb-1 block text-xs sm:text-sm font-medium text-dark-muted">
                <Calendar size={12} className="inline mr-1 sm:hidden" />
                <Calendar size={14} className="hidden sm:inline mr-1" />
                Tanggal Offer
              </label>
              <input
                type="date"
                value={offerDate}
                onChange={(e) => setOfferDate(e.target.value)}
                className="w-full rounded-lg border border-dark-border bg-dark-bg px-3 py-2 sm:py-2.5 text-base sm:text-sm text-white outline-none transition-colors focus:border-primary [color-scheme:dark]"
              />
            </div>
            <div className="flex items-end pb-1.5 sm:pb-2.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={responseReceived}
                  onChange={(e) => setResponseReceived(e.target.checked)}
                  className="h-4 w-4 rounded border-dark-border bg-dark-bg text-primary accent-primary outline-none focus:ring-1 focus:ring-primary"
                />
                <span className="text-xs sm:text-sm font-medium text-dark-muted">
                  Respon Diterima
                </span>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1 block text-xs sm:text-sm font-medium text-dark-muted">Catatan</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan tambahan..."
              rows={2}
              className="w-full resize-none rounded-lg border border-dark-border bg-dark-bg px-3 py-2 sm:py-2.5 text-base sm:text-sm text-white placeholder-dark-muted outline-none transition-colors focus:border-primary"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs sm:text-sm text-accent-pink">{error}</p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 sm:gap-3 pt-1 sm:pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-lg border border-dark-border px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-medium text-dark-muted transition-colors hover:bg-dark-hover hover:text-white disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-primary px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
            >
              {isPending ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Lamaran'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
