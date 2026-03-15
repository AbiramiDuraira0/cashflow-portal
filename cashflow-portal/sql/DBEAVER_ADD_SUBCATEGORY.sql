-- ============================================
-- QUICK SCRIPT FOR DBEAVER
-- Add Subcategory Column to Category Table
-- ============================================
-- Copy and paste this entire script into DBeaver and execute
-- ============================================

-- 1) Add subcategory column
ALTER TABLE public.category 
ADD COLUMN IF NOT EXISTS sub_category VARCHAR(50) NULL;

-- 2) Add index for performance
CREATE INDEX IF NOT EXISTS ix_category_subcategory 
  ON public.category(sub_category) 
  WHERE sub_category IS NOT NULL;

-- 3) Drop old unique index
DROP INDEX IF EXISTS public.ux_category_name_ci;

-- 4) Create new composite unique index (allows same category name with different subcategories)
CREATE UNIQUE INDEX IF NOT EXISTS ux_category_name_subcategory_ci
  ON public.category (LOWER(category_name), LOWER(COALESCE(sub_category, '')));

-- 5) Add column comment
COMMENT ON COLUMN public.category.sub_category IS 
'Optional subcategory name (max 50 characters). Example: Category="Food", Subcategory="Groceries"';

-- ============================================
-- VERIFICATION
-- ============================================

-- View updated table structure
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'category'
ORDER BY ordinal_position;

-- View all indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'dbo' 
  AND tablename = 'category'
ORDER BY indexname;

-- View current data (should show new sub_category column as NULL)
SELECT 
*
FROM public.category
ORDER BY category_id
LIMIT 10;

-- ============================================
-- ✅ MIGRATION COMPLETE!
-- ============================================
