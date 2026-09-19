import { Trash2, ArrowRight, ArrowLeftRight } from 'lucide-react';
import type { Transfer, Wallet } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';

interface TransferHistoryProps {
  transfers: Transfer[] | undefined;
  wallets: Wallet[];
  onDelete: (id: string) => void;
}

export function TransferHistory({ transfers, wallets, onDelete }: TransferHistoryProps) {
  const walletName = (id: string): { name: string; color: string } => {
    const wallet = wallets.find((w) => w.id === id);
    return wallet ? { name: wallet.name, color: wallet.color } : { name: '?', color: '#6b6b80' };
  };

  if (!transfers || transfers.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={ArrowLeftRight}
          title="Belum ada transfer"
          description="Pindahkan uang antar dompet untuk melihat riwayat di sini."
        />
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-dark-border/60 bg-dark-card/60 backdrop-blur-xl">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-dark-border bg-dark-hover/60 text-dark-muted">
            <th className="px-3 py-2 text-[10px] font-medium sm:text-xs">Tanggal</th>
            <th className="px-3 py-2 text-[10px] font-medium sm:text-xs">Transfer</th>
            <th className="hidden px-3 py-2 text-[10px] font-medium sm:table-cell sm:text-xs">Catatan</th>
            <th className="px-3 py-2 text-right text-[10px] font-medium sm:text-xs">Jumlah</th>
            <th className="px-3 py-2 text-center text-[10px] font-medium sm:text-xs">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {transfers.map((t) => {
            const from = walletName(t.from_wallet_id);
            const to = walletName(t.to_wallet_id);
            return (
              <tr
                key={t.id}
                className="border-b border-dark-border transition-colors last:border-none hover:bg-dark-hover"
              >
                <td className="whitespace-nowrap px-3 py-2 text-[10px] text-white sm:text-xs">
                  {formatDate(t.date)}
                </td>
                <td className="whitespace-nowrap px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <WalletTag name={from.name} color={from.color} />
                    <ArrowRight size={12} className="shrink-0 text-dark-muted" />
                    <WalletTag name={to.name} color={to.color} />
                  </div>
                </td>
                <td className="hidden max-w-[160px] truncate px-3 py-2 text-[10px] text-dark-muted sm:table-cell sm:text-xs">
                  {t.note || '-'}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-right text-[10px] font-medium text-white sm:text-xs">
                  {formatCurrency(t.amount)}
                </td>
                <td className="whitespace-nowrap px-3 py-2">
                  <div className="flex justify-center">
                    <button
                      onClick={() => {
                        if (window.confirm('Hapus riwayat transfer ini?')) {
                          onDelete(t.id);
                        }
                      }}
                      className="rounded-lg p-1.5 text-dark-muted transition-colors hover:bg-dark-border hover:text-accent-pink"
                      title="Hapus"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function WalletTag({ name, color }: { name: string; color: string }) {
  return (
    <span
      className="inline-flex max-w-[110px] items-center gap-1.5 truncate rounded-full px-2.5 py-0.5 text-[10px] font-medium sm:max-w-[150px] sm:text-xs"
      style={{
        backgroundColor: `${color}1a`,
        color,
      }}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      <span className="truncate">{name}</span>
    </span>
  );
}