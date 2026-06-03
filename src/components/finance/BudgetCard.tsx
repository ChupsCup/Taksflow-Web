import { Trash2 } from 'lucide-react';
import type { BudgetLimit } from '../../types';
import { formatCurrency, cn } from '../../lib/utils';
import { Card } from '../ui/Card';

interface BudgetCardProps {
  budget: BudgetLimit;
  spent: number;
  onDelete: (id: string) => void;
}

function getProgressColor(percentage: number): string {
  if (percentage >= 80) return 'bg-accent-pink';
  if (percentage >= 50) return 'bg-accent-orange';
  return 'bg-secondary';
}

function getProgressBgColor(percentage: number): string {
  if (percentage >= 80) return 'bg-accent-pink/20';
  if (percentage >= 50) return 'bg-accent-orange/20';
  return 'bg-secondary/20';
}

function getLabelVariant(percentage: number): string {
  if (percentage >= 80) return 'text-accent-pink';
  if (percentage >= 50) return 'text-accent-orange';
  return 'text-secondary';
}

export function BudgetCard({ budget, spent, onDelete }: BudgetCardProps) {
  const percentage = budget.amount > 0 ? Math.min(Math.round((spent / budget.amount) * 100), 100) : 0;

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-white">{budget.category}</h4>
          <p className="mt-0.5 text-xs text-dark-muted">
            Target: {formatCurrency(budget.amount)} / {budget.period === 'monthly' ? 'bulan' : 'tahun'}
          </p>
        </div>
        <button
          onClick={() => {
            if (window.confirm(`Hapus budget untuk ${budget.category}?`)) {
              onDelete(budget.id);
            }
          }}
          className="rounded-lg p-1.5 text-dark-muted transition-colors hover:bg-dark-border hover:text-accent-pink"
          title="Hapus Budget"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-2">
        <div className={cn('h-2 w-full overflow-hidden rounded-full', getProgressBgColor(percentage))}>
          <div
            className={cn('h-full rounded-full transition-all duration-300', getProgressColor(percentage))}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-dark-muted">
          Terpakai: <span className="text-white">{formatCurrency(spent)}</span>
        </span>
        <span className={cn('font-medium', getLabelVariant(percentage))}>
          {percentage}%
        </span>
      </div>
    </Card>
  );
}
