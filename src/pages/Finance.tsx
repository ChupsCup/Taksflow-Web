import { useState, useMemo } from 'react';
import {
  Plus,
  Wallet,
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  useTransactions,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
} from '../hooks/useTransactions';
import { useBudgets, useUpsertBudget, useDeleteBudget } from '../hooks/useBudgets';
import { getMonthRange, formatCurrency } from '../lib/utils';
import { CATEGORY_COLORS } from '../types';
import type { Transaction, CategoryTotals } from '../types';
import { StatCard } from '../components/ui/StatCard';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { TransactionForm } from '../components/finance/TransactionForm';
import { TransactionTable } from '../components/finance/TransactionTable';
import { FinanceChart } from '../components/finance/FinanceChart';
import { BudgetCard } from '../components/finance/BudgetCard';
import { BudgetForm } from '../components/finance/BudgetForm';

export default function Finance() {
  // Stable date references (memoized so query keys don't change every render)
  const todayRef = useMemo(() => new Date(), []);

  // ── Month Filter ──
  const [filterMonth, setFilterMonth] = useState(todayRef.getMonth());
  const [filterYear, setFilterYear] = useState(todayRef.getFullYear());

  // ── Modal State ──
  const [txFormOpen, setTxFormOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [budgetFormOpen, setBudgetFormOpen] = useState(false);

  // ── Date Ranges ──
  const filterDate = new Date(filterYear, filterMonth, 1);
  const monthRange = getMonthRange(filterDate);

  // ── Queries ──
  const { data: transactions, isLoading: txLoading } = useTransactions(
    monthRange.start,
    monthRange.end
  );
  const { data: allTransactions } = useTransactions();
  const { data: budgets, isLoading: budgetLoading } = useBudgets();

  // ── Mutations ──
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();
  const upsertBudget = useUpsertBudget();
  const deleteBudget = useDeleteBudget();

  // ── Computed Stats ──
  const totalIncome = useMemo(
    () =>
      transactions?.reduce(
        (sum, tx) => (tx.type === 'income' ? sum + tx.amount : sum),
        0
      ) ?? 0,
    [transactions]
  );

  const totalExpense = useMemo(
    () =>
      transactions?.reduce(
        (sum, tx) => (tx.type === 'expense' ? sum + tx.amount : sum),
        0
      ) ?? 0,
    [transactions]
  );

  const runningIncome = useMemo(
    () =>
      allTransactions?.reduce(
        (sum, tx) => (tx.type === 'income' ? sum + tx.amount : sum),
        0
      ) ?? 0,
    [allTransactions]
  );
  const runningExpense = useMemo(
    () =>
      allTransactions?.reduce(
        (sum, tx) => (tx.type === 'expense' ? sum + tx.amount : sum),
        0
      ) ?? 0,
    [allTransactions]
  );
  const balance = runningIncome - runningExpense;

  const hasTransactions = transactions && transactions.length > 0;

  // ── PieCharts: Income & Expense by Category ──
  const incomeData: CategoryTotals[] = useMemo(() => {
    if (!transactions) return [];
    const byCategory: Record<string, number> = {};
    let total = 0;

    for (const tx of transactions) {
      if (tx.type === 'income') {
        byCategory[tx.category] = (byCategory[tx.category] || 0) + tx.amount;
        total += tx.amount;
      }
    }

    return Object.entries(byCategory)
      .map(([category, amount]) => ({
        category,
        total: amount,
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
        color: CATEGORY_COLORS[category] || '#6b6b80',
      }))
      .sort((a, b) => b.total - a.total);
  }, [transactions]);

  const expenseData: CategoryTotals[] = useMemo(() => {
    if (!transactions) return [];
    const byCategory: Record<string, number> = {};
    let total = 0;

    for (const tx of transactions) {
      if (tx.type === 'expense') {
        byCategory[tx.category] = (byCategory[tx.category] || 0) + tx.amount;
        total += tx.amount;
      }
    }

    return Object.entries(byCategory)
      .map(([category, amount]) => ({
        category,
        total: amount,
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
        color: CATEGORY_COLORS[category] || '#6b6b80',
      }))
      .sort((a, b) => b.total - a.total);
  }, [transactions]);

  // ── Budget Spending ──
  const categorySpending = useMemo(() => {
    if (!transactions) return {};
    const spending: Record<string, number> = {};
    for (const tx of transactions) {
      if (tx.type === 'expense') {
        spending[tx.category] = (spending[tx.category] || 0) + tx.amount;
      }
    }
    return spending;
  }, [transactions]);

  // ── Handlers ──
  const handleTxSubmit = (data: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => {
    if (editingTx) {
      updateTransaction.mutate({ id: editingTx.id, ...data });
    } else {
      createTransaction.mutate(data);
    }
    setTxFormOpen(false);
    setEditingTx(null);
  };

  const handleEditTx = (tx: Transaction) => {
    setEditingTx(tx);
    setTxFormOpen(true);
  };

  const handleDeleteTx = (id: string) => {
    deleteTransaction.mutate(id);
  };

  const openAddTx = () => {
    setEditingTx(null);
    setTxFormOpen(true);
  };

  const handleBudgetSubmit = (data: {
    category: string;
    amount: number;
    period: 'monthly' | 'yearly';
  }) => {
    upsertBudget.mutate(data);
    setBudgetFormOpen(false);
  };

  const handleDeleteBudget = (id: string) => {
    deleteBudget.mutate(id);
  };

  const showLoading = txLoading && !transactions;

  if (showLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-white">Keuangan</h1>
        <p className="mt-0.5 text-xs text-dark-muted">
          Kelola pemasukan, pengeluaran, dan budget bulanan
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard
          title="Total Pemasukan"
          value={formatCurrency(totalIncome)}
          icon={TrendingUp}
          iconColor="#3ECFA8"
        />
        <StatCard
          title="Total Pengeluaran"
          value={formatCurrency(totalExpense)}
          icon={TrendingDown}
          iconColor="#F76A8A"
        />
        <StatCard
          title="Saldo"
          value={formatCurrency(balance)}
          icon={Wallet}
          iconColor="#7C6AF7"
          trend={
            balance >= 0
              ? { value: 'Positif', positive: true }
              : { value: 'Defisit', positive: false }
          }
        />
      </div>

      {/* Budget + Transaction: side by side */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Budget Section - Left */}
        <div className="min-w-0">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Budget Bulanan</h2>
            <button
              onClick={() => setBudgetFormOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-dark"
            >
              <Plus size={14} />
              Tambah
            </button>
          </div>

          {budgetLoading ? (
            <LoadingSpinner className="py-4" size={24} />
          ) : budgets && budgets.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {budgets.map((budget) => (
                <BudgetCard
                  key={budget.id}
                  budget={budget}
                  spent={categorySpending[budget.category] || 0}
                  onDelete={handleDeleteBudget}
                />
              ))}
            </div>
          ) : (
            <Card>
              <EmptyState
                icon={Wallet}
                title="Belum ada budget"
                description="Atur batas pengeluaran per kategori untuk membantu mengelola keuangan."
                action={{
                  label: 'Tambah Budget',
                  onClick: () => setBudgetFormOpen(true),
                }}
              />
            </Card>
          )}
        </div>

        {/* Transaction Section - Right */}
        <div className="min-w-0">
          <TransactionTable
            transactions={transactions}
            isLoading={txLoading}
            selectedMonth={filterMonth}
            selectedYear={filterYear}
            onMonthChange={setFilterMonth}
            onYearChange={setFilterYear}
            onAdd={openAddTx}
            onEdit={handleEditTx}
            onDelete={handleDeleteTx}
          />
        </div>
      </div>

      {/* Charts Section */}
      {hasTransactions ? (
        <FinanceChart incomeData={incomeData} expenseData={expenseData} />
      ) : (
        <Card>
          <EmptyState
            icon={PieChartIcon}
            title="Belum ada transaksi bulan ini"
            description="Tambahkan transaksi untuk melihat grafik pengeluaran per kategori."
            action={{ label: 'Tambah Transaksi', onClick: openAddTx }}
          />
        </Card>
      )}

      {/* Modals */}
      <TransactionForm
        isOpen={txFormOpen}
        onClose={() => {
          setTxFormOpen(false);
          setEditingTx(null);
        }}
        onSubmit={handleTxSubmit}
        transaction={editingTx}
      />

      <BudgetForm
        isOpen={budgetFormOpen}
        onClose={() => setBudgetFormOpen(false)}
        onSubmit={handleBudgetSubmit}
      />
    </div>
  );
}
