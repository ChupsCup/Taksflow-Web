import { useState, useMemo } from 'react';
import {
  Plus,
  ArrowLeftRight,
  Wallet as WalletIcon,
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
import {
  useWallets,
  useCreateWallet,
  useUpdateWallet,
  useDeleteWallet,
} from '../hooks/useWallets';
import {
  useTransfers,
  useCreateTransfer,
  useDeleteTransfer,
} from '../hooks/useTransfers';
import { getMonthRange, formatCurrency, computeWalletBalances, cn } from '../lib/utils';
import { CATEGORY_COLORS } from '../types';
import type { Transaction, CategoryTotals, Wallet, WalletType } from '../types';
import { StatCard } from '../components/ui/StatCard';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { TransactionForm } from '../components/finance/TransactionForm';
import { TransactionTable } from '../components/finance/TransactionTable';
import { FinanceChart } from '../components/finance/FinanceChart';
import { BudgetCard } from '../components/finance/BudgetCard';
import { BudgetForm } from '../components/finance/BudgetForm';
import { WalletCard } from '../components/finance/WalletCard';
import { WalletForm } from '../components/finance/WalletForm';
import { TransferForm } from '../components/finance/TransferForm';
import { TransferHistory } from '../components/finance/TransferHistory';

type TxSubmitData = Omit<Transaction, 'id' | 'user_id' | 'created_at'>;
type WalletSubmitData = { name: string; type: WalletType; color: string };
type TransferSubmitData = {
  from_wallet_id: string;
  to_wallet_id: string;
  amount: number;
  date: string;
  note: string;
};

export default function Finance() {
  // Stable date references (memoized so query keys don't change every render)
  const todayRef = useMemo(() => new Date(), []);

  // ── Month Filter ──
  const [filterMonth, setFilterMonth] = useState(todayRef.getMonth());
  const [filterYear, setFilterYear] = useState(todayRef.getFullYear());

  // ── Wallet Filter ──
  const [selectedWalletId, setSelectedWalletId] = useState<string>('all');

  // ── Modal State ──
  const [txFormOpen, setTxFormOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [budgetFormOpen, setBudgetFormOpen] = useState(false);
  const [walletFormOpen, setWalletFormOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [transferFormOpen, setTransferFormOpen] = useState(false);

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
  const { data: wallets = [], isLoading: walletsLoading } = useWallets();
  const { data: transfers = [] } = useTransfers();

  // ── Mutations ──
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();
  const upsertBudget = useUpsertBudget();
  const deleteBudget = useDeleteBudget();
  const createWallet = useCreateWallet();
  const updateWallet = useUpdateWallet();
  const deleteWallet = useDeleteWallet();
  const createTransfer = useCreateTransfer();
  const deleteTransfer = useDeleteTransfer();

  // ── Wallet Balances (semua waktu) ──
  const walletBalances = useMemo(
    () => computeWalletBalances(allTransactions, transfers, wallets),
    [allTransactions, transfers, wallets]
  );

  const totalWalletBalance = useMemo(
    () => wallets.reduce((sum, w) => sum + (walletBalances[w.id] || 0), 0),
    [wallets, walletBalances]
  );

  // ── Filtered Transactions (per dompet terpilih) ──
  const filteredTransactions = useMemo(() => {
    if (!selectedWalletId || selectedWalletId === 'all') return transactions;
    return transactions?.filter((t) => t.wallet_id === selectedWalletId);
  }, [transactions, selectedWalletId]);

  // ── Computed Stats ──
  const totalIncome = useMemo(
    () =>
      filteredTransactions?.reduce(
        (sum, tx) => (tx.type === 'income' ? sum + tx.amount : sum),
        0
      ) ?? 0,
    [filteredTransactions]
  );

  const totalExpense = useMemo(
    () =>
      filteredTransactions?.reduce(
        (sum, tx) => (tx.type === 'expense' ? sum + tx.amount : sum),
        0
      ) ?? 0,
    [filteredTransactions]
  );

  const hasTransactions = filteredTransactions && filteredTransactions.length > 0;

  // ── PieCharts: Income & Expense by Category ──
  const incomeData: CategoryTotals[] = useMemo(() => {
    if (!filteredTransactions) return [];
    const byCategory: Record<string, number> = {};
    let total = 0;

    for (const tx of filteredTransactions) {
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
  }, [filteredTransactions]);

  const expenseData: CategoryTotals[] = useMemo(() => {
    if (!filteredTransactions) return [];
    const byCategory: Record<string, number> = {};
    let total = 0;

    for (const tx of filteredTransactions) {
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
  }, [filteredTransactions]);

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
  const handleTxSubmit = (data: TxSubmitData) => {
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

  const openAddWallet = () => {
    setEditingWallet(null);
    setWalletFormOpen(true);
  };

  const handleEditWallet = (wallet: Wallet) => {
    setEditingWallet(wallet);
    setWalletFormOpen(true);
  };

  const handleWalletSubmit = (data: WalletSubmitData) => {
    if (editingWallet) {
      updateWallet.mutate({ id: editingWallet.id, ...data });
    } else {
      createWallet.mutate(data);
    }
    setWalletFormOpen(false);
    setEditingWallet(null);
  };

  const handleDeleteWallet = (id: string) => {
    if (wallets.length <= 1) {
      window.alert('Dompet terakhir tidak bisa dihapus.');
      return;
    }
    if (!window.confirm('Hapus dompet ini?')) return;
    deleteWallet.mutate(id, {
      onError: (error) => {
        window.alert(error.message);
      },
    });
    if (selectedWalletId === id) setSelectedWalletId('all');
  };

  const handleTransferSubmit = (data: TransferSubmitData) => {
    createTransfer.mutate(data);
    setTransferFormOpen(false);
  };

  const handleDeleteTransfer = (id: string) => {
    deleteTransfer.mutate(id);
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
          Kelola pemasukan, pengeluaran, budget bulanan, dan dompet
        </p>
      </div>

      {/* Wallet Section */}
      <div>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-white">Dompet</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTransferFormOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-dark-border bg-dark-card px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-dark-hover"
            >
              <ArrowLeftRight size={14} />
              Transfer
            </button>
            <button
              onClick={openAddWallet}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-dark"
            >
              <Plus size={14} />
              Tambah Dompet
            </button>
          </div>
        </div>

        {walletsLoading ? (
          <LoadingSpinner className="py-6" size={24} />
        ) : wallets.length === 0 ? (
          <Card>
            <EmptyState
              icon={WalletIcon}
              title="Belum ada dompet"
              description="Bagi uang kamu ke beberapa dompet seperti Bank, GoPay, dan Cash agar saldo tiap tempat terlihat."
              action={{ label: 'Tambah Dompet', onClick: openAddWallet }}
            />
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {/* Semua Dompet */}
            <Card
              onClick={() => setSelectedWalletId('all')}
              className={cn(
                'p-4 transition-colors',
                selectedWalletId === 'all' ? 'border-primary/70 ring-1 ring-primary/60' : 'hover:border-dark-hover'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                    <WalletIcon size={15} style={{ color: '#7C6AF7' }} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">Semua Dompet</p>
                    <p className="text-[10px] text-dark-muted">Total</p>
                  </div>
                </div>
              </div>
              <p className="mt-2 text-lg font-semibold text-white sm:text-xl">
                {formatCurrency(totalWalletBalance)}
              </p>
            </Card>

            {wallets.map((wallet) => (
              <WalletCard
                key={wallet.id}
                wallet={wallet}
                balance={walletBalances[wallet.id] || 0}
                selected={selectedWalletId === wallet.id}
                onSelect={() =>
                  setSelectedWalletId((prev) => (prev === wallet.id ? 'all' : wallet.id))
                }
                onEdit={() => handleEditWallet(wallet)}
                onDelete={() => handleDeleteWallet(wallet.id)}
              />
            ))}
          </div>
        )}
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
          value={formatCurrency(totalWalletBalance)}
          icon={WalletIcon}
          iconColor="#7C6AF7"
          trend={
            totalWalletBalance >= 0
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
                icon={WalletIcon}
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
            transactions={filteredTransactions}
            isLoading={txLoading}
            selectedMonth={filterMonth}
            selectedYear={filterYear}
            onMonthChange={setFilterMonth}
            onYearChange={setFilterYear}
            onAdd={openAddTx}
            onEdit={handleEditTx}
            onDelete={handleDeleteTx}
            wallets={wallets}
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

      {/* Transfer History */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Riwayat Transfer</h2>
        </div>
        <TransferHistory
          transfers={transfers}
          wallets={wallets}
          onDelete={handleDeleteTransfer}
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
        wallets={wallets}
        defaultWalletId={selectedWalletId !== 'all' ? selectedWalletId : undefined}
      />

      <BudgetForm
        isOpen={budgetFormOpen}
        onClose={() => setBudgetFormOpen(false)}
        onSubmit={handleBudgetSubmit}
      />

      <WalletForm
        isOpen={walletFormOpen}
        onClose={() => {
          setWalletFormOpen(false);
          setEditingWallet(null);
        }}
        onSubmit={handleWalletSubmit}
        wallet={editingWallet}
      />

      <TransferForm
        isOpen={transferFormOpen}
        onClose={() => setTransferFormOpen(false)}
        onSubmit={handleTransferSubmit}
        wallets={wallets}
        defaultFromId={selectedWalletId !== 'all' ? selectedWalletId : undefined}
      />
    </div>
  );
}