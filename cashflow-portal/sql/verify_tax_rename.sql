-- =====================================================
-- Verification Script for tax table rename
-- Run these queries to verify the rename was successful
-- =====================================================

-- 1. Check if table exists and get basic info
SELECT 
    table_name, 
    table_schema,
    table_type
FROM information_schema.tables 
WHERE table_name IN ('tax', 'tax_entries')
AND table_schema = 'public';

-- 2. Get table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'tax'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. List all indexes on the tax table
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'tax'
AND schemaname = 'public';

-- 4. List all triggers on the tax table
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'tax'
AND event_object_schema = 'public';

-- 5. List all constraints
SELECT 
    con.conname AS constraint_name,
    con.contype AS constraint_type,
    CASE 
        WHEN con.contype = 'p' THEN 'PRIMARY KEY'
        WHEN con.contype = 'f' THEN 'FOREIGN KEY'
        WHEN con.contype = 'u' THEN 'UNIQUE'
        WHEN con.contype = 'c' THEN 'CHECK'
        ELSE con.contype::text
    END AS constraint_description
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE rel.relname = 'tax'
AND nsp.nspname = 'public';

-- 6. Check sequence
SELECT 
    sequence_name,
    last_value,
    start_value,
    increment_by
FROM information_schema.sequences
WHERE sequence_name LIKE '%tax%'
AND sequence_schema = 'public';

-- 7. Sample data from the renamed table
SELECT * FROM public.tax 
ORDER BY tax_id DESC 
LIMIT 10;

-- 8. Count records
SELECT 
    'Total Records' AS metric,
    COUNT(*) AS count
FROM public.tax;

-- 9. Check table comment
SELECT 
    obj_description(oid) AS table_comment
FROM pg_class
WHERE relname = 'tax'
AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
