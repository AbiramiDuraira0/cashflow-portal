-- ============================================
-- Expense Audit Log Table
-- Created: 2026-05-19
-- Purpose: Track all CRUD operations on expense tables (especially 2021, 2022)
-- ============================================

-- Create the audit log table
CREATE TABLE IF NOT EXISTS expense_audit_log (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    operation VARCHAR(20) NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE', 'SOFT_DELETE', 'LOAD', 'YEAR_MOVE')),
    table_name VARCHAR(50) NOT NULL,
    expense_id INTEGER,
    year INTEGER NOT NULL,
    month VARCHAR(20),
    request_data JSONB,
    response_data JSONB,
    before_data JSONB,
    user_agent TEXT,
    status VARCHAR(10) NOT NULL CHECK (status IN ('SUCCESS', 'ERROR')),
    error_message TEXT,
    stack_trace TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_expense_audit_year ON expense_audit_log(year);
CREATE INDEX IF NOT EXISTS idx_expense_audit_timestamp ON expense_audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_expense_audit_operation ON expense_audit_log(operation);
CREATE INDEX IF NOT EXISTS idx_expense_audit_expense_id ON expense_audit_log(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_audit_table_name ON expense_audit_log(table_name);

-- Add comment to table
COMMENT ON TABLE expense_audit_log IS 'Audit log for tracking all expense table operations, especially for years 2021 and 2022';

-- Grant permissions (adjust as needed)
-- GRANT SELECT, INSERT ON expense_audit_log TO your_app_role;

-- ============================================
-- Useful queries for monitoring
-- ============================================

-- View all operations for 2021 and 2022
-- SELECT * FROM expense_audit_log 
-- WHERE year IN (2021, 2022) 
-- ORDER BY timestamp DESC;

-- View all destructive operations (DELETE, UPDATE, SOFT_DELETE)
-- SELECT * FROM expense_audit_log 
-- WHERE operation IN ('DELETE', 'SOFT_DELETE', 'UPDATE', 'YEAR_MOVE')
-- AND year IN (2021, 2022)
-- ORDER BY timestamp DESC;

-- Count operations by type for each year
-- SELECT year, operation, COUNT(*) as count
-- FROM expense_audit_log
-- WHERE year IN (2021, 2022)
-- GROUP BY year, operation
-- ORDER BY year, operation;

-- View recent operations (last 24 hours)
-- SELECT * FROM expense_audit_log 
-- WHERE timestamp > NOW() - INTERVAL '24 hours'
-- ORDER BY timestamp DESC;

-- View operations for a specific month
-- SELECT * FROM expense_audit_log 
-- WHERE year = 2022 AND month = 'June'
-- ORDER BY timestamp DESC;
