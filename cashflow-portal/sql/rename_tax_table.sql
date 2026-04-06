-- =====================================================
-- Script to rename table from tax_entries to tax
-- This script handles table rename, indexes, and triggers
-- =====================================================

-- Step 1: Rename the table
ALTER TABLE IF EXISTS public.tax_entries RENAME TO tax;

-- Step 2: Rename the primary key constraint
ALTER TABLE public.tax 
  RENAME CONSTRAINT tax_entries_pkey TO tax_pkey;

-- Step 3: Rename indexes
-- Note: Indexes are automatically renamed when table is renamed in PostgreSQL,
-- but if you have custom named indexes, rename them explicitly

-- If you have an index on year column:
ALTER INDEX IF EXISTS idx_tax_entries_year RENAME TO idx_tax_year;

-- If you have an index on month column:
ALTER INDEX IF EXISTS idx_tax_entries_month RENAME TO idx_tax_month;

-- If you have a composite index on year and month:
ALTER INDEX IF EXISTS idx_tax_entries_year_month RENAME TO idx_tax_year_month;

-- If you have an index on status:
ALTER INDEX IF EXISTS idx_tax_entries_status RENAME TO idx_tax_status;

-- Step 4: Rename sequence (if auto-increment)
ALTER SEQUENCE IF EXISTS tax_entries_tax_id_seq RENAME TO tax_tax_id_seq;

-- Step 5: Update trigger function (if exists)
-- First, let's recreate the trigger function with updated table name references
CREATE OR REPLACE FUNCTION update_tax_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Drop old trigger and create new one
DROP TRIGGER IF EXISTS update_tax_entries_updated_at ON public.tax;
DROP TRIGGER IF EXISTS update_tax_updated_at ON public.tax;

CREATE TRIGGER update_tax_updated_at
    BEFORE UPDATE ON public.tax
    FOR EACH ROW
    EXECUTE FUNCTION update_tax_updated_at();

-- Step 7: Verify the changes
-- Run these queries to verify:
/*
SELECT * FROM public.tax LIMIT 5;
SELECT indexname FROM pg_indexes WHERE tablename = 'tax';
SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'tax';
*/

-- Step 8: Grant permissions (if needed)
-- GRANT ALL PRIVILEGES ON TABLE public.tax TO your_user;
-- GRANT USAGE, SELECT ON SEQUENCE tax_tax_id_seq TO your_user;

COMMENT ON TABLE public.tax IS 'Tax payments tracking table - renamed from tax_entries';
