# SQL Scripts Repository

> **Database:** PostgreSQL (Supabase Hosted)  
> **Host:** aws-1-ap-southeast-1.pooler.supabase.com  
> **Database:** postgres  
> **Schema:** dbo

---

## 📁 Folder Structure

```
sql/
├── README.md                 ← This file
├── schemas/                  ← Table schema definitions (CREATE TABLE)
│   ├── 001_category.sql      ← Category table schema
│   ├── 002_income_entries.sql (future)
│   └── 003_expenses.sql      (future)
│
├── migrations/               ← Schema changes/updates (ALTER TABLE)
│   ├── 001_add_category_index.sql
│   └── 002_update_timestamps.sql
│
├── seeds/                    ← Initial data/sample data (INSERT)
│   ├── category_seed.sql     ← Initial category data
│   └── test_data.sql         (future)
│
└── queries/                  ← Common queries for debugging/reports
    ├── category_queries.sql  ← Useful category queries
    └── reports.sql           (future)
```

---

## 🎯 Purpose of Each Folder

### 📋 `/schemas` - Table Definitions
**Purpose:** Complete CREATE TABLE statements for each database table

**When to use:**
- Creating new tables
- Documenting existing table structure
- Setting up fresh database instances
- Onboarding new developers

**Naming convention:** `XXX_tablename.sql`
- `XXX` = Sequential number (001, 002, 003...)
- `tablename` = Name of the table

**Example:**
```sql
-- sql/schemas/001_category.sql
CREATE TABLE IF NOT EXISTS dbo.category (
  category_id INTEGER PRIMARY KEY,
  category_name VARCHAR(50) NOT NULL,
  ...
);
```

---

### 🔄 `/migrations` - Schema Changes
**Purpose:** ALTER TABLE, CREATE INDEX, and other schema modifications

**When to use:**
- Adding new columns to existing tables
- Creating indexes for performance
- Modifying constraints
- Database upgrades

**Naming convention:** `XXX_description.sql`
- `XXX` = Sequential number
- `description` = Brief description of change

**Example:**
```sql
-- sql/migrations/001_add_category_index.sql
CREATE UNIQUE INDEX ux_category_name_ci 
  ON dbo.category (LOWER(category_name));
```

---

### 🌱 `/seeds` - Initial Data
**Purpose:** INSERT statements for populating tables with initial/sample data

**When to use:**
- Populating lookup tables (categories, statuses, etc.)
- Adding sample data for development
- Resetting database to known state
- Testing with realistic data

**Naming convention:** `tablename_seed.sql` or `test_data.sql`

**Example:**
```sql
-- sql/seeds/category_seed.sql
INSERT INTO dbo.category (category_name) VALUES
('Personal - Abi'),
('Home - Household Items'),
...
```

---

### 🔍 `/queries` - Useful Queries
**Purpose:** Common SELECT queries for debugging, reports, and data analysis

**When to use:**
- Debugging data issues
- Generating reports
- Data validation
- Quick lookups during development

**Example:**
```sql
-- sql/queries/category_queries.sql
-- Get all active categories
SELECT * FROM dbo.category WHERE is_active = TRUE;

-- Count categories by status
SELECT is_active, COUNT(*) FROM dbo.category GROUP BY is_active;
```

---

## 📝 Documentation Standards

### Every SQL File Should Include:

1. **Header Comment Block:**
```sql
-- ============================================
-- File: 001_category.sql
-- Purpose: Category table schema definition
-- Author: Copilot AI Assistant
-- Date: YYYY-MM-DD
-- Version: 1.0
-- ============================================
```

2. **Description:** What this script does

3. **Dependencies:** Any tables/schemas it depends on

4. **Execution Order:** If it must run after other scripts

5. **Rollback:** How to undo changes (for migrations)

---

## 🚀 How to Use These Scripts

### Setting Up Fresh Database

```bash
# 1. Run schemas in order
psql -h <host> -U <user> -d postgres -f sql/schemas/001_category.sql
psql -h <host> -U <user> -d postgres -f sql/schemas/002_income_entries.sql

# 2. Run migrations
psql -h <host> -U <user> -d postgres -f sql/migrations/001_add_category_index.sql

# 3. Seed initial data
psql -h <host> -U <user> -d postgres -f sql/seeds/category_seed.sql
```

### Adding New Table

1. Create schema file: `sql/schemas/XXX_tablename.sql`
2. Create seed file: `sql/seeds/tablename_seed.sql`
3. Update this README with table info
4. Create service in Angular: `src/app/services/tablename.service.ts`

---

## 📊 Current Database Schema

### Tables

| # | Table Name | Schema File | Status | Records |
|---|------------|-------------|--------|---------|
| 1 | `dbo.category` | `schemas/001_category.sql` | ✅ Active | 12 |
| 2 | `income_entries` | (future) | ⏳ Planned | - |
| 3 | `expenses` | (future) | ⏳ Planned | - |

---

## 🔐 Database Connection Info

**Supabase Project:** bbaxjrihnfnpqmlttioh  
**Region:** ap-southeast-1 (Singapore)  
**Host:** aws-1-ap-southeast-1.pooler.supabase.com  
**Port:** 5432  
**Database:** postgres  
**Username:** postgres.bbaxjrihnfnpqmlttioh  

⚠️ **Note:** Password stored in `src/environments/environment.ts` (not committed to git)

---

## 📜 Version Control

### Current Schema Version: v1.0

**Schema Versions:**
- v1.0 (2026-03-13): Initial setup with category table

**Migration History:**
- 001_add_category_index (2026-03-13): Added unique index on category_name

---

## 🛠️ Maintenance Guidelines

### Before Making Changes:
1. ✅ Backup existing data if modifying schema
2. ✅ Test on local/dev database first
3. ✅ Document changes in appropriate folder
4. ✅ Update this README

### Naming Conventions:
- **Table names:** `snake_case` (e.g., `income_entries`)
- **Column names:** `snake_case` (e.g., `category_name`)
- **Indexes:** `idx_table_column` or `ux_table_column` (unique)
- **Triggers:** `trg_table_event`
- **Functions:** `action_table_detail()`

### SQL File Format:
- Use PostgreSQL syntax (not MySQL/MSSQL)
- Include `IF NOT EXISTS` where appropriate
- Add comments explaining complex logic
- Include DROP statements for idempotency where safe

---

## 🔗 Related Documentation

- **Supabase Dashboard:** https://supabase.com/dashboard/project/bbaxjrihnfnpqmlttioh
- **Angular Services:** `src/app/services/`
- **Database Models:** TypeScript types in service files
- **Migration Guide:** `docs/guides/SUPABASE_MIGRATION.md`

---

## 📞 Support

**Issues with:**
- Schema design → Ask Copilot to generate in appropriate folder
- Query optimization → Add to `/queries` folder with comments
- Data migration → Create script in `/migrations`
- Sample data → Add to `/seeds` folder
