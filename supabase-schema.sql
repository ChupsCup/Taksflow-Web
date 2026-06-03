-- ============================================================
-- TaskFlow Database Schema for Supabase
-- Execute this in your Supabase SQL Editor
-- ============================================================

-- 1. Profiles table (syncs with auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
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
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 2. Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  category TEXT NOT NULL,
  amount DECIMAL(14,2) NOT NULL,
  description TEXT DEFAULT '',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date DESC);

-- 3. Budget limits
CREATE TABLE IF NOT EXISTS budget_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  category TEXT NOT NULL,
  amount DECIMAL(14,2) NOT NULL,
  period TEXT CHECK (period IN ('monthly', 'yearly')) DEFAULT 'monthly',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category, period)
);

-- 4. Job applications
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  location TEXT DEFAULT '',
  salary_range TEXT DEFAULT '',
  job_url TEXT DEFAULT '',
  status TEXT CHECK (status IN ('saved', 'applied', 'interview', 'offer', 'accepted', 'rejected')) DEFAULT 'saved',
  applied_date DATE,
  interview_date DATE,
  offer_date DATE,
  response_received BOOLEAN DEFAULT FALSE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_applications_user ON job_applications(user_id, created_at DESC);

-- 5. Todos
CREATE TABLE IF NOT EXISTS todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'Lainnya',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('pending', 'in_progress', 'done')) DEFAULT 'pending',
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_todos_user ON todos(user_id, created_at DESC);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Transactions: users can CRUD their own
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE USING (auth.uid() = user_id);

-- Budget limits: users can CRUD their own
CREATE POLICY "Users can view own budgets"
  ON budget_limits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert own budgets"
  ON budget_limits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own budgets"
  ON budget_limits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own budgets"
  ON budget_limits FOR DELETE USING (auth.uid() = user_id);

-- Jobs: users can CRUD their own
CREATE POLICY "Users can view own applications"
  ON job_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own applications"
  ON job_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own applications"
  ON job_applications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own applications"
  ON job_applications FOR DELETE USING (auth.uid() = user_id);

-- Todos: users can CRUD their own
CREATE POLICY "Users can view own todos"
  ON todos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own todos"
  ON todos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own todos"
  ON todos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own todos"
  ON todos FOR DELETE USING (auth.uid() = user_id);
