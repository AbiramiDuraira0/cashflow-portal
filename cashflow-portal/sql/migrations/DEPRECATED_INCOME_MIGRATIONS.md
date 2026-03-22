# ⚠️ DEPRECATED - These Migration Files Are Archived

## Use Master File Instead

All income-related migrations have been consolidated into:

### 📄 `INCOME_MIGRATIONS_MASTER.sql`

Located in the parent directory: `sql/INCOME_MIGRATIONS_MASTER.sql`

---

## Why These Files Are Deprecated

1. **Scattered Information:** Previously split across 3 separate files
2. **No Version Tracking:** Unclear which migrations to run in what order
3. **Duplicate Content:** Simplified vs full versions caused confusion
4. **Hard to Maintain:** Changes needed in multiple places

---

## New Structure

The master file includes:
- ✅ **V1.0 Section** - Initial income table (replaces create_income_table.sql)
- ✅ **V4.0 Section** - MNC company column (replaces add_mnc_company_column.sql)
- ✅ **Verification Queries** - Test migrations worked
- ✅ **Sample Data** - Optional test data
- ✅ **Rollback Procedures** - Undo migrations safely
- ✅ **Complete Documentation** - Comments and explanations

---

## Migration Path

### If You Haven't Run Migrations Yet
```sql
-- Don't use these old files!
-- Use: sql/INCOME_MIGRATIONS_MASTER.sql instead
-- Run the entire file for a fresh setup
```

### If You Already Have V1.0 (base income table)
```sql
-- Don't use: add_mnc_company_column.sql
-- Instead: Open INCOME_MIGRATIONS_MASTER.sql
-- Find the V4.0 section
-- Execute only that section
```

---

## Files in This Folder (DO NOT USE)

| Old File | Status | Use Instead |
|----------|--------|-------------|
| `create_income_table.sql` | ⛔ Deprecated | `INCOME_MIGRATIONS_MASTER.sql` V1.0 section |
| `create_income_table_simplified.sql` | ⛔ Deprecated | `INCOME_MIGRATIONS_MASTER.sql` V1.0 section |
| `add_mnc_company_column.sql` | ⛔ Deprecated | `INCOME_MIGRATIONS_MASTER.sql` V4.0 section |

---

## Documentation

For complete SQL documentation, see:
- **SQL Guide:** `sql/INCOME_MIGRATIONS_README.md`
- **Feature Docs:** `docs/INCOME_MASTER_DOCUMENTATION.md`
- **Consolidation Summary:** `docs/CONSOLIDATION_SUMMARY.md`

---

## Questions?

**Q: Why are these files still here?**  
A: Kept for historical reference only. Do not use for new setups.

**Q: Can I delete these?**  
A: They're safe to delete, but keeping them as archive doesn't hurt.

**Q: Which file should I actually use?**  
A: Always use `sql/INCOME_MIGRATIONS_MASTER.sql`

---

**Last Updated:** March 22, 2026  
**Status:** 🗄️ Archived - Use Master File
