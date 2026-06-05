import { useRef } from 'react';
import { Moon, Sun, Image, Upload, Download, LogOut, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: Props) {
  const { theme, toggleTheme, wallpaper, setWallpaper } = useTheme();
  const { signOut } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  function handleWallpaper(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setWallpaper(reader.result as string); onClose(); };
    reader.readAsDataURL(file);
  }

  function exportCSV() {
    onClose();
    setTimeout(() => {
      alert('Fitur ekspor CSV ada di halaman Dashboard masing-masing modul.');
    }, 200);
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div className="fixed inset-x-4 bottom-[50%] z-50 translate-y-1/2">
        <div className="mx-auto max-w-sm overflow-hidden rounded-2xl border border-dark-border bg-dark-card shadow-xl">
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <h2 className="text-base font-semibold text-white">Pengaturan</h2>
            <button onClick={onClose} className="rounded-lg p-1 text-dark-muted hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="px-2 pb-2">
            <button
              onClick={() => { toggleTheme(); onClose(); }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-white transition-colors hover:bg-dark-hover"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              <span className="flex-1 text-left">{theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}</span>
              <span className="rounded-full bg-dark-hover px-2.5 py-0.5 text-xs text-dark-muted">
                {theme === 'dark' ? 'Gelap' : 'Terang'}
              </span>
            </button>

            <button
              onClick={() => fileRef.current?.click()}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-white transition-colors hover:bg-dark-hover"
            >
              {wallpaper ? <Upload size={20} /> : <Image size={20} />}
              <span className="flex-1 text-left">{wallpaper ? 'Ganti Latar' : 'Pasang Latar'}</span>
            </button>

            {wallpaper && (
              <button
                onClick={() => { setWallpaper(null); onClose(); }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-dark-muted transition-colors hover:bg-dark-hover"
              >
                <X size={20} />
                <span className="flex-1 text-left">Hapus Latar</span>
              </button>
            )}

            <button
              onClick={exportCSV}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-white transition-colors hover:bg-dark-hover"
            >
              <Download size={20} />
              Ekspor Data
            </button>
          </div>

          <div className="h-px bg-dark-border" />

          <div className="p-2">
            <button
              onClick={() => { signOut(); onClose(); }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-accent-pink transition-colors hover:bg-dark-hover"
            >
              <LogOut size={20} />
              Keluar
            </button>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleWallpaper}
          />
        </div>
      </div>
    </>
  );
}
