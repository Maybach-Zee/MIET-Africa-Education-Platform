-- =====================================================
-- FIX: Assessment trigger — use computed percentage
-- instead of generated column (unavailable in BEFORE triggers)
-- =====================================================

-- Fix the trigger function
CREATE OR REPLACE FUNCTION fn_auto_set_assessment_result()
RETURNS TRIGGER AS $$
DECLARE
    v_pass_mark  DECIMAL(5,2);
    v_percentage DECIMAL(5,2);
BEGIN
    -- Compute percentage manually
    -- (GENERATED ALWAYS AS columns are not available in BEFORE triggers)
    IF NEW.max_score > 0 THEN
        v_percentage := ROUND((NEW.score / NEW.max_score) * 100, 2);
    ELSE
        v_percentage := 0;
    END IF;

    -- Get the course pass_mark via enrolment
    SELECT co.pass_mark INTO v_pass_mark
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

-- Remove test learner inserted by POPIA constraint test
DELETE FROM learners WHERE id_number = '9901015800083';

-- Re-apply trigger to existing assessments by direct UPDATE
-- Bypass RLS as superuser
SET LOCAL row_security = off;

UPDATE assessments
SET result = CASE
    WHEN ROUND((score / max_score) * 100, 2) >= (
        SELECT co.pass_mark
        FROM courses co
        JOIN enrolments e ON co.course_id = e.course_id
        WHERE e.enrolment_id = assessments.enrolment_id
    ) THEN 'PASS'::assessment_result
    ELSE 'FAIL'::assessment_result
END;

SELECT 'Fix applied. Assessment results updated.' AS status;

-- Verify fix
SELECT
    l.first_name || ' ' || l.last_name AS learner,
    a.module_title,
    a.score,
    a.percentage,
    co.pass_mark,
    a.result,
    CASE
        WHEN a.percentage >= co.pass_mark AND a.result = 'PASS' THEN 'CORRECT'
        WHEN a.percentage < co.pass_mark  AND a.result = 'FAIL' THEN 'CORRECT'
        ELSE 'WRONG'
    END AS check_result
FROM assessments a
JOIN enrolments e ON a.enrolment_id = e.enrolment_id
JOIN learners l   ON e.learner_id   = l.learner_id
JOIN courses co   ON e.course_id    = co.course_id
ORDER BY l.last_name, a.module_title;
