# Tax Table Rename - SQL Scripts

This folder contains SQL scripts for renaming the `tax_entries` table to `tax` in PostgreSQL.

## 📋 Files

### 1. `rename_tax_table.sql` (Main Script)
Renames the table from `tax_entries` to `tax` and updates all related database objects.

**What it does:**
- ✅ Renames table: `tax_entries` → `tax`
- ✅ Renames primary key constraint: `tax_entries_pkey` → `tax_pkey`
- ✅ Renames indexes:
  - `idx_tax_entries_year` → `idx_tax_year`
  - `idx_tax_entries_month` → `idx_tax_month`
  - `idx_tax_entries_year_month` → `idx_tax_year_month`
  - `idx_tax_entries_status` → `idx_tax_status`
- ✅ Renames sequence: `tax_entries_tax_id_seq` → `tax_tax_id_seq`
- ✅ Recreates trigger: `update_tax_updated_at`
- ✅ Updates table comment

### 2. `rollback_tax_rename.sql` (Rollback Script)
Reverts all changes made by the main script.

**Use this if:**
- You need to undo the rename operation
- Something went wrong during the rename
- You need to restore the original table name

### 3. `verify_tax_rename.sql` (Verification Script)
Comprehensive verification queries to confirm the rename was successful.

**Checks:**
- ✅ Table existence and structure
- ✅ All indexes
- ✅ All triggers
- ✅ All constraints
- ✅ Sequence information
- ✅ Sample data
- ✅ Record count

## 🚀 How to Execute

### Step 1: Backup Your Database
```bash
# Create a backup before making any changes
pg_dump -U your_username -d your_database > backup_before_rename.sql
```

### Step 2: Run the Main Rename Script
```bash
# Using psql command line
psql -U your_username -d your_database -f rename_tax_table.sql

# Or using pgAdmin
# 1. Open pgAdmin
# 2. Connect to your database
# 3. Tools > Query Tool
# 4. Open and execute rename_tax_table.sql
```

### Step 3: Verify the Changes
```bash
# Run verification script
psql -U your_username -d your_database -f verify_tax_rename.sql

# Or execute in pgAdmin Query Tool
```

### Step 4 (If needed): Rollback
```bash
# Only if you need to undo the changes
psql -U your_username -d your_database -f rollback_tax_rename.sql
```

## ⚠️ Important Notes

1. **Stop your application** before running the rename script to avoid connection errors

2. **Update your Supabase service** after rename:
   - File: `src/app/services/tax.service.ts`
   - Change all references from `tax_entries` to `tax`

3. **Index names**: If your indexes have different names, modify the script accordingly

4. **Triggers**: The script assumes you have an `updated_at` trigger. Adjust if different.

5. **Permissions**: Ensure your database user has ALTER privileges

## 🔍 What to Check After Rename

Run these quick checks:

```sql
-- 1. Check table exists
SELECT * FROM public.tax LIMIT 1;

-- 2. Check indexes
SELECT indexname FROM pg_indexes WHERE tablename = 'tax';

-- 3. Check triggers
SELECT trigger_name FROM information_schema.triggers 
WHERE event_object_table = 'tax';

-- 4. Test insert/update
INSERT INTO public.tax (year, month, tax_paid, status) 
VALUES (2026, 1, 1000, 'paid') 
RETURNING *;
```

## 📊 Frontend Changes Needed

After renaming the database table, update your Supabase service:

**File:** `src/app/services/tax.service.ts`

```typescript
// Change this line:
const { data, error } = await this.supabase
  .from('tax_entries')  // OLD
  .select('*');

// To:
const { data, error } = await this.supabase
  .from('tax')  // NEW
  .select('*');
```

Update all Supabase queries in the service file from `'tax_entries'` to `'tax'`.

## 🆘 Troubleshooting

### Error: "relation tax_entries does not exist"
- Table was already renamed or doesn't exist
- Check with: `SELECT * FROM pg_tables WHERE tablename LIKE '%tax%';`

### Error: "permission denied"
- Ensure your user has ALTER privileges
- Grant with: `GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;`

### Trigger not working
- Recreate the trigger function
- Check with: `SELECT * FROM information_schema.triggers WHERE event_object_table = 'tax';`

## 📞 Support

If you encounter issues:
1. Check the verification script output
2. Review PostgreSQL error logs
3. Restore from backup if necessary
4. Ensure application is stopped during migration

---

**Last Updated:** April 6, 2026  
**PostgreSQL Version:** 12+  
**Tested on:** Supabase PostgreSQL
