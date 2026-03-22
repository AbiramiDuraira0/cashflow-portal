-- ============================================
-- Income Table Migration
-- Description: Create income tracking table
-- Created: 2026-03-22
-- ============================================

-- Drop table if exists (for clean migration)
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

-- Create updated_at trigger function (reuse if exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to auto-update updated_at
CREATE TRIGGER update_income_updated_at
    BEFORE UPDATE ON income
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE income IS 'Stores monthly income entries with soft delete support';
COMMENT ON COLUMN income.income_id IS 'Primary key - auto-incrementing';
COMMENT ON COLUMN income.year IS 'Year of income entry (2000-2100)';
COMMENT ON COLUMN income.month IS 'Month name (January-December)';
COMMENT ON COLUMN income.date IS 'Optional specific date of income';
COMMENT ON COLUMN income.amount_inr IS 'Income amount in Indian Rupees';
COMMENT ON COLUMN income.source IS 'Source of income (Salary, Bonus, etc.)';
COMMENT ON COLUMN income.notes IS 'Optional notes about the income';
COMMENT ON COLUMN income.is_delete IS 'Soft delete flag - true means deleted';
COMMENT ON COLUMN income.created_at IS 'Timestamp when record was created';
COMMENT ON COLUMN income.updated_at IS 'Timestamp when record was last updated';

-- Grant permissions (adjust based on your RLS policies)
-- For development, granting to authenticated users
-- ALTER TABLE income ENABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users
GRANT ALL ON income TO authenticated;
GRANT ALL ON income TO anon;
GRANT USAGE, SELECT ON SEQUENCE income_income_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE income_income_id_seq TO anon;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Income table created successfully';
    RAISE NOTICE '📊 Table: income';
    RAISE NOTICE '🔑 Primary Key: income_id';
    RAISE NOTICE '🗑️ Soft Delete: is_delete column';
    RAISE NOTICE '📅 Timestamps: created_at, updated_at (auto-updated)';
END $$;
