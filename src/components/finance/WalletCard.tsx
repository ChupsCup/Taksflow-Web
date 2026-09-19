import { Pencil, Trash2 } from 'lucide-react';
import type { Wallet } from '../../types';
import { getWalletTypeLabel } from '../../types';
import { formatCurrency, cn } from '../../lib/utils';
import { Card } from '../ui/Card';

interface WalletCardProps {
  wallet: Wallet;
  balance: number;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function WalletCard({
  wallet,
  balance,
  selected,
  onSelect,
  onEdit,
  onDelete,
}: WalletCardProps) {
  const handleDelete = () => onDelete();

  return (
    <Card
      onClick={onSelect}
      className={cn(
        'p-4 transition-colors',
        selected ? 'border-primary/70 ring-1 ring-primary/60' : 'hover:border-dark-hover'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
            style={{ backgroundColor: `${wallet.color}22`, color: wallet.color }}
          >
            <span className="text-base">
              {wallet.type === 'bank' ? '🏦' : wallet.type === 'ewallet' ? '📱' : wallet.type === 'cash' ? '💵' : '💰'}
            </span>
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{wallet.name}</p>
            <p className="text-[10px] text-dark-muted">{getWalletTypeLabel(wallet.type)}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="rounded-lg p-1 text-dark-muted transition-colors hover:bg-dark-border hover:text-white"
            title="Edit dompet"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="rounded-lg p-1 text-dark-muted transition-colors hover:bg-dark-border hover:text-accent-pink"
            title="Hapus dompet"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <p className="mt-2 text-lg font-semibold text-white sm:text-xl">
        {formatCurrency(balance)}
      </p>
    </Card>
  );
}