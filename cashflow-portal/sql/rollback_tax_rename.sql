-- =====================================================
-- Rollback Script: Rename table from tax back to tax_entries
-- Use this if you need to revert the changes
-- =====================================================

-- Step 1: Rename the table back
ALTER TABLE IF EXISTS public.tax RENAME TO tax_entries;

-- Step 2: Rename the primary key constraint back
ALTER TABLE public.tax_entries 
  RENAME CONSTRAINT tax_pkey TO tax_entries_pkey;

-- Step 3: Rename indexes back
ALTER INDEX IF EXISTS idx_tax_year RENAME TO idx_tax_entries_year;
ALTER INDEX IF EXISTS idx_tax_month RENAME TO idx_tax_entries_month;
ALTER INDEX IF EXISTS idx_tax_year_month RENAME TO idx_tax_entries_year_month;
ALTER INDEX IF EXISTS idx_tax_status RENAME TO idx_tax_entries_status;

-- Step 4: Rename sequence back
ALTER SEQUENCE IF EXISTS tax_tax_id_seq RENAME TO tax_entries_tax_id_seq;

-- Step 5: Update trigger
DROP TRIGGER IF EXISTS update_tax_updated_at ON public.tax_entries;

CREATE TRIGGER update_tax_entries_updated_at
    BEFORE UPDATE ON public.tax_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_tax_updated_at();

COMMENT ON TABLE public.tax_entries IS 'Tax payments tracking table';
