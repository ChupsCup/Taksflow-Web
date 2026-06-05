import { useState, useEffect, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { getTodoCategories } from '../../lib/utils';
import { type Todo, type TodoPriority, type TodoStatus } from '../../types';

interface TodoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Todo, 'id' | 'user_id' | 'created_at'>) => void;
  initialData?: Todo | null;
  isSubmitting?: boolean;
}

interface TodoFormState {
  title: string;
  description: string;
  category: string;
  priority: TodoPriority;
  status: TodoStatus;
  due_date: string;
}

const defaultForm: TodoFormState = {
  title: '',
  description: '',
  category: '',
  priority: 'medium',
  status: 'pending',
  due_date: '',
};

export function TodoForm({ isOpen, onClose, onSubmit, initialData, isSubmitting }: TodoFormProps) {
  const [form, setForm] = useState(defaultForm);
  const [categories, setCategories] = useState<string[]>(() => getTodoCategories());

  useEffect(() => {
    setCategories(getTodoCategories());
    if (initialData) {
      setForm({
        title: initialData.title,
        description: initialData.description,
        category: initialData.category,
        priority: initialData.priority,
        status: initialData.status,
        due_date: initialData.due_date ? initialData.due_date.split('T')[0] : '',
      });
    } else {
      setForm(defaultForm);
    }
  }, [initialData, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const scrollY = window.scrollY;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      priority: form.priority,
      status: form.status,
      due_date: form.due_date || null,
    });
  };

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <>
      {/* Desktop: centered modal */}
      <div className="hidden sm:block">
        <div className="fixed inset-0 z-50 bg-black/60" onClick={onClose} />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div className="pointer-events-auto w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-xl border border-dark-border bg-dark-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">
                {initialData ? 'Edit Tugas' : 'Tugas Baru'}
              </h2>
              <button onClick={onClose} className="rounded-lg p-1.5 text-dark-muted transition-colors hover:bg-dark-hover hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-dark-muted">Judul <span className="text-red-400">*</span></label>
                <input type="text" value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="Apa yang perlu dilakukan?" className="w-full rounded-lg border border-dark-border bg-dark-bg px-3.5 py-2.5 text-sm text-white placeholder-dark-muted outline-none transition-colors focus:border-primary" autoFocus required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-dark-muted">Deskripsi</label>
                <textarea value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Tambahkan detail..." rows={3} className="w-full resize-none rounded-lg border border-dark-border bg-dark-bg px-3.5 py-2.5 text-sm text-white placeholder-dark-muted outline-none transition-colors focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-dark-muted">Kategori</label>
                  <select value={form.category} onChange={(e) => update('category', e.target.value)} className="w-full rounded-lg border border-dark-border bg-dark-bg px-3.5 py-2.5 text-sm text-white outline-none transition-colors focus:border-primary">
                    {categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-dark-muted">Prioritas</label>
                  <select value={form.priority} onChange={(e) => update('priority', e.target.value as TodoPriority)} className="w-full rounded-lg border border-dark-border bg-dark-bg px-3.5 py-2.5 text-sm text-white outline-none transition-colors focus:border-primary">
                    <option value="low">Rendah</option>
                    <option value="medium">Sedang</option>
                    <option value="high">Tinggi</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-dark-muted">Tenggat</label>
                  <input type="date" value={form.due_date} onChange={(e) => update('due_date', e.target.value)} className="w-full rounded-lg border border-dark-border bg-dark-bg px-3.5 py-2.5 text-sm text-white outline-none transition-colors focus:border-primary [color-scheme:dark]" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-dark-muted">Status</label>
                  <select value={form.status} onChange={(e) => update('status', e.target.value as TodoStatus)} className="w-full rounded-lg border border-dark-border bg-dark-bg px-3.5 py-2.5 text-sm text-white outline-none transition-colors focus:border-primary">
                    <option value="pending">Menunggu</option>
                    <option value="in_progress">Diproses</option>
                    <option value="done">Selesai</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onClose} className="rounded-lg border border-dark-border px-4 py-2 text-sm font-medium text-dark-muted transition-colors hover:bg-dark-hover hover:text-white">Batal</button>
                <button type="submit" disabled={isSubmitting || !form.title.trim()} className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-50">
                  {isSubmitting ? 'Menyimpan...' : initialData ? 'Perbarui Tugas' : 'Tambah Tugas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Mobile: compact centered modal */}
      <div className="block sm:hidden">
        <div className="fixed inset-0 z-50 bg-black/60 touch-none" onClick={onClose} />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 pointer-events-none">
          <div className="pointer-events-auto w-full max-w-xs rounded-xl border border-dark-border bg-dark-card">
            <div className="max-h-[80vh] overflow-y-auto overscroll-contain p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-white">{initialData ? 'Edit Tugas' : 'Tugas Baru'}</span>
                <button onClick={onClose} className="rounded p-0.5 text-dark-muted hover:text-white">
                  <X size={14} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-1.5">
                <div>
                  <label className="mb-px block text-[10px] font-medium text-dark-muted">Judul <span className="text-red-400">*</span></label>
                  <input type="text" value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="Apa yang perlu dilakukan?" className="w-full rounded-lg border border-dark-border bg-dark-bg px-2.5 py-1 text-base text-white placeholder-dark-muted outline-none transition-colors focus:border-primary" autoFocus required />
                </div>
                <div>
                  <label className="mb-px block text-[10px] font-medium text-dark-muted">Deskripsi</label>
                  <textarea value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Tambahkan detail..." rows={1} className="w-full resize-none rounded-lg border border-dark-border bg-dark-bg px-2.5 py-1 text-base text-white placeholder-dark-muted outline-none transition-colors focus:border-primary" />
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <label className="mb-px block text-[10px] font-medium text-dark-muted">Kategori</label>
                    <select value={form.category} onChange={(e) => update('category', e.target.value)} className="w-full rounded-lg border border-dark-border bg-dark-bg px-2.5 py-1 text-base text-white outline-none transition-colors focus:border-primary">
                      {categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-px block text-[10px] font-medium text-dark-muted">Prioritas</label>
                    <select value={form.priority} onChange={(e) => update('priority', e.target.value as TodoPriority)} className="w-full rounded-lg border border-dark-border bg-dark-bg px-2.5 py-1 text-base text-white outline-none transition-colors focus:border-primary">
                      <option value="low">Rendah</option>
                      <option value="medium">Sedang</option>
                      <option value="high">Tinggi</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <label className="mb-px block text-[10px] font-medium text-dark-muted">Tenggat</label>
                    <input type="date" value={form.due_date} onChange={(e) => update('due_date', e.target.value)} className="w-full rounded-lg border border-dark-border bg-dark-bg px-2.5 py-1 text-xs text-white outline-none transition-colors focus:border-primary [color-scheme:dark]" />
                  </div>
                  <div>
                    <label className="mb-px block text-[10px] font-medium text-dark-muted">Status</label>
                    <select value={form.status} onChange={(e) => update('status', e.target.value as TodoStatus)} className="w-full rounded-lg border border-dark-border bg-dark-bg px-2.5 py-1 text-base text-white outline-none transition-colors focus:border-primary">
                      <option value="pending">Menunggu</option>
                      <option value="in_progress">Diproses</option>
                      <option value="done">Selesai</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-1.5 pt-0.5">
                  <button type="button" onClick={onClose} className="rounded-lg border border-dark-border px-3 py-1 text-[10px] font-medium text-dark-muted transition-colors hover:bg-dark-hover hover:text-white">Batal</button>
                  <button type="submit" disabled={isSubmitting || !form.title.trim()} className="rounded-lg bg-primary px-3 py-1 text-[10px] font-medium text-white transition-colors hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-50">
                    {isSubmitting ? 'Menyimpan...' : initialData ? 'Perbarui' : 'Tambah'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
