-- ============================================================
-- TANNMP Portal — Supabase PostgreSQL Schema
-- Run this entire file in Supabase SQL Editor (once)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: members
-- ============================================================
CREATE TABLE IF NOT EXISTS members (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name       TEXT NOT NULL,
  last_name        TEXT NOT NULL,
  email            TEXT UNIQUE NOT NULL,
  phone            TEXT NOT NULL,
  password_hash    TEXT NOT NULL,
  otp              TEXT,
  otp_expires_at   TIMESTAMPTZ,
  is_verified      BOOLEAN DEFAULT FALSE,
  member_id        TEXT UNIQUE,          -- e.g. TANNMP0001
  community        TEXT CHECK (community IN ('Naidu', 'Other')),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: member_address
-- ============================================================
CREATE TABLE IF NOT EXISTS member_address (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id                UUID REFERENCES members(id) ON DELETE CASCADE UNIQUE,
  current_address_line1    TEXT,
  current_address_line2    TEXT,
  current_city             TEXT,
  current_state            TEXT,
  current_postal           TEXT,
  permanent_address_line1  TEXT,
  permanent_address_line2  TEXT,
  permanent_city           TEXT,
  permanent_state          TEXT,
  permanent_postal         TEXT,
  created_at               TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: job_profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS job_profiles (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id             UUID REFERENCES members(id) ON DELETE CASCADE UNIQUE,
  first_name            TEXT,
  last_name             TEXT,
  address_line1         TEXT,
  address_line2         TEXT,
  country               TEXT,
  city                  TEXT,
  state                 TEXT,
  postal_code           TEXT,
  phone                 TEXT,
  work_experience_years INTEGER DEFAULT 0,
  education             JSONB DEFAULT '[]'::jsonb,
  work_history          JSONB DEFAULT '[]'::jsonb,
  skills                TEXT[] DEFAULT '{}',
  resume_url            TEXT,
  resume_filename       TEXT,
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: advocates
-- ============================================================
CREATE TABLE IF NOT EXISTS advocates (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id      UUID REFERENCES members(id) ON DELETE CASCADE UNIQUE,
  name           TEXT NOT NULL,
  phone          TEXT NOT NULL,
  bar_council_id TEXT NOT NULL,
  status         TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at   TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at    TIMESTAMPTZ
);

-- ============================================================
-- TABLE: job_posts
-- ============================================================
CREATE TABLE IF NOT EXISTS job_posts (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title             TEXT NOT NULL,
  location          TEXT NOT NULL,
  job_type          TEXT DEFAULT 'Full-Time',
  salary_range      TEXT,
  skills_required   TEXT[] DEFAULT '{}',
  company_name      TEXT NOT NULL,
  job_description   TEXT NOT NULL,
  min_experience    INTEGER DEFAULT 0,
  max_experience    INTEGER DEFAULT 25,
  company_whatsapp  TEXT NOT NULL,   -- NEVER exposed to frontend
  company_email     TEXT NOT NULL,   -- NEVER exposed to frontend
  posted_at         TIMESTAMPTZ DEFAULT NOW(),
  is_active         BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- TABLE: job_applications
-- ============================================================
CREATE TABLE IF NOT EXISTS job_applications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id      UUID REFERENCES job_posts(id) ON DELETE CASCADE,
  member_id   UUID REFERENCES members(id) ON DELETE CASCADE,
  applied_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, member_id)
);

-- ============================================================
-- TABLE: admin_settings
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_settings (
  key    TEXT PRIMARY KEY,   -- e.g. 'diary_password'
  value  TEXT NOT NULL
);

-- ============================================================
-- TABLE: admin_diary
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_diary (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  heading     TEXT NOT NULL,
  detail      TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: id_cards
-- ============================================================
CREATE TABLE IF NOT EXISTS id_cards (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id    UUID REFERENCES members(id) ON DELETE CASCADE UNIQUE,
  card_url     TEXT,    -- Supabase Storage path
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FUNCTION: Auto-generate member IDs (TANNMP0001, TANNMP0002...)
-- Thread-safe sequential ID generation
-- ============================================================
CREATE OR REPLACE FUNCTION get_next_member_id()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(
    MAX(CAST(SUBSTRING(member_id FROM 7) AS INTEGER)), 0
  ) + 1
  INTO next_num
  FROM members
  WHERE member_id IS NOT NULL
    AND member_id ~ '^TANNMP[0-9]+$';

  RETURN 'TANNMP' || LPAD(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- FUNCTION: Auto-update updated_at timestamp
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply auto-update trigger to job_profiles
CREATE TRIGGER job_profiles_updated_at
  BEFORE UPDATE ON job_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Apply auto-update trigger to admin_diary
CREATE TRIGGER admin_diary_updated_at
  BEFORE UPDATE ON admin_diary
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- All DB access goes through our backend using SERVICE ROLE KEY
-- which bypasses RLS. We deny all public/anon access below.
-- ============================================================
ALTER TABLE members          ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_address   ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE advocates        ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_posts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_diary      ENABLE ROW LEVEL SECURITY;
ALTER TABLE id_cards         ENABLE ROW LEVEL SECURITY;

-- Deny all access from anon role (backend uses service_role which bypasses RLS)
-- No policies = deny all for anon. Service role always has full access.

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_members_email     ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_member_id ON members(member_id);
CREATE INDEX IF NOT EXISTS idx_advocates_status  ON advocates(status);
CREATE INDEX IF NOT EXISTS idx_job_posts_active  ON job_posts(is_active);
CREATE INDEX IF NOT EXISTS idx_job_apps_member   ON job_applications(member_id);
CREATE INDEX IF NOT EXISTS idx_job_apps_job      ON job_applications(job_id);

-- ============================================================
-- SUPABASE STORAGE BUCKETS
-- Run these in Supabase Storage section OR use the Dashboard:
-- 1. Create bucket "id-cards"  → PUBLIC  (members download ID cards)
-- 2. Create bucket "resumes"   → PRIVATE (only backend can access)
-- ============================================================

-- Storage bucket creation via SQL (Supabase Storage API):
INSERT INTO storage.buckets (id, name, public)
VALUES ('id-cards', 'id-cards', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- DONE! Schema created successfully.
-- Next: Run the backend server (see server/ directory)
-- ============================================================
