-- ============================================================
-- Interview Prep Bank Table
-- Run this in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS interview_prep (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  category      TEXT NOT NULL DEFAULT 'Behavioral'
                CHECK (category IN (
                  'Behavioral', 'System Design', 'C# / .NET', 'SQL / Database',
                  'Angular / Frontend', 'Azure / Cloud', 'API / Integration',
                  'General Technical', 'Culture Fit', 'Security', 'Project Management'
                )),
  question      TEXT NOT NULL,
  answer        TEXT NOT NULL,
  difficulty    TEXT NOT NULL DEFAULT 'Medium'
                CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  tags          TEXT[] DEFAULT '{}',
  is_favorite   BOOLEAN NOT NULL DEFAULT FALSE,
  last_reviewed TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_interview_prep_category ON interview_prep (category);
CREATE INDEX idx_interview_prep_difficulty ON interview_prep (difficulty);
CREATE INDEX idx_interview_prep_favorite ON interview_prep (is_favorite);

-- RLS
ALTER TABLE interview_prep ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations" ON interview_prep
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Auto-update updated_at
CREATE TRIGGER set_interview_prep_updated_at
  BEFORE UPDATE ON interview_prep
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE interview_prep;

COMMENT ON TABLE interview_prep IS 'Interview preparation question and answer bank';

/*

ALTER TABLE interview_prep DROP CONSTRAINT interview_prep_category_check;
ALTER TABLE interview_prep ADD CONSTRAINT interview_prep_category_check 
  CHECK (category IN (
    'Behavioral', 'System Design', 'C# / .NET', 'SQL / Database',
    'Angular / Frontend', 'Azure / Cloud', 'API / Integration',
    'General Technical', 'Culture Fit', 'Security', 'Project Management'
  ));

*/