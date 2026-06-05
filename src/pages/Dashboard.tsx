import { useState, useRef } from 'react';
import { Wallet, Briefcase, CheckSquare, TrendingUp, TrendingDown, Calendar, Settings, Moon, Sun, Image, Download, LogOut, Upload } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useTransactions } from '../hooks/useTransactions';
import { useJobsStats } from '../hooks/useJobApplications';
import { useTodosStats } from '../hooks/useTodos';
import { formatCurrency, getMonthRange } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Dashboard() {
  const { start, end } = getMonthRange();
  const { data: transactions, isLoading: txLoading } = useTransactions(start, end);
  const { data: jobsStats, isLoading: jobsLoading } = useJobsStats();
  const { data: todoStats, isLoading: todoLoading } = useTodosStats();

  const income = transactions?.filter((t) => t.type === 'income').reduce((a, b) => a + b.amount, 0) ?? 0;
  const expense = transactions?.filter((t) => t.type === 'expense').reduce((a, b) => a + b.amount, 0) ?? 0;
  const balance = income - expense;

  const { signOut } = useAuth();
  const { theme, toggleTheme, wallpaper, setWallpaper } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const isLoading = txLoading || jobsLoading || todoLoading;

  function handleWallpaper(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setWallpaper(reader.result as string);
    reader.readAsDataURL(file);
  }

  function exportCSV() {
    if (!transactions || transactions.length === 0) {
      alert('Belum ada data transaksi untuk diekspor.');
      return;
    }
    const rows = [['Tanggal', 'Jenis', 'Kategori', 'Deskripsi', 'Jumlah']];
    for (const t of transactions) {
      rows.push([t.date, t.type === 'income' ? 'Pemasukan' : 'Pengeluaran', t.category, t.description || '', String(t.amount)]);
    }
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'taksflow-transaksi.csv';
    a.click();
    URL.revokeObjectURL(url);
    setMenuOpen(false);
  }

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
      <div className="relative flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="mt-1 text-sm text-dark-muted">Ringkasan aktivitas bulan ini</p>
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg p-2 text-dark-muted transition-colors hover:bg-dark-hover hover:text-white"
            title="Pengaturan"
          >
            <Settings size={20} />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full z-40 mt-2 w-48 overflow-hidden rounded-xl border border-dark-border bg-dark-card shadow-xl">
                <button
                  onClick={() => { toggleTheme(); setMenuOpen(false); }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm text-white transition-colors hover:bg-dark-hover"
                >
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                  {theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
                </button>

                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm text-white transition-colors hover:bg-dark-hover"
                >
                  {wallpaper ? <Upload size={18} /> : <Image size={18} />}
                  {wallpaper ? 'Ganti Latar' : 'Pasang Latar'}
                </button>

                <button
                  onClick={exportCSV}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm text-white transition-colors hover:bg-dark-hover"
                >
                  <Download size={18} />
                  Ekspor CSV
                </button>

                <div className="h-px bg-dark-border" />

                <button
                  onClick={() => { signOut(); setMenuOpen(false); }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm text-accent-pink transition-colors hover:bg-dark-hover"
                >
                  <LogOut size={18} />
                  Keluar
                </button>
              </div>
            </>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleWallpaper}
          />
        </div>
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
            <h2 className="font-semibold text-white">Daftar Tugas</h2>
          </div>
          {todoStats ? (
            <>
              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-dark-muted">Progres</span>
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
                  <p className="text-xs text-dark-muted">Menunggu</p>
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
