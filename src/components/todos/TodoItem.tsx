import { useState } from 'react';
import { Pencil, Trash2, Circle, CheckCircle2, Clock, AlertCircle, Calendar } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { cn, formatDate, isOverdue, daysUntil } from '../../lib/utils';
import type { Todo, TodoStatus } from '../../types';

interface TodoItemProps {
  todo: Todo;
  onStatusToggle: (id: string, newStatus: TodoStatus) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

const statusCycle: Record<TodoStatus, TodoStatus> = {
  pending: 'in_progress',
  in_progress: 'done',
  done: 'pending',
};

const priorityConfig: Record<string, { label: string; dotClass: string }> = {
  low: { label: 'Low', dotClass: 'bg-gray-500' },
  medium: { label: 'Medium', dotClass: 'bg-accent-orange' },
  high: { label: 'High', dotClass: 'bg-red-500' },
};

const statusIcons: Record<TodoStatus, typeof Circle> = {
  pending: Circle,
  in_progress: Clock,
  done: CheckCircle2,
};

const statusColors: Record<TodoStatus, string> = {
  pending: 'text-dark-muted hover:text-white',
  in_progress: 'text-accent-orange hover:text-accent-orange',
  done: 'text-secondary',
};

const categoryBadgeVariant: Record<string, 'default' | 'primary' | 'secondary' | 'orange' | 'pink'> = {
  Pekerjaan: 'primary',
  Pribadi: 'pink',
  Belajar: 'secondary',
  Kesehatan: 'orange',
  Keuangan: 'secondary',
  Rumah: 'pink',
  Lainnya: 'default',
};

export function TodoItem({ todo, onStatusToggle, onEdit, onDelete }: TodoItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const StatusIcon = statusIcons[todo.status];
  const priority = priorityConfig[todo.priority];
  const overdue = todo.status !== 'done' && isOverdue(todo.due_date);
  const days = daysUntil(todo.due_date);

  const handleStatusClick = () => {
    const nextStatus = statusCycle[todo.status];
    onStatusToggle(todo.id, nextStatus);
  };

  const handleDelete = () => {
    setIsDeleting(true);
    onDelete(todo.id);
  };

  return (
    <Card
      className={cn(
        'group relative flex items-start gap-4 transition-all duration-200',
        todo.status === 'done' && 'opacity-60',
        isDeleting && 'scale-95 opacity-0'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Status Toggle */}
      <button
        onClick={handleStatusClick}
        className={cn(
          'mt-0.5 shrink-0 transition-all duration-200',
          statusColors[todo.status],
          todo.status === 'done' ? 'scale-110' : 'hover:scale-110'
        )}
        title={`Mark as ${statusCycle[todo.status]}`}
      >
        <StatusIcon size={22} />
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap">
          {/* Title */}
          <h3
            className={cn(
              'text-sm font-medium transition-all duration-200',
              todo.status === 'done'
                ? 'text-dark-muted line-through'
                : 'text-white'
            )}
          >
            {todo.title}
          </h3>

          {/* Category Badge */}
          <Badge variant={categoryBadgeVariant[todo.category] || 'default'}>
            {todo.category}
          </Badge>

          {/* Priority Dot */}
          <span className="flex items-center gap-1.5 text-xs text-dark-muted">
            <span className={cn('h-2 w-2 rounded-full', priority.dotClass)} />
            {priority.label}
          </span>
        </div>

        {/* Description */}
        {todo.description && (
          <p
            className={cn(
              'mt-1 text-xs leading-relaxed transition-colors duration-200',
              todo.status === 'done' ? 'text-dark-muted/60' : 'text-dark-muted'
            )}
          >
            {todo.description}
          </p>
        )}

        {/* Due Date */}
        {todo.due_date && (
          <div className="mt-2 flex items-center gap-1.5">
            <Calendar size={13} className="text-dark-muted" />
            {overdue ? (
              <span className="flex items-center gap-1 text-xs font-medium text-red-400">
                <AlertCircle size={13} />
                Overdue by {Math.abs(days)} day{Math.abs(days) !== 1 ? 's' : ''}
              </span>
            ) : days === 0 ? (
              <span className="text-xs font-medium text-accent-orange">Due today</span>
            ) : days > 0 && days <= 3 ? (
              <span className="text-xs font-medium text-accent-orange">
                {days} day{days !== 1 ? 's' : ''} left
              </span>
            ) : days > 0 ? (
              <span className="text-xs text-dark-muted">
                {days} day{days !== 1 ? 's' : ''} left
              </span>
            ) : (
              <span className="text-xs text-dark-muted">{formatDate(todo.due_date)}</span>
            )}
          </div>
        )}
      </div>

      {/* Actions (visible on hover) */}
      <div
        className={cn(
          'flex items-center gap-1 transition-all duration-200',
          isHovered
            ? 'translate-y-0 opacity-100'
            : 'translate-y-1 opacity-0 pointer-events-none'
        )}
      >
        <button
          onClick={() => onEdit(todo)}
          className="rounded-lg p-1.5 text-dark-muted transition-colors hover:bg-dark-hover hover:text-white"
          title="Edit"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={handleDelete}
          className="rounded-lg p-1.5 text-dark-muted transition-colors hover:bg-red-500/15 hover:text-red-400"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </Card>
  );
}
