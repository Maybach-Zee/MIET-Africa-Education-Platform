CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS resources (
  resource_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50),
  grade_start INTEGER,
  grade_end INTEGER,
  subject VARCHAR(100),
  language VARCHAR(50),
  file_url VARCHAR(500),
  uploaded_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  approved_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
  approval_date TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_resources_uploaded_by ON resources(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_resources_is_approved ON resources(is_approved);
CREATE INDEX IF NOT EXISTS idx_resources_created_at ON resources(created_at);
