-- Add GPS coordinates and enrolled learners count
ALTER TABLE centres ADD COLUMN IF NOT EXISTS gps_latitude DECIMAL(9,6);
ALTER TABLE centres ADD COLUMN IF NOT EXISTS gps_longitude DECIMAL(9,6);
ALTER TABLE centres ADD COLUMN IF NOT EXISTS enrolled_learners INTEGER DEFAULT 0;

-- Add registration status for approval workflow
ALTER TABLE centres ADD COLUMN IF NOT EXISTS registration_status VARCHAR(20)
  CHECK (registration_status IN ('PENDING','APPROVED','REJECTED'))
  DEFAULT 'PENDING';

-- Add rejection comment
ALTER TABLE centres ADD COLUMN IF NOT EXISTS rejection_comment TEXT;

--Altered Centres
ALTER TABLE centres
ADD CONSTRAINT unique_centre_name UNIQUE (centre_name);

ALTER TABLE centres
ADD CONSTRAINT unique_centre_email UNIQUE (email);

-- Link resources to a centre (for school‑scoped resources)
ALTER TABLE resources ADD COLUMN IF NOT EXISTS centre_id UUID REFERENCES centres(centre_id);

-- Ensure existing resources get the centre from uploader (optional)
UPDATE resources r
SET centre_id = u.centre_id
FROM users u
WHERE r.uploaded_by = u.user_id AND u.centre_id IS NOT NULL AND r.centre_id IS NULL;

CREATE TABLE IF NOT EXISTS event_registrations (
  registration_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  registered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(session_id, user_id)
);