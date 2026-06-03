import { useState, useEffect, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { Card } from '../ui/Card';
import { TODO_CATEGORIES, type Todo, type TodoPriority, type TodoStatus } from '../../types';

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
  category: TODO_CATEGORIES[0],
  priority: 'medium',
  status: 'pending',
  due_date: '',
};

export function TodoForm({ isOpen, onClose, onSubmit, initialData, isSubmitting }: TodoFormProps) {
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <Card className="relative z-10 w-full max-w-lg mx-4 p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">
            {initialData ? 'Edit Todo' : 'New Todo'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-dark-muted transition-colors hover:bg-dark-hover hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-dark-muted">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="What needs to be done?"
              className="w-full rounded-lg border border-dark-border bg-dark-bg px-3.5 py-2.5 text-sm text-white placeholder-dark-muted outline-none transition-colors focus:border-primary"
              autoFocus
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-dark-muted">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Add some details..."
              rows={3}
              className="w-full resize-none rounded-lg border border-dark-border bg-dark-bg px-3.5 py-2.5 text-sm text-white placeholder-dark-muted outline-none transition-colors focus:border-primary"
            />
          </div>

          {/* Category & Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark-muted">Category</label>
              <select
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
                className="w-full rounded-lg border border-dark-border bg-dark-bg px-3.5 py-2.5 text-sm text-white outline-none transition-colors focus:border-primary"
              >
                {TODO_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark-muted">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => update('priority', e.target.value as TodoPriority)}
                className="w-full rounded-lg border border-dark-border bg-dark-bg px-3.5 py-2.5 text-sm text-white outline-none transition-colors focus:border-primary"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Due Date & Status Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark-muted">Due Date</label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => update('due_date', e.target.value)}
                className="w-full rounded-lg border border-dark-border bg-dark-bg px-3.5 py-2.5 text-sm text-white outline-none transition-colors focus:border-primary [color-scheme:dark]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark-muted">Status</label>
              <select
                value={form.status}
                onChange={(e) => update('status', e.target.value as TodoStatus)}
                className="w-full rounded-lg border border-dark-border bg-dark-bg px-3.5 py-2.5 text-sm text-white outline-none transition-colors focus:border-primary"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-dark-border px-4 py-2 text-sm font-medium text-dark-muted transition-colors hover:bg-dark-hover hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !form.title.trim()}
              className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : initialData ? 'Update Todo' : 'Add Todo'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
