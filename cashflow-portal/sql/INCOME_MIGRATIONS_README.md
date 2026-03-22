# SQL Migrations - Income Tracker

This directory contains all SQL migrations and scripts for the Cashflow Portal database.

## 📁 Directory Structure

```
sql/
├── INCOME_MIGRATIONS_MASTER.sql    # ⭐ Master income migrations file
├── 00_MASTER_SETUP.sql             # Complete database setup (all features)
├── test_connection.sql             # Test Supabase connection
├── QUICK_REFERENCE.md              # SQL query examples
├── migrations/                     # Individual migration files (archived)
├── queries/                        # Common SQL queries
├── schemas/                        # Table schemas
└── seeds/                          # Seed data for testing
```

## 🚀 Quick Start

### For Fresh Database Setup

1. **Test Connection First:**
   ```sql
   -- Run: test_connection.sql
   -- This verifies your Supabase connection works
   ```

2. **Run Master Migrations:**
   ```sql
   -- Run: INCOME_MIGRATIONS_MASTER.sql
   -- This creates the complete income table with all features
   ```

3. **Verify Setup:**
   ```sql
   -- Check tables exist
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' AND table_name = 'income';
   
   -- Check income table structure
   SELECT * FROM information_schema.columns 
   WHERE table_name = 'income' 
   ORDER BY ordinal_position;
   ```

### For Existing Database (Upgrade)

If you already have an income table and need to add new features:

1. **Check Current Version:**
   ```sql
   -- Check if mnc_company column exists
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'income' AND column_name = 'mnc_company';
   ```

2. **Run Specific Version:**
   - Open `INCOME_MIGRATIONS_MASTER.sql`
   - Find the version section you need (e.g., V4.0 for MNC company)
   - Execute only that section

## 📋 Master Migrations File

### `INCOME_MIGRATIONS_MASTER.sql`

This is the **single source of truth** for all income-related database migrations. It consolidates all previous migration files into one organized document.

**Versions Included:**
- **V1.0** - Initial income table (March 2026)
  - Basic income tracking with year/month
  - Optional salary date
  - Soft delete support
  - Auto-updated timestamps
  - Constraints and indexes

- **V4.0** - MNC company tracking (March 2026)
  - Added `mnc_company` column
  - Company-wise earnings support
  - Indexed for filtering

**Key Features:**
- ✅ Table of contents for easy navigation
- ✅ Version-based organization
- ✅ Verification queries included
- ✅ Sample data (commented out)
- ✅ Rollback procedures
- ✅ Complete migration history

**Usage:**
```sql
-- Fresh setup: Execute entire file
-- Upgrade: Execute only needed version sections
-- Verify: Run verification queries at the end
```

## 🗂️ Income Table Schema

### Current Schema (V4.0)

```sql
CREATE TABLE income (
    income_id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    month VARCHAR(20) NOT NULL,
    date DATE,
    amount_inr DECIMAL(15, 2) NOT NULL,
    source VARCHAR(100) DEFAULT 'Salary',
    mnc_company VARCHAR(100),              -- ⭐ Added in V4.0
    notes TEXT,
    is_delete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes

```sql
idx_income_year          -- On: year
idx_income_month         -- On: month
idx_income_date          -- On: date
idx_income_is_delete     -- On: is_delete
idx_income_created_at    -- On: created_at
idx_income_mnc_company   -- On: mnc_company (V4.0)
```

### Constraints

```sql
chk_year          -- year BETWEEN 2000 AND 2100
chk_amount        -- amount_inr >= 0
chk_month         -- month IN ('January'...'December')
unique_month_year -- UNIQUE(year, month) WHERE is_delete = FALSE
```

### Triggers

```sql
update_income_updated_at  -- Auto-updates updated_at on UPDATE
```

## 🔄 Migration History

| Version | Date | Description | Files Consolidated |
|---------|------|-------------|-------------------|
| V1.0 | Mar 22, 2026 | Initial income table | create_income_table.sql, create_income_table_simplified.sql |
| V4.0 | Mar 22, 2026 | MNC company tracking | add_mnc_company_column.sql |

## 📝 Common Queries

### Insert Income Entry
```sql
INSERT INTO income (year, month, date, amount_inr, source, mnc_company, notes)
VALUES (2026, 'March', '2026-03-31', 150000.00, 'Salary', 'Comcast', 'Monthly salary');
```

### Get All Income for a Year
```sql
SELECT * FROM income 
WHERE year = 2026 AND is_delete = FALSE
ORDER BY CASE month
    WHEN 'January' THEN 1 WHEN 'February' THEN 2 WHEN 'March' THEN 3
    WHEN 'April' THEN 4 WHEN 'May' THEN 5 WHEN 'June' THEN 6
    WHEN 'July' THEN 7 WHEN 'August' THEN 8 WHEN 'September' THEN 9
    WHEN 'October' THEN 10 WHEN 'November' THEN 11 WHEN 'December' THEN 12
END;
```

### Get Company-Wise Earnings
```sql
SELECT 
    mnc_company,
    COUNT(*) as entry_count,
    SUM(amount_inr) as total_earnings
FROM income
WHERE year = 2026 AND is_delete = FALSE
GROUP BY mnc_company
ORDER BY total_earnings DESC;
```

### Soft Delete Entry
```sql
UPDATE income 
SET is_delete = TRUE 
WHERE income_id = 1;
```

## 🛠️ Troubleshooting

### Issue: Migration fails with "relation already exists"

**Solution:** Table already exists. Use upgrade approach instead:
```sql
-- Check existing columns
SELECT column_name FROM information_schema.columns WHERE table_name = 'income';

-- Run only missing migrations from master file
```

### Issue: Unique constraint violation

**Solution:** You're trying to add duplicate month/year entry:
```sql
-- Check for existing entry
SELECT * FROM income WHERE year = 2026 AND month = 'March' AND is_delete = FALSE;

-- Either update existing or soft-delete it first
UPDATE income SET is_delete = TRUE WHERE income_id = ?;
```

### Issue: "Function update_updated_at_column() does not exist"

**Solution:** Run the function creation from V1.0 section:
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## 🗄️ Archived Files

The following files have been consolidated into `INCOME_MIGRATIONS_MASTER.sql`:

- ~~`migrations/create_income_table.sql`~~ → V1.0 section
- ~~`migrations/create_income_table_simplified.sql`~~ → V1.0 section
- ~~`migrations/add_mnc_company_column.sql`~~ → V4.0 section

**Note:** Original files are kept in `migrations/` folder for reference but should not be used directly.

## 📚 Related Documentation

- **Income Feature Docs:** `docs/INCOME_MASTER_DOCUMENTATION.md`
- **Quick Reference:** `sql/QUICK_REFERENCE.md`
- **Database Setup:** `docs/guides/DATABASE_SETUP_COMPLETE.md`

## ⚠️ Important Notes

1. **Always backup before migration:** Export your data before running migrations
2. **Test in development first:** Never run migrations directly in production
3. **Use transactions:** Wrap migrations in BEGIN/COMMIT blocks when possible
4. **Verify after migration:** Always run verification queries
5. **PostgreSQL syntax:** These files use PostgreSQL syntax (not MySQL/SQL Server)

## 🎯 Best Practices

1. **Fresh setup:** Run entire `INCOME_MIGRATIONS_MASTER.sql`
2. **Upgrades:** Run only needed version sections
3. **Rollback:** Use rollback section with caution (destructive)
4. **Testing:** Use sample data section for testing
5. **Documentation:** Update this README when adding new versions

## 📞 Support

For issues or questions:
1. Check `QUICK_REFERENCE.md` for common queries
2. Review `docs/INCOME_MASTER_DOCUMENTATION.md` for feature details
3. Check `docs/troubleshooting/` for known issues

---

**Last Updated:** March 22, 2026  
**Current Version:** V4.0  
**Database:** PostgreSQL (Supabase)
