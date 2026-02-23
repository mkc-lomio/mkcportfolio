-- ============================================================
-- Todos Table
-- Run this in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS todos (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title         TEXT NOT NULL,
  description   TEXT,
  priority      TEXT NOT NULL DEFAULT 'Medium'
                CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
  status        TEXT NOT NULL DEFAULT 'Pending'
                CHECK (status IN ('Pending', 'In Progress', 'Done')),
  due_date      DATE,
  tags          TEXT[] DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_todos_status   ON todos (status);
CREATE INDEX idx_todos_priority ON todos (priority);
CREATE INDEX idx_todos_due_date ON todos (due_date);

-- Row Level Security (RLS)
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read/write (access controlled via ?code=mkc)
CREATE POLICY "Allow all operations" ON todos
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Auto-update updated_at timestamp (reuses function if already exists)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_todos_updated_at
  BEFORE UPDATE ON todos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Optional: Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE todos;

-- Comments
COMMENT ON TABLE  todos IS 'Personal todo list for portfolio site';
COMMENT ON COLUMN todos.priority IS 'Task priority: Low, Medium, High, Urgent';
COMMENT ON COLUMN todos.status IS 'Task status: Pending, In Progress, Done';
