-- ============================================================
-- TaskFlow Migration: Multi-Dompet (Wallets) + Transfer
-- AMAN UNTUK DATA LAMA: tidak ada DROP TABLE / penghapusan data.
-- Jalankan file ini di Supabase SQL Editor.
-- ============================================================

-- 1. Tabel dompet (wallets)
CREATE TABLE IF NOT EXISTS wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('bank', 'ewallet', 'cash', 'other')) DEFAULT 'other',
  color TEXT DEFAULT '#7C6AF7',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS one_default_wallet_per_user ON wallets (user_id) WHERE is_default;
CREATE INDEX IF NOT EXISTS idx_wallets_user ON wallets (user_id, created_at DESC);

-- 2. Kolom wallet_id di transactions (nullable, soalnya data lama belum punya)
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS wallet_id UUID REFERENCES wallets (id);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON transactions (wallet_id);

-- 3. Tabel transfer
CREATE TABLE IF NOT EXISTS transfers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  from_wallet_id UUID REFERENCES wallets (id) NOT NULL,
  to_wallet_id UUID REFERENCES wallets (id) NOT NULL,
  amount DECIMAL(14, 2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT transfers_no_same_wallet CHECK (from_wallet_id <> to_wallet_id)
);

CREATE INDEX IF NOT EXISTS idx_transfers_user ON transfers (user_id, date DESC);

-- ============================================================
-- Backfill: bikin dompet default "Cash" untuk setiap user
-- ============================================================
INSERT INTO wallets (user_id, name, type, color, is_default)
SELECT
  u.id,
  'Cash',
  'cash',
  '#3ECFA8',
  TRUE
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM wallets w WHERE w.user_id = u.id
);

-- Transaksi lama dimapping ke dompet default user masing-masing
UPDATE transactions t
SET wallet_id = w.id
FROM wallets w
WHERE t.user_id = w.user_id
  AND w.is_default
  AND t.wallet_id IS NULL;

-- ============================================================
-- User baru: otomatis dapat dompet default (update trigger lama)
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );

  INSERT INTO public.wallets (user_id, name, type, color, is_default)
  VALUES (NEW.id, 'Cash', 'cash', '#3ECFA8', TRUE);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- Integrity: transfer harus antar dompet milik user yang sama
-- ============================================================
CREATE OR REPLACE FUNCTION enforce_transfer_wallet_ownership()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM wallets WHERE id = NEW.from_wallet_id AND user_id = NEW.user_id
  ) OR NOT EXISTS (
    SELECT 1 FROM wallets WHERE id = NEW.to_wallet_id AND user_id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'Transfer wallets must belong to the same user';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_transfer_wallet_ownership ON transfers;
CREATE TRIGGER trg_transfer_wallet_ownership
  BEFORE INSERT OR UPDATE ON transfers
  FOR EACH ROW EXECUTE FUNCTION enforce_transfer_wallet_ownership();

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;

-- Wallets: user bisa CRUD dompetnya sendiri
CREATE POLICY "Users can view own wallets"
  ON wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wallets"
  ON wallets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wallets"
  ON wallets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own wallets"
  ON wallets FOR DELETE USING (auth.uid() = user_id);

-- Transfers: user bisa lihat, buat, hapus transfernya sendiri
CREATE POLICY "Users can view own transfers"
  ON transfers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transfers"
  ON transfers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transfers"
  ON transfers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transfers"
  ON transfers FOR DELETE USING (auth.uid() = user_id);