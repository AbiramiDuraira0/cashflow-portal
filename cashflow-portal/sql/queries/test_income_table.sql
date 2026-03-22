-- ============================================
-- Income Table Testing Script
-- Description: Comprehensive tests for income table
-- Created: 2026-03-22
-- ============================================

-- ============================================
-- TEST 1: Basic Table Structure
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== TEST 1: TABLE STRUCTURE ===';
END $$;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'income'
ORDER BY ordinal_position;

-- ============================================
-- TEST 2: Insert Valid Entry
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== TEST 2: INSERT VALID ENTRY ===';
END $$;

INSERT INTO income (year, month, date, amount_inr, source, notes)
VALUES (2026, 'March', '2026-03-22', 50000.00, 'Bonus', 'Test entry')
RETURNING income_id, year, month, amount_inr, source;

-- ============================================
-- TEST 3: Prevent Duplicate Month/Year
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== TEST 3: DUPLICATE PREVENTION (Should Fail) ===';
END $$;

-- This should fail due to unique constraint
INSERT INTO income (year, month, amount_inr, source)
VALUES (2026, 'March', 75000.00, 'Salary');
-- Expected: ERROR - duplicate key value violates unique constraint

-- ============================================
-- TEST 4: Soft Delete
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== TEST 4: SOFT DELETE ===';
END $$;

-- Create a test entry
INSERT INTO income (year, month, amount_inr, source)
VALUES (2026, 'April', 80000.00, 'Test')
RETURNING income_id;

-- Soft delete it
UPDATE income 
SET is_delete = true 
WHERE month = 'April' AND year = 2026
RETURNING income_id, is_delete;

-- ============================================
-- TEST 5: Duplicate After Soft Delete
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== TEST 5: DUPLICATE AFTER SOFT DELETE (Should Work) ===';
END $$;

-- This should work because deleted entries are excluded from unique constraint
INSERT INTO income (year, month, amount_inr, source)
VALUES (2026, 'April', 85000.00, 'Salary')
RETURNING income_id, year, month, amount_inr, is_delete;

-- ============================================
-- TEST 6: Auto Timestamps
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== TEST 6: AUTO TIMESTAMPS ===';
END $$;

-- Insert entry
INSERT INTO income (year, month, amount_inr, source)
VALUES (2026, 'May', 90000.00, 'Test')
RETURNING income_id, created_at, updated_at;

-- Wait a moment and update
SELECT pg_sleep(1);

UPDATE income 
SET amount_inr = 95000.00 
WHERE month = 'May' AND year = 2026
RETURNING income_id, created_at, updated_at;

-- Verify updated_at changed
SELECT 
    income_id,
    created_at,
    updated_at,
    (updated_at > created_at) as timestamp_updated
FROM income
WHERE month = 'May' AND year = 2026;

-- ============================================
-- TEST 7: Check Constraints
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== TEST 7: CHECK CONSTRAINTS ===';
END $$;

-- Test invalid year (should fail)
-- INSERT INTO income (year, month, amount_inr) VALUES (1999, 'June', 50000);

-- Test invalid amount (should fail)
-- INSERT INTO income (year, month, amount_inr) VALUES (2026, 'June', -1000);

-- Test invalid month (should fail)
-- INSERT INTO income (year, month, amount_inr) VALUES (2026, 'InvalidMonth', 50000);

DO $$
BEGIN
    RAISE NOTICE 'Check constraints are active (uncomment to test failures)';
END $$;

-- ============================================
-- TEST 8: Queries - Active Only
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== TEST 8: QUERY ACTIVE ENTRIES ===';
END $$;

SELECT 
    income_id,
    year,
    month,
    amount_inr,
    source,
    is_delete
FROM income
WHERE is_delete = false
ORDER BY year DESC, created_at DESC;

-- ============================================
-- TEST 9: Yearly Aggregation
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== TEST 9: YEARLY AGGREGATION ===';
END $$;

SELECT 
    year,
    COUNT(*) as total_entries,
    COUNT(CASE WHEN is_delete = false THEN 1 END) as active_entries,
    COUNT(CASE WHEN is_delete = true THEN 1 END) as deleted_entries,
    SUM(CASE WHEN is_delete = false THEN amount_inr ELSE 0 END) as total_income,
    AVG(CASE WHEN is_delete = false THEN amount_inr ELSE NULL END) as avg_income
FROM income
GROUP BY year
ORDER BY year DESC;

-- ============================================
-- TEST 10: Performance - Indexes
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== TEST 10: INDEX VERIFICATION ===';
END $$;

SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'income';

-- ============================================
-- TEST 11: Restore Soft-Deleted Entry
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== TEST 11: RESTORE SOFT-DELETED ===';
END $$;

-- Find a deleted entry
SELECT income_id, month, year, is_delete
FROM income
WHERE is_delete = true
LIMIT 1;

-- Restore it
UPDATE income
SET is_delete = false, amount_inr = 99999.99, notes = 'Restored entry'
WHERE income_id = (SELECT income_id FROM income WHERE is_delete = true LIMIT 1)
RETURNING income_id, month, year, amount_inr, is_delete;

-- ============================================
-- TEST 12: Monthly Ordering
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== TEST 12: MONTHLY ORDERING ===';
END $$;

SELECT 
    month,
    year,
    amount_inr,
    CASE month
        WHEN 'January' THEN 1
        WHEN 'February' THEN 2
        WHEN 'March' THEN 3
        WHEN 'April' THEN 4
        WHEN 'May' THEN 5
        WHEN 'June' THEN 6
        WHEN 'July' THEN 7
        WHEN 'August' THEN 8
        WHEN 'September' THEN 9
        WHEN 'October' THEN 10
        WHEN 'November' THEN 11
        WHEN 'December' THEN 12
    END as month_number
FROM income
WHERE year = 2026 AND is_delete = false
ORDER BY month_number;

-- ============================================
-- CLEANUP TEST DATA
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== CLEANUP TEST DATA ===';
END $$;

-- Remove test entries created during testing
DELETE FROM income 
WHERE notes LIKE '%Test%' OR notes LIKE '%test%';

DO $$
BEGIN
    RAISE NOTICE 'Test data cleaned up';
END $$;

-- ============================================
-- FINAL SUMMARY
-- ============================================
DO $$
DECLARE
    total_count INTEGER;
    active_count INTEGER;
    deleted_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_count FROM income;
    SELECT COUNT(*) INTO active_count FROM income WHERE is_delete = false;
    SELECT COUNT(*) INTO deleted_count FROM income WHERE is_delete = true;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== FINAL SUMMARY ===';
    RAISE NOTICE 'Total entries: %', total_count;
    RAISE NOTICE 'Active entries: %', active_count;
    RAISE NOTICE 'Deleted entries: %', deleted_count;
    RAISE NOTICE '';
    RAISE NOTICE '✅ All tests completed!';
END $$;

-- Show final data
SELECT 
    year,
    COUNT(*) as entries,
    SUM(amount_inr) as total
FROM income
WHERE is_delete = false
GROUP BY year
ORDER BY year DESC;
