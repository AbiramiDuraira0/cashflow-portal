-- ============================================
-- File: 006_rename_expense_to_expense_2026.sql
-- Purpose: Rename existing 'expense' table to 'expense_2026'
-- Author: Copilot AI Assistant
-- Date: 2026-04-02
-- Version: 1.0
-- ============================================

-- Description:
-- The current 'expense' table contains 2026 data.
-- After creating separate yearly tables (expense_2021 through expense_2025),
-- we now rename the original table to maintain consistency.

-- Status: ✅ READY - Execute this script in Supabase SQL Editor

-- ⚠️ IMPORTANT NOTES:
-- 1. This will rename the 'expense' table to 'expense_2026'
-- 2. All indexes and triggers will be automatically renamed
-- 3. After renaming, update expense.service.ts to use 'expense_2026'
-- 4. Make sure to backup data before executing


-- ============================================
-- STEP 1: Verify current table exists
-- ============================================

-- Check if expense table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'expense'
    ) THEN
        RAISE EXCEPTION 'Table public.expense does not exist!';
    END IF;
END $$;


-- ============================================
-- STEP 2: Rename the table
-- ============================================

-- Rename expense to expense_2026
ALTER TABLE public.expense RENAME TO expense_2026;


-- ============================================
-- STEP 3: Add year constraint (optional but recommended)
-- ============================================

-- Add check constraint to ensure only 2026 data
ALTER TABLE public.expense_2026 
ADD CONSTRAINT chk_expense_2026_year 
CHECK (year = 2026);

-- Update default year value
ALTER TABLE public.expense_2026 
ALTER COLUMN year SET DEFAULT 2026;


-- ============================================
-- STEP 4: Verification
-- ============================================

-- Check table was renamed successfully
SELECT 
    table_name,
    (SELECT COUNT(*) FROM public.expense_2026) as row_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'expense_2026';

-- List all indexes on expense_2026
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
  AND tablename = 'expense_2026'
ORDER BY indexname;

-- List all triggers on expense_2026
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public' 
  AND event_object_table = 'expense_2026'
ORDER BY trigger_name;

-- Verify all expense tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'expense_%'
ORDER BY table_name;


-- ============================================
-- ROLLBACK PLAN (if needed)
-- ============================================

-- If you need to rollback, run this:
-- ALTER TABLE public.expense_2026 RENAME TO expense;
-- ALTER TABLE public.expense_2026 DROP CONSTRAINT IF EXISTS chk_expense_2026_year;
-- ALTER TABLE public.expense ALTER COLUMN year DROP DEFAULT;
