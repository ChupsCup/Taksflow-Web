import { useState, useEffect } from 'react';
import { X, ArrowLeftRight } from 'lucide-react';
import type { Wallet } from '../../types';
import { cn } from '../../lib/utils';

interface TransferFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    from_wallet_id: string;
    to_wallet_id: string;
    amount: number;
    date: string;
    note: string;
  }) => void;
  wallets: Wallet[];
  defaultFromId?: string;
}

function formatWithDots(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function TransferForm({
  isOpen,
  onClose,
  onSubmit,
  wallets,
  defaultFromId,
}: TransferFormProps) {
  const [fromWallet, setFromWallet] = useState('');
  const [toWallet, setToWallet] = useState('');
  const [amountDisplay, setAmountDisplay] = useState('');
  const [amountRaw, setAmountRaw] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const fromDefault = defaultFromId && wallets.some((w) => w.id === defaultFromId)
        ? defaultFromId
        : wallets[0]?.id ?? '';
      const toDefault = wallets.find((w) => w.id !== fromDefault)?.id ?? '';
      setFromWallet(fromDefault);
      setToWallet(toDefault);
      setAmountRaw('');
      setAmountDisplay('');
      setDate(new Date().toISOString().split('T')[0]);
      setNote('');
      setError('');
    }
  }, [isOpen, wallets, defaultFromId]);

  if (!isOpen) return null;

  const lessThanTwo = wallets.length < 2;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\./g, '').replace(/\D/g, '');
    setAmountRaw(raw);
    setAmountDisplay(formatWithDots(raw));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromWallet === toWallet) {
      setError('Dompet asal dan tujuan harus berbeda.');
      return;
    }
    if (!amountRaw || Number(amountRaw) <= 0) {
      setError('Jumlah transfer harus lebih dari 0.');
      return;
    }
    onSubmit({
      from_wallet_id: fromWallet,
      to_wallet_id: toWallet,
      amount: Number(amountRaw),
      date: new Date(date).toISOString(),
      note: note.trim(),
    });
  };

  const selectCls =
    'w-full rounded-lg border border-dark-border bg-dark-bg px-3 py-2 text-base sm:text-sm text-white outline-none transition-colors focus:border-primary disabled:opacity-50';

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
          <h2 className="flex items-center gap-2 text-base font-semibold text-white">
            <ArrowLeftRight size={18} />
            Transfer Antar Dompet
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-dark-muted transition-colors hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {lessThanTwo ? (
          <p className="rounded-lg bg-accent-orange/10 px-3 py-4 text-center text-sm text-accent-orange">
            Kamu butuh minimal 2 dompet untuk transfer.
            <br />
            Bikin dompet dulu lewat &quot;Tambah Dompet&quot;.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Dari */}
            <div>
              <label className="mb-1.5 block text-xs text-dark-muted">Dari Dompet</label>
              <select
                value={fromWallet}
                onChange={(e) => {
                  setFromWallet(e.target.value);
                  setError('');
                  if (e.target.value === toWallet) {
                    setToWallet(wallets.find((w) => w.id !== e.target.value)?.id ?? '');
                  }
                }}
                className={selectCls}
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Ke */}
            <div>
              <label className="mb-1.5 block text-xs text-dark-muted">Ke Dompet</label>
              <select
                value={toWallet}
                onChange={(e) => {
                  setToWallet(e.target.value);
                  setError('');
                }}
                className={selectCls}
              >
                {wallets
                  .filter((w) => w.id !== fromWallet)
                  .map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Jumlah */}
            <div>
              <label className="mb-1.5 block text-xs text-dark-muted">Jumlah (Rp)</label>
              <input
                type="text"
                inputMode="numeric"
                value={amountDisplay}
                onChange={handleAmountChange}
                placeholder="0"
                required
                className="w-full rounded-lg border border-dark-border bg-dark-bg px-3 py-2 text-base sm:text-sm text-white outline-none transition-colors focus:border-primary"
              />
            </div>

            {/* Tanggal */}
            <div>
              <label className="mb-1.5 block text-xs text-dark-muted">Tanggal</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full rounded-lg border border-dark-border bg-dark-bg px-3 py-2 text-base sm:text-sm text-white outline-none transition-colors focus:border-primary"
              />
            </div>

            {/* Catatan */}
            <div>
              <label className="mb-1.5 block text-xs text-dark-muted">
                Catatan <span className="text-dark-muted/50">(opsional)</span>
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Contoh: Geser ke rekening"
                className="w-full rounded-lg border border-dark-border bg-dark-bg px-3 py-2 text-base sm:text-sm text-white outline-none transition-colors focus:border-primary"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-accent-pink/10 px-3 py-2 text-xs text-accent-pink">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              className={cn(
                'w-full rounded-lg bg-primary px-4 py-2.5 text-base sm:text-sm font-medium text-white transition-colors hover:bg-primary-dark'
              )}
            >
              Transfer
            </button>
          </form>
        )}
      </div>
    </div>
  );
}