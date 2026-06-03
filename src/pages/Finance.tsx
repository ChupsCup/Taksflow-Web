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
import type { Transaction, MonthlySummary, CategoryTotals } from '../types';
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
  const today = new Date();

  // ── Month Filter ──
  const [filterMonth, setFilterMonth] = useState(today.getMonth());
  const [filterYear, setFilterYear] = useState(today.getFullYear());

  // ── Modal State ──
  const [txFormOpen, setTxFormOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [budgetFormOpen, setBudgetFormOpen] = useState(false);

  // ── Date Ranges ──
  const filterDate = new Date(filterYear, filterMonth, 1);
  const monthRange = getMonthRange(filterDate);

  const last12Months = new Date(today.getFullYear() - 1, today.getMonth(), 1);

  // ── Queries ──
  const { data: transactions, isLoading: txLoading } = useTransactions(
    monthRange.start,
    monthRange.end
  );
  const { data: allTransactions } = useTransactions(
    last12Months.toISOString(),
    today.toISOString()
  );
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

  const balance = totalIncome - totalExpense;

  const hasTransactions = transactions && transactions.length > 0;

  // ── BarChart: Monthly Data ──
  const monthlyData: MonthlySummary[] = useMemo(() => {
    if (!allTransactions) return [];
    const grouped: Record<string, { income: number; expense: number }> = {};

    for (const tx of allTransactions) {
      const d = new Date(tx.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!grouped[key]) grouped[key] = { income: 0, expense: 0 };
      if (tx.type === 'income') grouped[key].income += tx.amount;
      else grouped[key].expense += tx.amount;
    }

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
    ];

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, data]) => {
        const m = parseInt(key.split('-')[1], 10);
        return {
          month: monthNames[m - 1] || key,
          income: data.income,
          expense: data.expense,
        };
      });
  }, [allTransactions]);

  // ── PieChart: Expense by Category ──
  const categoryData: CategoryTotals[] = useMemo(() => {
    if (!transactions) return [];
    const expenseByCategory: Record<string, number> = {};
    let expenseTotal = 0;

    for (const tx of transactions) {
      if (tx.type === 'expense') {
        expenseByCategory[tx.category] =
          (expenseByCategory[tx.category] || 0) + tx.amount;
        expenseTotal += tx.amount;
      }
    }

    return Object.entries(expenseByCategory)
      .map(([category, total]) => ({
        category,
        total,
        percentage: expenseTotal > 0 ? Math.round((total / expenseTotal) * 100) : 0,
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

  // ── Loading State ──
  if (txLoading && !transactions) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Keuangan</h1>
          <p className="mt-1 text-sm text-dark-muted">
            Kelola pemasukan, pengeluaran, dan budget bulanan
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Pemasukan Bulan Ini"
          value={formatCurrency(totalIncome)}
          icon={TrendingUp}
          iconColor="#3ECFA8"
        />
        <StatCard
          title="Total Pengeluaran Bulan Ini"
          value={formatCurrency(totalExpense)}
          icon={TrendingDown}
          iconColor="#F76A8A"
        />
        <StatCard
          title="Saldo Bulan Ini"
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

      {/* Charts Section */}
      {hasTransactions ? (
        <FinanceChart monthlyData={monthlyData} categoryData={categoryData} />
      ) : (
        <Card className="p-5">
          <EmptyState
            icon={PieChartIcon}
            title="Belum ada data keuangan"
            description="Tambahkan transaksi untuk melihat grafik pemasukan dan pengeluaran."
            action={{ label: 'Tambah Transaksi', onClick: openAddTx }}
          />
        </Card>
      )}

      {/* Budget Section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Budget Bulanan</h2>
          <button
            onClick={() => setBudgetFormOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
          >
            <Plus size={16} />
            Tambah Budget
          </button>
        </div>

        {budgetLoading ? (
          <LoadingSpinner className="py-8" size={32} />
        ) : budgets && budgets.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          <Card className="p-5">
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

      {/* Transaction Section */}
      <div>
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
