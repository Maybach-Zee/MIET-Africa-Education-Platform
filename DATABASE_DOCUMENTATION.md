# MIET Africa Youth Skills Centre Management Platform
# Complete Database Documentation

**Version:** 1.0  
**Database:** PostgreSQL 18  
**Database Name:** `miet_africa_db`  
**Compliance:** POPIA | SETA | NQF  
**Author:** MIET Africa Development Team  

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Database Architecture](#3-database-architecture)
4. [Quick Start & Setup](#4-quick-start--setup)
5. [Entity Relationship Overview](#5-entity-relationship-overview)
6. [Tables — Complete Reference](#6-tables--complete-reference)
   - [users](#61-users)
   - [provinces](#62-provinces)
   - [centres](#63-centres)
   - [learners](#64-learners)
   - [courses](#65-courses)
   - [facilitator_assignments](#66-facilitator_assignments)
   - [enrolments](#67-enrolments)
   - [sessions](#68-sessions)
   - [attendance](#69-attendance)
   - [assessments](#610-assessments)
   - [certificates](#611-certificates)
   - [audit_logs](#612-audit_logs)
   - [donations](#613-donations)
   - [fees](#614-fees)
   - [system_config](#615-system_config)
7. [Custom Types (Enums)](#7-custom-types-enums)
8. [Reporting Views](#8-reporting-views)
9. [Triggers & Automated Functions](#9-triggers--automated-functions)
10. [Row Level Security (RLS)](#10-row-level-security-rls)
11. [Database Roles & Permissions](#11-database-roles--permissions)
12. [Indexes & Performance](#12-indexes--performance)
13. [POPIA Compliance](#13-popia-compliance)
14. [SETA Compliance](#14-seta-compliance)
15. [Sample Data Loaded](#15-sample-data-loaded)
16. [Common Queries for Developers](#16-common-queries-for-developers)
17. [Node.js Integration Guide](#17-nodejs-integration-guide)
18. [Files Reference](#18-files-reference)

---

## 1. Project Overview

The **MIET Africa Youth Skills Centre Management Platform** is a cloud-based digital system that replaces manual, paper-based processes across MIET Africa's Youth Skills Centres in multiple South African provinces.

### What the Database Does

The PostgreSQL database is the **central data repository** for the entire platform. It stores, manages, and automates:

| Function | What It Manages |
|----------|----------------|
| **Learner Management** | Registration, profiles, POPIA consent, enrolment history |
| **Course Management** | Course catalogue, SETA accreditation, scheduling, pass marks |
| **Attendance Tracking** | Session-by-session attendance with automatic % calculation |
| **Assessment Management** | Score capture with automatic PASS/FAIL determination |
| **Certificate Generation** | Certificate lifecycle from request to issuance with QR codes |
| **Donor Reporting** | Donation tracking and impact metrics for funders |
| **Fee Management** | Course fee tracking, waivers, and donor-funded bursaries |
| **Audit Logging** | Full POPIA-compliant audit trail of all user actions |
| **Analytics & Reporting** | Real-time dashboards for management and donors |

---

## 2. Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | ReactJS + TypeScript | User interface |
| **Backend** | Node.js + Express | REST API, business logic |
| **Database** | PostgreSQL 18 | Data storage and integrity |
| **Authentication** | JWT + bcrypt | Secure login and sessions |
| **Hosting** | Vercel | Cloud deployment |
| **Source Control** | GitHub | Version control and CI/CD |

---

## 3. Database Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│                  ReactJS + TypeScript                        │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTPS
┌─────────────────────────▼───────────────────────────────────┐
│                  BUSINESS LOGIC LAYER                        │
│               Node.js + Express REST API                     │
│         JWT Authentication | bcrypt Password Hashing         │
└─────────────────────────┬───────────────────────────────────┘
                          │ SSL/TLS
┌─────────────────────────▼───────────────────────────────────┐
│                      DATA LAYER                              │
│                    PostgreSQL 18                             │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Users   │  │ Learners │  │ Courses  │  │ Centres  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Enrolments│  │Sessions  │  │Attendance│  │Assessments│  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Certs  │  │Audit Logs│  │Donations │  │   Fees   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
│  Row Level Security | Triggers | Views | Indexes            │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Quick Start & Setup

### Prerequisites
- PostgreSQL 12 or higher installed
- `psql` command-line tool available

### Step-by-Step Setup

```bash
# Step 1: Create the database
psql -U postgres -c "CREATE DATABASE miet_africa_db WITH ENCODING='UTF8';"

# Step 2: Run the schema (creates all tables, views, triggers, roles)
psql -U postgres -d miet_africa_db -f miet_africa_schema.sql

# Step 3: Load seed data (provinces, sample users, courses, learners)
psql -U postgres -d miet_africa_db -f miet_africa_seed.sql

# Step 4: Verify everything loaded correctly
psql -U postgres -d miet_africa_db -P pager=off -c "
  SELECT 'Tables: ' || COUNT(*) FROM pg_tables WHERE schemaname='public';
  SELECT 'Views: '  || COUNT(*) FROM pg_views  WHERE schemaname='public';
"
```

### Node.js Connection String

```javascript
// .env file
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/miet_africa_db?sslmode=require

// In your Node.js app (using pg or Sequelize)
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// IMPORTANT: Set RLS session variables on every connection
await pool.query(`SET app.user_role = '${user.role}'`);
await pool.query(`SET app.user_id   = '${user.id}'`);
```

---

## 5. Entity Relationship Overview

```
provinces (1) ──────────────────────── (many) centres
provinces (1) ──────────────────────── (many) learners
provinces (1) ──────────────────────── (many) courses

centres (1) ────────────────────────── (many) learners
centres (1) ────────────────────────── (many) courses

users (1) ──────────────────────────── (many) facilitator_assignments
courses (1) ────────────────────────── (many) facilitator_assignments

learners (1) ───────────────────────── (many) enrolments
courses (1) ────────────────────────── (many) enrolments

courses (1) ────────────────────────── (many) sessions
enrolments (1) ─────────────────────── (many) attendance
sessions (1) ───────────────────────── (many) attendance

enrolments (1) ─────────────────────── (many) assessments
enrolments (1) ─────────────────────── (1) certificates

users (1) ──────────────────────────── (many) audit_logs
users (1) ──────────────────────────── (many) donations (donor account)

donations (1) ──────────────────────── (many) fees (donor-funded)
enrolments (1) ─────────────────────── (many) fees
```

### Key Relationships Explained

| Relationship | Meaning |
|-------------|---------|
| `learner → enrolments` | One learner can enrol in many courses |
| `course → enrolments` | One course can have many learners enrolled |
| `enrolment → attendance` | Each enrolment has attendance records per session |
| `enrolment → assessments` | Each enrolment has assessment scores per module |
| `enrolment → certificate` | Each completed enrolment can produce one certificate |
| `course → sessions` | Each course has multiple sessions (classes) |
| `donation → fees` | A donation can fund/waive fees for multiple learners |

---

## 6. Tables — Complete Reference

---

### 6.1 `users`

**Purpose:** Stores all platform users — admins, facilitators, managers, and donors. Controls who can log in and what they can access.

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `user_id` | UUID | ✅ PK | Auto-generated unique identifier |
| `full_name` | VARCHAR(200) | ✅ | User's full name |
| `email` | VARCHAR(150) | ✅ UNIQUE | Login email — must be unique, validated by regex |
| `password_hash` | VARCHAR(255) | ✅ | bcrypt-hashed password — plain text NEVER stored |
| `role` | user_role | ✅ | ADMIN \| FACILITATOR \| MANAGER \| DONOR |
| `is_active` | BOOLEAN | ✅ | FALSE = account disabled, cannot log in |
| `phone_number` | VARCHAR(20) | ❌ | Contact number |
| `profile_photo_url` | VARCHAR(500) | ❌ | URL to profile photo in cloud storage |
| `must_change_password` | BOOLEAN | ✅ | TRUE = user must change password on next login |
| `last_login` | TIMESTAMP | ❌ | Last successful login timestamp |
| `failed_login_attempts` | INTEGER | ✅ | Counter for failed logins (default 0) |
| `account_locked_until` | TIMESTAMP | ❌ | Account locked until this time after too many failures |
| `two_factor_enabled` | BOOLEAN | ✅ | Whether 2FA is enabled for this user |
| `two_factor_secret` | VARCHAR(100) | ❌ | 2FA secret key (encrypted) |
| `created_at` | TIMESTAMP | ✅ | Record creation timestamp |
| `updated_at` | TIMESTAMP | ✅ | Auto-updated on every change |
| `created_by` | UUID → users | ❌ | Which admin created this user |

**Constraints:**
- `email` must match regex: `^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$`
- `role` must be one of: `ADMIN`, `FACILITATOR`, `MANAGER`, `DONOR`

**What data is stored here:**
- The system administrator account (`admin@mietafrica.org`)
- All facilitators who record attendance and assessments
- Programme managers who view reports
- Donor organisation accounts for impact reporting

---

### 6.2 `provinces`

**Purpose:** Reference table for all 9 South African provinces. Used to link learners, courses, and centres to their geographic location.

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `province_id` | UUID | ✅ PK | Auto-generated unique identifier |
| `province_code` | VARCHAR(10) | ✅ UNIQUE | Short code: GP, WC, KZN, EC, LP, MP, NW, FS, NC |
| `province_name` | VARCHAR(100) | ✅ | Full name: Gauteng, Western Cape, etc. |
| `region` | VARCHAR(100) | ❌ | Geographic region: Central, Southern, Eastern, etc. |
| `is_active` | BOOLEAN | ✅ | Whether this province is operational |
| `created_at` | TIMESTAMP | ✅ | Record creation timestamp |

**Seed data loaded (9 provinces):**

| Code | Province | Region |
|------|----------|--------|
| GP | Gauteng | Central |
| WC | Western Cape | Southern |
| KZN | KwaZulu-Natal | Eastern |
| EC | Eastern Cape | Eastern |
| LP | Limpopo | Northern |
| MP | Mpumalanga | Eastern |
| NW | North West | Western |
| FS | Free State | Central |
| NC | Northern Cape | Western |

---

### 6.3 `centres`

**Purpose:** Stores each physical Youth Skills Centre location. Each centre belongs to a province and has a manager.

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `centre_id` | UUID | ✅ PK | Auto-generated unique identifier |
| `centre_code` | VARCHAR(50) | ✅ UNIQUE | Code like `YSC-GP-001` |
| `centre_name` | VARCHAR(200) | ✅ | Full centre name |
| `province_id` | UUID → provinces | ✅ | Which province this centre is in |
| `address` | TEXT | ❌ | Street address |
| `city` | VARCHAR(100) | ❌ | City/town |
| `postal_code` | VARCHAR(10) | ❌ | Postal code |
| `phone_number` | VARCHAR(20) | ❌ | Centre phone number |
| `email` | VARCHAR(150) | ❌ | Centre email address |
| `centre_manager_id` | UUID → users | ❌ | Manager responsible for this centre |
| `capacity` | INTEGER | ❌ | Maximum learner capacity |
| `is_active` | BOOLEAN | ✅ | Whether centre is currently operational |
| `established_date` | DATE | ❌ | When the centre was established |
| `created_at` | TIMESTAMP | ✅ | Record creation timestamp |
| `updated_at` | TIMESTAMP | ✅ | Auto-updated on every change |

**Seed data loaded (4 centres):**

| Code | Name | City | Province |
|------|------|------|----------|
| YSC-GP-001 | Soweto Youth Skills Centre | Soweto | Gauteng |
| YSC-KZN-001 | Durban Youth Skills Centre | Durban | KwaZulu-Natal |
| YSC-WC-001 | Cape Town Youth Skills Centre | Cape Town | Western Cape |
| YSC-EC-001 | East London Youth Skills Centre | East London | Eastern Cape |

---

### 6.4 `learners`

**Purpose:** The central learner registry. Every person who attends a MIET Africa programme is registered here. This is the most important table for POPIA compliance.

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `learner_id` | UUID | ✅ PK | Auto-generated unique identifier |
| `first_name` | VARCHAR(100) | ✅ | Learner's first name |
| `last_name` | VARCHAR(100) | ✅ | Learner's last name |
| `id_number` | VARCHAR(13) | ✅ UNIQUE | SA 13-digit ID number — validated by CHECK constraint |
| `passport_number` | VARCHAR(50) | ❌ | For non-SA citizens (alternative to ID number) |
| `date_of_birth` | DATE | ✅ | Date of birth — must not be in the future |
| `gender` | gender_type | ✅ | MALE \| FEMALE \| NON_BINARY \| PREFER_NOT_TO_SAY |
| `email` | VARCHAR(150) | ❌ UNIQUE | Email for learner portal access |
| `contact_number` | VARCHAR(20) | ✅ | Primary phone number |
| `alternative_contact` | VARCHAR(20) | ❌ | Secondary phone number |
| `address` | TEXT | ✅ | Home address |
| `city` | VARCHAR(100) | ❌ | City/town |
| `postal_code` | VARCHAR(10) | ❌ | Postal code |
| `province_id` | UUID → provinces | ❌ | Province where learner lives |
| `centre_id` | UUID → centres | ❌ | Centre where learner is registered |
| `highest_qualification` | VARCHAR(100) | ❌ | e.g. Grade 12, Diploma |
| `employment_status` | VARCHAR(50) | ❌ | UNEMPLOYED \| EMPLOYED \| SELF_EMPLOYED \| STUDENT |
| `disability_status` | BOOLEAN | ✅ | TRUE = learner has a disability |
| `disability_description` | TEXT | ❌ | Description of disability (if applicable) |
| `home_language` | VARCHAR(50) | ❌ | First language |
| `nationality` | VARCHAR(50) | ✅ | Default: 'South African' |
| `status` | learner_status | ✅ | ACTIVE \| INACTIVE \| SUSPENDED \| GRADUATED \| WITHDRAWN |
| `popia_consent` | BOOLEAN | ✅ | **POPIA REQUIRED** — explicit consent for data processing |
| `popia_consent_date` | TIMESTAMP | ❌ | Auto-stamped when consent is given |
| `registration_date` | DATE | ✅ | Date learner was registered |
| `photo_url` | VARCHAR(500) | ❌ | URL to learner photo |
| `notes` | TEXT | ❌ | Additional notes |
| `created_at` | TIMESTAMP | ✅ | Record creation timestamp |
| `updated_at` | TIMESTAMP | ✅ | Auto-updated on every change |
| `created_by` | UUID → users | ❌ | Which user registered this learner |

**Constraints:**
- `id_number` must match: `^[0-9]{13}$` (exactly 13 digits)
- `date_of_birth` must be ≤ today
- If `popia_consent = TRUE`, then `popia_consent_date` must not be NULL (auto-filled by trigger)

**⚠️ POPIA Note:** This table contains personal information. Access is controlled by Row Level Security. Facilitators can only see learners enrolled in their courses.

---

### 6.5 `courses`

**Purpose:** The course catalogue. Every training programme offered at a Youth Skills Centre is stored here, including SETA accreditation details.

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `course_id` | UUID | ✅ PK | Auto-generated unique identifier |
| `course_code` | VARCHAR(50) | ✅ UNIQUE | Short code like `CRS-ICT-001` |
| `title` | VARCHAR(200) | ✅ | Full course title |
| `description` | TEXT | ❌ | Detailed course description |
| `duration_hours` | INTEGER | ✅ | Total contact hours (must be > 0) |
| `start_date` | DATE | ✅ | Course start date |
| `end_date` | DATE | ✅ | Course end date (must be ≥ start_date) |
| `pass_mark` | DECIMAL(5,2) | ✅ | Minimum pass percentage (0–100, default 50%) |
| `max_learners` | INTEGER | ❌ | Maximum enrolment capacity |
| `centre_id` | UUID → centres | ❌ | Centre where course is delivered |
| `province_id` | UUID → provinces | ❌ | Province where course runs |
| `seta_name` | VARCHAR(100) | ❌ | **SETA** responsible for accreditation |
| `seta_accreditation_number` | VARCHAR(100) | ❌ | **SETA** accreditation number |
| `unit_standard_codes` | TEXT[] | ❌ | **SETA** array of SAQA unit standard codes |
| `nqf_level` | INTEGER | ❌ | **NQF** level 1–10 |
| `credits` | INTEGER | ❌ | **NQF** credits awarded on completion |
| `qualification_title` | VARCHAR(200) | ❌ | Full qualification name |
| `is_active` | BOOLEAN | ✅ | Whether course is currently running |
| `is_accredited` | BOOLEAN | ✅ | Whether course has SETA accreditation |
| `venue` | VARCHAR(200) | ❌ | Physical venue/room |
| `delivery_mode` | VARCHAR(50) | ❌ | IN_PERSON \| ONLINE \| HYBRID \| BLENDED |
| `course_fee` | DECIMAL(10,2) | ❌ | Course fee amount (default 0.00) |
| `currency` | VARCHAR(10) | ✅ | Currency code (default ZAR) |
| `created_at` | TIMESTAMP | ✅ | Record creation timestamp |
| `updated_at` | TIMESTAMP | ✅ | Auto-updated on every change |
| `created_by` | UUID → users | ❌ | Which admin created this course |

**Seed data loaded (5 courses):**

| Code | Title | SETA | NQF | Pass Mark |
|------|-------|------|-----|-----------|
| CRS-ICT-001 | Introduction to Computer Literacy | MICT SETA | 3 | 60% |
| CRS-ENT-001 | Youth Entrepreneurship & Business Skills | SERVICES SETA | 4 | 65% |
| CRS-LIFE-001 | Life Skills & Work Readiness | ETDP SETA | 2 | 50% |
| CRS-CONST-001 | Construction & Building Skills | CETA | 2 | 70% |
| CRS-CARE-001 | Early Childhood Development (ECD) | ETDP SETA | 4 | 65% |

---

### 6.6 `facilitator_assignments`

**Purpose:** Links facilitator users to the courses they teach. A facilitator can teach multiple courses; a course can have multiple facilitators (primary + co-facilitators).

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `assignment_id` | UUID | ✅ PK | Auto-generated unique identifier |
| `user_id` | UUID → users | ✅ | The facilitator (must have FACILITATOR or ADMIN role) |
| `course_id` | UUID → courses | ✅ | The course being assigned |
| `assigned_date` | DATE | ✅ | Date of assignment |
| `is_primary` | BOOLEAN | ✅ | TRUE = primary facilitator, FALSE = co-facilitator |
| `assigned_by` | UUID → users | ❌ | Which admin made the assignment |
| `notes` | TEXT | ❌ | Additional notes |
| `created_at` | TIMESTAMP | ✅ | Record creation timestamp |

**Constraints:**
- `UNIQUE(user_id, course_id)` — a facilitator can only be assigned to a course once
- Trigger `trg_validate_facilitator_role` rejects users who are not FACILITATOR or ADMIN

---

### 6.7 `enrolments`

**Purpose:** The link between a learner and a course. Every time a learner joins a course, an enrolment record is created. This table tracks their progress from start to completion.

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `enrolment_id` | UUID | ✅ PK | Auto-generated unique identifier |
| `learner_id` | UUID → learners | ✅ | The learner enrolled |
| `course_id` | UUID → courses | ✅ | The course they enrolled in |
| `enrol_date` | DATE | ✅ | Date of enrolment |
| `completion_status` | completion_status | ✅ | Current status (see below) |
| `completion_date` | DATE | ❌ | Date course was completed |
| `attendance_percentage` | DECIMAL(5,2) | ❌ | **AUTO-CALCULATED** by trigger (0–100%) |
| `final_score` | DECIMAL(5,2) | ❌ | Final overall score (0–100%) |
| `withdrawal_reason` | TEXT | ❌ | Reason if learner withdrew |
| `withdrawal_date` | DATE | ❌ | Date of withdrawal |
| `notes` | TEXT | ❌ | Additional notes |
| `created_at` | TIMESTAMP | ✅ | Record creation timestamp |
| `updated_at` | TIMESTAMP | ✅ | Auto-updated on every change |
| `created_by` | UUID → users | ❌ | Which user created this enrolment |

**Completion Status Flow:**
```
ENROLLED → IN_PROGRESS → COMPLETED
                       → FAILED
                       → WITHDRAWN
```

| Status | Meaning |
|--------|---------|
| `ENROLLED` | Learner registered but no sessions attended yet |
| `IN_PROGRESS` | At least one session attended (auto-set by trigger) |
| `COMPLETED` | Course finished and passed |
| `FAILED` | Course finished but did not meet pass mark |
| `WITHDRAWN` | Learner left the course before completion |

**⚠️ Important:** `attendance_percentage` is **automatically recalculated** every time an attendance record is inserted, updated, or deleted. You should never manually update this field.

---

### 6.8 `sessions`

**Purpose:** Each individual class or meeting within a course. A course with 60 hours might have 15 sessions of 4 hours each. Attendance is tracked per session.

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `session_id` | UUID | ✅ PK | Auto-generated unique identifier |
| `course_id` | UUID → courses | ✅ | Which course this session belongs to |
| `session_date` | DATE | ✅ | Date of the session |
| `session_start_time` | TIME | ❌ | Start time (e.g. 08:00) |
| `session_end_time` | TIME | ❌ | End time (e.g. 12:00) — must be after start time |
| `topic` | VARCHAR(300) | ✅ | Topic covered in this session |
| `description` | TEXT | ❌ | Detailed description |
| `venue` | VARCHAR(200) | ❌ | Room or location |
| `facilitator_id` | UUID → users | ❌ | Facilitator who ran this session |
| `session_number` | INTEGER | ❌ | Sequential number (1, 2, 3...) |
| `is_cancelled` | BOOLEAN | ✅ | TRUE = session was cancelled |
| `cancellation_reason` | TEXT | ❌ | Why it was cancelled |
| `notes` | TEXT | ❌ | Additional notes |
| `created_at` | TIMESTAMP | ✅ | Record creation timestamp |
| `updated_at` | TIMESTAMP | ✅ | Auto-updated on every change |
| `created_by` | UUID → users | ❌ | Which user created this session |

**⚠️ Important:** Cancelled sessions (`is_cancelled = TRUE`) are **excluded** from attendance percentage calculations.

---

### 6.9 `attendance`

**Purpose:** Records whether each enrolled learner was present or absent at each session. This is the source data for attendance percentage calculations.

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `attendance_id` | UUID | ✅ PK | Auto-generated unique identifier |
| `enrolment_id` | UUID → enrolments | ✅ | Which enrolment (learner + course) |
| `session_id` | UUID → sessions | ✅ | Which session |
| `present` | BOOLEAN | ✅ | TRUE = attended, FALSE = absent |
| `arrival_time` | TIME | ❌ | Time learner arrived |
| `departure_time` | TIME | ❌ | Time learner left |
| `notes` | TEXT | ❌ | e.g. "Late arrival", "Medical excuse" |
| `recorded_by` | UUID → users | ❌ | Facilitator who recorded attendance |
| `recorded_at` | TIMESTAMP | ✅ | When attendance was recorded |
| `updated_at` | TIMESTAMP | ✅ | Auto-updated on every change |

**Constraints:**
- `UNIQUE(enrolment_id, session_id)` — only one attendance record per learner per session

**⚠️ Trigger:** Every INSERT, UPDATE, or DELETE on this table automatically recalculates `enrolments.attendance_percentage` for the affected learner.

**How attendance % is calculated:**
```
attendance_percentage = (sessions attended / total non-cancelled sessions) × 100
```

---

### 6.10 `assessments`

**Purpose:** Stores assessment scores for each learner per module within a course. The PASS/FAIL result is automatically determined by comparing the score to the course's pass mark.

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `assessment_id` | UUID | ✅ PK | Auto-generated unique identifier |
| `enrolment_id` | UUID → enrolments | ✅ | Which enrolment (learner + course) |
| `module_title` | VARCHAR(200) | ✅ | Name of the module assessed |
| `assessment_type` | VARCHAR(50) | ❌ | WRITTEN_TEST \| PRACTICAL \| ASSIGNMENT \| PROJECT \| ORAL \| PORTFOLIO \| OBSERVATION |
| `score` | DECIMAL(5,2) | ✅ | Marks obtained (must be ≥ 0 and ≤ max_score) |
| `max_score` | DECIMAL(5,2) | ✅ | Maximum possible marks (must be > 0) |
| `percentage` | DECIMAL(5,2) | AUTO | **COMPUTED COLUMN**: `(score / max_score) × 100` — always accurate |
| `result` | assessment_result | ✅ | **AUTO-SET by trigger**: PASS \| FAIL \| PENDING \| ABSENT |
| `assessment_date` | DATE | ✅ | Date assessment was conducted |
| `assessor_id` | UUID → users | ❌ | Facilitator who assessed |
| `moderator_id` | UUID → users | ❌ | Moderator who verified the assessment |
| `moderation_date` | DATE | ❌ | Date of moderation |
| `feedback` | TEXT | ❌ | Feedback given to learner |
| `attempt_number` | INTEGER | ✅ | 1 = first attempt, 2 = re-assessment, etc. |
| `unit_standard_code` | VARCHAR(50) | ❌ | SETA unit standard code for this module |
| `notes` | TEXT | ❌ | Additional notes |
| `created_at` | TIMESTAMP | ✅ | Record creation timestamp |
| `updated_at` | TIMESTAMP | ✅ | Auto-updated on every change |
| `created_by` | UUID → users | ❌ | Which user captured this assessment |

**How PASS/FAIL is determined automatically:**
```
percentage = (score / max_score) × 100
IF percentage >= course.pass_mark → result = 'PASS'
IF percentage <  course.pass_mark → result = 'FAIL'
```

**Example:**
- Course pass mark: 60%
- Learner score: 72/100 → percentage = 72% → **PASS**
- Learner score: 55/100 → percentage = 55% → **FAIL**

---

### 6.11 `certificates`

**Purpose:** Manages the full lifecycle of digital certificates — from the initial generation request through approval to final issuance. Each certificate has a unique number, QR code, and verification URL.

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `certificate_id` | UUID | ✅ PK | Auto-generated unique identifier |
| `certificate_number` | VARCHAR(100) | ✅ UNIQUE | **AUTO-GENERATED**: format `MIET-2025-0000001` |
| `learner_id` | UUID → learners | ✅ | The learner receiving the certificate |
| `course_id` | UUID → courses | ✅ | The course completed |
| `enrolment_id` | UUID → enrolments | ❌ | The specific enrolment record |
| `issue_date` | DATE | ❌ | Date certificate was issued |
| `expiry_date` | DATE | ❌ | Certificate expiry date (if applicable) |
| `pdf_url` | VARCHAR(500) | ❌ | URL to the PDF certificate in cloud storage |
| `qr_code_url` | VARCHAR(500) | ❌ | URL to the QR code image for printed certificates |
| `verification_url` | VARCHAR(500) | ❌ | Public URL for third-party verification |
| `verification_code` | VARCHAR(100) | ❌ UNIQUE | **AUTO-GENERATED**: 12-char alphanumeric code |
| `status` | certificate_status | ✅ | PENDING \| APPROVED \| ISSUED \| REVOKED |
| `approved_by` | UUID → users | ❌ | Admin/Manager who approved the certificate |
| `approval_date` | TIMESTAMP | ❌ | When it was approved |
| `approval_notes` | TEXT | ❌ | Notes from approver |
| `revocation_reason` | TEXT | ❌ | Why certificate was revoked (if applicable) |
| `revocation_date` | DATE | ❌ | Date of revocation |
| `seta_registration_number` | VARCHAR(100) | ❌ | SETA certificate registration number |
| `nqf_level` | INTEGER | ❌ | NQF level shown on certificate |
| `credits_awarded` | INTEGER | ❌ | Credits awarded on certificate |
| `created_at` | TIMESTAMP | ✅ | Record creation timestamp |
| `updated_at` | TIMESTAMP | ✅ | Auto-updated on every change |
| `created_by` | UUID → users | ❌ | Which user initiated the certificate |

**Certificate Lifecycle:**
```
PENDING → APPROVED → ISSUED
        → REVOKED (at any stage)
```

**Auto-generated fields (by trigger on INSERT):**
- `certificate_number` → `MIET-YYYY-0000001` (sequential per year)
- `verification_code` → 12-character uppercase alphanumeric (e.g. `A3F9B2C1D4E7`)

**QR Code Usage:** The `qr_code_url` points to a QR code image that, when scanned, opens the `verification_url` where anyone can verify the certificate's authenticity using the `verification_code`.

---

### 6.12 `audit_logs`

**Purpose:** Records every significant action performed by any user on the platform. This is a **POPIA compliance requirement** — all data access, creation, modification, and deletion must be logged.

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `log_id` | UUID | ✅ PK | Auto-generated unique identifier |
| `user_id` | UUID → users | ❌ | Which user performed the action |
| `user_email` | VARCHAR(150) | ❌ | Snapshot of email at time of action (preserved if user deleted) |
| `action` | audit_action | ✅ | Type of action (see below) |
| `entity_type` | VARCHAR(100) | ✅ | Table/entity affected (e.g. `learners`, `courses`) |
| `entity_id` | VARCHAR(100) | ❌ | UUID of the specific record affected |
| `old_values` | JSONB | ❌ | Complete snapshot of record **before** change |
| `new_values` | JSONB | ❌ | Complete snapshot of record **after** change |
| `description` | TEXT | ❌ | Human-readable description of what happened |
| `ip_address` | INET | ❌ | IP address of the user |
| `user_agent` | TEXT | ❌ | Browser/client information |
| `session_id` | VARCHAR(100) | ❌ | JWT session identifier |
| `action_result` | VARCHAR(20) | ❌ | SUCCESS \| FAILURE \| PARTIAL |
| `error_message` | TEXT | ❌ | Error details if action failed |
| `timestamp` | TIMESTAMP | ✅ | Exact time of action |

**Action Types Logged:**

| Action | When Used |
|--------|-----------|
| `CREATE` | New record created (learner registered, course added) |
| `READ` | Sensitive data accessed (learner profile viewed, report exported) |
| `UPDATE` | Record modified (attendance updated, score changed) |
| `DELETE` | Record deleted |
| `LOGIN` | User logged in |
| `LOGOUT` | User logged out |
| `EXPORT` | Data exported to CSV/PDF |
| `IMPORT` | Data imported |
| `APPROVE` | Certificate approved |
| `REJECT` | Certificate rejected |
| `GENERATE_CERTIFICATE` | Certificate generation initiated |

**⚠️ POPIA Note:** Audit logs must be retained for **7 years** (configured in `system_config`). Only ADMIN role can view audit logs.

---

### 6.13 `donations`

**Purpose:** Records all financial contributions from donors and funders. Supports impact reporting, Section 18A tax certificates, and links donations to specific centres, courses, or provinces.

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `donation_id` | UUID | ✅ PK | Auto-generated unique identifier |
| `donor_user_id` | UUID → users | ❌ | If donor has a platform account (DONOR role) |
| `donor_name` | VARCHAR(200) | ✅ | Donor's name or organisation name |
| `donor_organisation` | VARCHAR(200) | ❌ | Organisation name (if different from donor_name) |
| `donor_email` | VARCHAR(150) | ❌ | Donor contact email |
| `donor_phone` | VARCHAR(20) | ❌ | Donor contact phone |
| `amount` | DECIMAL(15,2) | ✅ | Donation amount (must be > 0) |
| `currency` | VARCHAR(10) | ✅ | Currency code (default ZAR) |
| `donation_date` | DATE | ✅ | Date donation was received |
| `purpose` | TEXT | ✅ | What the donation funds |
| `centre_id` | UUID → centres | ❌ | Targeted centre (if donation is centre-specific) |
| `course_id` | UUID → courses | ❌ | Targeted course (if donation is course-specific) |
| `province_id` | UUID → provinces | ❌ | Targeted province (if donation is province-specific) |
| `receipt_url` | VARCHAR(500) | ❌ | URL to receipt document |
| `receipt_number` | VARCHAR(100) | ❌ UNIQUE | Receipt reference number |
| `payment_method` | payment_method | ❌ | CASH \| EFT \| CARD \| MOBILE_PAYMENT \| BURSARY \| DONOR_FUNDED |
| `payment_reference` | VARCHAR(100) | ❌ | Bank reference or transaction ID |
| `is_recurring` | BOOLEAN | ✅ | TRUE = recurring donation |
| `recurrence_interval` | VARCHAR(20) | ❌ | MONTHLY \| QUARTERLY \| ANNUALLY |
| `tax_certificate_url` | VARCHAR(500) | ❌ | Section 18A tax certificate URL |
| `tax_certificate_number` | VARCHAR(100) | ❌ | Tax certificate reference |
| `notes` | TEXT | ❌ | Additional notes |
| `created_at` | TIMESTAMP | ✅ | Record creation timestamp |
| `updated_at` | TIMESTAMP | ✅ | Auto-updated on every change |
| `created_by` | UUID → users | ❌ | Which user recorded this donation |

**Seed data loaded (2 donations):**

| Donor | Amount | Purpose |
|-------|--------|---------|
| Standard Bank Foundation | R500,000 | ICT & Entrepreneurship training — Gauteng 2025 |
| National Youth Development Agency | R250,000 | Bursary funding for materials, transport, certification |

---

### 6.14 `fees`

**Purpose:** Tracks course fees for each learner enrolment. Supports fee waivers (for donor-funded programmes), payment tracking, and links fees to the donations that funded them.

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `fee_id` | UUID | ✅ PK | Auto-generated unique identifier |
| `enrolment_id` | UUID → enrolments | ✅ | The enrolment this fee applies to |
| `learner_id` | UUID → learners | ✅ | The learner being charged |
| `course_id` | UUID → courses | ✅ | The course the fee is for |
| `fee_amount` | DECIMAL(10,2) | ✅ | Total fee amount (≥ 0) |
| `currency` | VARCHAR(10) | ✅ | Currency code (default ZAR) |
| `fee_type` | VARCHAR(50) | ✅ | COURSE_FEE \| REGISTRATION_FEE \| MATERIAL_FEE \| CERTIFICATION_FEE \| OTHER |
| `due_date` | DATE | ❌ | Payment due date |
| `payment_status` | payment_status | ✅ | PENDING \| PAID \| WAIVED \| REFUNDED \| OVERDUE |
| `payment_method` | payment_method | ❌ | How payment was made |
| `amount_paid` | DECIMAL(10,2) | ❌ | Amount actually paid (≤ fee_amount) |
| `payment_date` | DATE | ❌ | Date payment was received |
| `payment_reference` | VARCHAR(100) | ❌ | Payment reference number |
| `receipt_url` | VARCHAR(500) | ❌ | URL to payment receipt |
| `receipt_number` | VARCHAR(100) | ❌ UNIQUE | Receipt reference number |
| `waiver_reason` | TEXT | ❌ | Reason fee was waived (e.g. "Donor-funded bursary") |
| `waiver_approved_by` | UUID → users | ❌ | Admin who approved the waiver |
| `donation_id` | UUID → donations | ❌ | Donation that funded this fee waiver |
| `notes` | TEXT | ❌ | Additional notes |
| `created_at` | TIMESTAMP | ✅ | Record creation timestamp |
| `updated_at` | TIMESTAMP | ✅ | Auto-updated on every change |
| `created_by` | UUID → users | ❌ | Which user created this fee record |

---

### 6.15 `system_config`

**Purpose:** Stores platform-wide configuration settings that control behaviour across the application. Settings can be changed without redeploying code.

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `config_id` | UUID | ✅ PK | Auto-generated unique identifier |
| `config_key` | VARCHAR(100) | ✅ UNIQUE | Setting name (e.g. `ATTENDANCE_THRESHOLD_PASS`) |
| `config_value` | TEXT | ✅ | Setting value |
| `config_category` | VARCHAR(50) | ❌ | Category: GENERAL \| ACADEMIC \| SECURITY \| COMPLIANCE \| etc. |
| `description` | TEXT | ❌ | What this setting controls |
| `data_type` | VARCHAR(20) | ❌ | STRING \| INTEGER \| BOOLEAN \| JSON \| DATE |
| `is_sensitive` | BOOLEAN | ✅ | TRUE = value should not be displayed in UI |
| `last_modified_by` | UUID → users | ❌ | Who last changed this setting |
| `last_modified_at` | TIMESTAMP | ❌ | When it was last changed |
| `created_at` | TIMESTAMP | ✅ | Record creation timestamp |

**Key configuration settings loaded:**

| Key | Value | Meaning |
|-----|-------|---------|
| `ATTENDANCE_THRESHOLD_PASS` | 80 | 80% attendance = meets threshold |
| `ATTENDANCE_THRESHOLD_WARN` | 60 | Below 60% = critical alert |
| `DEFAULT_PASS_MARK` | 50 | Default course pass mark |
| `MAX_LOGIN_ATTEMPTS` | 5 | Lock account after 5 failed logins |
| `ACCOUNT_LOCKOUT_MINUTES` | 30 | Lock duration in minutes |
| `SESSION_TIMEOUT_MINUTES` | 60 | JWT session timeout |
| `POPIA_CONSENT_REQUIRED` | true | Require consent before registration |
| `DATA_RETENTION_YEARS` | 7 | POPIA data retention period |
| `CERTIFICATE_NUMBER_PREFIX` | MIET | Prefix for certificate numbers |
| `CERTIFICATE_VALIDITY_YEARS` | 3 | Default certificate validity |
| `VERIFICATION_BASE_URL` | https://verify.mietafrica.org/cert | Certificate verification portal |

---

## 7. Custom Types (Enums)

PostgreSQL custom types ensure only valid values are stored in key columns.

| Type Name | Values | Used In |
|-----------|--------|---------|
| `user_role` | ADMIN, FACILITATOR, MANAGER, DONOR | users.role |
| `learner_status` | ACTIVE, INACTIVE, SUSPENDED, GRADUATED, WITHDRAWN | learners.status |
| `completion_status` | ENROLLED, IN_PROGRESS, COMPLETED, WITHDRAWN, FAILED | enrolments.completion_status |
| `assessment_result` | PASS, FAIL, PENDING, ABSENT | assessments.result |
| `certificate_status` | PENDING, APPROVED, ISSUED, REVOKED | certificates.status |
| `audit_action` | CREATE, READ, UPDATE, DELETE, LOGIN, LOGOUT, EXPORT, IMPORT, APPROVE, REJECT, GENERATE_CERTIFICATE | audit_logs.action |
| `payment_status` | PENDING, PAID, WAIVED, REFUNDED, OVERDUE | fees.payment_status |
| `payment_method` | CASH, EFT, CARD, MOBILE_PAYMENT, BURSARY, DONOR_FUNDED | fees.payment_method, donations.payment_method |
| `gender_type` | MALE, FEMALE, NON_BINARY, PREFER_NOT_TO_SAY | learners.gender |

---

## 8. Reporting Views

Views are pre-built queries that the backend API can call directly. They combine data from multiple tables and return ready-to-use analytics.

---

### `v_learner_summary`

**Purpose:** One row per learner showing their complete profile summary.

**Columns returned:**
| Column | Description |
|--------|-------------|
| `learner_id` | Learner UUID |
| `first_name`, `last_name` | Learner name |
| `id_number` | SA ID number |
| `email` | Learner email |
| `contact_number` | Phone number |
| `learner_status` | ACTIVE / INACTIVE / etc. |
| `province_name` | Province name |
| `centre_name` | Centre name |
| `total_enrolments` | How many courses enrolled in |
| `completed_courses` | How many courses completed |
| `failed_courses` | How many courses failed |
| `avg_attendance_percentage` | Average attendance across all courses |
| `certificates_issued` | Number of certificates issued |

**Example use:** Learner directory page, learner profile page.

---

### `v_course_statistics`

**Purpose:** One row per course showing performance analytics.

**Columns returned:**
| Column | Description |
|--------|-------------|
| `course_code`, `course_title` | Course identifier and name |
| `pass_mark` | Required pass percentage |
| `seta_name`, `nqf_level` | SETA accreditation info |
| `province_name`, `centre_name` | Location |
| `total_enrolments` | Total learners enrolled |
| `completed` | Learners who completed |
| `failed` | Learners who failed |
| `withdrawn` | Learners who withdrew |
| `in_progress` | Currently active learners |
| `avg_attendance_percentage` | Average attendance % |
| `avg_assessment_score` | Average assessment score % |
| `completion_rate_percent` | % of enrolled learners who completed |
| `certificates_issued` | Certificates issued for this course |
| `total_sessions` | Number of sessions held |

**Example use:** Course management dashboard, management reports.

---

### `v_attendance_report`

**Purpose:** Session-by-session attendance for every learner with threshold alerts.

**Columns returned:**
| Column | Description |
|--------|-------------|
| `learner_name` | Full name |
| `id_number` | SA ID number |
| `course_title` | Course name |
| `session_date` | Date of session |
| `session_topic` | What was covered |
| `present` | TRUE/FALSE |
| `attendance_percentage` | Running attendance % |
| `attendance_alert` | **MEETS THRESHOLD** (≥80%) / **BELOW THRESHOLD** (60–79%) / **CRITICAL - BELOW 60%** |

**Example use:** Attendance register, at-risk learner alerts.

---

### `v_certificate_status`

**Purpose:** Full certificate pipeline showing every certificate and its current status.

**Columns returned:**
| Column | Description |
|--------|-------------|
| `certificate_number` | e.g. MIET-2025-0000001 |
| `certificate_status` | PENDING / APPROVED / ISSUED / REVOKED |
| `learner_name` | Learner full name |
| `course_title` | Course name |
| `seta_name`, `nqf_level` | SETA info |
| `issue_date`, `expiry_date` | Certificate dates |
| `qr_code_url` | QR code image URL |
| `verification_url` | Public verification link |
| `verification_code` | Unique verification code |
| `approved_by_name` | Who approved it |
| `credits_awarded` | NQF credits |
| `province_name`, `centre_name` | Location |

**Example use:** Certificate management page, certificate printing.

---

### `v_donor_impact_metrics`

**Purpose:** Monthly impact statistics for donor reporting. Shows what was achieved with donor funding.

**Columns returned:**
| Column | Description |
|--------|-------------|
| `year`, `month` | Time period |
| `province_name` | Province |
| `course_title` | Course name |
| `seta_name` | SETA |
| `learners_trained` | Number of learners who enrolled |
| `learners_completed` | Number who completed |
| `assessments_passed` | Number of assessments passed |
| `certificates_issued` | Certificates issued |
| `avg_attendance_percent` | Average attendance |
| `pass_rate_percent` | Overall pass rate % |

**Example use:** Donor dashboard, funder reports, annual impact reports.

---

### `v_province_analytics`

**Purpose:** Province-level aggregated statistics for management overview.

**Columns returned:**
| Column | Description |
|--------|-------------|
| `province_name` | Province |
| `total_centres` | Number of active centres |
| `total_learners` | Total learners registered |
| `active_learners` | Currently active learners |
| `total_courses` | Total courses |
| `active_courses` | Currently running courses |
| `total_enrolments` | Total enrolments |
| `completed_enrolments` | Completed enrolments |
| `certificates_issued` | Certificates issued |
| `avg_attendance_percent` | Average attendance |
| `overall_pass_rate_percent` | Overall pass rate |

**Example use:** Management dashboard, provincial reports.

---

### `v_monthly_registrations`

**Purpose:** Monthly trend of new learner registrations with demographic breakdown.

**Columns returned:**
| Column | Description |
|--------|-------------|
| `year`, `month`, `month_label` | Time period (e.g. "Jan 2025") |
| `province_name` | Province |
| `new_registrations` | New learners registered |
| `female_count` | Female learners |
| `male_count` | Male learners |
| `learners_with_disability` | Learners with disabilities |

**Example use:** Registration trend charts, demographic reports.

---

### `v_fee_collection_summary`

**Purpose:** Financial overview of fee collection per course.

**Columns returned:**
| Column | Description |
|--------|-------------|
| `course_title` | Course name |
| `province_name`, `centre_name` | Location |
| `total_fee_records` | Number of fee records |
| `total_fees_due` | Total amount due |
| `total_collected` | Total amount collected |
| `outstanding_balance` | Amount still outstanding |
| `paid_count` | Number of paid fees |
| `pending_count` | Number of pending fees |
| `waived_count` | Number of waived fees |
| `overdue_count` | Number of overdue fees |
| `collection_rate_percent` | % of fees collected |

**Example use:** Financial reports, fee management dashboard.

---

## 9. Triggers & Automated Functions

These functions run **automatically** in the database — the backend API does not need to call them manually.

---

### Trigger 1: `trg_recalculate_attendance` (AFTER INSERT/UPDATE/DELETE on `attendance`)

**What it does:** Every time an attendance record is added, changed, or deleted, this trigger automatically recalculates the `attendance_percentage` on the related `enrolments` record.

**Formula:** `(sessions attended / total non-cancelled sessions) × 100`

**Why it matters:** The backend never needs to calculate attendance — it just inserts attendance records and the percentage is always up to date.

---

### Trigger 2: `trg_auto_assessment_result` (BEFORE INSERT/UPDATE on `assessments`)

**What it does:** When a score is entered, this trigger automatically sets the `result` field to PASS or FAIL by comparing the percentage to the course's `pass_mark`.

**Formula:** `IF (score / max_score × 100) >= course.pass_mark → PASS, else FAIL`

**⚠️ Technical Note:** This trigger computes the percentage manually because PostgreSQL's `GENERATED ALWAYS AS` columns are not available inside `BEFORE` triggers.

---

### Trigger 3: `trg_enrolment_status_on_attendance` (AFTER INSERT on `attendance`)

**What it does:** When the first attendance record is inserted for an enrolment, the enrolment status automatically changes from `ENROLLED` to `IN_PROGRESS`.

**Why it matters:** Tracks the learner journey automatically without manual status updates.

---

### Trigger 4: `trg_generate_certificate_number` (BEFORE INSERT on `certificates`)

**What it does:** Auto-generates two fields when a certificate is created:
- `certificate_number` → format `MIET-2025-0000001` (sequential per year)
- `verification_code` → 12-character uppercase alphanumeric code

---

### Trigger 5: `trg_validate_facilitator_role` (BEFORE INSERT/UPDATE on `facilitator_assignments`)

**What it does:** Rejects any attempt to assign a user who is not a FACILITATOR or ADMIN to a course. Raises an error with a clear message.

---

### Trigger 6: `trg_popia_consent_date` (BEFORE INSERT/UPDATE on `learners`)

**What it does:** If `popia_consent = TRUE` and `popia_consent_date` is NULL, automatically stamps the current timestamp as the consent date.

---

### Trigger 7–17: `trg_*_timestamp` (BEFORE UPDATE on all tables)

**What it does:** Automatically updates the `updated_at` column to the current timestamp whenever any record is modified. Applied to all 11 tables that have an `updated_at` column.

---

### Utility Functions (callable from backend)

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `fn_calculate_age(date)` | Date of birth | INTEGER | Calculates current age in years |
| `fn_get_learner_name(uuid)` | Learner UUID | VARCHAR | Returns "First Last" name |
| `fn_get_course_pass_rate(uuid)` | Course UUID | DECIMAL | Returns pass rate % for a course |

**Example usage in Node.js:**
```javascript
// Get learner age
const result = await pool.query(
  "SELECT fn_calculate_age($1) AS age", ['2000-01-01']
);

// Get course pass rate
const result = await pool.query(
  "SELECT fn_get_course_pass_rate($1) AS pass_rate", [courseId]
);
```

---

## 10. Row Level Security (RLS)

Row Level Security ensures that users can only see data they are authorised to access. The backend must set session variables on every database connection.

### How to Set RLS Variables (Node.js)

```javascript
// Set these on every request BEFORE running queries
await pool.query(`SET app.user_role = '${req.user.role}'`);
await pool.query(`SET app.user_id   = '${req.user.id}'`);
```

### RLS Policies Summary

| Table | ADMIN | MANAGER | FACILITATOR | DONOR |
|-------|-------|---------|-------------|-------|
| `learners` | All rows | All rows | Own courses only | ❌ |
| `assessments` | All rows | All rows | Own courses only | ❌ |
| `attendance` | All rows | All rows | Own courses only | ❌ |
| `certificates` | All rows | All rows | Read only | ❌ |
| `donations` | All rows | All rows | ❌ | Own records |
| `fees` | All rows | All rows | Own courses only | ❌ |
| `audit_logs` | All rows | ❌ | ❌ | ❌ |

**"Own courses only"** means the facilitator can only see data for learners enrolled in courses they are assigned to via `facilitator_assignments`.

---

## 11. Database Roles & Permissions

Five database roles control what each type of user can do at the database level.

### `miet_admin`
- Full access to all 15 tables
- Can execute all functions
- Can manage all sequences
- **Assigned to:** System administrators

### `miet_manager`
- Read + Write on all tables except `audit_logs` (read-only)
- Can execute utility functions
- **Assigned to:** Programme managers

### `miet_facilitator`
- **Read** on: provinces, centres, courses, learners, enrolments, facilitator_assignments, certificates, fees
- **Read + Write** on: sessions, attendance, assessments
- **Assigned to:** Course facilitators

### `miet_donor`
- **Read only** on: provinces, centres, courses, donations
- **Read only** on views: v_donor_impact_metrics, v_province_analytics, v_course_statistics, v_certificate_status
- **Assigned to:** Donor organisation accounts

### `miet_readonly`
- **Read only** on non-sensitive tables and reporting views
- **Assigned to:** Reporting tools, BI dashboards

---

## 12. Indexes & Performance

The database has **88 indexes** (including primary key and unique constraint indexes) to ensure fast queries even with 5,000+ learners.

### Key Indexes

| Index | Table | Columns | Purpose |
|-------|-------|---------|---------|
| `idx_learners_id_number` | learners | id_number | Fast learner lookup by ID |
| `idx_learners_name_trgm` | learners | first_name + last_name | Full-text name search |
| `idx_learners_centre` | learners | centre_id | Filter learners by centre |
| `idx_enrolments_learner` | enrolments | learner_id | All courses for a learner |
| `idx_enrolments_course` | enrolments | course_id | All learners in a course |
| `idx_attendance_enrolment` | attendance | enrolment_id | Attendance for an enrolment |
| `idx_attendance_session` | attendance | session_id | Attendance for a session |
| `idx_assessments_enrolment` | assessments | enrolment_id | Assessments for an enrolment |
| `idx_certificates_verification_code` | certificates | verification_code | Certificate verification lookup |
| `idx_audit_logs_timestamp` | audit_logs | timestamp | Audit log time-range queries |

### Full-Text Search on Learner Names

```sql
-- Fast name search using trigram index
SELECT * FROM learners
WHERE (first_name || ' ' || last_name) ILIKE '%sipho%';
```

---

## 13. POPIA Compliance

The Protection of Personal Information Act (POPIA) governs how personal data is collected, stored, and used in South Africa. The database is designed with POPIA compliance built in at every level.

### Personal Information Stored

| Table | Personal Data Fields |
|-------|---------------------|
| `learners` | Name, ID number, DOB, gender, email, phone, address, disability status |
| `users` | Name, email, phone, password hash |
| `audit_logs` | User email snapshot, IP address, user agent |
| `donations` | Donor name, email, phone |

### POPIA Compliance Features

| Feature | Implementation |
|---------|---------------|
| **Explicit Consent** | `learners.popia_consent` must be TRUE before registration |
| **Consent Timestamp** | `learners.popia_consent_date` auto-stamped by trigger |
| **Data Minimisation** | Only fields necessary for operations are collected |
| **Access Control** | RLS ensures users only see data they need |
| **Audit Trail** | All data access and changes logged in `audit_logs` |
| **Data Retention** | 7-year retention policy in `system_config` |
| **Secure Storage** | Passwords bcrypt-hashed, SSL/TLS connections required |
| **Right to Access** | Learners can view their own data via portal |

### How to Record POPIA Consent (Node.js)

```javascript
// When registering a learner, always capture consent
const learner = await pool.query(`
  INSERT INTO learners (
    first_name, last_name, id_number, date_of_birth,
    gender, contact_number, address, nationality,
    popia_consent, popia_consent_date
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE, NOW())
  RETURNING *
`, [firstName, lastName, idNumber, dob, gender, phone, address, nationality]);
```

### How to Log an Audit Entry (Node.js)

```javascript
// Log every significant action
await pool.query(`
  INSERT INTO audit_logs (
    user_id, user_email, action, entity_type, entity_id,
    description, ip_address, action_result
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'SUCCESS')
`, [userId, userEmail, 'CREATE', 'learners', learnerId,
    'New learner registered', req.ip]);
```

---

## 14. SETA Compliance

The database supports full SETA (Sector Education and Training Authority) reporting requirements for accredited programmes.

### SETA Fields on Courses

| Field | Example | Purpose |
|-------|---------|---------|
| `seta_name` | MICT SETA | Which SETA accredits this course |
| `seta_accreditation_number` | MICT/ACC/2023/001 | SETA accreditation reference |
| `unit_standard_codes` | {116937, 116938, 116940} | SAQA unit standard codes (array) |
| `nqf_level` | 3 | National Qualifications Framework level |
| `credits` | 12 | NQF credits awarded |
| `qualification_title` | End User Computing | Full qualification name |

### SETA Fields on Assessments

| Field | Example | Purpose |
|-------|---------|---------|
| `unit_standard_code` | 116937 | Which unit standard this assessment covers |
| `assessment_type` | WRITTEN_TEST | Type of assessment |
| `attempt_number` | 1 | Tracks re-assessments |
| `moderator_id` | UUID | Moderation requirement |
| `moderation_date` | 2025-02-20 | When moderation occurred |

### SETA Fields on Certificates

| Field | Example | Purpose |
|-------|---------|---------|
| `seta_registration_number` | MICT/CERT/2025/001 | SETA certificate registration |
| `nqf_level` | 3 | NQF level on certificate |
| `credits_awarded` | 12 | Credits shown on certificate |

### SETAs Currently Configured

| SETA | Courses |
|------|---------|
| MICT SETA | Computer Literacy |
| SERVICES SETA | Entrepreneurship & Business Skills |
| ETDP SETA | Life Skills, Early Childhood Development |
| CETA | Construction & Building Skills |

---

## 15. Sample Data Loaded

The seed file (`miet_africa_seed.sql`) loads the following reference and sample data into the database.

### Users (6 records)

| Name | Email | Role |
|------|-------|------|
| MIET Africa System Administrator | admin@mietafrica.org | ADMIN |
| Nomsa Dlamini | nomsa.dlamini@mietafrica.org | MANAGER |
| Thabo Mokoena | thabo.mokoena@mietafrica.org | FACILITATOR |
| Ayanda Nkosi | ayanda.nkosi@mietafrica.org | FACILITATOR |
| Priya Naidoo | priya.naidoo@mietafrica.org | FACILITATOR |
| Standard Bank Foundation | foundation@standardbank.co.za | DONOR |

### Learners (8 records)

| Name | Province | Centre | Course |
|------|----------|--------|--------|
| Sipho Zulu | Gauteng | Soweto YSC | ICT + Entrepreneurship |
| Nomvula Khumalo | Gauteng | Soweto YSC | ICT + Entrepreneurship |
| Lungelo Mthembu | KwaZulu-Natal | Durban YSC | Life Skills |
| Fatima Davids | Western Cape | Cape Town YSC | Construction |
| Andile Ntuli | Eastern Cape | East London YSC | ECD |
| Zanele Mokoena | Gauteng | Soweto YSC | ICT |
| Rethabile Sithole | Gauteng | Soweto YSC | ICT |
| Nompumelelo Dube | KwaZulu-Natal | Durban YSC | Life Skills |

### Enrolments (10 records)

| Learner | Course | Status |
|---------|--------|--------|
| Sipho Zulu | Computer Literacy | IN_PROGRESS |
| Nomvula Khumalo | Computer Literacy | IN_PROGRESS |
| Zanele Mokoena | Computer Literacy | IN_PROGRESS |
| Rethabile Sithole | Computer Literacy | IN_PROGRESS |
| Sipho Zulu | Entrepreneurship | ENROLLED |
| Nomvula Khumalo | Entrepreneurship | ENROLLED |
| Lungelo Mthembu | Life Skills | IN_PROGRESS |
| Nompumelelo Dube | Life Skills | IN_PROGRESS |
| Fatima Davids | Construction | ENROLLED |
| Andile Ntuli | ECD | ENROLLED |

### Sessions (7 records)

| Course | Sessions |
|--------|---------|
| Computer Literacy | 4 sessions (03, 05, 10, 12 Feb 2025) |
| Life Skills | 3 sessions (03, 05, 10 Feb 2025) |

### Attendance (22 records)

| Learner | ICT Sessions Attended | Attendance % |
|---------|----------------------|-------------|
| Sipho Zulu | 4/4 | 100% |
| Nomvula Khumalo | 3/4 | 75% |
| Zanele Mokoena | 3/4 | 75% |
| Rethabile Sithole | 3/4 | 75% |
| Lungelo Mthembu | 3/3 | 100% |
| Nompumelelo Dube | 2/3 | 67% |

### Assessments (9 records) — with auto PASS/FAIL results

| Learner | Module | Score | % | Pass Mark | Result |
|---------|--------|-------|---|-----------|--------|
| Sipho Zulu | Computer Basics & OS | 72/100 | 72% | 60% | **PASS** |
| Sipho Zulu | Microsoft Word Practical | 68/100 | 68% | 60% | **PASS** |
| Nomvula Khumalo | Computer Basics & OS | 55/100 | 55% | 60% | **FAIL** |
| Nomvula Khumalo | Microsoft Word Practical | 80/100 | 80% | 60% | **PASS** |
| Zanele Mokoena | Computer Basics & OS | 45/100 | 45% | 60% | **FAIL** |
| Lungelo Mthembu | Communication Skills | 78/100 | 78% | 50% | **PASS** |
| Lungelo Mthembu | Financial Literacy | 65/100 | 65% | 50% | **PASS** |
| Nompumelelo Dube | Communication Skills | 88/100 | 88% | 50% | **PASS** |
| Nompumelelo Dube | Financial Literacy | 72/100 | 72% | 50% | **PASS** |

### Donations (2 records — R750,000 total)

| Donor | Amount | Purpose |
|-------|--------|---------|
| Standard Bank Foundation | R500,000 | ICT & Entrepreneurship — Gauteng 2025 (recurring annually) |
| National Youth Development Agency | R250,000 | Bursary funding — all provinces |

### Fees (5 records — all waived)

All current learner fees are waived because the programmes are donor-funded.

### System Config (23 settings)

Categories: GENERAL, ACADEMIC, SECURITY, COMPLIANCE, INFRASTRUCTURE, CERTIFICATES, FINANCIAL.

---

## 16. Common Queries for Developers

These are the most frequently needed SQL queries for building the backend API.

### Get all learners at a centre

```sql
SELECT
    l.learner_id,
    l.first_name || ' ' || l.last_name AS full_name,
    l.id_number,
    l.contact_number,
    l.email,
    l.status
FROM learners l
WHERE l.centre_id = $1
  AND l.status = 'ACTIVE'
ORDER BY l.last_name, l.first_name;
```

### Get all enrolments for a learner (with course details)

```sql
SELECT
    e.enrolment_id,
    co.course_code,
    co.title AS course_title,
    e.enrol_date,
    e.completion_status,
    e.attendance_percentage,
    co.pass_mark,
    cert.status AS certificate_status
FROM enrolments e
JOIN courses co ON e.course_id = co.course_id
LEFT JOIN certificates cert ON e.learner_id = cert.learner_id
                           AND e.course_id  = cert.course_id
WHERE e.learner_id = $1
ORDER BY e.enrol_date DESC;
```

### Get attendance register for a session

```sql
SELECT
    l.first_name || ' ' || l.last_name AS learner_name,
    l.id_number,
    COALESCE(att.present, FALSE) AS present,
    att.arrival_time,
    att.notes
FROM enrolments e
JOIN learners l ON e.learner_id = l.learner_id
LEFT JOIN attendance att ON e.enrolment_id = att.enrolment_id
                        AND att.session_id  = $1
WHERE e.course_id = (SELECT course_id FROM sessions WHERE session_id = $1)
ORDER BY l.last_name, l.first_name;
```

### Record attendance for a session

```sql
INSERT INTO attendance (enrolment_id, session_id, present, recorded_by)
VALUES ($1, $2, $3, $4)
ON CONFLICT (enrolment_id, session_id)
DO UPDATE SET present = EXCLUDED.present,
              recorded_by = EXCLUDED.recorded_by,
              updated_at = NOW();
-- The trigger automatically recalculates attendance_percentage
```

### Enter an assessment score

```sql
INSERT INTO assessments (
    enrolment_id, module_title, assessment_type,
    score, max_score, assessment_date, assessor_id
) VALUES ($1, $2, $3, $4, $5, $6, $7);
-- The trigger automatically sets result = PASS or FAIL
```

### Get learners below attendance threshold (at-risk)

```sql
SELECT
    l.first_name || ' ' || l.last_name AS learner_name,
    l.contact_number,
    co.title AS course_title,
    e.attendance_percentage,
    CASE
        WHEN e.attendance_percentage < 60 THEN 'CRITICAL'
        WHEN e.attendance_percentage < 80 THEN 'WARNING'
    END AS alert_level
FROM enrolments e
JOIN learners l ON e.learner_id = l.learner_id
JOIN courses co ON e.course_id  = co.course_id
WHERE e.completion_status = 'IN_PROGRESS'
  AND e.attendance_percentage < 80
ORDER BY e.attendance_percentage ASC;
```

### Get course pass rate

```sql
SELECT fn_get_course_pass_rate($1) AS pass_rate_percent;
-- Or use the view:
SELECT course_code, course_title, completion_rate_percent, avg_attendance_percentage
FROM v_course_statistics
WHERE course_id = $1;
```

### Get donor impact report

```sql
SELECT * FROM v_donor_impact_metrics
ORDER BY year DESC, month DESC;
```

### Search learners by name (full-text)

```sql
SELECT learner_id, first_name, last_name, id_number, status
FROM learners
WHERE (first_name || ' ' || last_name) ILIKE '%' || $1 || '%'
ORDER BY last_name, first_name
LIMIT 20;
```

### Initiate a certificate

```sql
-- certificate_number and verification_code are auto-generated by trigger
INSERT INTO certificates (learner_id, course_id, enrolment_id, status, created_by)
VALUES ($1, $2, $3, 'PENDING', $4)
RETURNING certificate_id, certificate_number, verification_code;
```

### Approve a certificate

```sql
UPDATE certificates
SET status       = 'APPROVED',
    approved_by  = $1,
    approval_date = NOW(),
    approval_notes = $2
WHERE certificate_id = $3;
```

### Get province analytics dashboard data

```sql
SELECT * FROM v_province_analytics
ORDER BY total_learners DESC;
```

### Get monthly registration trends

```sql
SELECT * FROM v_monthly_registrations
WHERE year = EXTRACT(YEAR FROM CURRENT_DATE)
ORDER BY month DESC;
```

### Log an audit entry

```sql
INSERT INTO audit_logs (
    user_id, user_email, action, entity_type, entity_id,
    new_values, description, ip_address, action_result
) VALUES (
    $1, $2, $3::audit_action, $4, $5,
    $6::jsonb, $7, $8::inet, 'SUCCESS'
);
```

---

## 17. Node.js Integration Guide

### Recommended Package

```bash
npm install pg
npm install dotenv
```

### Database Connection Pool

```javascript
// db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },  // Required for cloud hosting
  max: 20,          // Maximum connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

module.exports = pool;
```

### Middleware: Set RLS Session Variables

```javascript
// middleware/setRLS.js
const pool = require('../db');

const setRLSContext = async (req, res, next) => {
  if (req.user) {
    const client = await pool.connect();
    try {
      await client.query(`SET app.user_role = '${req.user.role}'`);
      await client.query(`SET app.user_id   = '${req.user.id}'`);
      req.dbClient = client;
      next();
    } catch (err) {
      client.release();
      next(err);
    }
  } else {
    next();
  }
};

module.exports = setRLSContext;
```

### Example: Register a Learner

```javascript
// POST /api/learners
const registerLearner = async (req, res) => {
  const {
    firstName, lastName, idNumber, dateOfBirth,
    gender, email, contactNumber, address,
    provinceId, centreId
  } = req.body;

  try {
    const result = await pool.query(`
      INSERT INTO learners (
        first_name, last_name, id_number, date_of_birth,
        gender, email, contact_number, address,
        province_id, centre_id,
        popia_consent, popia_consent_date,
        created_by
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,TRUE,NOW(),$11)
      RETURNING learner_id, first_name, last_name, id_number
    `, [firstName, lastName, idNumber, dateOfBirth,
        gender, email, contactNumber, address,
        provinceId, centreId, req.user.id]);

    // Log the action
    await pool.query(`
      INSERT INTO audit_logs (user_id, user_email, action, entity_type, entity_id, description, action_result)
      VALUES ($1, $2, 'CREATE', 'learners', $3, 'New learner registered', 'SUCCESS')
    `, [req.user.id, req.user.email, result.rows[0].learner_id]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.constraint === 'learners_id_number_key') {
      return res.status(409).json({ error: 'A learner with this ID number already exists' });
    }
    res.status(500).json({ error: err.message });
  }
};
```

### Example: Record Attendance

```javascript
// POST /api/attendance
const recordAttendance = async (req, res) => {
  const { enrolmentId, sessionId, present, notes } = req.body;

  try {
    // Upsert attendance (insert or update if already exists)
    await pool.query(`
      INSERT INTO attendance (enrolment_id, session_id, present, notes, recorded_by)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (enrolment_id, session_id)
      DO UPDATE SET present = EXCLUDED.present,
                    notes = EXCLUDED.notes,
                    recorded_by = EXCLUDED.recorded_by,
                    updated_at = NOW()
    `, [enrolmentId, sessionId, present, notes, req.user.id]);

    // attendance_percentage is automatically recalculated by trigger
    // Fetch updated percentage
    const enrolment = await pool.query(
      'SELECT attendance_percentage FROM enrolments WHERE enrolment_id = $1',
      [enrolmentId]
    );

    res.json({
      message: 'Attendance recorded',
      attendance_percentage: enrolment.rows[0].attendance_percentage
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
```

### Example: Enter Assessment Score

```javascript
// POST /api/assessments
const enterAssessment = async (req, res) => {
  const { enrolmentId, moduleTitle, assessmentType, score, maxScore, assessmentDate } = req.body;

  try {
    const result = await pool.query(`
      INSERT INTO assessments (
        enrolment_id, module_title, assessment_type,
        score, max_score, assessment_date, assessor_id, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
      RETURNING assessment_id, percentage, result
    `, [enrolmentId, moduleTitle, assessmentType, score, maxScore, assessmentDate, req.user.id]);

    // result (PASS/FAIL) is automatically set by trigger
    res.status(201).json({
      message: 'Assessment recorded',
      percentage: result.rows[0].percentage,
      result: result.rows[0].result  // 'PASS' or 'FAIL'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
```

### Example: Get Dashboard Stats

```javascript
// GET /api/dashboard
const getDashboard = async (req, res) => {
  const [learners, courses, provinces, impact] = await Promise.all([
    pool.query('SELECT COUNT(*) FROM learners WHERE status = $1', ['ACTIVE']),
    pool.query('SELECT COUNT(*) FROM courses WHERE is_active = TRUE'),
    pool.query('SELECT * FROM v_province_analytics ORDER BY total_learners DESC'),
    pool.query('SELECT * FROM v_donor_impact_metrics ORDER BY year DESC, month DESC LIMIT 12')
  ]);

  res.json({
    active_learners: learners.rows[0].count,
    active_courses: courses.rows[0].count,
    province_stats: provinces.rows,
    monthly_impact: impact.rows
  });
};
```

---

## 18. Files Reference

All database files are located in: `C:/Users/Elie/Desktop/miet_africa/`

| File | Size | Purpose |
|------|------|---------|
| `miet_africa_schema.sql` | ~1,550 lines | **Main schema** — run this first. Creates all tables, types, indexes, views, triggers, functions, RLS policies, and roles. |
| `miet_africa_seed.sql` | ~400 lines | **Seed data** — run this second. Loads all 9 provinces, sample users, centres, courses, learners, enrolments, sessions, attendance, assessments, donations, fees, and system config. |
| `DATABASE_DOCUMENTATION.md` | This file | **Complete documentation** — explains every table, column, view, trigger, and how to use the database. |
| `README_MIET_AFRICA.md` | Setup guide | Quick setup and deployment guide. |
| `test_queries.sql` | 20 tests | **Test suite** — 20 queries that verify all triggers, constraints, views, and functions work correctly. |
| `fix_trigger.sql` | Fix script | Applied during development to fix the assessment PASS/FAIL trigger. Already incorporated into `miet_africa_schema.sql`. |
| `TODO.md` | Task tracker | Development task tracker showing all completed items. |

### Deployment Order

```
1. miet_africa_schema.sql   ← Always run first
2. miet_africa_seed.sql     ← Run second (depends on schema)
3. test_queries.sql         ← Optional: verify everything works
```

### Re-deploying (Fresh Start)

```bash
# Drop and recreate the database
psql -U postgres -c "DROP DATABASE IF EXISTS miet_africa_db;"
psql -U postgres -c "CREATE DATABASE miet_africa_db WITH ENCODING='UTF8';"
psql -U postgres -d miet_africa_db -f miet_africa_schema.sql
psql -U postgres -d miet_africa_db -f miet_africa_seed.sql
```

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| **Tables** | 15 |
| **Custom Types (Enums)** | 9 |
| **Indexes** | 88 |
| **Reporting Views** | 8 |
| **Triggers** | 10 |
| **Functions** | 7 |
| **RLS Policies** | 11 |
| **Database Roles** | 5 |
| **Seed: Provinces** | 9 |
| **Seed: Users** | 6 |
| **Seed: Centres** | 4 |
| **Seed: Courses** | 5 |
| **Seed: Learners** | 8 |
| **Seed: Enrolments** | 10 |
| **Seed: Sessions** | 7 |
| **Seed: Attendance Records** | 22 |
| **Seed: Assessments** | 9 |
| **Seed: Donations** | 2 (R750,000 total) |
| **Seed: System Config Settings** | 23 |
| **Scalability Target** | 5,000 learners / 500 concurrent users |

---

*Document Version: 1.0 | MIET Africa Youth Skills Centre Management Platform | Compliance: POPIA | SETA | NQF*

