import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { isOverdue } from '../lib/utils';
import type { Todo, TodoStats } from '../types';

export function useTodos() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['todos', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Todo[];
    },
    enabled: !!user,
  });
}

export function useTodosStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['todos_stats', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      const todos = data as Todo[];

      const total = todos.length;
      const done = todos.filter((t) => t.status === 'done').length;
      const inProgress = todos.filter((t) => t.status === 'in_progress').length;
      const pending = todos.filter((t) => t.status === 'pending').length;
      const overdue = todos.filter((t) => t.status !== 'done' && isOverdue(t.due_date)).length;
      const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

      return { total, done, inProgress, pending, overdue, completionRate } satisfies TodoStats;
    },
    enabled: !!user,
  });
}

export function useCreateTodo() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (todo: Omit<Todo, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('todos')
        .insert([{ ...todo, user_id: user.id }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['todos_stats'] });
    },
  });
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Todo> & { id: string }) => {
      const { data, error } = await supabase
        .from('todos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['todos_stats'] });
    },
  });
}

export function useDeleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('todos').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['todos_stats'] });
    },
  });
}
