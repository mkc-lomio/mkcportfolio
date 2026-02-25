-- ============================================================
-- Knowledge Base Table
-- Run this in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS knowledge_base (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title         TEXT NOT NULL,
  content       TEXT NOT NULL,
  category      TEXT NOT NULL DEFAULT 'General'
                CHECK (category IN (
                  'Programming', 'System Design', 'Database', 'DevOps',
                  'Frontend', 'Backend', 'Architecture', 'Career',
                  'Books', 'Courses', 'Articles', 'Life Lessons', 'General'
                )),
  source        TEXT DEFAULT '',
  source_url    TEXT DEFAULT '',
  tags          TEXT[] DEFAULT '{}',
  is_favorite   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_knowledge_base_category ON knowledge_base (category);
CREATE INDEX idx_knowledge_base_favorite ON knowledge_base (is_favorite);

-- RLS
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations" ON knowledge_base
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Auto-update updated_at
CREATE TRIGGER set_knowledge_base_updated_at
  BEFORE UPDATE ON knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE knowledge_base;

COMMENT ON TABLE knowledge_base IS 'Personal knowledge base for retention - books, articles, online learnings';

ALTER TABLE knowledge_base DROP CONSTRAINT knowledge_base_category_check;
ALTER TABLE knowledge_base ADD CONSTRAINT knowledge_base_category_check 
  CHECK (category IN (
    'English', 'Vocabulary', 'Grammar', 'History',
    'Science', 'Health', 'Finance', 'Philosophy',
    'Psychology', 'Books', 'Life Lessons', 'Fun Facts', 'General'
  ));