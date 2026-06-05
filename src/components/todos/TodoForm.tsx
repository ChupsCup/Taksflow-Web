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
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto overflow-x-hidden rounded-xl border border-dark-border bg-dark-card sm:p-6">
        <div className="p-3 sm:p-0">
          <div className="flex items-center justify-between mb-3 sm:mb-6">
            <h2 className="text-sm sm:text-lg font-semibold text-white">
              {initialData ? 'Edit Tugas' : 'Tugas Baru'}
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-dark-muted transition-colors hover:bg-dark-hover hover:text-white sm:p-1.5"
            >
              <X size={16} className="sm:hidden" />
              <X size={20} className="hidden sm:block" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Title */}
            <div>
              <label className="mb-0.5 sm:mb-1 block text-xs sm:text-sm font-medium text-dark-muted">
                Judul <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                placeholder="Apa yang perlu dilakukan?"
                className="w-full rounded-lg border border-dark-border bg-dark-bg px-3 py-1.5 sm:py-2.5 text-base sm:text-sm text-white placeholder-dark-muted outline-none transition-colors focus:border-primary"
                autoFocus
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-0.5 sm:mb-1 block text-xs sm:text-sm font-medium text-dark-muted">Deskripsi</label>
              <textarea
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                placeholder="Tambahkan detail..."
                rows={2}
                className="w-full resize-none rounded-lg border border-dark-border bg-dark-bg px-3 py-1.5 sm:py-2.5 text-base sm:text-sm text-white placeholder-dark-muted outline-none transition-colors focus:border-primary"
              />
            </div>

            {/* Category & Priority Row */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="mb-0.5 sm:mb-1 block text-xs sm:text-sm font-medium text-dark-muted">Kategori</label>
                <select
                  value={form.category}
                  onChange={(e) => update('category', e.target.value)}
                  className="w-full rounded-lg border border-dark-border bg-dark-bg px-3 py-1.5 sm:py-2.5 text-base sm:text-sm text-white outline-none transition-colors focus:border-primary"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-0.5 sm:mb-1 block text-xs sm:text-sm font-medium text-dark-muted">Prioritas</label>
                <select
                  value={form.priority}
                  onChange={(e) => update('priority', e.target.value as TodoPriority)}
                  className="w-full rounded-lg border border-dark-border bg-dark-bg px-3 py-1.5 sm:py-2.5 text-base sm:text-sm text-white outline-none transition-colors focus:border-primary"
                >
                  <option value="low">Rendah</option>
                  <option value="medium">Sedang</option>
                  <option value="high">Tinggi</option>
                </select>
              </div>
            </div>

            {/* Due Date & Status Row */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="mb-0.5 sm:mb-1 block text-xs sm:text-sm font-medium text-dark-muted">Tenggat</label>
                <input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => update('due_date', e.target.value)}
                  className="w-full rounded-lg border border-dark-border bg-dark-bg px-3 py-1.5 sm:py-2.5 text-base sm:text-sm text-white outline-none transition-colors focus:border-primary [color-scheme:dark]"
                />
              </div>

              <div>
                <label className="mb-0.5 sm:mb-1 block text-xs sm:text-sm font-medium text-dark-muted">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => update('status', e.target.value as TodoStatus)}
                  className="w-full rounded-lg border border-dark-border bg-dark-bg px-3 py-1.5 sm:py-2.5 text-base sm:text-sm text-white outline-none transition-colors focus:border-primary"
                >
                  <option value="pending">Menunggu</option>
                  <option value="in_progress">Diproses</option>
                  <option value="done">Selesai</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 sm:gap-3 pt-1 sm:pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-dark-border px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-dark-muted transition-colors hover:bg-dark-hover hover:text-white"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !form.title.trim()}
                className="rounded-lg bg-primary px-3.5 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'Menyimpan...' : initialData ? 'Perbarui' : 'Tambah'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
