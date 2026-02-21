-- ============================================================
-- Job Applications Table
-- Run this in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS job_applications (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  company       TEXT NOT NULL,
  position      TEXT NOT NULL,
  date_applied  DATE NOT NULL DEFAULT CURRENT_DATE,
  status        TEXT NOT NULL DEFAULT 'Applied'
                CHECK (status IN (
                  'Applied', 'Screening', 'Interview', 'Technical',
                  'Offer', 'Accepted', 'Rejected', 'Withdrawn', 'Ghosted'
                )),
  salary_range  TEXT,
  location      TEXT,
  job_url       TEXT,
  notes         TEXT,
  interview_dates TEXT[] DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for common queries
CREATE INDEX idx_job_applications_status ON job_applications (status);
CREATE INDEX idx_job_applications_date   ON job_applications (date_applied DESC);

-- Row Level Security (RLS)
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read/write (since you use ?code=mkc for access control)
CREATE POLICY "Allow all operations" ON job_applications
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Optional: Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE job_applications;

-- Comments
COMMENT ON TABLE  job_applications IS 'Job application tracker for portfolio site';
COMMENT ON COLUMN job_applications.status IS 'Application pipeline stage';
COMMENT ON COLUMN job_applications.interview_dates IS 'Array of interview date strings (YYYY-MM-DD)';
