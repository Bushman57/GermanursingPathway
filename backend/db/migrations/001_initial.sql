-- Legacy reference SQL — prefer Alembic: `cd backend && alembic upgrade head`
-- Manual run: psql $DATABASE_URL -f backend/db/migrations/001_initial.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(200) NOT NULL,
  email VARCHAR(320) NOT NULL,
  phone VARCHAR(40),
  nursing_qualification VARCHAR(120) NOT NULL,
  german_level VARCHAR(40) NOT NULL,
  timeline VARCHAR(120) NOT NULL,
  message TEXT,
  source VARCHAR(60) DEFAULT 'homepage',
  locale VARCHAR(5) DEFAULT 'en',
  status VARCHAR(30) DEFAULT 'new',
  whatsapp_joined BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS partner_schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(120) UNIQUE NOT NULL,
  name_en VARCHAR(200) NOT NULL,
  name_de VARCHAR(200),
  description_en TEXT NOT NULL,
  description_de TEXT,
  logo_url VARCHAR(500),
  website_url VARCHAR(500),
  city VARCHAR(100),
  verified BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS scholarships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(120) UNIQUE NOT NULL,
  partner_school_id UUID REFERENCES partner_schools(id),
  program_type VARCHAR(60) NOT NULL,
  title_en VARCHAR(300) NOT NULL,
  title_de VARCHAR(300),
  short_description_en TEXT NOT NULL,
  short_description_de TEXT,
  funding VARCHAR(80),
  deadline DATE,
  verified BOOLEAN DEFAULT FALSE,
  program_data JSONB
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(320) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(30) DEFAULT 'candidate'
);

CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id),
  user_id UUID REFERENCES users(id),
  full_name VARCHAR(200) NOT NULL,
  email VARCHAR(320) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id),
  scholarship_id UUID REFERENCES scholarships(id),
  stage VARCHAR(40) DEFAULT 'registered',
  checklist JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scholarships_program ON scholarships(program_type);
CREATE INDEX IF NOT EXISTS idx_scholarships_verified ON scholarships(verified);
