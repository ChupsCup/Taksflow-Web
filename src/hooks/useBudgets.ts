import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { BudgetLimit } from '../types';

export function useBudgets() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['budgets', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('budget_limits')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data as BudgetLimit[];
    },
    enabled: !!user,
  });
}

export function useUpsertBudget() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (budget: { category: string; amount: number; period: 'monthly' | 'yearly' }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('budget_limits')
        .upsert([{ ...budget, user_id: user.id }], {
          onConflict: 'user_id,category,period',
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('budget_limits').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}
