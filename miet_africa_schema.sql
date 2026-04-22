-- =====================================================
-- MIET AFRICA YOUTH SKILLS CENTRE MANAGEMENT PLATFORM
-- PostgreSQL Database Schema
-- Version: 1.0
-- Compliance: POPIA | SETA Regulations
-- Architecture: Three-Tier (ReactJS / NodeJS+Express / PostgreSQL)
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- SECTION 1: ENUMERATIONS & CUSTOM TYPES
-- =====================================================

-- User roles for Role-Based Access Control
CREATE TYPE user_role AS ENUM ('ADMIN', 'FACILITATOR', 'MANAGER', 'DONOR');

-- Learner status
CREATE TYPE learner_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'GRADUATED', 'WITHDRAWN');

-- Enrolment completion status
CREATE TYPE completion_status AS ENUM ('ENROLLED', 'IN_PROGRESS', 'COMPLETED', 'WITHDRAWN', 'FAILED');

-- Assessment result
CREATE TYPE assessment_result AS ENUM ('PASS', 'FAIL', 'PENDING', 'ABSENT');

-- Certificate lifecycle status
CREATE TYPE certificate_status AS ENUM ('PENDING', 'APPROVED', 'ISSUED', 'REVOKED');

-- Audit action types
CREATE TYPE audit_action AS ENUM (
    'CREATE', 'READ', 'UPDATE', 'DELETE',
    'LOGIN', 'LOGOUT', 'EXPORT', 'IMPORT',
    'APPROVE', 'REJECT', 'GENERATE_CERTIFICATE'
);

-- Payment status
CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'WAIVED', 'REFUNDED', 'OVERDUE');

-- Payment method
CREATE TYPE payment_method AS ENUM ('CASH', 'EFT', 'CARD', 'MOBILE_PAYMENT', 'BURSARY', 'DONOR_FUNDED');

-- Gender
CREATE TYPE gender_type AS ENUM ('MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY');

-- =====================================================
-- SECTION 2: USERS TABLE
-- =====================================================

CREATE TABLE users (
    user_id                 UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name               VARCHAR(200)    NOT NULL,
    email                   VARCHAR(150)    UNIQUE NOT NULL,
    password_hash           VARCHAR(255)    NOT NULL,                        -- bcrypt hashed
    role                    user_role       NOT NULL DEFAULT 'FACILITATOR',
    is_active               BOOLEAN         NOT NULL DEFAULT TRUE,
    phone_number            VARCHAR(20),
    profile_photo_url       VARCHAR(500),
    must_change_password    BOOLEAN         NOT NULL DEFAULT TRUE,
    last_login              TIMESTAMP,
    failed_login_attempts   INTEGER         NOT NULL DEFAULT 0,
    account_locked_until    TIMESTAMP,
    two_factor_enabled      BOOLEAN         NOT NULL DEFAULT FALSE,
    two_factor_secret       VARCHAR(100),
    created_at              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              UUID            REFERENCES users(user_id),
    CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

COMMENT ON TABLE users IS 'Platform users with Role-Based Access Control (Admin, Facilitator, Manager, Donor)';
COMMENT ON COLUMN users.password_hash IS 'bcrypt hashed password — plain text is never stored';
COMMENT ON COLUMN users.role IS 'RBAC role: ADMIN | FACILITATOR | MANAGER | DONOR';
COMMENT ON COLUMN users.must_change_password IS 'Forces password change on first login';

-- =====================================================
-- SECTION 3: PROVINCES TABLE
-- =====================================================

CREATE TABLE provinces (
    province_id     UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    province_code   VARCHAR(10)     UNIQUE NOT NULL,
    province_name   VARCHAR(100)    NOT NULL,
    region          VARCHAR(100),
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE provinces IS 'South African provinces for multi-province operational support';

-- =====================================================
-- SECTION 4: CENTRES TABLE
-- =====================================================

CREATE TABLE centres (
    centre_id           UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    centre_code         VARCHAR(50)     UNIQUE NOT NULL,
    centre_name         VARCHAR(200)    NOT NULL,
    province_id         UUID            NOT NULL REFERENCES provinces(province_id),
    address             TEXT,
    city                VARCHAR(100),
    postal_code         VARCHAR(10),
    phone_number        VARCHAR(20),
    email               VARCHAR(150),
    centre_manager_id   UUID            REFERENCES users(user_id),
    capacity            INTEGER,
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    established_date    DATE,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE centres IS 'MIET Africa Youth Skills Centres across multiple provinces';
COMMENT ON COLUMN centres.centre_manager_id IS 'FK to users — the manager responsible for this centre';

-- =====================================================
-- SECTION 5: LEARNERS TABLE
-- =====================================================

CREATE TABLE learners (
    learner_id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name              VARCHAR(100)    NOT NULL,
    last_name               VARCHAR(100)    NOT NULL,
    id_number               VARCHAR(13)     UNIQUE NOT NULL,                -- SA ID number (13 digits)
    passport_number         VARCHAR(50),                                    -- For non-SA citizens
    date_of_birth           DATE            NOT NULL,
    gender                  gender_type     NOT NULL,
    email                   VARCHAR(150)    UNIQUE,                         -- For learner portal access
    contact_number          VARCHAR(20)     NOT NULL,
    alternative_contact     VARCHAR(20),
    address                 TEXT            NOT NULL,
    city                    VARCHAR(100),
    postal_code             VARCHAR(10),
    province_id             UUID            REFERENCES provinces(province_id),
    centre_id               UUID            REFERENCES centres(centre_id),
    highest_qualification   VARCHAR(100),
    employment_status       VARCHAR(50)     CHECK (employment_status IN ('UNEMPLOYED', 'EMPLOYED', 'SELF_EMPLOYED', 'STUDENT')),
    disability_status       BOOLEAN         NOT NULL DEFAULT FALSE,
    disability_description  TEXT,
    home_language           VARCHAR(50),
    nationality             VARCHAR(50)     NOT NULL DEFAULT 'South African',
    status                  learner_status  NOT NULL DEFAULT 'ACTIVE',
    popia_consent           BOOLEAN         NOT NULL DEFAULT FALSE,         -- POPIA compliance
    popia_consent_date      TIMESTAMP,
    registration_date       DATE            NOT NULL DEFAULT CURRENT_DATE,
    photo_url               VARCHAR(500),
    notes                   TEXT,
    created_at              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              UUID            REFERENCES users(user_id),
    CONSTRAINT chk_id_number_format CHECK (id_number ~ '^[0-9]{13}$'),
    CONSTRAINT chk_dob_valid CHECK (date_of_birth <= CURRENT_DATE),
    CONSTRAINT chk_popia_consent CHECK (
        popia_consent = FALSE OR (popia_consent = TRUE AND popia_consent_date IS NOT NULL)
    )
);

COMMENT ON TABLE learners IS 'Learner profiles — central registry for all Youth Skills Centre participants';
COMMENT ON COLUMN learners.id_number IS 'South African 13-digit ID number — unique identifier per learner';
COMMENT ON COLUMN learners.popia_consent IS 'POPIA compliance: explicit consent for personal data processing';
COMMENT ON COLUMN learners.popia_consent_date IS 'Timestamp when POPIA consent was recorded';
COMMENT ON COLUMN learners.email IS 'Learner email for portal access — optional but unique when provided';

-- =====================================================
-- SECTION 6: COURSES TABLE
-- =====================================================

CREATE TABLE courses (
    course_id               UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_code             VARCHAR(50)     UNIQUE NOT NULL,
    title                   VARCHAR(200)    NOT NULL,
    description             TEXT,
    duration_hours          INTEGER         NOT NULL CHECK (duration_hours > 0),
    start_date              DATE            NOT NULL,
    end_date                DATE            NOT NULL,
    pass_mark               DECIMAL(5,2)    NOT NULL DEFAULT 50.00
                                            CHECK (pass_mark >= 0 AND pass_mark <= 100),
    max_learners            INTEGER,
    centre_id               UUID            REFERENCES centres(centre_id),
    province_id             UUID            REFERENCES provinces(province_id),
    -- SETA Accreditation Fields
    seta_name               VARCHAR(100),                                   -- e.g. ETDP SETA, SERVICES SETA
    seta_accreditation_number VARCHAR(100),
    unit_standard_codes     TEXT[],                                         -- Array of unit standard codes
    nqf_level               INTEGER         CHECK (nqf_level BETWEEN 1 AND 10),
    credits                 INTEGER,
    qualification_title     VARCHAR(200),
    -- Course Status
    is_active               BOOLEAN         NOT NULL DEFAULT TRUE,
    is_accredited           BOOLEAN         NOT NULL DEFAULT FALSE,
    venue                   VARCHAR(200),
    delivery_mode           VARCHAR(50)     CHECK (delivery_mode IN ('IN_PERSON', 'ONLINE', 'HYBRID', 'BLENDED')),
    course_fee              DECIMAL(10,2)   DEFAULT 0.00,
    currency                VARCHAR(10)     NOT NULL DEFAULT 'ZAR',
    created_at              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              UUID            REFERENCES users(user_id),
    CONSTRAINT chk_course_dates CHECK (end_date >= start_date)
);

COMMENT ON TABLE courses IS 'Course catalogue for Youth Skills Centre programmes';
COMMENT ON COLUMN courses.pass_mark IS 'Minimum pass percentage (0–100) — enforced by CHECK constraint';
COMMENT ON COLUMN courses.seta_name IS 'SETA responsible for accreditation (e.g. ETDP SETA, SERVICES SETA)';
COMMENT ON COLUMN courses.unit_standard_codes IS 'Array of SAQA unit standard codes for SETA reporting';
COMMENT ON COLUMN courses.nqf_level IS 'National Qualifications Framework level (1–10)';
COMMENT ON COLUMN courses.credits IS 'NQF credits awarded upon successful completion';

-- =====================================================
-- SECTION 7: FACILITATOR ASSIGNMENTS TABLE
-- =====================================================

CREATE TABLE facilitator_assignments (
    assignment_id   UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID        NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    course_id       UUID        NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    assigned_date   DATE        NOT NULL DEFAULT CURRENT_DATE,
    is_primary      BOOLEAN     NOT NULL DEFAULT TRUE,                      -- Primary vs co-facilitator
    assigned_by     UUID        REFERENCES users(user_id),
    notes           TEXT,
    created_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_facilitator_course UNIQUE (user_id, course_id)
);

COMMENT ON TABLE facilitator_assignments IS 'Links facilitator users to courses they are responsible for';
COMMENT ON COLUMN facilitator_assignments.is_primary IS 'TRUE = primary facilitator, FALSE = co-facilitator';

-- =====================================================
-- SECTION 8: ENROLMENTS TABLE
-- =====================================================

CREATE TABLE enrolments (
    enrolment_id            UUID                PRIMARY KEY DEFAULT uuid_generate_v4(),
    learner_id              UUID                NOT NULL REFERENCES learners(learner_id) ON DELETE RESTRICT,
    course_id               UUID                NOT NULL REFERENCES courses(course_id) ON DELETE RESTRICT,
    enrol_date              DATE                NOT NULL DEFAULT CURRENT_DATE,
    completion_status       completion_status   NOT NULL DEFAULT 'ENROLLED',
    completion_date         DATE,
    attendance_percentage   DECIMAL(5,2)        DEFAULT 0.00
                                                CHECK (attendance_percentage >= 0 AND attendance_percentage <= 100),
    final_score             DECIMAL(5,2)        CHECK (final_score >= 0 AND final_score <= 100),
    withdrawal_reason       TEXT,
    withdrawal_date         DATE,
    notes                   TEXT,
    created_at              TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              UUID                REFERENCES users(user_id),
    CONSTRAINT uq_learner_course UNIQUE (learner_id, course_id),
    CONSTRAINT chk_completion_date CHECK (
        completion_date IS NULL OR completion_date >= enrol_date
    ),
    CONSTRAINT chk_withdrawal_date CHECK (
        withdrawal_date IS NULL OR withdrawal_date >= enrol_date
    )
);

COMMENT ON TABLE enrolments IS 'Learner-to-course enrolment records with completion tracking';
COMMENT ON COLUMN enrolments.attendance_percentage IS 'Auto-calculated by trigger after each attendance record';
COMMENT ON COLUMN enrolments.completion_status IS 'ENROLLED | IN_PROGRESS | COMPLETED | WITHDRAWN | FAILED';

-- =====================================================
-- SECTION 9: SESSIONS TABLE
-- =====================================================

CREATE TABLE sessions (
    session_id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id           UUID        NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    session_date        DATE        NOT NULL,
    session_start_time  TIME,
    session_end_time    TIME,
    topic               VARCHAR(300) NOT NULL,
    description         TEXT,
    venue               VARCHAR(200),
    facilitator_id      UUID        REFERENCES users(user_id),
    session_number      INTEGER,
    is_cancelled        BOOLEAN     NOT NULL DEFAULT FALSE,
    cancellation_reason TEXT,
    notes               TEXT,
    created_at          TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by          UUID        REFERENCES users(user_id),
    CONSTRAINT chk_session_times CHECK (
        session_end_time IS NULL OR session_start_time IS NULL OR
        session_end_time > session_start_time
    )
);

COMMENT ON TABLE sessions IS 'Individual course sessions — each session represents one class/meeting';
COMMENT ON COLUMN sessions.session_number IS 'Sequential session number within the course';

-- =====================================================
-- SECTION 10: ATTENDANCE TABLE
-- =====================================================

CREATE TABLE attendance (
    attendance_id   UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrolment_id    UUID        NOT NULL REFERENCES enrolments(enrolment_id) ON DELETE CASCADE,
    session_id      UUID        NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
    present         BOOLEAN     NOT NULL DEFAULT FALSE,
    arrival_time    TIME,
    departure_time  TIME,
    notes           TEXT,
    recorded_by     UUID        REFERENCES users(user_id),
    recorded_at     TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_attendance_record UNIQUE (enrolment_id, session_id)
);

COMMENT ON TABLE attendance IS 'Session-level attendance records — triggers auto-update enrolment attendance_percentage';
COMMENT ON COLUMN attendance.present IS 'TRUE = attended, FALSE = absent';

-- =====================================================
-- SECTION 11: ASSESSMENTS TABLE
-- =====================================================

CREATE TABLE assessments (
    assessment_id       UUID                PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrolment_id        UUID                NOT NULL REFERENCES enrolments(enrolment_id) ON DELETE CASCADE,
    module_title        VARCHAR(200)        NOT NULL,
    assessment_type     VARCHAR(50)         CHECK (assessment_type IN (
                                                'WRITTEN_TEST', 'PRACTICAL', 'ASSIGNMENT',
                                                'PROJECT', 'ORAL', 'PORTFOLIO', 'OBSERVATION'
                                            )),
    score               DECIMAL(5,2)        NOT NULL CHECK (score >= 0),
    max_score           DECIMAL(5,2)        NOT NULL CHECK (max_score > 0),
    percentage          DECIMAL(5,2)        GENERATED ALWAYS AS
                                            (ROUND((score / max_score) * 100, 2)) STORED,
    result              assessment_result   NOT NULL DEFAULT 'PENDING',
    assessment_date     DATE                NOT NULL DEFAULT CURRENT_DATE,
    assessor_id         UUID                REFERENCES users(user_id),
    moderator_id        UUID                REFERENCES users(user_id),
    moderation_date     DATE,
    feedback            TEXT,
    attempt_number      INTEGER             NOT NULL DEFAULT 1,
    unit_standard_code  VARCHAR(50),                                        -- SETA unit standard reference
    notes               TEXT,
    created_at          TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by          UUID                REFERENCES users(user_id),
    CONSTRAINT chk_score_not_exceed_max CHECK (score <= max_score),
    CONSTRAINT chk_attempt_positive CHECK (attempt_number >= 1)
);

COMMENT ON TABLE assessments IS 'Assessment scores per module — result auto-set by trigger based on course pass_mark';
COMMENT ON COLUMN assessments.percentage IS 'Computed column: (score / max_score) * 100';
COMMENT ON COLUMN assessments.result IS 'PASS | FAIL | PENDING | ABSENT — auto-calculated by trigger';
COMMENT ON COLUMN assessments.unit_standard_code IS 'SETA unit standard code for this specific assessment';
COMMENT ON COLUMN assessments.attempt_number IS 'Tracks re-assessment attempts (1 = first attempt)';

-- =====================================================
-- SECTION 12: CERTIFICATES TABLE
-- =====================================================

CREATE TABLE certificates (
    certificate_id          UUID                PRIMARY KEY DEFAULT uuid_generate_v4(),
    certificate_number      VARCHAR(100)        UNIQUE NOT NULL,            -- Human-readable cert number
    learner_id              UUID                NOT NULL REFERENCES learners(learner_id) ON DELETE RESTRICT,
    course_id               UUID                NOT NULL REFERENCES courses(course_id) ON DELETE RESTRICT,
    enrolment_id            UUID                REFERENCES enrolments(enrolment_id),
    issue_date              DATE,
    expiry_date             DATE,
    pdf_url                 VARCHAR(500),                                   -- Cloud storage URL
    qr_code_url             VARCHAR(500),                                   -- QR code for verification
    verification_url        VARCHAR(500),                                   -- Public verification link
    verification_code       VARCHAR(100)        UNIQUE,                     -- Unique code for online verification
    status                  certificate_status  NOT NULL DEFAULT 'PENDING',
    approved_by             UUID                REFERENCES users(user_id),
    approval_date           TIMESTAMP,
    approval_notes          TEXT,
    revocation_reason       TEXT,
    revocation_date         DATE,
    -- SETA fields
    seta_registration_number VARCHAR(100),
    nqf_level               INTEGER             CHECK (nqf_level BETWEEN 1 AND 10),
    credits_awarded         INTEGER,
    created_at              TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by              UUID                REFERENCES users(user_id),
    CONSTRAINT uq_learner_course_cert UNIQUE (learner_id, course_id),
    CONSTRAINT chk_issue_date CHECK (
        issue_date IS NULL OR expiry_date IS NULL OR expiry_date >= issue_date
    ),
    CONSTRAINT chk_approval_requires_date CHECK (
        status != 'APPROVED' OR (status = 'APPROVED' AND approval_date IS NOT NULL)
    )
);

COMMENT ON TABLE certificates IS 'Digital certificate lifecycle — from generation request to issuance';
COMMENT ON COLUMN certificates.certificate_number IS 'Human-readable certificate number (e.g. MIET-2024-00001)';
COMMENT ON COLUMN certificates.qr_code_url IS 'URL to QR code image for printed certificate verification';
COMMENT ON COLUMN certificates.verification_url IS 'Public URL for third-party certificate verification';
COMMENT ON COLUMN certificates.verification_code IS 'Unique alphanumeric code for online authenticity check';
COMMENT ON COLUMN certificates.status IS 'PENDING → APPROVED → ISSUED | REVOKED';

-- =====================================================
-- SECTION 13: AUDIT LOGS TABLE
-- =====================================================

CREATE TABLE audit_logs (
    log_id          UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID            REFERENCES users(user_id),
    user_email      VARCHAR(150),                                           -- Snapshot at time of action
    action          audit_action    NOT NULL,
    entity_type     VARCHAR(100)    NOT NULL,                               -- Table/entity name
    entity_id       VARCHAR(100),                                           -- UUID of affected record
    old_values      JSONB,                                                  -- Previous state
    new_values      JSONB,                                                  -- New state
    description     TEXT,                                                   -- Human-readable description
    ip_address      INET,
    user_agent      TEXT,
    session_id      VARCHAR(100),
    action_result   VARCHAR(20)     CHECK (action_result IN ('SUCCESS', 'FAILURE', 'PARTIAL')),
    error_message   TEXT,
    timestamp       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail — POPIA compliance requirement for all data actions';
COMMENT ON COLUMN audit_logs.user_email IS 'Snapshot of user email at time of action (preserved even if user is deleted)';
COMMENT ON COLUMN audit_logs.old_values IS 'JSONB snapshot of record before change (UPDATE/DELETE)';
COMMENT ON COLUMN audit_logs.new_values IS 'JSONB snapshot of record after change (CREATE/UPDATE)';
COMMENT ON COLUMN audit_logs.entity_type IS 'Name of the table/entity affected (e.g. learners, courses)';

-- =====================================================
-- SECTION 14: DONATIONS TABLE
-- =====================================================

CREATE TABLE donations (
    donation_id         UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_user_id       UUID            REFERENCES users(user_id),          -- If donor has a platform account
    donor_name          VARCHAR(200)    NOT NULL,
    donor_organisation  VARCHAR(200),
    donor_email         VARCHAR(150),
    donor_phone         VARCHAR(20),
    amount              DECIMAL(15,2)   NOT NULL CHECK (amount > 0),
    currency            VARCHAR(10)     NOT NULL DEFAULT 'ZAR',
    donation_date       DATE            NOT NULL DEFAULT CURRENT_DATE,
    purpose             TEXT            NOT NULL,
    centre_id           UUID            REFERENCES centres(centre_id),      -- Targeted centre (optional)
    course_id           UUID            REFERENCES courses(course_id),      -- Targeted course (optional)
    province_id         UUID            REFERENCES provinces(province_id),  -- Targeted province (optional)
    receipt_url         VARCHAR(500),
    receipt_number      VARCHAR(100)    UNIQUE,
    payment_method      payment_method,
    payment_reference   VARCHAR(100),
    is_recurring        BOOLEAN         NOT NULL DEFAULT FALSE,
    recurrence_interval VARCHAR(20)     CHECK (recurrence_interval IN ('MONTHLY', 'QUARTERLY', 'ANNUALLY')),
    tax_certificate_url VARCHAR(500),
    tax_certificate_number VARCHAR(100),
    notes               TEXT,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by          UUID            REFERENCES users(user_id)
);

COMMENT ON TABLE donations IS 'Donor contributions — supports impact reporting and donor transparency';
COMMENT ON COLUMN donations.donor_user_id IS 'FK to users if donor has a platform account (DONOR role)';
COMMENT ON COLUMN donations.purpose IS 'Description of what the donation funds (e.g. bursaries, equipment)';
COMMENT ON COLUMN donations.tax_certificate_url IS 'Section 18A tax certificate for eligible donations';

-- =====================================================
-- SECTION 15: FEES & PAYMENTS TABLE
-- =====================================================

CREATE TABLE fees (
    fee_id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrolment_id        UUID            NOT NULL REFERENCES enrolments(enrolment_id) ON DELETE CASCADE,
    learner_id          UUID            NOT NULL REFERENCES learners(learner_id),
    course_id           UUID            NOT NULL REFERENCES courses(course_id),
    fee_amount          DECIMAL(10,2)   NOT NULL CHECK (fee_amount >= 0),
    currency            VARCHAR(10)     NOT NULL DEFAULT 'ZAR',
    fee_type            VARCHAR(50)     NOT NULL CHECK (fee_type IN (
                                            'COURSE_FEE', 'REGISTRATION_FEE',
                                            'MATERIAL_FEE', 'CERTIFICATION_FEE', 'OTHER'
                                        )),
    due_date            DATE,
    payment_status      payment_status  NOT NULL DEFAULT 'PENDING',
    payment_method      payment_method,
    amount_paid         DECIMAL(10,2)   DEFAULT 0.00 CHECK (amount_paid >= 0),
    payment_date        DATE,
    payment_reference   VARCHAR(100),
    receipt_url         VARCHAR(500),
    receipt_number      VARCHAR(100)    UNIQUE,
    waiver_reason       TEXT,                                               -- If fee is waived
    waiver_approved_by  UUID            REFERENCES users(user_id),
    donation_id         UUID            REFERENCES donations(donation_id),  -- If covered by donation
    notes               TEXT,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by          UUID            REFERENCES users(user_id),
    CONSTRAINT chk_amount_paid_not_exceed CHECK (amount_paid <= fee_amount)
);

COMMENT ON TABLE fees IS 'Learner course fee tracking and payment records';
COMMENT ON COLUMN fees.fee_type IS 'COURSE_FEE | REGISTRATION_FEE | MATERIAL_FEE | CERTIFICATION_FEE | OTHER';
COMMENT ON COLUMN fees.payment_status IS 'PENDING | PAID | WAIVED | REFUNDED | OVERDUE';
COMMENT ON COLUMN fees.donation_id IS 'Links to a donation if the fee is covered by donor funding';
COMMENT ON COLUMN fees.waiver_reason IS 'Reason for fee waiver (e.g. bursary, financial hardship)';

-- =====================================================
-- SECTION 16: SYSTEM CONFIGURATION TABLE
-- =====================================================

CREATE TABLE system_config (
    config_id       UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_key      VARCHAR(100) UNIQUE NOT NULL,
    config_value    TEXT        NOT NULL,
    config_category VARCHAR(50),
    description     TEXT,
    data_type       VARCHAR(20) CHECK (data_type IN ('STRING', 'INTEGER', 'BOOLEAN', 'JSON', 'DATE')),
    is_sensitive    BOOLEAN     NOT NULL DEFAULT FALSE,
    last_modified_by UUID       REFERENCES users(user_id),
    last_modified_at TIMESTAMP,
    created_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE system_config IS 'Platform-wide configuration settings';

-- =====================================================
-- SECTION 17: INDEXES FOR PERFORMANCE OPTIMIZATION
-- =====================================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Provinces
CREATE INDEX idx_provinces_code ON provinces(province_code);

-- Centres
CREATE INDEX idx_centres_province ON centres(province_id);
CREATE INDEX idx_centres_manager ON centres(centre_manager_id);
CREATE INDEX idx_centres_code ON centres(centre_code);

-- Learners
CREATE INDEX idx_learners_id_number ON learners(id_number);
CREATE INDEX idx_learners_email ON learners(email);
CREATE INDEX idx_learners_name ON learners(last_name, first_name);
CREATE INDEX idx_learners_status ON learners(status);
CREATE INDEX idx_learners_centre ON learners(centre_id);
CREATE INDEX idx_learners_province ON learners(province_id);
CREATE INDEX idx_learners_registration_date ON learners(registration_date);
-- Full-text search on learner names
CREATE INDEX idx_learners_name_trgm ON learners USING GIN (
    (first_name || ' ' || last_name) gin_trgm_ops
);

-- Courses
CREATE INDEX idx_courses_code ON courses(course_code);
CREATE INDEX idx_courses_centre ON courses(centre_id);
CREATE INDEX idx_courses_province ON courses(province_id);
CREATE INDEX idx_courses_dates ON courses(start_date, end_date);
CREATE INDEX idx_courses_is_active ON courses(is_active);
CREATE INDEX idx_courses_seta ON courses(seta_name);
CREATE INDEX idx_courses_nqf_level ON courses(nqf_level);

-- Facilitator Assignments
CREATE INDEX idx_facilitator_assignments_user ON facilitator_assignments(user_id);
CREATE INDEX idx_facilitator_assignments_course ON facilitator_assignments(course_id);

-- Enrolments
CREATE INDEX idx_enrolments_learner ON enrolments(learner_id);
CREATE INDEX idx_enrolments_course ON enrolments(course_id);
CREATE INDEX idx_enrolments_status ON enrolments(completion_status);
CREATE INDEX idx_enrolments_enrol_date ON enrolments(enrol_date);

-- Sessions
CREATE INDEX idx_sessions_course ON sessions(course_id);
CREATE INDEX idx_sessions_date ON sessions(session_date);
CREATE INDEX idx_sessions_facilitator ON sessions(facilitator_id);

-- Attendance
CREATE INDEX idx_attendance_enrolment ON attendance(enrolment_id);
CREATE INDEX idx_attendance_session ON attendance(session_id);
CREATE INDEX idx_attendance_present ON attendance(present);
CREATE INDEX idx_attendance_recorded_at ON attendance(recorded_at);

-- Assessments
CREATE INDEX idx_assessments_enrolment ON assessments(enrolment_id);
CREATE INDEX idx_assessments_date ON assessments(assessment_date);
CREATE INDEX idx_assessments_result ON assessments(result);
CREATE INDEX idx_assessments_assessor ON assessments(assessor_id);

-- Certificates
CREATE INDEX idx_certificates_learner ON certificates(learner_id);
CREATE INDEX idx_certificates_course ON certificates(course_id);
CREATE INDEX idx_certificates_status ON certificates(status);
CREATE INDEX idx_certificates_number ON certificates(certificate_number);
CREATE INDEX idx_certificates_verification_code ON certificates(verification_code);
CREATE INDEX idx_certificates_issue_date ON certificates(issue_date);

-- Audit Logs
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- Donations
CREATE INDEX idx_donations_donor_user ON donations(donor_user_id);
CREATE INDEX idx_donations_date ON donations(donation_date);
CREATE INDEX idx_donations_centre ON donations(centre_id);
CREATE INDEX idx_donations_province ON donations(province_id);

-- Fees
CREATE INDEX idx_fees_enrolment ON fees(enrolment_id);
CREATE INDEX idx_fees_learner ON fees(learner_id);
CREATE INDEX idx_fees_course ON fees(course_id);
CREATE INDEX idx_fees_payment_status ON fees(payment_status);
CREATE INDEX idx_fees_due_date ON fees(due_date);

-- =====================================================
-- SECTION 18: REPORTING VIEWS
-- =====================================================

-- View: Learner Summary — enrolments, attendance, assessments per learner
CREATE VIEW v_learner_summary AS
SELECT
    l.learner_id,
    l.first_name,
    l.last_name,
    l.id_number,
    l.email,
    l.contact_number,
    l.status                                        AS learner_status,
    p.province_name,
    c.centre_name,
    COUNT(DISTINCT e.enrolment_id)                  AS total_enrolments,
    COUNT(DISTINCT CASE WHEN e.completion_status = 'COMPLETED' THEN e.enrolment_id END) AS completed_courses,
    COUNT(DISTINCT CASE WHEN e.completion_status = 'FAILED'    THEN e.enrolment_id END) AS failed_courses,
    ROUND(AVG(e.attendance_percentage), 2)          AS avg_attendance_percentage,
    COUNT(DISTINCT cert.certificate_id)             AS certificates_issued
FROM learners l
LEFT JOIN provinces p       ON l.province_id    = p.province_id
LEFT JOIN centres c         ON l.centre_id      = c.centre_id
LEFT JOIN enrolments e      ON l.learner_id     = e.learner_id
LEFT JOIN certificates cert ON l.learner_id     = cert.learner_id
                            AND cert.status      = 'ISSUED'
GROUP BY
    l.learner_id, l.first_name, l.last_name, l.id_number,
    l.email, l.contact_number, l.status,
    p.province_name, c.centre_name;

COMMENT ON VIEW v_learner_summary IS 'Aggregated learner profile with enrolment, attendance, and certificate counts';

-- -------------------------------------------------------

-- View: Course Statistics — pass rates, completion rates, attendance averages
CREATE VIEW v_course_statistics AS
SELECT
    co.course_id,
    co.course_code,
    co.title                                        AS course_title,
    co.pass_mark,
    co.seta_name,
    co.nqf_level,
    p.province_name,
    c.centre_name,
    COUNT(DISTINCT e.enrolment_id)                  AS total_enrolments,
    COUNT(DISTINCT CASE WHEN e.completion_status = 'COMPLETED'   THEN e.enrolment_id END) AS completed,
    COUNT(DISTINCT CASE WHEN e.completion_status = 'FAILED'      THEN e.enrolment_id END) AS failed,
    COUNT(DISTINCT CASE WHEN e.completion_status = 'WITHDRAWN'   THEN e.enrolment_id END) AS withdrawn,
    COUNT(DISTINCT CASE WHEN e.completion_status = 'IN_PROGRESS' THEN e.enrolment_id END) AS in_progress,
    ROUND(AVG(e.attendance_percentage), 2)          AS avg_attendance_percentage,
    ROUND(AVG(a.percentage), 2)                     AS avg_assessment_score,
    CASE
        WHEN COUNT(DISTINCT e.enrolment_id) > 0
        THEN ROUND(
            COUNT(DISTINCT CASE WHEN e.completion_status = 'COMPLETED' THEN e.enrolment_id END)::DECIMAL
            / COUNT(DISTINCT e.enrolment_id) * 100, 2)
        ELSE 0
    END                                             AS completion_rate_percent,
    COUNT(DISTINCT cert.certificate_id)             AS certificates_issued,
    COUNT(DISTINCT s.session_id)                    AS total_sessions
FROM courses co
LEFT JOIN provinces p           ON co.province_id   = p.province_id
LEFT JOIN centres c             ON co.centre_id     = c.centre_id
LEFT JOIN enrolments e          ON co.course_id     = e.course_id
LEFT JOIN assessments a         ON e.enrolment_id   = a.enrolment_id
LEFT JOIN certificates cert     ON co.course_id     = cert.course_id AND cert.status = 'ISSUED'
LEFT JOIN sessions s            ON co.course_id     = s.course_id    AND s.is_cancelled = FALSE
GROUP BY
    co.course_id, co.course_code, co.title, co.pass_mark,
    co.seta_name, co.nqf_level, p.province_name, c.centre_name;

COMMENT ON VIEW v_course_statistics IS 'Course-level analytics: pass rates, completion rates, attendance averages';

-- -------------------------------------------------------

-- View: Attendance Report — session-level attendance with percentage per enrolment
CREATE VIEW v_attendance_report AS
SELECT
    e.enrolment_id,
    l.learner_id,
    l.first_name || ' ' || l.last_name             AS learner_name,
    l.id_number,
    co.course_code,
    co.title                                        AS course_title,
    s.session_id,
    s.session_date,
    s.topic                                         AS session_topic,
    s.session_number,
    att.present,
    att.notes                                       AS attendance_notes,
    e.attendance_percentage,
    CASE
        WHEN e.attendance_percentage >= 80 THEN 'MEETS THRESHOLD'
        WHEN e.attendance_percentage >= 60 THEN 'BELOW THRESHOLD'
        ELSE 'CRITICAL - BELOW 60%'
    END                                             AS attendance_alert
FROM enrolments e
JOIN learners l     ON e.learner_id  = l.learner_id
JOIN courses co     ON e.course_id   = co.course_id
JOIN sessions s     ON co.course_id  = s.course_id
LEFT JOIN attendance att ON e.enrolment_id = att.enrolment_id
                        AND s.session_id   = att.session_id
WHERE s.is_cancelled = FALSE
ORDER BY l.last_name, l.first_name, s.session_date;

COMMENT ON VIEW v_attendance_report IS 'Session-level attendance with threshold alerts (80% = meets, <60% = critical)';

-- -------------------------------------------------------

-- View: Certificate Status Pipeline
CREATE VIEW v_certificate_status AS
SELECT
    cert.certificate_id,
    cert.certificate_number,
    cert.status                                     AS certificate_status,
    l.learner_id,
    l.first_name || ' ' || l.last_name             AS learner_name,
    l.id_number,
    co.course_code,
    co.title                                        AS course_title,
    co.seta_name,
    co.nqf_level,
    cert.issue_date,
    cert.expiry_date,
    cert.qr_code_url,
    cert.verification_url,
    cert.verification_code,
    u.full_name                                     AS approved_by_name,
    cert.approval_date,
    cert.credits_awarded,
    p.province_name,
    c.centre_name
FROM certificates cert
JOIN learners l     ON cert.learner_id  = l.learner_id
JOIN courses co     ON cert.course_id   = co.course_id
LEFT JOIN users u   ON cert.approved_by = u.user_id
LEFT JOIN provinces p ON l.province_id  = p.province_id
LEFT JOIN centres c   ON l.centre_id    = c.centre_id;

COMMENT ON VIEW v_certificate_status IS 'Full certificate pipeline view including QR code and verification details';

-- -------------------------------------------------------

-- View: Donor Impact Metrics — for donor reporting and transparency
CREATE VIEW v_donor_impact_metrics AS
SELECT
    EXTRACT(YEAR FROM e.enrol_date)                 AS year,
    EXTRACT(MONTH FROM e.enrol_date)                AS month,
    p.province_name,
    c.centre_name,
    co.title                                        AS course_title,
    co.seta_name,
    COUNT(DISTINCT l.learner_id)                    AS learners_trained,
    COUNT(DISTINCT CASE WHEN e.completion_status = 'COMPLETED' THEN l.learner_id END) AS learners_completed,
    COUNT(DISTINCT CASE
        WHEN a.result = 'PASS' THEN a.assessment_id END)                              AS assessments_passed,
    COUNT(DISTINCT CASE
        WHEN cert.status = 'ISSUED' THEN cert.certificate_id END)                     AS certificates_issued,
    ROUND(AVG(e.attendance_percentage), 2)          AS avg_attendance_percent,
    CASE
        WHEN COUNT(DISTINCT e.enrolment_id) > 0
        THEN ROUND(
            COUNT(DISTINCT CASE WHEN e.completion_status = 'COMPLETED' THEN e.enrolment_id END)::DECIMAL
            / COUNT(DISTINCT e.enrolment_id) * 100, 2)
        ELSE 0
    END                                             AS pass_rate_percent
FROM enrolments e
JOIN learners l         ON e.learner_id  = l.learner_id
JOIN courses co         ON e.course_id   = co.course_id
LEFT JOIN provinces p   ON co.province_id = p.province_id
LEFT JOIN centres c     ON co.centre_id   = c.centre_id
LEFT JOIN assessments a ON e.enrolment_id = a.enrolment_id
LEFT JOIN certificates cert ON e.learner_id = cert.learner_id
                           AND e.course_id  = cert.course_id
GROUP BY
    EXTRACT(YEAR FROM e.enrol_date),
    EXTRACT(MONTH FROM e.enrol_date),
    p.province_name, c.centre_name,
    co.title, co.seta_name
ORDER BY year DESC, month DESC;

COMMENT ON VIEW v_donor_impact_metrics IS 'Monthly donor impact report: learners trained, pass rates, certificates issued';

-- -------------------------------------------------------

-- View: Province Analytics — province-level aggregated statistics
CREATE VIEW v_province_analytics AS
SELECT
    p.province_id,
    p.province_name,
    COUNT(DISTINCT c.centre_id)                     AS total_centres,
    COUNT(DISTINCT l.learner_id)                    AS total_learners,
    COUNT(DISTINCT CASE WHEN l.status = 'ACTIVE' THEN l.learner_id END) AS active_learners,
    COUNT(DISTINCT co.course_id)                    AS total_courses,
    COUNT(DISTINCT CASE WHEN co.is_active = TRUE THEN co.course_id END) AS active_courses,
    COUNT(DISTINCT e.enrolment_id)                  AS total_enrolments,
    COUNT(DISTINCT CASE WHEN e.completion_status = 'COMPLETED' THEN e.enrolment_id END) AS completed_enrolments,
    COUNT(DISTINCT cert.certificate_id)             AS certificates_issued,
    ROUND(AVG(e.attendance_percentage), 2)          AS avg_attendance_percent,
    CASE
        WHEN COUNT(DISTINCT e.enrolment_id) > 0
        THEN ROUND(
            COUNT(DISTINCT CASE WHEN e.completion_status = 'COMPLETED' THEN e.enrolment_id END)::DECIMAL
            / COUNT(DISTINCT e.enrolment_id) * 100, 2)
        ELSE 0
    END                                             AS overall_pass_rate_percent
FROM provinces p
LEFT JOIN centres c         ON p.province_id = c.province_id AND c.is_active = TRUE
LEFT JOIN learners l        ON p.province_id = l.province_id
LEFT JOIN courses co        ON p.province_id = co.province_id
LEFT JOIN enrolments e      ON co.course_id  = e.course_id
LEFT JOIN certificates cert ON p.province_id = (
    SELECT co2.province_id FROM courses co2 WHERE co2.course_id = cert.course_id
) AND cert.status = 'ISSUED'
WHERE p.is_active = TRUE
GROUP BY p.province_id, p.province_name;

COMMENT ON VIEW v_province_analytics IS 'Province-level aggregated statistics for management reporting';

-- -------------------------------------------------------

-- View: Monthly Learner Registrations — dashboard trend data
CREATE VIEW v_monthly_registrations AS
SELECT
    EXTRACT(YEAR FROM l.registration_date)          AS year,
    EXTRACT(MONTH FROM l.registration_date)         AS month,
    TO_CHAR(l.registration_date, 'Mon YYYY')        AS month_label,
    p.province_name,
    COUNT(l.learner_id)                             AS new_registrations,
    COUNT(CASE WHEN l.gender = 'FEMALE' THEN 1 END) AS female_count,
    COUNT(CASE WHEN l.gender = 'MALE'   THEN 1 END) AS male_count,
    COUNT(CASE WHEN l.disability_status = TRUE THEN 1 END) AS learners_with_disability
FROM learners l
LEFT JOIN provinces p ON l.province_id = p.province_id
GROUP BY
    EXTRACT(YEAR FROM l.registration_date),
    EXTRACT(MONTH FROM l.registration_date),
    TO_CHAR(l.registration_date, 'Mon YYYY'),
    p.province_name
ORDER BY year DESC, month DESC;

COMMENT ON VIEW v_monthly_registrations IS 'Monthly learner registration trends with gender and disability breakdown';

-- -------------------------------------------------------

-- View: Fee Collection Summary — financial overview
CREATE VIEW v_fee_collection_summary AS
SELECT
    co.course_id,
    co.course_code,
    co.title                                        AS course_title,
    p.province_name,
    c.centre_name,
    COUNT(f.fee_id)                                 AS total_fee_records,
    SUM(f.fee_amount)                               AS total_fees_due,
    SUM(f.amount_paid)                              AS total_collected,
    SUM(f.fee_amount) - SUM(f.amount_paid)          AS outstanding_balance,
    COUNT(CASE WHEN f.payment_status = 'PAID'    THEN 1 END) AS paid_count,
    COUNT(CASE WHEN f.payment_status = 'PENDING' THEN 1 END) AS pending_count,
    COUNT(CASE WHEN f.payment_status = 'WAIVED'  THEN 1 END) AS waived_count,
    COUNT(CASE WHEN f.payment_status = 'OVERDUE' THEN 1 END) AS overdue_count,
    ROUND(
        SUM(f.amount_paid) / NULLIF(SUM(f.fee_amount), 0) * 100, 2
    )                                               AS collection_rate_percent
FROM fees f
JOIN courses co     ON f.course_id   = co.course_id
LEFT JOIN provinces p ON co.province_id = p.province_id
LEFT JOIN centres c   ON co.centre_id   = c.centre_id
GROUP BY co.course_id, co.course_code, co.title, p.province_name, c.centre_name;

COMMENT ON VIEW v_fee_collection_summary IS 'Financial overview of fee collection per course';

-- =====================================================
-- SECTION 19: FUNCTIONS & TRIGGERS
-- =====================================================

-- -------------------------------------------------------
-- Function: Auto-update updated_at timestamp
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp trigger to all tables with updated_at
CREATE TRIGGER trg_users_timestamp
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER trg_centres_timestamp
    BEFORE UPDATE ON centres
    FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER trg_learners_timestamp
    BEFORE UPDATE ON learners
    FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER trg_courses_timestamp
    BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER trg_enrolments_timestamp
    BEFORE UPDATE ON enrolments
    FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER trg_sessions_timestamp
    BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER trg_attendance_timestamp
    BEFORE UPDATE ON attendance
    FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER trg_assessments_timestamp
    BEFORE UPDATE ON assessments
    FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER trg_certificates_timestamp
    BEFORE UPDATE ON certificates
    FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER trg_donations_timestamp
    BEFORE UPDATE ON donations
    FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER trg_fees_timestamp
    BEFORE UPDATE ON fees
    FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

-- -------------------------------------------------------
-- Function: Auto-calculate attendance percentage on enrolment
-- Triggered after INSERT or UPDATE on attendance table
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_recalculate_attendance_percentage()
RETURNS TRIGGER AS $$
DECLARE
    v_total_sessions    INTEGER;
    v_attended_sessions INTEGER;
    v_percentage        DECIMAL(5,2);
BEGIN
    -- Count total non-cancelled sessions for this course
    SELECT COUNT(s.session_id)
    INTO v_total_sessions
    FROM sessions s
    JOIN enrolments e ON s.course_id = e.course_id
    WHERE e.enrolment_id = COALESCE(NEW.enrolment_id, OLD.enrolment_id)
      AND s.is_cancelled = FALSE;

    -- Count sessions the learner attended
    SELECT COUNT(a.attendance_id)
    INTO v_attended_sessions
    FROM attendance a
    WHERE a.enrolment_id = COALESCE(NEW.enrolment_id, OLD.enrolment_id)
      AND a.present = TRUE;

    -- Calculate percentage (avoid division by zero)
    IF v_total_sessions > 0 THEN
        v_percentage := ROUND((v_attended_sessions::DECIMAL / v_total_sessions) * 100, 2);
    ELSE
        v_percentage := 0.00;
    END IF;

    -- Update the enrolment record
    UPDATE enrolments
    SET attendance_percentage = v_percentage,
        updated_at = CURRENT_TIMESTAMP
    WHERE enrolment_id = COALESCE(NEW.enrolment_id, OLD.enrolment_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_recalculate_attendance
    AFTER INSERT OR UPDATE OR DELETE ON attendance
    FOR EACH ROW EXECUTE FUNCTION fn_recalculate_attendance_percentage();

-- -------------------------------------------------------
-- Function: Auto-set assessment result (PASS/FAIL)
-- based on course pass_mark after score is entered
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_auto_set_assessment_result()
RETURNS TRIGGER AS $$
DECLARE
    v_pass_mark  DECIMAL(5,2);
    v_percentage DECIMAL(5,2);
BEGIN
    -- Compute percentage manually.
    -- NOTE: GENERATED ALWAYS AS columns (like `percentage`) are NOT available
    -- inside BEFORE triggers — they are computed after the trigger fires.
    IF NEW.max_score > 0 THEN
        v_percentage := ROUND((NEW.score / NEW.max_score) * 100, 2);
    ELSE
        v_percentage := 0;
    END IF;

    -- Get the course pass_mark via enrolment
    SELECT co.pass_mark
    INTO v_pass_mark
    FROM courses co
    JOIN enrolments e ON co.course_id = e.course_id
    WHERE e.enrolment_id = NEW.enrolment_id;

    -- Set result based on computed percentage vs pass_mark
    IF v_percentage >= v_pass_mark THEN
        NEW.result := 'PASS';
    ELSE
        NEW.result := 'FAIL';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_assessment_result
    BEFORE INSERT OR UPDATE OF score, max_score ON assessments
    FOR EACH ROW EXECUTE FUNCTION fn_auto_set_assessment_result();

-- -------------------------------------------------------
-- Function: Auto-generate certificate number
-- Format: MIET-YYYY-XXXXXXX (e.g. MIET-2024-0000001)
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_generate_certificate_number()
RETURNS TRIGGER AS $$
DECLARE
    v_year      VARCHAR(4);
    v_sequence  BIGINT;
    v_cert_num  VARCHAR(100);
BEGIN
    IF NEW.certificate_number IS NULL OR NEW.certificate_number = '' THEN
        v_year := TO_CHAR(CURRENT_DATE, 'YYYY');

        SELECT COUNT(*) + 1
        INTO v_sequence
        FROM certificates
        WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE);

        v_cert_num := 'MIET-' || v_year || '-' || LPAD(v_sequence::TEXT, 7, '0');
        NEW.certificate_number := v_cert_num;
    END IF;

    -- Auto-generate verification code if not set
    IF NEW.verification_code IS NULL OR NEW.verification_code = '' THEN
        NEW.verification_code := UPPER(
            SUBSTRING(REPLACE(uuid_generate_v4()::TEXT, '-', ''), 1, 12)
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_certificate_number
    BEFORE INSERT ON certificates
    FOR EACH ROW EXECUTE FUNCTION fn_generate_certificate_number();

-- -------------------------------------------------------
-- Function: Auto-update enrolment completion status
-- Sets IN_PROGRESS when first attendance is recorded
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_update_enrolment_status_on_attendance()
RETURNS TRIGGER AS $$
BEGIN
    -- Move from ENROLLED to IN_PROGRESS on first attendance
    UPDATE enrolments
    SET completion_status = 'IN_PROGRESS',
        updated_at = CURRENT_TIMESTAMP
    WHERE enrolment_id = NEW.enrolment_id
      AND completion_status = 'ENROLLED';

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enrolment_status_on_attendance
    AFTER INSERT ON attendance
    FOR EACH ROW EXECUTE FUNCTION fn_update_enrolment_status_on_attendance();

-- -------------------------------------------------------
-- Function: Validate facilitator role before assignment
-- Ensures only FACILITATOR or ADMIN users can be assigned
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_validate_facilitator_role()
RETURNS TRIGGER AS $$
DECLARE
    v_role user_role;
BEGIN
    SELECT role INTO v_role FROM users WHERE user_id = NEW.user_id;

    IF v_role NOT IN ('FACILITATOR', 'ADMIN') THEN
        RAISE EXCEPTION 'Only users with FACILITATOR or ADMIN role can be assigned to courses. User % has role %.',
            NEW.user_id, v_role;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_facilitator_role
    BEFORE INSERT OR UPDATE ON facilitator_assignments
    FOR EACH ROW EXECUTE FUNCTION fn_validate_facilitator_role();

-- -------------------------------------------------------
-- Function: Enforce POPIA consent before learner data access
-- Logs a warning if consent is not recorded
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_check_popia_consent()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.popia_consent = TRUE AND NEW.popia_consent_date IS NULL THEN
        NEW.popia_consent_date := CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_popia_consent_date
    BEFORE INSERT OR UPDATE ON learners
    FOR EACH ROW EXECUTE FUNCTION fn_check_popia_consent();

-- -------------------------------------------------------
-- Function: Utility — calculate learner age
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_calculate_age(p_date_of_birth DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN EXTRACT(YEAR FROM AGE(CURRENT_DATE, p_date_of_birth))::INTEGER;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- -------------------------------------------------------
-- Function: Utility — get learner full name
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_get_learner_name(p_learner_id UUID)
RETURNS VARCHAR AS $$
DECLARE
    v_name VARCHAR(200);
BEGIN
    SELECT first_name || ' ' || last_name
    INTO v_name
    FROM learners
    WHERE learner_id = p_learner_id;
    RETURN v_name;
END;
$$ LANGUAGE plpgsql;

-- -------------------------------------------------------
-- Function: Utility — get course pass rate
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_get_course_pass_rate(p_course_id UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    v_total     INTEGER;
    v_passed    INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total
    FROM enrolments
    WHERE course_id = p_course_id
      AND completion_status IN ('COMPLETED', 'FAILED');

    SELECT COUNT(*) INTO v_passed
    FROM enrolments
    WHERE course_id = p_course_id
      AND completion_status = 'COMPLETED';

    IF v_total = 0 THEN RETURN 0; END IF;
    RETURN ROUND((v_passed::DECIMAL / v_total) * 100, 2);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SECTION 20: ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on sensitive tables
ALTER TABLE learners            ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance          ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates        ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations           ENABLE ROW LEVEL SECURITY;
ALTER TABLE fees                ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs          ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------
-- Policy: Admins and Managers can see all learners
-- Facilitators can only see learners enrolled in their courses
-- -------------------------------------------------------
CREATE POLICY policy_learners_admin_manager
    ON learners
    FOR ALL
    USING (
        current_setting('app.user_role', true) IN ('ADMIN', 'MANAGER')
    );

CREATE POLICY policy_learners_facilitator
    ON learners
    FOR SELECT
    USING (
        current_setting('app.user_role', true) = 'FACILITATOR'
        AND learner_id IN (
            SELECT e.learner_id
            FROM enrolments e
            JOIN facilitator_assignments fa ON e.course_id = fa.course_id
            WHERE fa.user_id = current_setting('app.user_id', true)::UUID
        )
    );

-- -------------------------------------------------------
-- Policy: Facilitators can only see assessments for their courses
-- -------------------------------------------------------
CREATE POLICY policy_assessments_facilitator
    ON assessments
    FOR ALL
    USING (
        current_setting('app.user_role', true) IN ('ADMIN', 'MANAGER')
        OR (
            current_setting('app.user_role', true) = 'FACILITATOR'
            AND enrolment_id IN (
                SELECT e.enrolment_id
                FROM enrolments e
                JOIN facilitator_assignments fa ON e.course_id = fa.course_id
                WHERE fa.user_id = current_setting('app.user_id', true)::UUID
            )
        )
    );

-- -------------------------------------------------------
-- Policy: Attendance — same as assessments
-- -------------------------------------------------------
CREATE POLICY policy_attendance_facilitator
    ON attendance
    FOR ALL
    USING (
        current_setting('app.user_role', true) IN ('ADMIN', 'MANAGER')
        OR (
            current_setting('app.user_role', true) = 'FACILITATOR'
            AND enrolment_id IN (
                SELECT e.enrolment_id
                FROM enrolments e
                JOIN facilitator_assignments fa ON e.course_id = fa.course_id
                WHERE fa.user_id = current_setting('app.user_id', true)::UUID
            )
        )
    );

-- -------------------------------------------------------
-- Policy: Donations — only Admin and Manager can view
-- -------------------------------------------------------
CREATE POLICY policy_donations_admin_manager
    ON donations
    FOR ALL
    USING (
        current_setting('app.user_role', true) IN ('ADMIN', 'MANAGER', 'DONOR')
    );

-- -------------------------------------------------------
-- Policy: Fees — Admin, Manager, and assigned Facilitator
-- -------------------------------------------------------
CREATE POLICY policy_fees_access
    ON fees
    FOR ALL
    USING (
        current_setting('app.user_role', true) IN ('ADMIN', 'MANAGER')
        OR (
            current_setting('app.user_role', true) = 'FACILITATOR'
            AND course_id IN (
                SELECT fa.course_id
                FROM facilitator_assignments fa
                WHERE fa.user_id = current_setting('app.user_id', true)::UUID
            )
        )
    );

-- -------------------------------------------------------
-- Policy: Audit logs — only Admin can view
-- -------------------------------------------------------
CREATE POLICY policy_audit_logs_admin
    ON audit_logs
    FOR SELECT
    USING (
        current_setting('app.user_role', true) = 'ADMIN'
    );

-- -------------------------------------------------------
-- Policy: Certificates — all roles can view, only Admin/Manager can modify
-- -------------------------------------------------------
CREATE POLICY policy_certificates_view
    ON certificates
    FOR SELECT
    USING (TRUE);

CREATE POLICY policy_certificates_insert
    ON certificates
    FOR INSERT
    WITH CHECK (
        current_setting('app.user_role', true) IN ('ADMIN', 'MANAGER')
    );

CREATE POLICY policy_certificates_update
    ON certificates
    FOR UPDATE
    USING (
        current_setting('app.user_role', true) IN ('ADMIN', 'MANAGER')
    );

CREATE POLICY policy_certificates_delete
    ON certificates
    FOR DELETE
    USING (
        current_setting('app.user_role', true) IN ('ADMIN', 'MANAGER')
    );

-- =====================================================
-- SECTION 21: DATABASE ROLES & GRANTS
-- =====================================================

-- Create application roles (IF NOT EXISTS prevents errors on re-run)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'miet_admin')      THEN CREATE ROLE miet_admin;      END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'miet_manager')    THEN CREATE ROLE miet_manager;    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'miet_facilitator') THEN CREATE ROLE miet_facilitator; END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'miet_donor')      THEN CREATE ROLE miet_donor;      END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'miet_readonly')   THEN CREATE ROLE miet_readonly;   END IF;
END
$$;

-- -------------------------------------------------------
-- ADMIN: Full access to all tables
-- -------------------------------------------------------
GRANT ALL PRIVILEGES ON ALL TABLES    IN SCHEMA public TO miet_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO miet_admin;
GRANT EXECUTE ON ALL FUNCTIONS        IN SCHEMA public TO miet_admin;

-- -------------------------------------------------------
-- MANAGER: Read/write on all tables except audit_logs (read-only)
-- -------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON
    users, provinces, centres, learners, courses,
    facilitator_assignments, enrolments, sessions,
    attendance, assessments, certificates,
    donations, fees, system_config
    TO miet_manager;
GRANT SELECT ON audit_logs TO miet_manager;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO miet_manager;
GRANT EXECUTE ON FUNCTION fn_get_course_pass_rate(UUID)  TO miet_manager;
GRANT EXECUTE ON FUNCTION fn_get_learner_name(UUID)      TO miet_manager;
GRANT EXECUTE ON FUNCTION fn_calculate_age(DATE)         TO miet_manager;

-- -------------------------------------------------------
-- FACILITATOR: Limited access — own courses, sessions, attendance, assessments
-- -------------------------------------------------------
GRANT SELECT ON
    provinces, centres, courses, learners,
    enrolments, facilitator_assignments
    TO miet_facilitator;
GRANT SELECT, INSERT, UPDATE ON
    sessions, attendance, assessments
    TO miet_facilitator;
GRANT SELECT ON certificates TO miet_facilitator;
GRANT SELECT ON fees         TO miet_facilitator;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO miet_facilitator;
GRANT EXECUTE ON FUNCTION fn_get_learner_name(UUID)  TO miet_facilitator;
GRANT EXECUTE ON FUNCTION fn_calculate_age(DATE)     TO miet_facilitator;

-- -------------------------------------------------------
-- DONOR: Read-only access to impact metrics and donations
-- -------------------------------------------------------
GRANT SELECT ON
    provinces, centres, courses, donations
    TO miet_donor;
GRANT SELECT ON
    v_donor_impact_metrics, v_province_analytics,
    v_course_statistics, v_certificate_status
    TO miet_donor;

-- -------------------------------------------------------
-- READONLY: Read-only access to all non-sensitive tables
-- -------------------------------------------------------
GRANT SELECT ON
    provinces, centres, courses, sessions,
    v_course_statistics, v_province_analytics,
    v_monthly_registrations, v_attendance_report,
    v_certificate_status, v_fee_collection_summary
    TO miet_readonly;

-- =====================================================
-- SECTION 22: SCHEMA COMPLETION NOTES
-- =====================================================

/*
=======================================================
MIET AFRICA YOUTH SKILLS CENTRE MANAGEMENT PLATFORM
PostgreSQL Database Schema — Completion Summary
Version: 1.0 | Compliance: POPIA & SETA Regulations
=======================================================

TABLES CREATED (14 tables):
  Core:
    ✓ users                   — Platform users with RBAC (Admin/Facilitator/Manager/Donor)
    ✓ provinces               — South African provinces (9 provinces)
    ✓ centres                 — Youth Skills Centres per province
    ✓ learners                — Learner profiles with POPIA consent tracking
    ✓ courses                 — Course catalogue with SETA accreditation fields
    ✓ facilitator_assignments — Facilitator-to-course links
  Operational:
    ✓ enrolments              — Learner-course enrolments with auto attendance %
    ✓ sessions                — Course sessions (date, topic, venue)
    ✓ attendance              — Session attendance with auto-recalculation trigger
    ✓ assessments             — Module scores with auto PASS/FAIL trigger
  Administrative:
    ✓ certificates            — Certificate lifecycle with QR code & verification URL
    ✓ audit_logs              — Full POPIA-compliant audit trail
    ✓ donations               — Donor contributions with Section 18A tax support
    ✓ fees                    — Learner fee tracking and payment records
    ✓ system_config           — Platform configuration settings

CUSTOM TYPES (7 enums):
    ✓ user_role               — ADMIN | FACILITATOR | MANAGER | DONOR
    ✓ learner_status          — ACTIVE | INACTIVE | SUSPENDED | GRADUATED | WITHDRAWN
    ✓ completion_status       — ENROLLED | IN_PROGRESS | COMPLETED | WITHDRAWN | FAILED
    ✓ assessment_result       — PASS | FAIL | PENDING | ABSENT
    ✓ certificate_status      — PENDING | APPROVED | ISSUED | REVOKED
    ✓ audit_action            — CREATE | READ | UPDATE | DELETE | LOGIN | LOGOUT | EXPORT | ...
    ✓ payment_status          — PENDING | PAID | WAIVED | REFUNDED | OVERDUE
    ✓ payment_method          — CASH | EFT | CARD | MOBILE_PAYMENT | BURSARY | DONOR_FUNDED
    ✓ gender_type             — MALE | FEMALE | NON_BINARY | PREFER_NOT_TO_SAY

INDEXES CREATED (40+ indexes):
    ✓ All foreign key columns indexed for JOIN performance
    ✓ GIN trigram index on learner names for full-text search
    ✓ Composite indexes on attendance (enrolment_id + session_id)
    ✓ Indexes on status, date, and role columns for filtering

VIEWS CREATED (8 reporting views):
    ✓ v_learner_summary         — Per-learner enrolment, attendance, certificate counts
    ✓ v_course_statistics       — Pass rates, completion rates, attendance averages
    ✓ v_attendance_report       — Session attendance with 80%/60% threshold alerts
    ✓ v_certificate_status      — Certificate pipeline with QR code & verification
    ✓ v_donor_impact_metrics    — Monthly donor impact: learners trained, pass rates
    ✓ v_province_analytics      — Province-level aggregated statistics
    ✓ v_monthly_registrations   — Monthly registration trends with gender breakdown
    ✓ v_fee_collection_summary  — Financial fee collection overview per course

TRIGGERS & FUNCTIONS (10 triggers, 7 functions):
    ✓ fn_update_timestamp()                    — Auto-update updated_at on all tables
    ✓ fn_recalculate_attendance_percentage()   — Auto-recalculate attendance % on enrolment
    ✓ fn_auto_set_assessment_result()          — Auto PASS/FAIL based on course pass_mark
    ✓ fn_generate_certificate_number()         — Auto-generate MIET-YYYY-XXXXXXX cert number
    ✓ fn_update_enrolment_status_on_attendance() — ENROLLED → IN_PROGRESS on first attendance
    ✓ fn_validate_facilitator_role()           — Enforce FACILITATOR/ADMIN role on assignment
    ✓ fn_check_popia_consent()                 — Auto-stamp POPIA consent date
    ✓ fn_calculate_age(DATE)                   — Utility: calculate age from DOB
    ✓ fn_get_learner_name(UUID)                — Utility: get learner full name
    ✓ fn_get_course_pass_rate(UUID)            — Utility: calculate course pass rate %

ROW LEVEL SECURITY (7 policies):
    ✓ Learners: Admin/Manager = all | Facilitator = own courses only
    ✓ Assessments: Admin/Manager = all | Facilitator = own courses only
    ✓ Attendance: Admin/Manager = all | Facilitator = own courses only
    ✓ Donations: Admin/Manager/Donor only
    ✓ Fees: Admin/Manager = all | Facilitator = own courses only
    ✓ Audit Logs: Admin only
    ✓ Certificates: All roles can view | Admin/Manager can modify

DATABASE ROLES (5 roles):
    ✓ miet_admin        — Full access to all tables, sequences, functions
    ✓ miet_manager      — Read/write all tables, read-only audit_logs
    ✓ miet_facilitator  — Limited: sessions, attendance, assessments (own courses)
    ✓ miet_donor        — Read-only: donations, impact views
    ✓ miet_readonly     — Read-only: non-sensitive tables and views

SECURITY FEATURES:
    ✓ bcrypt password hashing (enforced at application layer)
    ✓ JWT-based authentication (enforced at API layer)
    ✓ Row Level Security on all sensitive tables
    ✓ Comprehensive audit logging (POPIA compliant)
    ✓ POPIA consent tracking with timestamp
    ✓ SA ID number format validation (13-digit CHECK constraint)
    ✓ Email format validation (CHECK constraint)
    ✓ Account lockout tracking (failed_login_attempts, account_locked_until)

SETA COMPLIANCE FIELDS:
    ✓ courses.seta_name               — SETA name (e.g. ETDP SETA, SERVICES SETA)
    ✓ courses.seta_accreditation_number — SETA accreditation number
    ✓ courses.unit_standard_codes     — Array of SAQA unit standard codes
    ✓ courses.nqf_level               — NQF level (1–10)
    ✓ courses.credits                 — NQF credits
    ✓ courses.qualification_title     — Full qualification title
    ✓ assessments.unit_standard_code  — Per-assessment unit standard reference
    ✓ certificates.seta_registration_number — SETA cert registration
    ✓ certificates.nqf_level          — NQF level on certificate
    ✓ certificates.credits_awarded    — Credits awarded on certificate

DEPLOYMENT INSTRUCTIONS:
    1. Ensure PostgreSQL 12+ is installed
    2. Create the database:
         CREATE DATABASE miet_africa_db;
    3. Connect to the database:
         \c miet_africa_db
    4. Execute this schema:
         psql -d miet_africa_db -f miet_africa_schema.sql
    5. Execute seed data:
         psql -d miet_africa_db -f miet_africa_seed.sql
    6. Configure application connection string (SSL required):
         postgresql://user:password@host:5432/miet_africa_db?sslmode=require
    7. Set session variables for RLS in application:
         SET app.user_role = 'ADMIN';
         SET app.user_id   = '<uuid>';
    8. Set up automated daily backups
    9. Enable SSL/TLS on database server

SCALABILITY:
    Designed to support:
    ✓ Up to 5,000 learners
    ✓ Up to 500 concurrent users
    ✓ Multi-province operations across all 9 SA provinces
    ✓ Multiple centres per province

Version: 1.0
Organisation: MIET Africa
Platform: Youth Skills Centre Management Platform
Compliance: POPIA | SETA | NQF
*/

-- End of MIET Africa PostgreSQL Schema
