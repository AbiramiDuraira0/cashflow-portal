# Income Database - Quick Reference

## 🚀 Quick Setup (3 Steps)

### 1. Create Table
```bash
# Run in Supabase SQL Editor
# File: sql/migrations/create_income_table.sql
```

### 2. Load Seed Data (Optional)
```bash
# File: sql/seeds/income_seed_data.sql
```

### 3. Test
Navigate to Income page and start using!

---

## 📋 API Reference

### Service Methods

#### Load Data
```typescript
await incomeService.loadIncomeData();
```

#### Add Entry
```typescript
await incomeService.addEntry({
  month: 'March',
  year: 2026,
  amount: 100000,
  source: 'Salary',
  notes: 'Optional notes'
});
```

#### Update Entry
```typescript
await incomeService.updateEntry(id, {
  amount: 105000,
  notes: 'Updated'
});
```

#### Delete Entry (Soft)
```typescript
await incomeService.deleteEntry(id);
```

#### Check Existence
```typescript
const exists = await incomeService.entryExists('March', 2026);
```

#### Restore/Update Deleted
```typescript
await incomeService.restoreOrUpdateEntry('March', 2026, {
  month: 'March',
  year: 2026,
  amount: 100000,
  source: 'Salary'
});
```

---

## 🗄️ Database Queries

### Get Active Entries
```sql
SELECT * FROM income 
WHERE is_delete = false 
ORDER BY year DESC;
```

### Yearly Total
```sql
SELECT year, SUM(amount_inr) as total
FROM income
WHERE is_delete = false
GROUP BY year;
```

### Find Deleted
```sql
SELECT * FROM income WHERE is_delete = true;
```

### Restore Entry
```sql
UPDATE income 
SET is_delete = false 
WHERE income_id = 1;
```

---

## 🎯 Key Features

### ✅ Implemented
- Full CRUD operations
- Soft delete (data preserved)
- Restore deleted entries
- Duplicate prevention
- Auto-timestamps
- Reactive UI updates
- Type-safe code

### 🔍 Database Schema
```
income (
  income_id SERIAL PRIMARY KEY,
  year INTEGER,
  month VARCHAR(20),
  date DATE,
  amount_inr DECIMAL(15,2),
  source VARCHAR(100),
  notes TEXT,
  is_delete BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

---

## 🐛 Common Issues

### Permission Error
```sql
GRANT ALL ON income TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE income_income_id_seq TO authenticated;
```

### Duplicate Error
Check if entry was soft-deleted:
```sql
SELECT * FROM income 
WHERE month = 'X' AND year = Y;
```

---

## 📊 Testing Checklist

- [ ] Add new entry
- [ ] Edit entry
- [ ] Delete entry (soft)
- [ ] Try duplicate (should prompt restore)
- [ ] Restore deleted entry
- [ ] Filter by year
- [ ] Reload page (data persists)

---

## 📁 Files Modified

### New Files
- `sql/migrations/create_income_table.sql`
- `sql/seeds/income_seed_data.sql`
- `docs/features/INCOME_DATABASE_INTEGRATION.md`

### Updated Files
- `src/app/services/income.service.ts` (Complete rewrite)
- `src/app/component/income/income.page.ts` (Updated methods)

### Unchanged
- `src/app/component/income/income.page.html` (UI preserved)
- `src/app/component/income/income.page.scss` (Styles preserved)

---

## 💡 Tips

1. **Soft Delete First**: Always use soft delete to preserve data
2. **Check Existence**: Use `entryExists()` before adding
3. **Reactive State**: No need to manually reload data
4. **Type Safety**: Use provided TypeScript types
5. **Error Handling**: All methods have try-catch blocks

---

## 🎓 Example Flow

### Adding Income
```typescript
// 1. User fills form
const entry = {
  month: 'March',
  year: 2026,
  amount: 100000,
  source: 'Salary',
  notes: 'Monthly salary'
};

// 2. Check if exists
const exists = await incomeService.entryExists(entry.month, entry.year);

// 3. Add or restore
if (exists) {
  // Prompt user to restore
  await incomeService.restoreOrUpdateEntry(entry.month, entry.year, entry);
} else {
  await incomeService.addEntry(entry);
}

// 4. UI auto-updates via reactive signals
```

---

## 📞 Support

For issues or questions:
1. Check documentation: `docs/features/INCOME_DATABASE_INTEGRATION.md`
2. Review error logs in browser console
3. Check Supabase dashboard for database issues
4. Verify environment configuration

---

**Status**: ✅ Production Ready  
**Last Updated**: March 22, 2026  
**Version**: 1.0.0
