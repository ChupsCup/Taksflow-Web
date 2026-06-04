import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { TRANSACTION_CATEGORIES, type Transaction } from '../../types';
import { cn } from '../../lib/utils';
import { CategorySelect } from '../ui/CategorySelect';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => void;
  transaction?: Transaction | null;
}

function formatWithDots(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function parseDotted(value: string): string {
  return value.replace(/\./g, '');
}

// 'Lainnya' di-exclude karena ada opsi custom "+ Lainnya..." di dropdown
const BASE_INCOME = ['Gaji', 'Freelance', 'Investasi', 'Tabungan'];
const BASE_EXPENSE = TRANSACTION_CATEGORIES.filter(
  (c) => !BASE_INCOME.includes(c) && c !== 'Lainnya'
);
const INCOME_CATEGORIES = BASE_INCOME.filter((c) => c !== 'Lainnya');
const EXPENSE_CATEGORIES = BASE_EXPENSE;

export function TransactionForm({ isOpen, onClose, onSubmit, transaction }: TransactionFormProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('');
  const [amountDisplay, setAmountDisplay] = useState('');
  const [amountRaw, setAmountRaw] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setCategory(transaction.category);
      const raw = String(transaction.amount);
      setAmountRaw(raw);
      setAmountDisplay(formatWithDots(raw));
      setDescription(transaction.description);
      setDate(transaction.date.split('T')[0]);
    } else {
      setType('expense');
      setCategory('');
      setAmountRaw('');
      setAmountDisplay('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [transaction, isOpen]);

  if (!isOpen) return null;

  const selectCategories =
    type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !amountRaw) return;
    onSubmit({
      type,
      category,
      amount: Number(amountRaw),
      description,
      date: new Date(date).toISOString(),
    });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = parseDotted(e.target.value).replace(/\D/g, '');
    setAmountRaw(raw);
    setAmountDisplay(formatWithDots(raw));
  };

  const switchType = (newType: 'income' | 'expense') => {
    setType(newType);
    setCategory('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-dark-border bg-dark-card p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">
            {transaction ? 'Edit Transaksi' : 'Tambah Transaksi'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-dark-muted transition-colors hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Type Toggle */}
          <div className="flex gap-2 rounded-lg bg-dark-bg p-1">
            <button
              type="button"
              onClick={() => switchType('expense')}
              className={cn(
                'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                type === 'expense'
                  ? 'bg-accent-pink text-white'
                  : 'text-dark-muted hover:text-white'
              )}
            >
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => switchType('income')}
              className={cn(
                'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                type === 'income'
                  ? 'bg-secondary text-white'
                  : 'text-dark-muted hover:text-white'
              )}
            >
              Pemasukan
            </button>
          </div>

          {/* Category */}
          <div>
            <label className="mb-1.5 block text-xs text-dark-muted">Kategori</label>
            <CategorySelect
              key={type}
              categories={selectCategories}
              value={category}
              onChange={(val) => setCategory(val)}
              required
              storageKey={`transaction-${type}`}
            />
          </div>

          {/* Amount */}
          <div>
            <label className="mb-1.5 block text-xs text-dark-muted">Jumlah (Rp)</label>
            <input
              type="text"
              inputMode="numeric"
              value={amountDisplay}
              onChange={handleAmountChange}
              placeholder="0"
              required
              className="w-full rounded-lg border border-dark-border bg-dark-bg px-3 py-2 text-sm text-white outline-none transition-colors focus:border-primary"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-xs text-dark-muted">
              Deskripsi <span className="text-dark-muted/50">(opsional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi transaksi"
              className="w-full rounded-lg border border-dark-border bg-dark-bg px-3 py-2 text-sm text-white outline-none transition-colors focus:border-primary"
            />
          </div>

          {/* Date */}
          <div>
            <label className="mb-1.5 block text-xs text-dark-muted">Tanggal</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full rounded-lg border border-dark-border bg-dark-bg px-3 py-2 text-sm text-white outline-none transition-colors focus:border-primary"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
          >
            {transaction ? 'Simpan Perubahan' : 'Tambah Transaksi'}
          </button>
        </form>
      </div>
    </div>
  );
}
