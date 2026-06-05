import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { Transaction } from '../../types';

import { formatCurrency, formatDate, cn } from '../../lib/utils';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface TransactionTableProps {
  transactions: Transaction[] | undefined;
  isLoading: boolean;
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  onAdd: () => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

function getYearOptions(): number[] {
  const current = new Date().getFullYear();
  return Array.from({ length: 6 }, (_, i) => current - i);
}

export function TransactionTable({
  transactions,
  isLoading,
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  onAdd,
  onEdit,
  onDelete,
}: TransactionTableProps) {
  const hasTransactions = transactions && transactions.length > 0;

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <select
            value={selectedMonth}
            onChange={(e) => onMonthChange(Number(e.target.value))}
            className="rounded-lg border border-dark-border bg-dark-card px-2.5 py-1.5 text-xs text-white outline-none transition-colors focus:border-primary"
          >
            {MONTHS.map((name, idx) => (
              <option key={idx} value={idx}>
                {name}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(Number(e.target.value))}
            className="rounded-lg border border-dark-border bg-dark-card px-2.5 py-1.5 text-xs text-white outline-none transition-colors focus:border-primary"
          >
            {getYearOptions().map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-dark"
        >
          <Plus size={14} />
          Tambah
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSpinner className="py-12" size={36} />
      ) : !hasTransactions ? (
        <EmptyState
          icon={Trash2}
          title="Belum ada transaksi"
          description="Tambahkan transaksi pertama kamu untuk mulai melacak keuangan."
          action={{ label: 'Tambah Transaksi', onClick: onAdd }}
        />
      ) : (
        <div className="min-w-0 overflow-x-auto rounded-xl border border-dark-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-dark-border bg-dark-hover text-dark-muted">
                  <th className="px-3 py-2 text-xs font-medium">Tanggal</th>
                <th className="hidden px-3 py-2 text-xs font-medium sm:table-cell">Deskripsi</th>
                <th className="px-3 py-2 text-xs font-medium">Kategori</th>
                <th className="px-3 py-2 text-right text-xs font-medium">Jumlah</th>
                <th className="sticky right-0 z-[1] bg-dark-hover px-3 py-2 text-center text-xs font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {transactions?.map((tx) => (
                <tr
                  key={tx.id}
                  className="border-b border-dark-border transition-colors last:border-none hover:bg-dark-hover"
                >
                  <td className="whitespace-nowrap px-3 py-2 text-xs text-white">
                    {formatDate(tx.date)}
                  </td>
                  <td className="hidden px-3 py-2 text-xs text-white sm:table-cell">{tx.description}</td>
                  <td className="px-3 py-2">
                    <Badge variant={tx.type === 'income' ? 'secondary' : 'pink'} className="text-[10px]">
                      {tx.category}
                    </Badge>
                  </td>
                  <td
                    className={cn(
                      'whitespace-nowrap px-3 py-2 text-right text-xs font-medium',
                      tx.type === 'income' ? 'text-secondary' : 'text-accent-pink'
                    )}
                  >
                    {tx.type === 'income' ? '+' : '-'}
                    {formatCurrency(tx.amount)}
                  </td>
                  <td className="sticky right-0 z-[1] bg-dark-bg whitespace-nowrap px-3 py-2">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onEdit(tx)}
                        className="rounded-lg p-2 text-dark-muted transition-colors hover:bg-dark-border hover:text-white"
                        title="Edit"
                      >
                        <Pencil size={20} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Hapus transaksi ini?')) {
                            onDelete(tx.id);
                          }
                        }}
                        className="rounded-lg p-2 text-dark-muted transition-colors hover:bg-dark-border hover:text-accent-pink"
                        title="Hapus"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
