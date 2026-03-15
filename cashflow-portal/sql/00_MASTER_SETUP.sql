-- ============================================
-- File: 00_MASTER_SETUP.sql
-- Purpose: Complete database setup - Run this first
-- Author: Copilot AI Assistant
-- Date: 2026-03-13
-- Version: 1.0
-- ============================================

-- Description:
-- Master script that executes all schema, migration, and seed scripts
-- in the correct order. Use this for fresh database setup.

-- ============================================
-- EXECUTION ORDER
-- ============================================

-- This file documents the order to run all scripts.
-- In PostgreSQL, you can execute using \i command:
--
-- psql -h aws-1-ap-southeast-1.pooler.supabase.com \
--      -U postgres.bbaxjrihnfnpqmlttioh \
--      -d postgres \
--      -f sql/00_MASTER_SETUP.sql

-- Or run each file individually in order:

\echo '============================================'
\echo 'CashFlow Portal - Database Setup'
\echo '============================================'
\echo ''

-- ============================================
-- STEP 1: SCHEMAS (Table Definitions)
-- ============================================

\echo '📋 Step 1: Creating table schemas...'
\echo ''

\echo '  → Creating category table...'
\i schemas/001_category.sql
\echo '  ✅ Category table created'
\echo ''

-- Future tables (uncomment when ready):
-- \echo '  → Creating income_entries table...'
-- \i schemas/002_income_entries.sql
-- \echo '  ✅ Income entries table created'
-- \echo ''


-- ============================================
-- STEP 2: MIGRATIONS (Schema Modifications)
-- ============================================

\echo '🔄 Step 2: Running migrations...'
\echo ''

\echo '  → Adding category unique index...'
\i migrations/001_add_category_index.sql
\echo '  ✅ Index created'
\echo ''


-- ============================================
-- STEP 3: SEED DATA (Initial Records)
-- ============================================

\echo '🌱 Step 3: Seeding initial data...'
\echo ''

\echo '  → Inserting category seed data...'
\i seeds/category_seed.sql
\echo '  ✅ Categories seeded'
\echo ''


-- ============================================
-- STEP 4: VERIFICATION
-- ============================================

\echo '✅ Step 4: Verifying setup...'
\echo ''

-- Check category table
SELECT 
  'Category table' as table_name,
  COUNT(*) as record_count,
  COUNT(*) FILTER (WHERE is_active = TRUE) as active_count,
  COUNT(*) FILTER (WHERE is_active = FALSE) as inactive_count
FROM dbo.category;


-- ============================================
-- SETUP COMPLETE
-- ============================================

\echo ''
\echo '============================================'
\echo '✅ Database setup complete!'
\echo '============================================'
\echo ''
\echo 'Next steps:'
\echo '1. Start Angular dev server: ng serve'
\echo '2. Navigate to Categories page'
\echo '3. Verify data loads from database'
\echo ''


-- ============================================
-- MANUAL EXECUTION (If \i commands dont work)
-- ============================================

-- If your PostgreSQL client doesn't support \i command,
-- manually execute files in this order:
--
-- 1. sql/schemas/001_category.sql
-- 2. sql/migrations/001_add_category_index.sql
-- 3. sql/seeds/category_seed.sql
--
-- Via Supabase SQL Editor:
-- 1. Go to https://supabase.com/dashboard/project/bbaxjrihnfnpqmlttioh/editor
-- 2. Copy contents of each file
-- 3. Execute in SQL Editor
-- 4. Verify results


-- ============================================
-- ROLLBACK (Complete Reset)
-- ============================================

-- WARNING: This drops all tables and data!
-- Only use for complete database reset.
--
-- DROP TRIGGER IF EXISTS trg_category_updated_at ON dbo.category;
-- DROP FUNCTION IF EXISTS dbo.set_category_updated_at();
-- DROP TABLE IF EXISTS dbo.category CASCADE;
-- DROP SCHEMA IF EXISTS dbo CASCADE;


-- ============================================
-- CONNECTION DETAILS
-- ============================================

-- Host: aws-1-ap-southeast-1.pooler.supabase.com
-- Port: 5432
-- Database: postgres
-- User: postgres.bbaxjrihnfnpqmlttioh
-- Schema: dbo
--
-- Environment File: src/environments/environment.ts
-- Supabase Service: src/app/services/supabase.service.ts


-- ============================================
-- NOTES
-- ============================================

-- 1. This script is designed for Supabase PostgreSQL
-- 2. Idempotent - safe to run multiple times
-- 3. Each section can be run independently if needed
-- 4. All scripts use IF NOT EXISTS for safety
-- 5. Transactions are implicit per statement

-- ============================================
-- RELATED FILES
-- ============================================

-- Connection Test: sql/test_connection.sql
-- README: sql/README.md
-- Category Service: src/app/services/category.service.ts
