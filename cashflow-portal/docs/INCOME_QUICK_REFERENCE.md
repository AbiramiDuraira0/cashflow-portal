# 📌 Income Tracker - Quick Reference Card

**Last Updated:** March 22, 2026 | **Status:** ✅ Active

---

## 🎯 Quick Links

| I Need... | Go To... |
|-----------|----------|
| 📖 Feature Documentation | [`docs/INCOME_MASTER_DOCUMENTATION.md`](./INCOME_MASTER_DOCUMENTATION.md) |
| 💾 Database Setup | [`sql/INCOME_MIGRATIONS_MASTER.sql`](../sql/INCOME_MIGRATIONS_MASTER.sql) |
| 🔍 SQL Guide | [`sql/INCOME_MIGRATIONS_README.md`](../sql/INCOME_MIGRATIONS_README.md) |
| 📊 Consolidation Details | [`docs/CONSOLIDATION_SUMMARY.md`](./CONSOLIDATION_SUMMARY.md) |
| 📝 Final Report | [`docs/FINAL_CONSOLIDATION_REPORT.md`](./FINAL_CONSOLIDATION_REPORT.md) |
| 🗄️ Old Files | [`docs/archive/income-versions/`](./archive/income-versions/) |

---

## 🚀 Getting Started (30 Seconds)

### 1. First Time Setup
```bash
# Open SQL file and run in Supabase
→ sql/INCOME_MIGRATIONS_MASTER.sql
→ Execute entire file
→ Done! Table created with all features
```

### 2. Understanding Features
```bash
# Open documentation
→ docs/INCOME_MASTER_DOCUMENTATION.md
→ Check table of contents
→ Jump to your version (V1-V5)
```

### 3. Upgrading Existing Database
```bash
# Check what you have
→ Run verification query from master SQL file
→ Find version section you need
→ Execute only that section
```

---

## 📚 What's Included

### INCOME_MASTER_DOCUMENTATION.md
- ✅ All versions (V1.0 - V5.0)
- ✅ Complete features
- ✅ Database schema
- ✅ Testing guide
- ✅ Troubleshooting
- ✅ Code examples

### INCOME_MIGRATIONS_MASTER.sql
- ✅ V1.0 - Base table
- ✅ V4.0 - Company tracking
- ✅ Verification queries
- ✅ Sample data
- ✅ Rollback procedures

### INCOME_MIGRATIONS_README.md
- ✅ Setup instructions
- ✅ Schema details
- ✅ Common queries
- ✅ Troubleshooting
- ✅ Best practices

---

## 🎨 Current Features (V5.0)

### Database
- Monthly income tracking
- Year-based organization
- Optional salary date
- MNC company tracking
- Soft delete support
- Auto-updated timestamps

### UI
- Grid view (2 rows × 6 months)
- Clickable widgets
- Add/Edit/Delete modals
- Toast notifications
- Company-wise earnings
- Year-specific buttons

### Data Model
```typescript
interface IncomeEntry {
  incomeId: number;
  year: number;
  month: string;
  date: string | null;
  amountInr: number;
  source: string;
  mncCompany: string | null;  // ⭐ V4.0
  notes: string | null;
  isDelete: boolean;
  createdAt: string;
  updatedAt: string;
}
```

---

## 🔧 Common Tasks

### Add New Income
```typescript
// In component
openAddFormForYear(2026);
// Fill form → Submit
// Toast notification appears
// Grid updates automatically
```

### View Company Earnings
```typescript
// Click company badge in widget
// Modal shows breakdown:
// - Mindtree: ₹300,000
// - LTIMindtree: ₹450,000
// - Comcast: ₹600,000
```

### Database Query
```sql
-- Get all income for 2026
SELECT * FROM income 
WHERE year = 2026 AND is_delete = FALSE
ORDER BY month;
```

---

## 🐛 Quick Fixes

### Issue: Table doesn't exist
```sql
→ Run: sql/INCOME_MIGRATIONS_MASTER.sql (V1.0 section)
```

### Issue: Company column missing
```sql
→ Run: sql/INCOME_MIGRATIONS_MASTER.sql (V4.0 section)
```

### Issue: Can't find documentation
```bash
→ Read: docs/INCOME_MASTER_DOCUMENTATION.md
```

### Issue: Old file confusion
```bash
→ Check: docs/archive/income-versions/README.md
→ All old files are archived there
```

---

## 📊 File Statistics

| Metric | Count |
|--------|-------|
| Master Documentation Files | 1 |
| Master SQL Files | 1 |
| Guide Files | 3 |
| Archived Files | 10 |
| Total Active Files | 5 |

### Before Consolidation
- ❌ 13 scattered files
- ❌ Hard to navigate
- ❌ Duplicate info

### After Consolidation
- ✅ 2 master files
- ✅ Clear structure
- ✅ Single source of truth

---

## 💡 Pro Tips

1. **Bookmark this file** for quick access
2. **Start with master documentation** for full context
3. **Use table of contents** to jump to sections
4. **Check archived files** for historical reference
5. **Run verification queries** after migrations

---

## 🆘 Need Help?

| Problem | Solution |
|---------|----------|
| Feature question | `docs/INCOME_MASTER_DOCUMENTATION.md` |
| SQL issue | `sql/INCOME_MIGRATIONS_README.md` |
| Can't find file | This quick reference card |
| Migration error | Verification queries in master SQL |
| Old file confusion | `docs/archive/income-versions/README.md` |

---

## 📈 Version History

| Version | Date | Changes |
|---------|------|---------|
| V1.0 | Mar 2026 | Initial table |
| V2.0 | Mar 2026 | Grid view, date field |
| V3.0 | Mar 2026 | Widgets, modals |
| V4.0 | Mar 2026 | Company tracking |
| V5.0 | Mar 2026 | Bug fixes, toasts |

**Current Version:** V5.0  
**Database Version:** V4.0

---

## ⚡ One-Minute Setup

```bash
1. Open: sql/INCOME_MIGRATIONS_MASTER.sql
2. Run: Entire file in Supabase
3. Read: docs/INCOME_MASTER_DOCUMENTATION.md
4. Code: Already complete in income.page.ts
5. Test: Navigate to /income page
```

**Done!** 🎉

---

## 📞 Quick Contact Points

- **Documentation:** `docs/INCOME_MASTER_DOCUMENTATION.md`
- **SQL Setup:** `sql/INCOME_MIGRATIONS_MASTER.sql`
- **SQL Guide:** `sql/INCOME_MIGRATIONS_README.md`
- **Archive:** `docs/archive/income-versions/`
- **This File:** `docs/INCOME_QUICK_REFERENCE.md`

---

**Keep this file handy!** 📌  
**Everything you need, right here.** ✨
