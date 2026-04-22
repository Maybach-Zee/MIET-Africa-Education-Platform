# MIET Africa Youth Skills Centre Management Platform
## PostgreSQL Database — Task Tracker

---

## Tasks

- [x] **Step 1**: Create `miet_africa_schema.sql` — Full database schema
  - [x] Section 1: Extensions (uuid-ossp, pgcrypto, pg_trgm)
  - [x] Section 2–16: Core Tables (15 tables)
  - [x] Section 17: Indexes (88 indexes including PK/UNIQUE)
  - [x] Section 18: Reporting Views (8 views)
  - [x] Section 19: Triggers & Functions (10 triggers, 7 functions)
  - [x] Section 20: Row Level Security (11 policies)
  - [x] Section 21: Roles & Grants (5 roles)
  - [x] Section 22: Completion Notes & Deployment Instructions
  - [x] **BUG FIX**: Assessment trigger — compute percentage manually
        (GENERATED ALWAYS AS columns unavailable in BEFORE triggers)

- [x] **Step 2**: Create `miet_africa_seed.sql` — Reference & sample data
  - [x] 9 SA Provinces
  - [x] 6 Sample Users (Admin, Manager, Facilitators, Donor)
  - [x] 4 Youth Skills Centres (GP, KZN, WC, EC)
  - [x] 5 Sample Courses (with SETA fields)
  - [x] 5 Facilitator Assignments
  - [x] 8 Sample Learners (across 4 provinces)
  - [x] 10 Enrolments
  - [x] 7 Sessions
  - [x] 22 Attendance Records
  - [x] 9 Assessments
  - [x] 2 Donations (R750,000 total)
  - [x] 5 Fee Records (all waived — donor-funded)
  - [x] 23 System Configuration Settings
  - [x] Initial Audit Log Entry
  - [x] **BUG FIX**: UUID prefixes g/h replaced with valid hex (a2/a3)

- [x] **Step 3**: Create `README_MIET_AFRICA.md` — Setup & documentation guide

- [x] **Step 4**: Thorough Testing on PostgreSQL 18
  - [x] TEST 1:  Tables — 15 tables ✅
  - [x] TEST 2:  Views — 8 views ✅
  - [x] TEST 3:  Indexes — 88 indexes ✅
  - [x] TEST 4:  Seed data counts — all correct ✅
  - [x] TEST 5:  Attendance % auto-calculation trigger ✅
  - [x] TEST 6:  Assessment PASS/FAIL trigger ✅ (fixed)
  - [x] TEST 7:  Enrolment ENROLLED→IN_PROGRESS trigger ✅
  - [x] TEST 8:  UNIQUE constraint — duplicate enrolment rejected ✅
  - [x] TEST 9:  CHECK constraint — invalid SA ID number rejected ✅
  - [x] TEST 10: CHECK constraint — score > max_score rejected ✅
  - [x] TEST 11: CHECK constraint — pass_mark > 100 rejected ✅
  - [x] TEST 12: POPIA trigger — auto-stamps consent date ✅ (by design)
  - [x] TEST 13: Facilitator role trigger — MANAGER rejected ✅
  - [x] TEST 14: v_course_statistics view ✅
  - [x] TEST 15: v_attendance_report with threshold alerts ✅
  - [x] TEST 16: v_donor_impact_metrics view ✅
  - [x] TEST 17: v_province_analytics view ✅
  - [x] TEST 18: Utility functions (age, name, pass rate) ✅
  - [x] TEST 19: v_learner_summary view ✅
  - [x] TEST 20: v_fee_collection_summary view ✅

---

## Status: ✅ COMPLETE — All Tests Passed

### Files Delivered
| File | Description |
|------|-------------|
| `miet_africa_schema.sql` | Full PostgreSQL schema (~1,550 lines) |
| `miet_africa_seed.sql` | Reference & sample data (~400 lines) |
| `README_MIET_AFRICA.md` | Setup & documentation guide |
| `test_queries.sql` | 20 thorough test queries |
| `fix_trigger.sql` | Trigger fix applied during te### Database: miet_africa_db (PostgreSQL 18)
| Metric | Count |
|--------|-------|
| Tables | 15 |
| Views | 8 |
| Indexes | 88 |
| Triggers | 10 |
| Functions | 7 |
| RLS Policies | 11 |
| DB Roles | 5 |

### Quick Start
```bash
# 1. Create database
psql -U postgres -c "CREATE DATABASE miet_africa_db;"

# 2. Run schema
psql -U postgres -d miet_africa_db -f miet_africa_schema.sql

# 3. Run seed data
psql -U postgres -d miet_africa_db -f miet_africa_seed.sql
