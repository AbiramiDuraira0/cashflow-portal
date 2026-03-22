-- ============================================
-- Income Table Seed Data
-- Description: Sample income entries for testing
-- Created: 2026-03-22
-- ============================================

-- Insert sample income entries
INSERT INTO income (year, month, date, amount_inr, source, notes, is_delete) VALUES
-- 2024 Entries
(2024, 'January', '2024-01-01', 85000.00, 'Salary', 'Regular monthly salary', false),
(2024, 'February', '2024-02-01', 85000.00, 'Salary', 'Regular monthly salary', false),
(2024, 'March', '2024-03-01', 90000.00, 'Salary', 'Salary with increment', false),
(2024, 'April', '2024-04-01', 90000.00, 'Salary', 'Regular monthly salary', false),
(2024, 'May', '2024-05-01', 110000.00, 'Salary', 'Salary with bonus', false),
(2024, 'June', '2024-06-01', 90000.00, 'Salary', 'Regular monthly salary', false),
(2024, 'July', '2024-07-01', 90000.00, 'Salary', 'Regular monthly salary', false),
(2024, 'August', '2024-08-01', 95000.00, 'Salary', 'Salary with freelance income', false),
(2024, 'September', '2024-09-01', 90000.00, 'Salary', 'Regular monthly salary', false),
(2024, 'October', '2024-10-01', 90000.00, 'Salary', 'Regular monthly salary', false),
(2024, 'November', '2024-11-01', 100000.00, 'Salary', 'Salary with Diwali bonus', false),
(2024, 'December', '2024-12-01', 120000.00, 'Salary', 'Salary with year-end bonus', false),

-- 2025 Entries
(2025, 'January', '2025-01-01', 95000.00, 'Salary', 'New year salary', false),
(2025, 'February', '2025-02-01', 95000.00, 'Salary', 'Regular monthly salary', false),
(2025, 'March', '2025-03-01', 95000.00, 'Salary', 'Regular monthly salary', false),

-- 2026 Entries (Current Year)
(2026, 'January', '2026-01-01', 100000.00, 'Salary', 'New year salary with increment', false),
(2026, 'February', '2026-02-01', 100000.00, 'Salary', 'Regular monthly salary', false),
(2026, 'March', '2026-03-01', 105000.00, 'Salary', 'Salary with freelance bonus', false);

-- Insert some soft-deleted entries for testing restore functionality
INSERT INTO income (year, month, date, amount_inr, source, notes, is_delete) VALUES
(2023, 'December', '2023-12-01', 80000.00, 'Salary', 'This entry was deleted', true),
(2024, 'May', '2024-05-15', 15000.00, 'Freelance', 'Deleted freelance entry', true);

-- Verify inserted data
SELECT 
    income_id,
    year,
    month,
    amount_inr,
    source,
    is_delete,
    created_at
FROM income
ORDER BY year DESC, created_at DESC;

-- Show summary statistics
SELECT 
    year,
    COUNT(*) as total_entries,
    SUM(amount_inr) as total_income,
    AVG(amount_inr) as avg_income,
    COUNT(CASE WHEN is_delete = true THEN 1 END) as deleted_entries,
    COUNT(CASE WHEN is_delete = false THEN 1 END) as active_entries
FROM income
GROUP BY year
ORDER BY year DESC;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Seed data inserted successfully';
    RAISE NOTICE '📊 Total entries: %', (SELECT COUNT(*) FROM income);
    RAISE NOTICE '📊 Active entries: %', (SELECT COUNT(*) FROM income WHERE is_delete = false);
    RAISE NOTICE '🗑️ Deleted entries: %', (SELECT COUNT(*) FROM income WHERE is_delete = true);
END $$;
