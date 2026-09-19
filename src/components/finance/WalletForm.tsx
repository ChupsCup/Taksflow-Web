import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { WALLET_TYPES, WALLET_COLORS, type Wallet, type WalletType } from '../../types';
import { cn } from '../../lib/utils';

interface WalletFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; type: WalletType; color: string }) => void;
  wallet?: Wallet | null;
}

export function WalletForm({ isOpen, onClose, onSubmit, wallet }: WalletFormProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<WalletType>('other');
  const [color, setColor] = useState(WALLET_COLORS[0]);

  useEffect(() => {
    if (wallet) {
      setName(wallet.name);
      setType(wallet.type);
      setColor(wallet.color);
    } else {
      setName('');
      setType('other');
      setColor(WALLET_COLORS[0]);
    }
  }, [wallet, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), type, color });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-dark-border/60 bg-dark-card/85 p-5 shadow-xl backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">
            {wallet ? 'Edit Dompet' : 'Tambah Dompet'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-dark-muted transition-colors hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Nama */}
          <div>
            <label className="mb-1.5 block text-xs text-dark-muted">Nama Dompet</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Bank BCA, GoPay, Cash"
              required
              className="w-full rounded-lg border border-dark-border bg-dark-bg px-3 py-2 text-base sm:text-sm text-white outline-none transition-colors focus:border-primary"
            />
          </div>

          {/* Tipe */}
          <div>
            <label className="mb-1.5 block text-xs text-dark-muted">Tipe</label>
            <div className="grid grid-cols-2 gap-2">
              {WALLET_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
                    type === t.value
                      ? 'border-primary bg-primary/10 text-white'
                      : 'border-dark-border bg-dark-bg text-dark-muted hover:text-white'
                  )}
                >
                  <span>{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Warna */}
          <div>
            <label className="mb-1.5 block text-xs text-dark-muted">Warna</label>
            <div className="flex flex-wrap gap-2">
              {WALLET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    'h-7 w-7 rounded-full transition-transform',
                    color === c && 'ring-2 ring-white ring-offset-1 ring-offset-dark-card scale-110'
                  )}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-base sm:text-sm font-medium text-white transition-colors hover:bg-primary-dark"
          >
            {wallet ? 'Simpan Perubahan' : 'Tambah Dompet'}
          </button>
        </form>
      </div>
    </div>
  );
}