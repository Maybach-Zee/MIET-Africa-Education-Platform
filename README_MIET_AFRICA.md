# MIET Africa Youth Skills Centre Management Platform
## PostgreSQL Database — Setup & Documentation Guide

---

## 📋 Overview

This directory contains the complete PostgreSQL database design for the **MIET Africa Youth Skills Centre Management Platform** — a secure, scalable, cloud-based system that replaces manual paper-based processes with digital learner management, course tracking, assessments, certification, and donor reporting.

| File | Description |
|------|-------------|
| `miet_africa_schema.sql` | Full database schema (tables, indexes, views, triggers, RLS, roles) |
| `miet_africa_seed.sql` | Reference data and sample data for development/testing |
| `README_MIET_AFRICA.md` | This documentation guide |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│              PRESENTATION LAYER                         │
│         ReactJS + TypeScript (Frontend)                 │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTPS / REST API
┌─────────────────────▼───────────────────────────────────┐
│              BUSINESS LOGIC LAYER                       │
│         NodeJS + Express (Backend API)                  │
│    JWT Authentication | bcrypt | Role Enforcement       │
└─────────────────────┬───────────────────────────────────┘
                      │ SSL/TLS Connection
┌─────────────────────▼───────────────────────────────────┐
│                  DATA LAYER                             │
│                PostgreSQL 18                            │
│    RLS | Audit Logs | Triggers | Views | Indexes        │
└─────────────────────────────────────────────────────────┘
```

---

## ⚙️ Prerequisites

- **PostgreSQL** version 12 or higher
- **psql** command-line tool (or pgAdmin 4)
- Database superuser access for initial setup

---

## 🚀 Deployment Instructions

### Step 1 — Create the Database

```sql
-- Connect as superuser (postgres)
psql -U postgres

-- Create the database
CREATE DATABASE miet_africa_db
    WITH ENCODING = 'UTF8'
    LC_COLLATE = 'en_ZA.UTF-8'
    LC_CTYPE = 'en_ZA.UTF-8'
    TEMPLATE = template0;

-- Connect to the new database
\c miet_africa_db
```

### Step 2 — Run the Schema

```bash
psql -U postgres -d miet_africa_db -f miet_africa_schema.sql
```

Or from within psql:
```sql
\i miet_africa_schema.sql
```

### Step 3 — Run the Seed Data

```bash
psql -U postgres -d miet_africa_db -f miet_africa_seed.sql
```

### Step 4 — Verify the Installation

```sql
-- Check all tables were created
\dt

-- Check all views were created
\dv

-- Check all functions were created
\df

-- Verify provinces
SELECT province_code, province_name FROM provinces ORDER BY province_name;

-- Verify courses with SETA fields
SELECT course_code, title, seta_name, nqf_level, pass_mark FROM courses;

-- Check attendance auto-calculation
SELECT l.first_name || ' ' || l.last_name AS learner,
       co.title AS course,
       e.attendance_percentage
FROM enrolments e
JOIN learners l ON e.learner_id = l.learner_id
JOIN courses co ON e.course_id = co.course_id;

-- Check assessment auto-results
SELECT l.first_name || ' ' || l.last_name AS learner,
       a.module_title, a.percentage, a.result
FROM assessments a
JOIN enrolments e ON a.enrolment_id = e.enrolment_id
JOIN learners l ON e.learner_id = l.learner_id;
```

### Step 5 — Configure Application Connection

```env
# .env (Node.js backend)
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=miet_africa_db
DB_USER=miet_app_user
DB_PASSWORD=your_secure_password
DB_SSL=true
DB_SSL_MODE=require
```

Connection string format:
```
postgresql://miet_app_user:password@host:5432/miet_africa_db?sslmode=require
```

### Step 6 — Set RLS Session Variables (Backend)

The Row Level Security policies require session variables to be set on each database connection:

```javascript
// Node.js / Express middleware example
const setRLSContext = async (client, userId, userRole) => {
    await client.query(`SET app.user_id = '${userId}'`);
    await client.query(`SET app.user_role = '${userRole}'`);
};
```

---

## 🗄️ Database Schema Overview

### Tables (15 total)

#### Core Tables
| Table | Description |
|-------|-------------|
| `users` | Platform users — Admin, Facilitator, Manager, Donor |
| `provinces` | South African provinces (9 provinces) |
| `centres` | Youth Skills Centres per province |
| `learners` | Learner profiles with POPIA consent tracking |
| `courses` | Course catalogue with SETA accreditation fields |
| `facilitator_assignments` | Facilitator-to-course assignments |

#### Operational Tables
| Table | Description |
|-------|-------------|
| `enrolments` | Learner-course enrolments with auto attendance % |
| `sessions` | Course sessions (date, topic, venue, time) |
| `attendance` | Session attendance — triggers auto-recalculate % |
| `assessments` | Module scores — triggers auto PASS/FAIL |

#### Administrative Tables
| Table | Description |
|-------|-------------|
| `certificates` | Certificate lifecycle with QR code & verification URL |
| `audit_logs` | Full POPIA-compliant audit trail |
| `donations` | Donor contributions with Section 18A tax support |
| `fees` | Learner fee tracking and payment records |
| `system_config` | Platform-wide configuration settings |

---

### Entity Relationship Summary

```
provinces ──< centres ──< learners
                │               │
                └──< courses ──< enrolments ──< attendance
                        │               │
                        │               └──< assessments
                        │               │
                        │               └──< fees
                        │               │
                        │               └──< certificates
                        │
                        └──< sessions ──< attendance
                        │
                        └──< facilitator_assignments >── users

users ──< audit_logs
users ──< donations
donations ──< fees
```

---

### Custom Types (Enums)

| Type | Values |
|------|--------|
| `user_role` | `ADMIN`, `FACILITATOR`, `MANAGER`, `DONOR` |
| `learner_status` | `ACTIVE`, `INACTIVE`, `SUSPENDED`, `GRADUATED`, `WITHDRAWN` |
| `completion_status` | `ENROLLED`, `IN_PROGRESS`, `COMPLETED`, `WITHDRAWN`, `FAILED` |
| `assessment_result` | `PASS`, `FAIL`, `PENDING`, `ABSENT` |
| `certificate_status` | `PENDING`, `APPROVED`, `ISSUED`, `REVOKED` |
| `audit_action` | `CREATE`, `READ`, `UPDATE`, `DELETE`, `LOGIN`, `LOGOUT`, `EXPORT`, `APPROVE`, `REJECT`, `GENERATE_CERTIFICATE` |
| `payment_status` | `PENDING`, `PAID`, `WAIVED`, `REFUNDED`, `OVERDUE` |
| `payment_method` | `CASH`, `EFT`, `CARD`, `MOBILE_PAYMENT`, `BURSARY`, `DONOR_FUNDED` |
| `gender_type` | `MALE`, `FEMALE`, `NON_BINARY`, `PREFER_NOT_TO_SAY` |

---

## 📊 Reporting Views

| View | Purpose |
|------|---------|
| `v_learner_summary` | Per-learner enrolment, attendance %, certificate counts |
| `v_course_statistics` | Pass rates, completion rates, attendance averages per course |
| `v_attendance_report` | Session attendance with 80%/60% threshold alerts |
| `v_certificate_status` | Certificate pipeline with QR code & verification details |
| `v_donor_impact_metrics` | Monthly donor impact: learners trained, pass rates, certs issued |
| `v_province_analytics` | Province-level aggregated statistics |
| `v_monthly_registrations` | Monthly registration trends with gender & disability breakdown |
| `v_fee_collection_summary` | Financial fee collection overview per course |

### Example Queries

```sql
-- Dashboard: Overall platform statistics
SELECT
    (SELECT COUNT(*) FROM learners WHERE status = 'ACTIVE')          AS active_learners,
    (SELECT COUNT(*) FROM courses WHERE is_active = TRUE)            AS active_courses,
    (SELECT COUNT(*) FROM certificates WHERE status = 'ISSUED')      AS certificates_issued,
    (SELECT COUNT(*) FROM enrolments WHERE completion_status = 'COMPLETED') AS completions;

-- Donor report: Impact metrics for current year
SELECT * FROM v_donor_impact_metrics
WHERE year = EXTRACT(YEAR FROM CURRENT_DATE)
ORDER BY month DESC;

-- Attendance alert: Learners below 60% threshold
SELECT learner_name, course_title, attendance_percentage, attendance_alert
FROM v_attendance_report
WHERE attendance_alert = 'CRITICAL - BELOW 60%'
GROUP BY learner_name, course_title, attendance_percentage, attendance_alert;

-- Certificate verification by code
SELECT learner_name, course_title, issue_date, verification_code, qr_code_url
FROM v_certificate_status
WHERE verification_code = 'YOUR_CODE_HERE';

-- Province analytics
SELECT province_name, total_learners, active_learners,
       total_courses, certificates_issued, overall_pass_rate_percent
FROM v_province_analytics
ORDER BY total_learners DESC;
```

---

## ⚡ Automated Triggers

| Trigger | Table | Action |
|---------|-------|--------|
| `trg_recalculate_attendance` | `attendance` | Auto-recalculates `enrolments.attendance_percentage` after every INSERT/UPDATE/DELETE |
| `trg_auto_assessment_result` | `assessments` | Auto-sets `result` to PASS/FAIL based on `courses.pass_mark` |
| `trg_generate_certificate_number` | `certificates` | Auto-generates `MIET-YYYY-XXXXXXX` certificate number and verification code |
| `trg_enrolment_status_on_attendance` | `attendance` | Moves enrolment from `ENROLLED` → `IN_PROGRESS` on first attendance |
| `trg_validate_facilitator_role` | `facilitator_assignments` | Enforces FACILITATOR/ADMIN role before course assignment |
| `trg_popia_consent_date` | `learners` | Auto-stamps `popia_consent_date` when consent is set to TRUE |
| `trg_*_timestamp` | All tables | Auto-updates `updated_at` on every UPDATE |

---

## 🔐 Security & POPIA Compliance

### Row Level Security (RLS)

| Table | Admin | Manager | Facilitator | Donor |
|-------|-------|---------|-------------|-------|
| `learners` | All | All | Own courses only | None |
| `assessments` | All | All | Own courses only | None |
| `attendance` | All | All | Own courses only | None |
| `certificates` | All (modify) | All (modify) | View only | View only |
| `donations` | All | All | None | Own records |
| `fees` | All | All | Own courses only | None |
| `audit_logs` | All | View only | None | None |

### POPIA Compliance Features

- ✅ **Explicit consent tracking** — `learners.popia_consent` + `popia_consent_date`
- ✅ **Audit trail** — Every CREATE, UPDATE, DELETE, EXPORT action logged
- ✅ **Data minimisation** — Only necessary fields collected
- ✅ **Right to access** — Learner portal access via email login
- ✅ **Data retention** — Configurable via `system_config.DATA_RETENTION_YEARS` (default: 7 years)
- ✅ **Audit log retention** — `AUDIT_LOG_RETENTION_DAYS` = 2555 (7 years)
- ✅ **Encrypted connections** — SSL/TLS required on all connections

### Password Security

Passwords are **never stored in plain text**. The `password_hash` column stores bcrypt hashes generated by the Node.js backend:

```javascript
// Node.js backend — password hashing
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 12;
const hash = await bcrypt.hash(plainTextPassword, SALT_ROUNDS);
```

---

## 🎓 SETA Compliance Fields

The following fields support SETA reporting requirements:

| Field | Table | Description |
|-------|-------|-------------|
| `seta_name` | `courses` | SETA name (e.g. ETDP SETA, MICT SETA, SERVICES SETA) |
| `seta_accreditation_number` | `courses` | SETA provider accreditation number |
| `unit_standard_codes` | `courses` | Array of SAQA unit standard codes |
| `nqf_level` | `courses` | NQF level (1–10) |
| `credits` | `courses` | NQF credits awarded on completion |
| `qualification_title` | `courses` | Full SAQA qualification title |
| `unit_standard_code` | `assessments` | Per-assessment unit standard reference |
| `seta_registration_number` | `certificates` | SETA certificate registration number |
| `nqf_level` | `certificates` | NQF level on issued certificate |
| `credits_awarded` | `certificates` | Credits awarded on certificate |

---

## 🏷️ Certificate Lifecycle

```
Learner completes course
        │
        ▼
Certificate record created (status: PENDING)
Auto-generated: MIET-YYYY-XXXXXXX number + verification code
        │
        ▼
Manager/Admin reviews and approves (status: APPROVED)
        │
        ▼
PDF generated + QR code created (status: ISSUED)
pdf_url + qr_code_url + verification_url populated
        │
        ▼
Learner can verify at: https://verify.mietafrica.org/cert/{verification_code}
```

---

## 👥 Database Roles

| Role | Permissions |
|------|-------------|
| `miet_admin` | Full access to all tables, sequences, functions |
| `miet_manager` | Read/write all tables; read-only audit_logs |
| `miet_facilitator` | Read: provinces, centres, courses, learners, enrolments; Write: sessions, attendance, assessments |
| `miet_donor` | Read-only: donations, impact views |
| `miet_readonly` | Read-only: non-sensitive tables and views |

---

## 🔧 Utility Functions

```sql
-- Calculate learner age
SELECT fn_calculate_age('2000-01-15'::DATE);  -- Returns: 25

-- Get learner full name
SELECT fn_get_learner_name('learner-uuid-here');

-- Get course pass rate
SELECT fn_get_course_pass_rate('course-uuid-here');  -- Returns: 75.50
```

---

## 📦 Seed Data Summary

The seed file (`miet_africa_seed.sql`) includes:

| Data | Count |
|------|-------|
| Provinces | 9 (all SA provinces) |
| Users | 6 (1 Admin, 1 Manager, 3 Facilitators, 1 Donor) |
| Centres | 4 (Soweto, Durban, Cape Town, East London) |
| Courses | 5 (ICT, Entrepreneurship, Life Skills, Construction, ECD) |
| Learners | 8 (across 4 provinces) |
| Enrolments | 10 |
| Sessions | 7 |
| Attendance Records | 22 |
| Assessments | 9 |
| Donations | 2 (R750,000 total) |
| Fees | 5 (all waived — donor-funded) |
| System Config | 23 settings |

---

## 🔄 Maintenance

### Daily Backups
```bash
pg_dump -U postgres -d miet_africa_db -F c -f backup_$(date +%Y%m%d).dump
```

### Restore from Backup
```bash
pg_restore -U postgres -d miet_africa_db -F c backup_20250101.dump
```

### Monitor Audit Logs
```sql
-- Recent actions in last 24 hours
SELECT user_email, action, entity_type, entity_id, action_result, timestamp
FROM audit_logs
WHERE timestamp >= NOW() - INTERVAL '24 hours'
ORDER BY timestamp DESC;
```

### Check Database Size
```sql
SELECT pg_size_pretty(pg_database_size('miet_africa_db')) AS database_size;
```

---

## 📞 Support

| Contact | Details |
|---------|---------|
| Organisation | MIET Africa |
| Website | https://www.miet.co.za |
| Support Email | support@mietafrica.org |
| Platform | Youth Skills Centre Management Platform |

---

## 📄 Compliance

| Standard | Status |
|----------|--------|
| POPIA (Protection of Personal Information Act) | ✅ Compliant |
| SETA Reporting Requirements | ✅ Supported |
| NQF (National Qualifications Framework) | ✅ Supported |
| SSL/TLS Encrypted Connections | ✅ Required |
| Audit Trail | ✅ Comprehensive |
| Data Retention Policy | ✅ 7 years (configurable) |

---

*Version: 1.0 | MIET Africa Youth Skills Centre Management Platform*
