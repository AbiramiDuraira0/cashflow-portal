-- ============================================
-- INCOME TRACKER - MASTER MIGRATIONS
-- ============================================
-- Description: Consolidated SQL migrations for Income Tracker feature
-- Created: March 22, 2026
-- Last Updated: March 22, 2026
--
-- This file contains all database migrations needed for the Income Tracker feature,
-- organized by version. Execute sections in order for a fresh setup, or run
-- specific version sections to upgrade an existing database.
--
-- TABLE OF CONTENTS:
-- 1. V1.0 - Initial Income Table (March 2026)
-- 2. V4.0 - Add MNC Company Column (March 2026)
--
-- USAGE:
-- For fresh setup: Execute all sections in order
-- For upgrade: Execute only the version sections you need
-- ============================================


-- ============================================
-- VERSION 1.0 - INITIAL INCOME TABLE
-- ============================================
-- Date: March 22, 2026
-- Description: Create income tracking table with basic fields
-- Features:
--   - Monthly income tracking by year
--   - Optional salary date
--   - Soft delete support
--   - Auto-updated timestamps
--   - Constraints and indexes
-- ============================================

-- Drop table if exists (use with caution in production)
DROP TABLE IF EXISTS income CASCADE;

-- Create income table
CREATE TABLE income (
    income_id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    month VARCHAR(20) NOT NULL,
    date DATE,
    amount_inr DECIMAL(15, 2) NOT NULL,
    source VARCHAR(100) DEFAULT 'Salary',
    notes TEXT,
    is_delete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_year CHECK (year >= 2000 AND year <= 2100),
    CONSTRAINT chk_amount CHECK (amount_inr >= 0),
    CONSTRAINT chk_month CHECK (month IN (
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    )),
    
    -- Unique constraint to prevent duplicate entries for same month and year (excluding soft-deleted)
    CONSTRAINT unique_month_year UNIQUE (year, month) WHERE is_delete = FALSE
);

-- Create indexes for better query performance
CREATE INDEX idx_income_year ON income(year);
CREATE INDEX idx_income_month ON income(month);
CREATE INDEX idx_income_date ON income(date);
CREATE INDEX idx_income_is_delete ON income(is_delete);
CREATE INDEX idx_income_created_at ON income(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at column
DROP TRIGGER IF EXISTS update_income_updated_at ON income;
CREATE TRIGGER update_income_updated_at
    BEFORE UPDATE ON income
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE income IS 'Monthly income tracking with soft delete support';
COMMENT ON COLUMN income.income_id IS 'Primary key';
COMMENT ON COLUMN income.year IS 'Year of income (2000-2100)';
COMMENT ON COLUMN income.month IS 'Month name (January-December)';
COMMENT ON COLUMN income.date IS 'Optional salary date';
COMMENT ON COLUMN income.amount_inr IS 'Income amount in INR (must be >= 0)';
COMMENT ON COLUMN income.source IS 'Income source (default: Salary)';
COMMENT ON COLUMN income.notes IS 'Optional notes';
COMMENT ON COLUMN income.is_delete IS 'Soft delete flag';
COMMENT ON COLUMN income.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN income.updated_at IS 'Record update timestamp (auto-updated)';

-- Success message
SELECT '✅ V1.0 - Income table created successfully!' AS status;


-- ============================================
-- VERSION 4.0 - ADD MNC COMPANY TRACKING
-- ============================================
-- Date: March 22, 2026
-- Description: Add MNC company column to track income source company
-- Features:
--   - Track which company paid the salary
--   - Nullable column (optional field)
--   - Indexed for filtering by company
--   - Support for company-wise earnings reports
--
-- Dependencies: V1.0 must be applied first
-- ============================================

-- Add mnc_company column (nullable - makes it optional)
ALTER TABLE income
ADD COLUMN IF NOT EXISTS mnc_company VARCHAR(100);

-- Create index for faster filtering by company
CREATE INDEX IF NOT EXISTS idx_income_mnc_company
ON income(mnc_company)
WHERE mnc_company IS NOT NULL;

-- Add comment to column
COMMENT ON COLUMN income.mnc_company IS 'MNC company name (e.g., Mindtree, LTIMindtree, Comcast)';

-- Verify column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'income'
AND column_name = 'mnc_company';

-- Success message
SELECT '✅ V4.0 - MNC company column added successfully!' AS status;


-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Use these queries to verify the migrations were successful
-- ============================================

-- View complete table structure
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    numeric_precision,
    numeric_scale,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'income'
ORDER BY ordinal_position;

-- View all indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'income'
ORDER BY indexname;

-- View all constraints
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'income'::regclass
ORDER BY conname;

-- View triggers
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'income';


-- ============================================
-- SAMPLE DATA (OPTIONAL)
-- ============================================
-- Uncomment to insert sample data for testing
-- ============================================

/*
INSERT INTO income (year, month, date, amount_inr, source, mnc_company, notes) VALUES
(2026, 'January', '2026-01-31', 150000.00, 'Salary', 'Comcast', 'January salary'),
(2026, 'February', '2026-02-28', 150000.00, 'Salary', 'Comcast', 'February salary'),
(2026, 'March', '2026-03-31', 155000.00, 'Salary', 'Comcast', 'March salary with increment'),
(2025, 'December', '2025-12-31', 140000.00, 'Salary', 'LTIMindtree', 'Previous company');

-- Verify sample data
SELECT * FROM income ORDER BY year DESC, 
    CASE month
        WHEN 'January' THEN 1 WHEN 'February' THEN 2 WHEN 'March' THEN 3
        WHEN 'April' THEN 4 WHEN 'May' THEN 5 WHEN 'June' THEN 6
        WHEN 'July' THEN 7 WHEN 'August' THEN 8 WHEN 'September' THEN 9
        WHEN 'October' THEN 10 WHEN 'November' THEN 11 WHEN 'December' THEN 12
    END;
*/


-- ============================================
-- ROLLBACK PROCEDURES (USE WITH CAUTION)
-- ============================================
-- Uncomment carefully if you need to rollback migrations
-- ============================================

/*
-- Rollback V4.0 - Remove MNC company column
DROP INDEX IF EXISTS idx_income_mnc_company;
ALTER TABLE income DROP COLUMN IF EXISTS mnc_company;
SELECT '⚠️ V4.0 - MNC company column removed' AS status;

-- Rollback V1.0 - Drop entire income table
DROP TRIGGER IF EXISTS update_income_updated_at ON income;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP TABLE IF EXISTS income CASCADE;
SELECT '⚠️ V1.0 - Income table dropped' AS status;
*/


-- ============================================
-- MIGRATION HISTORY
-- ============================================
-- V1.0 (March 22, 2026) - Initial income table creation
--   - Basic income tracking with year/month
--   - Soft delete support
--   - Constraints and indexes
--   - Auto-updated timestamps
--
-- V4.0 (March 22, 2026) - MNC company tracking
--   - Added mnc_company column
--   - Company-wise earnings support
--   - Indexed for filtering
-- ============================================

-- ============================================
-- END OF MIGRATIONS
-- ============================================
