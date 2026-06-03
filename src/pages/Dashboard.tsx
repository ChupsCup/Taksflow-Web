import { Wallet, Briefcase, CheckSquare, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useTransactions } from '../hooks/useTransactions';
import { useJobsStats } from '../hooks/useJobApplications';
import { useTodosStats } from '../hooks/useTodos';
import { formatCurrency } from '../lib/utils';
import { getMonthRange } from '../lib/utils';

export default function Dashboard() {
  const { start, end } = getMonthRange();
  const { data: transactions, isLoading: txLoading } = useTransactions(start, end);
  const { data: jobsStats, isLoading: jobsLoading } = useJobsStats();
  const { data: todoStats, isLoading: todoLoading } = useTodosStats();

  const income = transactions?.filter((t) => t.type === 'income').reduce((a, b) => a + b.amount, 0) ?? 0;
  const expense = transactions?.filter((t) => t.type === 'expense').reduce((a, b) => a + b.amount, 0) ?? 0;
  const balance = income - expense;

  const isLoading = txLoading || jobsLoading || todoLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-dark-muted">Ringkasan aktivitas bulan ini</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Pemasukan Bulan Ini"
          value={formatCurrency(income)}
          icon={TrendingUp}
          iconColor="#3ECFA8"
        />
        <StatCard
          title="Pengeluaran Bulan Ini"
          value={formatCurrency(expense)}
          icon={TrendingDown}
          iconColor="#F76A8A"
        />
        <StatCard
          title="Saldo"
          value={formatCurrency(balance)}
          icon={Wallet}
          iconColor="#7C6AF7"
          className="sm:col-span-2 lg:col-span-1"
        />
      </div>

      {/* Module Summaries */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Jobs Summary */}
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Briefcase size={20} />
            </div>
            <h2 className="font-semibold text-white">Lamaran Kerja</h2>
          </div>
          {jobsStats ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-dark-hover p-3 text-center">
                <p className="text-2xl font-bold text-white">{jobsStats.total}</p>
                <p className="text-xs text-dark-muted">Total Lamaran</p>
              </div>
              <div className="rounded-lg bg-dark-hover p-3 text-center">
                <p className="text-2xl font-bold text-secondary">{jobsStats.responseRate}%</p>
                <p className="text-xs text-dark-muted">Response Rate</p>
              </div>
              <div className="rounded-lg bg-dark-hover p-3 text-center">
                <p className="text-2xl font-bold text-accent-orange">{jobsStats.interviewRate}%</p>
                <p className="text-xs text-dark-muted">Interview Rate</p>
              </div>
              <div className="rounded-lg bg-dark-hover p-3 text-center">
                <p className="text-2xl font-bold text-primary">{jobsStats.saved}</p>
                <p className="text-xs text-dark-muted">Tersimpan</p>
              </div>
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-dark-muted">
              Belum ada data lamaran
            </p>
          )}
        </Card>

        {/* Todos Summary */}
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded-lg bg-secondary/10 p-2 text-secondary">
              <CheckSquare size={20} />
            </div>
            <h2 className="font-semibold text-white">Todo List</h2>
          </div>
          {todoStats ? (
            <>
              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-dark-muted">Progress</span>
                  <span className="font-medium text-white">{todoStats.completionRate}%</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-dark-hover">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${todoStats.completionRate}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-dark-hover p-3 text-center">
                  <p className="text-2xl font-bold text-white">{todoStats.total}</p>
                  <p className="text-xs text-dark-muted">Total</p>
                </div>
                <div className="rounded-lg bg-dark-hover p-3 text-center">
                  <p className="text-2xl font-bold text-secondary">{todoStats.done}</p>
                  <p className="text-xs text-dark-muted">Selesai</p>
                </div>
                <div className="rounded-lg bg-dark-hover p-3 text-center">
                  <p className="text-2xl font-bold text-accent-orange">{todoStats.pending}</p>
                  <p className="text-xs text-dark-muted">Pending</p>
                </div>
              </div>
              {todoStats.overdue > 0 && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-accent-pink/10 px-3 py-2 text-sm text-accent-pink">
                  <Calendar size={14} />
                  {todoStats.overdue} tugas terlambat!
                </div>
              )}
            </>
          ) : (
            <p className="py-6 text-center text-sm text-dark-muted">
              Belum ada data tugas
            </p>
          )}
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-lg bg-accent-orange/10 p-2 text-accent-orange">
            <Wallet size={20} />
          </div>
          <h2 className="font-semibold text-white">Transaksi Terbaru</h2>
        </div>
        {transactions && transactions.length > 0 ? (
          <div className="space-y-2">
            {transactions.slice(0, 5).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-lg bg-dark-hover px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {tx.description || tx.category}
                  </p>
                  <p className="text-xs text-dark-muted">{tx.category}</p>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    tx.type === 'income' ? 'text-secondary' : 'text-accent-pink'
                  }`}
                >
                  {tx.type === 'income' ? '+' : '-'}
                  {formatCurrency(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-dark-muted">
            Belum ada transaksi bulan ini
          </p>
        )}
      </Card>
    </div>
  );
}
