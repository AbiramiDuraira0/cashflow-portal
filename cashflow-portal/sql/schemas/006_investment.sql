-- =====================================================
-- Investment Table Schema
-- Version: 1.0
-- Created: 2026-04-06
-- Description: Tracks all investment entries (MF, Stocks, Gold, PPF, NPS, etc.)
-- =====================================================

-- Drop table if exists (for fresh creation)
-- DROP TABLE IF EXISTS public.investment CASCADE;

-- Create investment table
CREATE TABLE IF NOT EXISTS public.investment (
    -- Primary Key
    investment_id SERIAL PRIMARY KEY,
    
    -- Investment Type & Status
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'Physical Gold',
        'MF - SIP',
        'Stocks',
        'PPF',
        'PF',
        'NPS',
        'RD',
        'Land',
        'House'
    )),
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Past', 'To-do')),
    
    -- Investment Details
    name VARCHAR(255) NOT NULL, -- Investment name (e.g., "HDFC Top 100", "Infosys Stock")
    start_date DATE NOT NULL,
    end_date DATE, -- For closed investments
    
    -- Financial Data
    invested_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    current_value DECIMAL(15, 2), -- Current market value
    maturity_value DECIMAL(15, 2), -- Expected/actual maturity value
    maturity_date DATE, -- Expected/actual maturity date
    
    -- Additional Fields
    frequency VARCHAR(50), -- For SIP: Monthly, Quarterly, Yearly
    units DECIMAL(15, 4), -- For stocks/MF units
    avg_price DECIMAL(15, 2), -- Average purchase price
    current_price DECIMAL(15, 2), -- Current market price
    
    -- Calculated Fields (can be computed or stored)
    returns DECIMAL(15, 2), -- Calculated returns
    returns_percentage DECIMAL(8, 2), -- Returns percentage
    
    -- Notes
    notes TEXT,
    
    -- Soft Delete
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

-- Index on type for filtering by investment type
CREATE INDEX IF NOT EXISTS idx_investment_type 
ON public.investment(type) 
WHERE is_deleted = FALSE;

-- Index on status for filtering active/past/todo investments
CREATE INDEX IF NOT EXISTS idx_investment_status 
ON public.investment(status) 
WHERE is_deleted = FALSE;

-- Index on start_date for date-based queries
CREATE INDEX IF NOT EXISTS idx_investment_start_date 
ON public.investment(start_date DESC) 
WHERE is_deleted = FALSE;

-- Composite index on type and status (common query pattern)
CREATE INDEX IF NOT EXISTS idx_investment_type_status 
ON public.investment(type, status) 
WHERE is_deleted = FALSE;

-- Index on is_deleted for soft delete queries
CREATE INDEX IF NOT EXISTS idx_investment_is_deleted 
ON public.investment(is_deleted);

-- =====================================================
-- Trigger for Auto-updating updated_at
-- =====================================================

-- Create or replace trigger function
CREATE OR REPLACE FUNCTION update_investment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_investment_updated_at ON public.investment;
CREATE TRIGGER trigger_update_investment_updated_at
    BEFORE UPDATE ON public.investment
    FOR EACH ROW
    EXECUTE FUNCTION update_investment_updated_at();

-- =====================================================
-- Function to Auto-calculate Returns
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_investment_returns()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate returns if current_value is provided and status is Active
    IF NEW.status = 'Active' AND NEW.current_value IS NOT NULL AND NEW.invested_amount > 0 THEN
        NEW.returns = NEW.current_value - NEW.invested_amount;
        NEW.returns_percentage = ROUND(((NEW.returns / NEW.invested_amount) * 100)::NUMERIC, 2);
    ELSE
        NEW.returns = NULL;
        NEW.returns_percentage = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-calculating returns
DROP TRIGGER IF EXISTS trigger_calculate_investment_returns ON public.investment;
CREATE TRIGGER trigger_calculate_investment_returns
    BEFORE INSERT OR UPDATE ON public.investment
    FOR EACH ROW
    EXECUTE FUNCTION calculate_investment_returns();

-- =====================================================
-- Comments for Documentation
-- =====================================================

COMMENT ON TABLE public.investment IS 'Investment tracking table for all investment types (MF, Stocks, Gold, PPF, NPS, etc.)';
COMMENT ON COLUMN public.investment.investment_id IS 'Primary key - Auto-incrementing ID';
COMMENT ON COLUMN public.investment.type IS 'Investment type: Physical Gold, MF - SIP, Stocks, PPF, PF, NPS, RD, Land, House';
COMMENT ON COLUMN public.investment.status IS 'Investment status: Active, Past, or To-do';
COMMENT ON COLUMN public.investment.name IS 'Investment name (e.g., HDFC Top 100 Fund, Infosys Stock)';
COMMENT ON COLUMN public.investment.start_date IS 'Investment start date';
COMMENT ON COLUMN public.investment.end_date IS 'Investment end date (for closed investments)';
COMMENT ON COLUMN public.investment.invested_amount IS 'Total amount invested';
COMMENT ON COLUMN public.investment.current_value IS 'Current market value (for active investments)';
COMMENT ON COLUMN public.investment.maturity_value IS 'Expected or actual maturity value';
COMMENT ON COLUMN public.investment.maturity_date IS 'Expected or actual maturity date';
COMMENT ON COLUMN public.investment.frequency IS 'Investment frequency (Monthly, Quarterly, Yearly) - mainly for SIP';
COMMENT ON COLUMN public.investment.units IS 'Number of units (for stocks/mutual funds)';
COMMENT ON COLUMN public.investment.avg_price IS 'Average purchase price per unit';
COMMENT ON COLUMN public.investment.current_price IS 'Current market price per unit';
COMMENT ON COLUMN public.investment.returns IS 'Calculated returns (auto-calculated)';
COMMENT ON COLUMN public.investment.returns_percentage IS 'Returns percentage (auto-calculated)';
COMMENT ON COLUMN public.investment.notes IS 'Additional notes or comments';
COMMENT ON COLUMN public.investment.is_deleted IS 'Soft delete flag';
COMMENT ON COLUMN public.investment.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN public.investment.updated_at IS 'Record last update timestamp (auto-updated)';

-- =====================================================
-- Sample Data (Optional - Remove in production)
-- =====================================================

-- Uncomment to insert sample data for testing
/*
INSERT INTO public.investment (
    type, status, name, start_date, invested_amount, current_value, 
    frequency, notes
) VALUES
    ('MF - SIP', 'Active', 'HDFC Top 100 Fund', '2023-01-01', 120000, 145000, 'Monthly', 'Regular SIP of ₹10,000'),
    ('Stocks', 'Active', 'Infosys', '2022-06-15', 85000, 95000, NULL, '50 shares @ ₹1700 avg'),
    ('PPF', 'Active', 'PPF Account', '2021-04-01', 150000, 180000, 'Yearly', '7.1% interest rate'),
    ('Physical Gold', 'Active', 'Gold Coins (10g)', '2023-08-01', 60000, 65000, NULL, 'Sovereign gold bonds'),
    ('NPS', 'Active', 'NPS Tier I', '2020-01-01', 200000, 250000, 'Monthly', 'Retirement planning'),
    ('MF - SIP', 'Past', 'Axis Bluechip Fund', '2020-01-01', 60000, NULL, 'Monthly', 'Closed in 2023, Profit: ₹15,000'),
    ('RD', 'To-do', 'HDFC RD Plan', '2026-05-01', 0, NULL, 'Monthly', 'Planning to start ₹5,000/month');
*/

-- =====================================================
-- Grants (Adjust based on your user/role setup)
-- =====================================================

-- Grant permissions to authenticated users (Supabase pattern)
-- ALTER TABLE public.investment ENABLE ROW LEVEL SECURITY;
-- GRANT ALL ON public.investment TO authenticated;
-- GRANT USAGE, SELECT ON SEQUENCE investment_investment_id_seq TO authenticated;

-- =====================================================
-- Verification Queries
-- =====================================================

-- Check table structure
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'investment' AND table_schema = 'public'
-- ORDER BY ordinal_position;

-- Check indexes
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'investment';

-- Check triggers
-- SELECT trigger_name, event_manipulation, action_statement
-- FROM information_schema.triggers WHERE event_object_table = 'investment';

-- =====================================================
-- End of Investment Table Schema
-- =====================================================
