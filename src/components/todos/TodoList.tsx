import { useState, type FormEvent } from 'react';
import {
  Search,
  Plus,
  ArrowUpDown,
  CheckSquare,
  X,
} from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { TodoItem } from './TodoItem';
import { cn, getTodoCategories, saveTodoCategories } from '../../lib/utils';
import { type Todo, type TodoStatus } from '../../types';

type FilterTab = 'all' | TodoStatus;
type SortBy = 'newest' | 'oldest' | 'due_date' | 'priority';

interface TodoListProps {
  todos: Todo[];
  isLoading: boolean;
  onStatusToggle: (id: string, newStatus: TodoStatus) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onQuickAdd: (title: string) => void;
}

const priorityWeight: Record<string, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const filterTabs: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'Semua' },
  { key: 'pending', label: 'Menunggu' },
  { key: 'in_progress', label: 'Diproses' },
  { key: 'done', label: 'Selesai' },
];

export function TodoList({
  todos,
  isLoading,
  onStatusToggle,
  onEdit,
  onDelete,
  onQuickAdd,
}: TodoListProps) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [quickAddTitle, setQuickAddTitle] = useState('');
  const [categories, setCategories] = useState<string[]>(() => getTodoCategories());
  const [manageOpen, setManageOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const handleQuickAdd = (e: FormEvent) => {
    e.preventDefault();
    const title = quickAddTitle.trim();
    if (!title) return;
    onQuickAdd(title);
    setQuickAddTitle('');
  };

  // Filter
  let filtered = todos;

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((t) => t.title.toLowerCase().includes(q));
  }

  if (activeTab !== 'all') {
    filtered = filtered.filter((t) => t.status === activeTab);
  }

  if (categoryFilter) {
    filtered = filtered.filter((t) => t.category === categoryFilter);
  }

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'due_date': {
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      case 'priority':
        return priorityWeight[a.priority] - priorityWeight[b.priority];
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-4">
      {/* Quick-add inline form */}
      <form onSubmit={handleQuickAdd} className="flex gap-2">
        <div className="relative flex-1">
          <Plus size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" />
          <input
            type="text"
            value={quickAddTitle}
            onChange={(e) => setQuickAddTitle(e.target.value)}
            placeholder="Tambah cepat... (Enter)"
            className="w-full rounded-lg border border-dark-border bg-dark-card py-2.5 pl-10 pr-4 text-sm text-white placeholder-dark-muted outline-none transition-colors focus:border-primary"
          />
        </div>
      </form>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari tugas berdasarkan judul..."
          className="w-full rounded-lg border border-dark-border bg-dark-card py-2.5 pl-10 pr-4 text-sm text-white placeholder-dark-muted outline-none transition-colors focus:border-primary"
        />
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Filter tabs */}
        <div className="flex rounded-lg border border-dark-border overflow-hidden">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'px-3.5 py-1.5 text-xs font-medium transition-colors',
                activeTab === tab.key
                  ? 'bg-primary text-white'
                  : 'bg-dark-card text-dark-muted hover:text-white hover:bg-dark-hover'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category filter + manage */}
        <div className="relative flex items-center gap-1">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-dark-border bg-dark-card px-3 py-1.5 text-xs font-medium text-dark-muted outline-none transition-colors focus:border-primary"
          >
            <option value="">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              setManageOpen(!manageOpen);
              setNewCategory('');
            }}
            className="flex items-center gap-1 rounded-lg border border-dark-border px-2 py-1.5 text-xs text-dark-muted transition-colors hover:bg-dark-hover hover:text-white"
            title="Tambah atau hapus kategori"
          >
            <Plus size={12} />
            Kategori
          </button>

          {manageOpen && (
            <div className="absolute left-0 top-full z-30 mt-1 w-56 rounded-lg border border-dark-border bg-dark-card p-3 shadow-xl">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-dark-muted">
                Kelola Kategori
              </p>
              <div className="mb-2 max-h-32 space-y-1 overflow-y-auto">
                {categories.map((cat) => (
                  <div
                    key={cat}
                    className="flex items-center justify-between rounded-md px-2 py-1 text-xs text-white hover:bg-dark-hover"
                  >
                    <span>{cat}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = categories.filter((c) => c !== cat);
                        setCategories(updated);
                        saveTodoCategories(updated);
                        if (categoryFilter === cat) setCategoryFilter('');
                      }}
                      className="rounded p-0.5 text-dark-muted transition-colors hover:text-accent-pink"
                      title="Hapus"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const trimmed = newCategory.trim();
                  if (!trimmed || categories.includes(trimmed)) return;
                  const updated = [...categories, trimmed];
                  setCategories(updated);
                  saveTodoCategories(updated);
                  setNewCategory('');
                }}
                className="flex gap-1"
              >
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Tambah kategori"
                  className="min-w-0 flex-1 rounded-md border border-dark-border bg-dark-bg px-2 py-1 text-xs text-white placeholder-dark-muted outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-md bg-primary px-2 py-1 text-[10px] font-medium text-white"
                >
                  Tambah
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1.5 ml-auto">
          <ArrowUpDown size={14} className="text-dark-muted" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="rounded-lg border border-dark-border bg-dark-card px-3 py-1.5 text-xs font-medium text-dark-muted outline-none transition-colors focus:border-primary"
          >
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
            <option value="due_date">Tenggat</option>
            <option value="priority">Prioritas</option>
          </select>
        </div>
      </div>

      {/* Todo list */}
      {isLoading ? (
        <LoadingSpinner className="py-16" size={36} />
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title={search || activeTab !== 'all' || categoryFilter ? 'Tidak ada tugas yang cocok' : 'Belum ada tugas'}
          description={
            search || activeTab !== 'all' || categoryFilter
              ? 'Coba atur ulang filter atau pencarian.'
              : 'Tambahkan tugas pertama menggunakan form di atas atau klik tombol di bawah.'
          }
        />
      ) : (
        <div className="space-y-2">
          {sorted.map((todo) => (
            <div
              key={todo.id}
              className="transition-all duration-200 animate-in fade-in slide-in-from-top-1"
            >
              <TodoItem
                todo={todo}
                onStatusToggle={onStatusToggle}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
