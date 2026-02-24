-- ============================================================
-- Credit Monitoring Tables
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS subscriptions (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name          TEXT NOT NULL,
  amount        NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency      TEXT NOT NULL DEFAULT 'AUD',
  frequency     TEXT NOT NULL DEFAULT 'Monthly'
                CHECK (frequency IN ('Monthly', 'Quarterly', 'Yearly')),
  next_due      DATE,
  notes         TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_active ON subscriptions (is_active);
CREATE INDEX idx_subscriptions_frequency ON subscriptions (frequency);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations" ON subscriptions
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE TRIGGER set_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

ALTER PUBLICATION supabase_realtime ADD TABLE subscriptions;

COMMENT ON TABLE subscriptions IS 'Recurring subscriptions tracker';


-- 2. CREDITS / LOANS
CREATE TABLE IF NOT EXISTS credits_loans (
  id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name             TEXT NOT NULL,
  total_amount     NUMERIC(14,2) NOT NULL DEFAULT 0,
  remaining_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  monthly_payment  NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency         TEXT NOT NULL DEFAULT 'AUD',
  interest_rate    NUMERIC(6,3) DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'Active'
                   CHECK (status IN ('Active', 'Paid Off', 'Overdue', 'Deferred')),
  due_date         DATE,
  lender           TEXT,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_credits_loans_status ON credits_loans (status);

ALTER TABLE credits_loans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations" ON credits_loans
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE TRIGGER set_credits_loans_updated_at
  BEFORE UPDATE ON credits_loans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

ALTER PUBLICATION supabase_realtime ADD TABLE credits_loans;

COMMENT ON TABLE credits_loans IS 'Credits and loans tracker';


-- 3. DAILY EXPENSES
CREATE TABLE IF NOT EXISTS daily_expenses (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  description   TEXT NOT NULL,
  amount        NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency      TEXT NOT NULL DEFAULT 'AUD',
  category      TEXT NOT NULL DEFAULT 'Other'
                CHECK (category IN ('Food', 'Transport', 'Shopping', 'Entertainment',
                                     'Bills', 'Health', 'Education', 'Groceries',
                                     'Personal', 'Other')),
  expense_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_daily_expenses_date ON daily_expenses (expense_date);
CREATE INDEX idx_daily_expenses_category ON daily_expenses (category);

ALTER TABLE daily_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations" ON daily_expenses
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE TRIGGER set_daily_expenses_updated_at
  BEFORE UPDATE ON daily_expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

ALTER PUBLICATION supabase_realtime ADD TABLE daily_expenses;

COMMENT ON TABLE  daily_expenses IS 'Daily expense tracker';
COMMENT ON COLUMN daily_expenses.category IS 'Expense category: Food, Transport, Shopping, Entertainment, Bills, Health, Education, Groceries, Personal, Other';
