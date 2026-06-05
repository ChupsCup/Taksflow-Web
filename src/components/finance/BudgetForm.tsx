import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { TRANSACTION_CATEGORIES } from '../../types';
import { CategorySelect } from '../ui/CategorySelect';

interface BudgetFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { category: string; amount: number; period: 'monthly' | 'yearly' }) => void;
  existingCategory?: string;
}

const expenseCategories = TRANSACTION_CATEGORIES.filter(
  (c) => !['Gaji', 'Freelance', 'Investasi', 'Tabungan', 'Lainnya'].includes(c)
);

function formatWithDots(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function BudgetForm({ isOpen, onClose, onSubmit, existingCategory }: BudgetFormProps) {
  const [category, setCategory] = useState('');
  const [amountDisplay, setAmountDisplay] = useState('');
  const [amountRaw, setAmountRaw] = useState('');
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    if (existingCategory) {
      setCategory(existingCategory);
    } else {
      setCategory('');
    }
    setAmountRaw('');
    setAmountDisplay('');
    setPeriod('monthly');
  }, [existingCategory, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountRaw) return;
    onSubmit({
      category,
      amount: Number(amountRaw),
      period,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-dark-border bg-dark-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            {existingCategory ? 'Edit Budget' : 'Tambah Budget'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-dark-muted transition-colors hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category */}
          <div>
            <label className="mb-1.5 block text-xs sm:text-sm text-dark-muted">Kategori</label>
            <CategorySelect
              categories={expenseCategories}
              value={category}
              onChange={(val) => setCategory(val)}
              required
              storageKey="transaction-expense"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="mb-1.5 block text-xs sm:text-sm text-dark-muted">Batas Budget (Rp)</label>
            <input
              type="text"
              inputMode="numeric"
              value={amountDisplay}
              onChange={(e) => {
                const raw = e.target.value.replace(/\./g, '').replace(/\D/g, '');
                setAmountRaw(raw);
                setAmountDisplay(formatWithDots(raw));
              }}
              placeholder="0"
              required
              className="w-full rounded-lg border border-dark-border bg-dark-bg px-3 py-2 text-base sm:text-sm text-white outline-none transition-colors focus:border-primary"
            />
          </div>

          {/* Period */}
          <div>
            <label className="mb-1.5 block text-xs sm:text-sm text-dark-muted">Periode</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as 'monthly' | 'yearly')}
              className="w-full rounded-lg border border-dark-border bg-dark-bg px-3 py-2 text-base sm:text-sm text-white outline-none transition-colors focus:border-primary"
            >
              <option value="monthly">Bulanan</option>
              <option value="yearly">Tahunan</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-base sm:text-sm font-medium text-white transition-colors hover:bg-primary-dark"
          >
            Simpan Budget
          </button>
        </form>
      </div>
    </div>
  );
}
