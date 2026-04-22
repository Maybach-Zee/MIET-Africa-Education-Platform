-- =====================================================
-- MIET AFRICA DATABASE — THOROUGH TEST QUERIES
-- =====================================================
\pset pager off
\pset tuples_only off

-- ============================================================
-- TEST 1: All 15 tables exist
-- ============================================================
\echo '=== TEST 1: Tables (expect 15) ==='
SELECT COUNT(*) AS table_count FROM pg_tables WHERE schemaname = 'public';

-- ============================================================
-- TEST 2: All 8 views exist
-- ============================================================
\echo '=== TEST 2: Views (expect 8) ==='
SELECT COUNT(*) AS view_count FROM pg_views WHERE schemaname = 'public';

-- ============================================================
-- TEST 3: All 58+ indexes exist
-- ============================================================
\echo '=== TEST 3: Indexes (expect 58+) ==='
SELECT COUNT(*) AS index_count FROM pg_indexes WHERE schemaname = 'public';

-- ============================================================
-- TEST 4: Seed data counts
-- ============================================================
\echo '=== TEST 4: Seed Data Counts ==='
SELECT 'provinces'              AS entity, COUNT(*) AS count FROM provinces
UNION ALL
SELECT 'users',                            COUNT(*) FROM users
UNION ALL
SELECT 'centres',                          COUNT(*) FROM centres
UNION ALL
SELECT 'courses',                          COUNT(*) FROM courses
UNION ALL
SELECT 'learners',                         COUNT(*) FROM learners
UNION ALL
SELECT 'enrolments',                       COUNT(*) FROM enrolments
UNION ALL
SELECT 'sessions',                         COUNT(*) FROM sessions
UNION ALL
SELECT 'attendance',                       COUNT(*) FROM attendance
UNION ALL
SELECT 'assessments',                      COUNT(*) FROM assessments
UNION ALL
SELECT 'donations',                        COUNT(*) FROM donations
UNION ALL
SELECT 'fees',                             COUNT(*) FROM fees
UNION ALL
SELECT 'system_config',                    COUNT(*) FROM system_config
UNION ALL
SELECT 'audit_logs',                       COUNT(*) FROM audit_logs
ORDER BY entity;

-- ============================================================
-- TEST 5: TRIGGER — Attendance % auto-calculated
-- ============================================================
\echo '=== TEST 5: Attendance % Auto-Calculation ==='
SELECT
    l.first_name || ' ' || l.last_name AS learner,
    co.title AS course,
    e.attendance_percentage,
    CASE WHEN e.attendance_percentage > 0 THEN 'PASS - Trigger worked' ELSE 'FAIL - Trigger did not fire' END AS trigger_status
FROM enrolments e
JOIN learners l ON e.learner_id = l.learner_id
JOIN courses co ON e.course_id = co.course_id
WHERE e.completion_status = 'IN_PROGRESS'
ORDER BY l.last_name;

-- ============================================================
-- TEST 6: TRIGGER — Assessment PASS/FAIL auto-set
-- ============================================================
\echo '=== TEST 6: Assessment Auto PASS/FAIL ==='
SELECT
    l.first_name || ' ' || l.last_name AS learner,
    a.module_title,
    a.score,
    a.percentage,
    co.pass_mark,
    a.result,
    CASE
        WHEN a.percentage >= co.pass_mark AND a.result = 'PASS' THEN 'CORRECT'
        WHEN a.percentage < co.pass_mark AND a.result = 'FAIL'  THEN 'CORRECT'
        ELSE 'WRONG - Trigger failed'
    END AS trigger_check
FROM assessments a
JOIN enrolments e ON a.enrolment_id = e.enrolment_id
JOIN learners l   ON e.learner_id   = l.learner_id
JOIN courses co   ON e.course_id    = co.course_id
ORDER BY l.last_name, a.module_title;

-- ============================================================
-- TEST 7: TRIGGER — Enrolment status ENROLLED → IN_PROGRESS
-- ============================================================
\echo '=== TEST 7: Enrolment Status Transition ==='
SELECT
    l.first_name || ' ' || l.last_name AS learner,
    co.title AS course,
    e.completion_status,
    CASE
        WHEN e.completion_status = 'IN_PROGRESS' THEN 'CORRECT - Status updated by trigger'
        WHEN e.completion_status = 'ENROLLED'    THEN 'OK - No attendance yet'
        ELSE 'CHECK'
    END AS status_check
FROM enrolments e
JOIN learners l ON e.learner_id = l.learner_id
JOIN courses co ON e.course_id  = co.course_id
ORDER BY co.title, l.last_name;

-- ============================================================
-- TEST 8: CONSTRAINT — Duplicate enrolment rejected
-- ============================================================
\echo '=== TEST 8: UNIQUE Constraint — Duplicate Enrolment ==='
DO $$
BEGIN
    BEGIN
        INSERT INTO enrolments (learner_id, course_id, enrol_date)
        VALUES (
            'e0000000-0000-0000-0000-000000000001',
            'd0000000-0000-0000-0000-000000000001',
            CURRENT_DATE
        );
        RAISE NOTICE 'FAIL - Duplicate enrolment was allowed!';
    EXCEPTION WHEN unique_violation THEN
        RAISE NOTICE 'PASS - Duplicate enrolment correctly rejected (unique_violation)';
    END;
END $$;

-- ============================================================
-- TEST 9: CONSTRAINT — Invalid SA ID number rejected
-- ============================================================
\echo '=== TEST 9: CHECK Constraint — Invalid ID Number ==='
DO $$
BEGIN
    BEGIN
        INSERT INTO learners (
            first_name, last_name, id_number, date_of_birth,
            gender, contact_number, address, nationality, popia_consent, popia_consent_date
        ) VALUES (
            'Test', 'User', 'INVALID123', '2000-01-01',
            'MALE', '+27 71 000 0000', '1 Test Street', 'South African', TRUE, NOW()
        );
        RAISE NOTICE 'FAIL - Invalid ID number was accepted!';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'PASS - Invalid ID number correctly rejected (check_violation)';
    END;
END $$;

-- ============================================================
-- TEST 10: CONSTRAINT — Score exceeding max_score rejected
-- ============================================================
\echo '=== TEST 10: CHECK Constraint — Score > Max Score ==='
DO $$
BEGIN
    BEGIN
        INSERT INTO assessments (
            enrolment_id, module_title, assessment_type, score, max_score, assessment_date
        ) VALUES (
            'f0000000-0000-0000-0000-000000000001',
            'Test Module', 'WRITTEN_TEST', 110.00, 100.00, CURRENT_DATE
        );
        RAISE NOTICE 'FAIL - Score > max_score was accepted!';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'PASS - Score > max_score correctly rejected (check_violation)';
    END;
END $$;

-- ============================================================
-- TEST 11: CONSTRAINT — pass_mark out of range rejected
-- ============================================================
\echo '=== TEST 11: CHECK Constraint — pass_mark > 100 ==='
DO $$
BEGIN
    BEGIN
        INSERT INTO courses (
            course_code, title, duration_hours, start_date, end_date, pass_mark
        ) VALUES (
            'TEST-001', 'Test Course', 10, CURRENT_DATE, CURRENT_DATE + 30, 150.00
        );
        RAISE NOTICE 'FAIL - pass_mark > 100 was accepted!';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'PASS - pass_mark > 100 correctly rejected (check_violation)';
    END;
END $$;

-- ============================================================
-- TEST 12: CONSTRAINT — POPIA consent without date rejected
-- ============================================================
\echo '=== TEST 12: CHECK Constraint — POPIA consent without date ==='
DO $$
BEGIN
    BEGIN
        INSERT INTO learners (
            first_name, last_name, id_number, date_of_birth,
            gender, contact_number, address, nationality,
            popia_consent, popia_consent_date
        ) VALUES (
            'Test', 'POPIA', '9901015800083', '1999-01-01',
            'MALE', '+27 71 000 0001', '2 Test Street', 'South African',
            TRUE, NULL  -- consent=TRUE but no date — should fail
        );
        RAISE NOTICE 'FAIL - POPIA consent without date was accepted!';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'PASS - POPIA consent without date correctly rejected (check_violation)';
    END;
END $$;

-- ============================================================
-- TEST 13: TRIGGER — Facilitator role validation
-- ============================================================
\echo '=== TEST 13: TRIGGER — Non-facilitator assignment rejected ==='
DO $$
BEGIN
    BEGIN
        INSERT INTO facilitator_assignments (user_id, course_id, assigned_date)
        VALUES (
            'b0000000-0000-0000-0000-000000000001',  -- MANAGER role, not FACILITATOR
            'd0000000-0000-0000-0000-000000000003',
            CURRENT_DATE
        );
        RAISE NOTICE 'FAIL - MANAGER was assigned as facilitator!';
    EXCEPTION WHEN others THEN
        RAISE NOTICE 'PASS - Non-facilitator assignment correctly rejected: %', SQLERRM;
    END;
END $$;

-- ============================================================
-- TEST 14: Reporting Views — v_course_statistics
-- ============================================================
\echo '=== TEST 14: View — v_course_statistics ==='
SELECT
    course_code,
    course_title,
    total_enrolments,
    in_progress,
    avg_attendance_percentage,
    avg_assessment_score
FROM v_course_statistics
ORDER BY course_code;

-- ============================================================
-- TEST 15: Reporting Views — v_attendance_report with alerts
-- ============================================================
\echo '=== TEST 15: View — v_attendance_report (threshold alerts) ==='
SELECT DISTINCT
    learner_name,
    course_title,
    attendance_percentage,
    attendance_alert
FROM v_attendance_report
ORDER BY learner_name, course_title;

-- ============================================================
-- TEST 16: Reporting Views — v_donor_impact_metrics
-- ============================================================
\echo '=== TEST 16: View — v_donor_impact_metrics ==='
SELECT
    year, month, province_name, course_title,
    learners_trained, assessments_passed, avg_attendance_percent
FROM v_donor_impact_metrics
ORDER BY year DESC, month DESC;

-- ============================================================
-- TEST 17: Reporting Views — v_province_analytics
-- ============================================================
\echo '=== TEST 17: View — v_province_analytics ==='
SELECT
    province_name, total_centres, total_learners,
    total_courses, total_enrolments
FROM v_province_analytics
WHERE total_learners > 0
ORDER BY total_learners DESC;

-- ============================================================
-- TEST 18: Utility Functions
-- ============================================================
\echo '=== TEST 18: Utility Functions ==='
SELECT
    fn_calculate_age('2000-01-01'::DATE)    AS age_2000,
    fn_get_learner_name('e0000000-0000-0000-0000-000000000001'::UUID) AS learner_name,
    fn_get_course_pass_rate('d0000000-0000-0000-0000-000000000001'::UUID) AS ict_pass_rate;

-- ============================================================
-- TEST 19: v_learner_summary
-- ============================================================
\echo '=== TEST 19: View — v_learner_summary ==='
SELECT
    first_name || ' ' || last_name AS learner,
    total_enrolments,
    avg_attendance_percentage,
    certificates_issued
FROM v_learner_summary
ORDER BY last_name;

-- ============================================================
-- TEST 20: v_fee_collection_summary
-- ============================================================
\echo '=== TEST 20: View — v_fee_collection_summary ==='
SELECT
    course_title,
    total_fee_records,
    total_fees_due,
    waived_count
FROM v_fee_collection_summary
ORDER BY course_title;

\echo '=== ALL TESTS COMPLETE ==='
