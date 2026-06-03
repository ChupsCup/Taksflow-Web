import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { TRANSACTION_CATEGORIES, type Transaction } from '../../types';
import { cn } from '../../lib/utils';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => void;
  transaction?: Transaction | null;
}

export function TransactionForm({ isOpen, onClose, onSubmit, transaction }: TransactionFormProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setCategory(transaction.category);
      setAmount(String(transaction.amount));
      setDescription(transaction.description);
      setDate(transaction.date.split('T')[0]);
    } else {
      setType('expense');
      setCategory('');
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [transaction, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      type,
      category,
      amount: Number(amount),
      description,
      date: new Date(date).toISOString(),
    });
  };

  const incomeCategories = TRANSACTION_CATEGORIES.filter((c) =>
    ['Gaji', 'Freelance', 'Investasi', 'Tabungan', 'Lainnya'].includes(c)
  );
  const expenseCategories = TRANSACTION_CATEGORIES.filter(
    (c) => !['Gaji', 'Freelance', 'Investasi', 'Tabungan'].includes(c)
  );
  const filteredCategories = type === 'income' ? incomeCategories : expenseCategories;

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
            {transaction ? 'Edit Transaksi' : 'Tambah Transaksi'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-dark-muted transition-colors hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Toggle */}
          <div className="flex gap-2 rounded-lg bg-dark-bg p-1">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={cn(
                'flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                type === 'expense'
                  ? 'bg-accent-pink text-white'
                  : 'text-dark-muted hover:text-white'
              )}
            >
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={cn(
                'flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors',
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
            <label className="mb-1.5 block text-sm text-dark-muted">Kategori</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full rounded-lg border border-dark-border bg-dark-bg px-3 py-2 text-sm text-white outline-none transition-colors focus:border-primary"
            >
              <option value="">Pilih kategori</option>
              {filteredCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="mb-1.5 block text-sm text-dark-muted">Jumlah (Rp)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              min="0"
              required
              className="w-full rounded-lg border border-dark-border bg-dark-bg px-3 py-2 text-sm text-white outline-none transition-colors focus:border-primary"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm text-dark-muted">Deskripsi</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi transaksi"
              required
              className="w-full rounded-lg border border-dark-border bg-dark-bg px-3 py-2 text-sm text-white outline-none transition-colors focus:border-primary"
            />
          </div>

          {/* Date */}
          <div>
            <label className="mb-1.5 block text-sm text-dark-muted">Tanggal</label>
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
