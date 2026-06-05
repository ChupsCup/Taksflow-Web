import { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { TodoStats } from '../components/todos/TodoStats';
import { TodoList } from '../components/todos/TodoList';
import { TodoForm } from '../components/todos/TodoForm';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useTodos, useCreateTodo, useUpdateTodo, useDeleteTodo } from '../hooks/useTodos';
import type { Todo, TodoStatus } from '../types';

export default function Todos() {
  const { data: todos, isLoading, error } = useTodos();
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const openCreateForm = useCallback(() => {
    setEditingTodo(null);
    setIsFormOpen(true);
  }, []);

  const openEditForm = useCallback((todo: Todo) => {
    setEditingTodo(todo);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingTodo(null);
  }, []);

  const handleSubmit = useCallback(
    (data: Omit<Todo, 'id' | 'user_id' | 'created_at'>) => {
      if (editingTodo) {
        updateTodo.mutate(
          { id: editingTodo.id, ...data },
          { onSuccess: () => closeForm() }
        );
      } else {
        createTodo.mutate(data, { onSuccess: () => closeForm() });
      }
    },
    [editingTodo, createTodo, updateTodo, closeForm]
  );

  const handleStatusToggle = useCallback(
    (id: string, newStatus: TodoStatus) => {
      updateTodo.mutate({ id, status: newStatus });
    },
    [updateTodo]
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteTodo.mutate(id);
    },
    [deleteTodo]
  );

  const handleQuickAdd = useCallback(
    (title: string) => {
      createTodo.mutate({
        title,
        description: '',
        category: 'Lainnya',
        priority: 'medium',
        status: 'pending',
        due_date: null,
      });
    },
    [createTodo]
  );

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-red-400">Gagal memuat tugas. Silakan coba lagi.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white sm:text-2xl">Daftar Tugas</h1>
          <p className="mt-0.5 text-xs text-dark-muted sm:mt-1 sm:text-sm">Kelola tugasmu dan tetap produktif</p>
        </div>
        <button
          onClick={openCreateForm}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-primary/80 sm:px-4 sm:py-2.5 sm:text-sm"
        >
          <Plus size={16} />
          Tambah Tugas
        </button>
      </div>

      {/* Stats */}
      <TodoStats />

      {/* Todo List */}
      {isLoading ? (
        <LoadingSpinner className="py-16" size={40} />
      ) : (
        <TodoList
          todos={todos ?? []}
          isLoading={false}
          onStatusToggle={handleStatusToggle}
          onEdit={openEditForm}
          onDelete={handleDelete}
          onQuickAdd={handleQuickAdd}
        />
      )}

      {/* Modal Form */}
      <TodoForm
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={handleSubmit}
        initialData={editingTodo}
        isSubmitting={createTodo.isPending || updateTodo.isPending}
      />
    </div>
  );
}
