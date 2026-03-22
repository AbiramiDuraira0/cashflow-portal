-- ============================================
-- Income Table Migration - Simplified Version
-- Description: Create income tracking table
-- Created: 2026-03-22
-- Note: This is a simplified version. Use create_income_table.sql for full features.
-- ============================================

-- Drop table if exists
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add constraints
ALTER TABLE income ADD CONSTRAINT chk_year CHECK (year >= 2000 AND year <= 2100);
ALTER TABLE income ADD CONSTRAINT chk_amount CHECK (amount_inr >= 0);
ALTER TABLE income ADD CONSTRAINT chk_month CHECK (month IN (
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
));

-- Add unique constraint (partial unique index for PostgreSQL)
CREATE UNIQUE INDEX unique_month_year ON income(year, month) WHERE is_delete = FALSE;

-- Create indexes
CREATE INDEX idx_income_year ON income(year);
CREATE INDEX idx_income_month ON income(month);
CREATE INDEX idx_income_date ON income(date);
CREATE INDEX idx_income_is_delete ON income(is_delete);
CREATE INDEX idx_income_created_at ON income(created_at);

-- Create trigger function for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_income_updated_at
    BEFORE UPDATE ON income
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON income TO authenticated;
GRANT ALL ON income TO anon;
GRANT USAGE, SELECT ON SEQUENCE income_income_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE income_income_id_seq TO anon;

-- Verify table was created
SELECT 
    'income' as table_name,
    COUNT(*) as column_count
FROM information_schema.columns
WHERE table_name = 'income';
