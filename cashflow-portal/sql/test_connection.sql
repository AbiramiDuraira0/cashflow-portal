-- ============================================
-- File: test_connection.sql
-- Purpose: Test database connectivity and permissions
-- Author: Copilot AI Assistant
-- Date: 2026-03-13
-- Version: 1.0
-- ============================================

-- Description:
-- Quick diagnostics to verify database connection is working
-- and you have proper permissions.

-- ============================================
-- CONNECTION TEST
-- ============================================

-- 1. Basic connectivity test
SELECT 'Database connection successful!' as message, NOW() as current_time;


-- ============================================
-- PERMISSION TEST
-- ============================================

-- 2. Check schema access
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name = 'dbo';

-- 3. Check table access
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'dbo' 
  AND table_name = 'category';

-- 4. Check read permission
SELECT COUNT(*) as category_count 
FROM dbo.category;

-- 5. Check write permission (insert test - will rollback)
BEGIN;
  INSERT INTO dbo.category (category_name) VALUES ('__TEST_CATEGORY__');
  SELECT 'Write permission OK' as message;
ROLLBACK;


-- ============================================
-- DATABASE INFO
-- ============================================

-- PostgreSQL version
SELECT version();

-- Current user
SELECT current_user, current_database();

-- Available schemas
SELECT schema_name 
FROM information_schema.schemata 
ORDER BY schema_name;

-- All tables in dbo schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'dbo'
ORDER BY table_name;


-- ============================================
-- EXPECTED RESULTS
-- ============================================

-- If everything is working, you should see:
-- ✅ "Database connection successful!" message
-- ✅ "dbo" schema exists
-- ✅ "category" table exists
-- ✅ Count of categories (should be 12 after seeding)
-- ✅ "Write permission OK" message
-- ✅ PostgreSQL version info

-- If any query fails:
-- ❌ Check connection string in environment.ts
-- ❌ Verify IP whitelisting in Supabase dashboard
-- ❌ Check user permissions
-- ❌ Verify schema/table names are correct


-- ============================================
-- TROUBLESHOOTING
-- ============================================

-- Error: "permission denied for schema dbo"
-- Solution: Grant schema access
--   GRANT USAGE ON SCHEMA dbo TO postgres;

-- Error: "relation dbo.category does not exist"
-- Solution: Run schema creation script first
--   \i sql/schemas/001_category.sql

-- Error: "could not connect to server"
-- Solution: Check firewall/IP whitelisting in Supabase

-- Error: "password authentication failed"
-- Solution: Verify password in environment.ts


-- ============================================
-- RELATED FILES
-- ============================================

-- Schema: sql/schemas/001_category.sql
-- Environment: src/environments/environment.ts
-- Service: src/app/services/supabase.service.ts
