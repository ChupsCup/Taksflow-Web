import { useState, type FormEvent } from 'react';
import {
  Search,
  Plus,
  ArrowUpDown,
  CheckSquare,
} from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { TodoItem } from './TodoItem';
import { cn } from '../../lib/utils';
import { TODO_CATEGORIES, type Todo, type TodoStatus } from '../../types';

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
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'done', label: 'Done' },
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
            placeholder="Quick add a todo... (press Enter)"
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
          placeholder="Search todos by title..."
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

        {/* Category filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-dark-border bg-dark-card px-3 py-1.5 text-xs font-medium text-dark-muted outline-none transition-colors focus:border-primary"
        >
          <option value="">All Categories</option>
          {TODO_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Sort */}
        <div className="flex items-center gap-1.5 ml-auto">
          <ArrowUpDown size={14} className="text-dark-muted" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="rounded-lg border border-dark-border bg-dark-card px-3 py-1.5 text-xs font-medium text-dark-muted outline-none transition-colors focus:border-primary"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="due_date">Due Date</option>
            <option value="priority">Priority</option>
          </select>
        </div>
      </div>

      {/* Todo list */}
      {isLoading ? (
        <LoadingSpinner className="py-16" size={36} />
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title={search || activeTab !== 'all' || categoryFilter ? 'No matching todos' : 'No todos yet'}
          description={
            search || activeTab !== 'all' || categoryFilter
              ? 'Try adjusting your filters or search query.'
              : 'Add your first todo using the form above or click the button below.'
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
