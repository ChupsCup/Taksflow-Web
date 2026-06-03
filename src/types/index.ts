// ─── Finance Types ───
export interface Transaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  created_at: string;
}

export interface BudgetLimit {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  period: 'monthly' | 'yearly';
  created_at: string;
}

export interface CategoryTotals {
  category: string;
  total: number;
  percentage: number;
  color: string;
}

export interface MonthlySummary {
  month: string;
  income: number;
  expense: number;
}

// ─── Job Application Types ───
export type ApplicationStatus = 'saved' | 'applied' | 'interview' | 'offer' | 'accepted' | 'rejected';

export interface JobApplication {
  id: string;
  user_id: string;
  company: string;
  position: string;
  location: string;
  salary_range: string;
  job_url: string;
  status: ApplicationStatus;
  applied_date: string | null;
  interview_date: string | null;
  offer_date: string | null;
  response_received: boolean;
  notes: string;
  created_at: string;
}

export interface JobsStats {
  total: number;
  applied: number;
  interview: number;
  offer: number;
  accepted: number;
  rejected: number;
  saved: number;
  responseRate: number;
  interviewRate: number;
}

// ─── Todo Types ───
export type TodoPriority = 'low' | 'medium' | 'high';
export type TodoStatus = 'pending' | 'in_progress' | 'done';

export interface Todo {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  priority: TodoPriority;
  status: TodoStatus;
  due_date: string | null;
  created_at: string;
}

export interface TodoStats {
  total: number;
  done: number;
  inProgress: number;
  pending: number;
  overdue: number;
  completionRate: number;
}

// ─── Shared ───
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  created_at: string;
}

// ─── Constants ───
export const TRANSACTION_CATEGORIES = [
  'Makanan & Minuman',
  'Transportasi',
  'Belanja',
  'Hiburan',
  'Tagihan & Utilitas',
  'Kesehatan',
  'Pendidikan',
  'Gaji',
  'Freelance',
  'Investasi',
  'Tabungan',
  'Lainnya',
] as const;

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  saved: 'Disimpan',
  applied: 'Sudah Lamar',
  interview: 'Interview',
  offer: 'Offer',
  accepted: 'Diterima',
  rejected: 'Ditolak',
};

export const TODO_CATEGORIES = [
  'Pekerjaan',
  'Pribadi',
  'Belajar',
  'Kesehatan',
  'Keuangan',
  'Rumah',
  'Lainnya',
] as const;

export const CATEGORY_COLORS: Record<string, string> = {
  'Makanan & Minuman': '#F76A8A',
  'Transportasi': '#F7A26A',
  'Belanja': '#7C6AF7',
  'Hiburan': '#3ECFA8',
  'Tagihan & Utilitas': '#F76A8A',
  'Kesehatan': '#F7A26A',
  'Pendidikan': '#7C6AF7',
  'Gaji': '#3ECFA8',
  'Freelance': '#7C6AF7',
  'Investasi': '#3ECFA8',
  'Tabungan': '#3ECFA8',
  'Lainnya': '#6b6b80',
};
