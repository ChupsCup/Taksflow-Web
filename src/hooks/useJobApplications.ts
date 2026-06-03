import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { JobApplication, JobsStats } from '../types';

export function useJobApplications() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['job_applications', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as JobApplication[];
    },
    enabled: !!user,
  });
}

export function useJobsStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['job_applications_stats', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      const apps = data as JobApplication[];

      const total = apps.length;
      const saved = apps.filter((a) => a.status === 'saved').length;
      const applied = apps.filter((a) => a.status === 'applied').length;
      const interview = apps.filter((a) => a.status === 'interview').length;
      const offer = apps.filter((a) => a.status === 'offer').length;
      const accepted = apps.filter((a) => a.status === 'accepted').length;
      const rejected = apps.filter((a) => a.status === 'rejected').length;

      const responded = apps.filter((a) => a.response_received).length;
      const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;
      const interviewRate =
        total > 0 ? Math.round(((interview + offer + accepted) / total) * 100) : 0;

      return {
        total, saved, applied, interview, offer, accepted, rejected,
        responseRate, interviewRate,
      } satisfies JobsStats;
    },
    enabled: !!user,
  });
}

export function useCreateJobApplication() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (app: Omit<JobApplication, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('job_applications')
        .insert([{ ...app, user_id: user.id }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job_applications'] });
      queryClient.invalidateQueries({ queryKey: ['job_applications_stats'] });
    },
  });
}

export function useUpdateJobApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<JobApplication> & { id: string }) => {
      const { data, error } = await supabase
        .from('job_applications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job_applications'] });
      queryClient.invalidateQueries({ queryKey: ['job_applications_stats'] });
    },
  });
}

export function useDeleteJobApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('job_applications').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job_applications'] });
      queryClient.invalidateQueries({ queryKey: ['job_applications_stats'] });
    },
  });
}
