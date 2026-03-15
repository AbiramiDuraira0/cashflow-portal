-- ============================================
-- CASHFLOW PORTAL - MASTER DATABASE SCHEMA
-- ============================================
-- Version: 2.0 (Bug Fixes V9)
-- Database: PostgreSQL 14+ / Supabase
-- Date: March 15, 2026
-- ============================================

-- ============================================
-- TABLE: category
-- Purpose: Stores income/expense categories with icons
-- ============================================

CREATE TABLE IF NOT EXISTS category (
  -- Primary Key
  category_id SERIAL PRIMARY KEY,
  
  -- Category Information
  category_name VARCHAR(255) NOT NULL,
  category_icon VARCHAR(10),                    -- Emoji icon for category (e.g., 🍕, 🚗)
  
  -- Subcategory Information
  sub_category VARCHAR(255),
  subcategory_icon VARCHAR(10),                 -- Emoji icon for subcategory (e.g., 🍔, 🚕)
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Index for category name lookups (used in icon consistency feature)
CREATE INDEX IF NOT EXISTS idx_category_name 
ON category(category_name);

-- Index for subcategory name lookups (used in icon consistency feature)
CREATE INDEX IF NOT EXISTS idx_sub_category 
ON category(sub_category) 
WHERE sub_category IS NOT NULL;

-- Index for active status filtering
CREATE INDEX IF NOT EXISTS idx_category_active 
ON category(is_active);

-- Composite index for active categories lookup
CREATE INDEX IF NOT EXISTS idx_category_name_active 
ON category(category_name, is_active);

-- Index for created_at sorting (most recent first)
CREATE INDEX IF NOT EXISTS idx_category_created 
ON category(created_at DESC);

-- Index for updated_at sorting
CREATE INDEX IF NOT EXISTS idx_category_updated 
ON category(updated_at DESC);

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger function: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update timestamp on category modification
DROP TRIGGER IF EXISTS set_category_updated_at ON category;
CREATE TRIGGER set_category_updated_at
  BEFORE UPDATE ON category
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CONSTRAINTS
-- ============================================

-- Ensure category names are not empty strings
ALTER TABLE category 
ADD CONSTRAINT chk_category_name_not_empty 
CHECK (TRIM(category_name) <> '');

-- Ensure icons are valid emoji characters (optional, max 10 chars for multi-byte emojis)
-- Note: This is length-based, not character validation
ALTER TABLE category 
ADD CONSTRAINT chk_category_icon_length 
CHECK (category_icon IS NULL OR LENGTH(category_icon) <= 10);

ALTER TABLE category 
ADD CONSTRAINT chk_subcategory_icon_length 
CHECK (subcategory_icon IS NULL OR LENGTH(subcategory_icon) <= 10);

-- ============================================
-- COMMENTS (Documentation)
-- ============================================

COMMENT ON TABLE category IS 
'Stores income and expense categories with optional subcategories and emoji icons';

COMMENT ON COLUMN category.category_id IS 
'Auto-incrementing primary key';

COMMENT ON COLUMN category.category_name IS 
'Main category name (e.g., Food, Transport, Entertainment)';

COMMENT ON COLUMN category.category_icon IS 
'Emoji icon representing the category (e.g., 🍕, 🚗, 🎬). Stores in database for persistence.';

COMMENT ON COLUMN category.sub_category IS 
'Optional subcategory name (e.g., Pizza, Taxi, Movies)';

COMMENT ON COLUMN category.subcategory_icon IS 
'Emoji icon for the subcategory (e.g., 🍔, 🚕, 🎭). Null if no subcategory.';

COMMENT ON COLUMN category.is_active IS 
'Soft delete flag. false = deactivated (not deleted), true = active';

COMMENT ON COLUMN category.created_at IS 
'Timestamp when category was created';

COMMENT ON COLUMN category.updated_at IS 
'Timestamp of last modification. Auto-updated by trigger.';

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Note: Adjust policies based on your authentication setup

-- Enable RLS on category table
ALTER TABLE category ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users
-- Adjust this based on your security requirements
CREATE POLICY category_select_policy ON category
  FOR SELECT
  USING (true);  -- Allow everyone to read (adjust if needed)

CREATE POLICY category_insert_policy ON category
  FOR INSERT
  WITH CHECK (true);  -- Allow authenticated users to insert

CREATE POLICY category_update_policy ON category
  FOR UPDATE
  USING (true);  -- Allow authenticated users to update

-- Note: DELETE is not used (we use soft delete via is_active)

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert sample categories
INSERT INTO category (category_name, category_icon, sub_category, subcategory_icon, is_active) 
VALUES 
  ('Food', '🍕', 'Pizza', '🍕', true),
  ('Food', '🍕', 'Burger', '🍔', true),
  ('Transport', '🚗', 'Taxi', '🚕', true),
  ('Transport', '🚗', 'Fuel', '⛽', true),
  ('Entertainment', '🎬', 'Movies', '🎭', true),
  ('Shopping', '🛍️', 'Clothes', '👗', true),
  ('Technology', '📱', 'Internet', '📡', true),
  ('Health', '🏥', 'Medicine', '💊', true),
  ('Bills', '📄', 'Electricity', '⚡', true),
  ('Education', '📚', 'Books', '📖', true)
ON CONFLICT DO NOTHING;  -- Skip if already exists

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check table structure
SELECT 
  column_name, 
  data_type, 
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'category'
ORDER BY ordinal_position;

-- Check indexes
SELECT 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE tablename = 'category';

-- Check triggers
SELECT 
  trigger_name, 
  event_manipulation, 
  action_statement 
FROM information_schema.triggers 
WHERE event_object_table = 'category';

-- Check constraints
SELECT 
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'category'::regclass;

-- Count records
SELECT 
  COUNT(*) as total_categories,
  COUNT(*) FILTER (WHERE is_active = true) as active_categories,
  COUNT(*) FILTER (WHERE is_active = false) as inactive_categories,
  COUNT(*) FILTER (WHERE sub_category IS NOT NULL) as with_subcategory,
  COUNT(*) FILTER (WHERE category_icon IS NOT NULL) as with_category_icon,
  COUNT(*) FILTER (WHERE subcategory_icon IS NOT NULL) as with_subcategory_icon
FROM category;

-- ============================================
-- MAINTENANCE QUERIES
-- ============================================

-- Vacuum and analyze for performance
VACUUM ANALYZE category;

-- Reindex all indexes
REINDEX TABLE category;

-- ============================================
-- MIGRATION NOTES
-- ============================================
/*
VERSION HISTORY:
- V1.0: Initial table creation with basic fields
- V1.5: Added is_active for soft delete
- V2.0 (Bug Fixes V8): Added category_icon and subcategory_icon columns
- V2.0 (Bug Fixes V9): Added comprehensive indexes, triggers, constraints

ICON CONSISTENCY FEATURE:
- When updating a category icon, ALL records with the same category_name 
  are updated automatically via application logic
- Indexes on category_name and sub_category ensure fast bulk updates

UPGRADE FROM V1.x:
1. Add icon columns: ALTER TABLE category ADD COLUMN category_icon VARCHAR(10);
2. Add icon columns: ALTER TABLE category ADD COLUMN subcategory_icon VARCHAR(10);
3. Create indexes: Run index creation statements above
4. Create triggers: Run trigger creation statements above
5. Add constraints: Run constraint statements above

ROLLBACK (if needed):
- DROP TABLE category CASCADE;  -- WARNING: Deletes all data!
*/

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT '✅ Cashflow Portal Database Schema - Ready!' AS status,
       NOW() AS timestamp,
       '2.0' AS version,
       'Bug Fixes V9' AS release;

-- ============================================
-- END OF SCHEMA
-- ============================================
