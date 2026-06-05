import { useState, useCallback } from 'react';
import { X, Plus, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CategorySelectProps {
  categories: string[];
  value: string;
  onChange: (category: string) => void;
  required?: boolean;
  storageKey?: string;
}

function loadPersisted(key: string): { hidden: string[]; custom: string[] } {
  try {
    const raw = localStorage.getItem(`taksflow-cat-${key}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { hidden: [], custom: [] };
}

function savePersisted(key: string, data: { hidden: string[]; custom: string[] }) {
  try {
    localStorage.setItem(`taksflow-cat-${key}`, JSON.stringify(data));
  } catch {}
}

export function CategorySelect({
  categories: baseCategories,
  value,
  onChange,
  required,
  storageKey,
}: CategorySelectProps) {
  const initial = storageKey ? loadPersisted(storageKey) : { hidden: [], custom: [] };

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hiddenCategories, setHiddenCategories] = useState<string[]>(initial.hidden);
  const [customCategories, setCustomCategories] = useState<string[]>(initial.custom);
  const [isCustom, setIsCustom] = useState(false);
  const [customValue, setCustomValue] = useState('');

  const allCategories = [...baseCategories, ...customCategories];
  const visibleCategories = allCategories.filter(
    (c) => !hiddenCategories.includes(c)
  );

  const handleSelect = (cat: string) => {
    onChange(cat);
    setDropdownOpen(false);
  };

  const handleDelete = useCallback(
    (cat: string) => {
      // Predefined → hide; Custom → remove permanently
      if (customCategories.includes(cat)) {
        const nextCustom = customCategories.filter((c) => c !== cat);
        setCustomCategories(nextCustom);
        if (storageKey) {
          savePersisted(storageKey, { hidden: hiddenCategories, custom: nextCustom });
        }
      } else {
        setHiddenCategories((prev) => {
          const next = [...prev, cat];
          if (storageKey) savePersisted(storageKey, { hidden: next, custom: customCategories });
          return next;
        });
      }
      if (value === cat) onChange('');
    },
    [value, onChange, storageKey, customCategories, hiddenCategories]
  );

  const addCustom = () => {
    const trimmed = customValue.trim();
    if (!trimmed) return;
    let updatedCustom = customCategories;
    if (!baseCategories.includes(trimmed) && !customCategories.includes(trimmed)) {
      updatedCustom = [...customCategories, trimmed];
      setCustomCategories(updatedCustom);
    }
    if (storageKey) {
      savePersisted(storageKey, { hidden: hiddenCategories, custom: updatedCustom });
    }
    onChange(trimmed);
    setIsCustom(false);
    setCustomValue('');
  };

  // Show custom input mode
  if (isCustom) {
    return (
      <div className="flex gap-2">
        <input
          type="text"
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addCustom();
            }
          }}
          placeholder="Ketik kategori baru"
          required={required}
          autoFocus
          className="w-full rounded-lg border border-dark-border bg-dark-bg px-3 py-2 text-base sm:text-sm text-white outline-none transition-colors focus:border-primary"
        />
        <button
          type="button"
          onClick={addCustom}
          className="shrink-0 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-primary-dark"
        >
          Pakai
        </button>
        <button
          type="button"
          onClick={() => {
            setIsCustom(false);
            setCustomValue('');
          }}
          className="shrink-0 rounded-lg border border-dark-border bg-dark-bg px-3 py-2 text-xs text-dark-muted transition-colors hover:text-white"
        >
          Batal
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Dropdown trigger */}
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className={cn(
          'flex w-full items-center justify-between rounded-lg border bg-dark-bg px-3 py-2 text-base sm:text-sm outline-none transition-colors focus:border-primary',
          value
            ? 'border-dark-border text-white'
            : 'border-dark-border text-dark-muted'
        )}
      >
        <span>{value || 'Pilih kategori'}</span>
        <ChevronDown
          size={14}
          className={cn(
            'text-dark-muted transition-transform',
            dropdownOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown menu */}
      {dropdownOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
          <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded-lg border border-dark-border bg-dark-card py-1 shadow-xl">
            {visibleCategories.length === 0 ? (
              <p className="px-3 py-4 text-center text-xs text-dark-muted">
                Semua kategori disembunyikan
              </p>
            ) : (
              visibleCategories.map((cat) => (
                <div
                  key={cat}
                  className="flex items-center justify-between px-3 py-2 text-sm text-white transition-colors hover:bg-dark-hover"
                >
                  <button
                    type="button"
                    className="flex-1 text-left"
                    onClick={() => handleSelect(cat)}
                  >
                    {cat}
                    {customCategories.includes(cat) && (
                      <span className="ml-1.5 text-[10px] text-dark-muted">(custom)</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(cat)}
                    className="rounded p-1 text-dark-muted transition-colors hover:bg-dark-border hover:text-accent-pink"
                    title="Hapus kategori"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))
            )}

            <div className="my-1 border-t border-dark-border" />

            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-dark-muted transition-colors hover:bg-dark-hover hover:text-white"
              onClick={() => {
                setIsCustom(true);
                setDropdownOpen(false);
              }}
            >
              <Plus size={14} />
              Lainnya...
            </button>
          </div>
        </>
      )}
    </div>
  );
}
