import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, isAfter, startOfMonth, endOfMonth } from 'date-fns';
import { id } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  try {
    return format(parseISO(dateStr), 'dd MMM yyyy', { locale: id });
  } catch {
    return dateStr;
  }
}

export function formatDateShort(dateStr: string | null): string {
  if (!dateStr) return '-';
  try {
    return format(parseISO(dateStr), 'dd/MM/yyyy');
  } catch {
    return dateStr;
  }
}

export function getMonthRange(date: Date = new Date()) {
  return {
    start: startOfMonth(date).toISOString(),
    end: endOfMonth(date).toISOString(),
  };
}

export function isOverdue(dateStr: string | null): boolean {
  if (!dateStr) return false;
  try {
    return isAfter(new Date(), parseISO(dateStr));
  } catch {
    return false;
  }
}

const DEFAULT_CATEGORIES = ['Pekerjaan', 'Pribadi', 'Belajar', 'Kesehatan', 'Keuangan', 'Rumah', 'Lainnya'];
const CAT_STORAGE_KEY = 'taksflow-todo-categories';

export function getTodoCategories(): string[] {
  try {
    const raw = localStorage.getItem(CAT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [...DEFAULT_CATEGORIES];
}

export function saveTodoCategories(categories: string[]): void {
  try {
    localStorage.setItem(CAT_STORAGE_KEY, JSON.stringify(categories));
  } catch {}
}

export function addTodoCategory(name: string): string[] {
  const cats = getTodoCategories();
  if (!cats.includes(name)) {
    cats.push(name);
    saveTodoCategories(cats);
  }
  return cats;
}

export function removeTodoCategory(name: string): string[] {
  const cats = getTodoCategories().filter((c) => c !== name);
  saveTodoCategories(cats);
  return cats;
}

export function daysUntil(dateStr: string | null): number {
  if (!dateStr) return Infinity;
  try {
    const now = new Date();
    const target = parseISO(dateStr);
    const diff = target.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  } catch {
    return Infinity;
  }
}
