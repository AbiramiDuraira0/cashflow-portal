# SQL Quick Reference

## 📂 Folder Structure

```
sql/
├── 00_MASTER_SETUP.sql          ← Run this first (executes everything in order)
├── test_connection.sql          ← Test DB connectivity
├── README.md                    ← Full documentation
│
├── schemas/                     ← Table definitions (CREATE TABLE)
│   ├── 001_category.sql         ✅ Category table (ACTIVE)
│   └── 002_income_entries.sql   ⏳ Income table (DRAFT)
│
├── migrations/                  ← Schema changes (ALTER TABLE, CREATE INDEX)
│   └── 001_add_category_index.sql ✅ Unique index on category_name
│
├── seeds/                       ← Initial data (INSERT)
│   └── category_seed.sql        ✅ 12 default categories
│
└── queries/                     ← Common queries (SELECT)
    └── category_queries.sql     ✅ Debugging & reporting queries
```

---

## 🚀 Quick Start

### Option 1: Supabase SQL Editor (Easiest)

1. Go to: https://supabase.com/dashboard/project/bbaxjrihnfnpqmlttioh/editor
2. Copy contents of `sql/schemas/001_category.sql`
3. Paste and click **RUN**
4. Repeat for `migrations/001_add_category_index.sql`
5. Repeat for `seeds/category_seed.sql`
6. Done! ✅

### Option 2: psql Command Line

```bash
# Navigate to project
cd cashflow-portal

# Run master setup script
psql -h aws-1-ap-southeast-1.pooler.supabase.com \
     -U postgres.bbaxjrihnfnpqmlttioh \
     -d postgres \
     -f sql/00_MASTER_SETUP.sql

# Enter password when prompted: Abirami@1999
```

---

## 📝 When You Need a New Script

### New Table?
→ Create: `sql/schemas/00X_tablename.sql`

### Modify Existing Table?
→ Create: `sql/migrations/00X_description.sql`

### Add Sample Data?
→ Create: `sql/seeds/tablename_seed.sql`

### Need Common Query?
→ Add to: `sql/queries/tablename_queries.sql`

---

## 🎯 Current Schema Status

| Table | Schema File | Status | Records |
|-------|-------------|--------|---------|
| `dbo.category` | `001_category.sql` | ✅ Active | 12 |
| `dbo.income_entries` | `002_income_entries.sql` | ⏳ Draft | 0 |

---

## 🔍 Quick Commands

```sql
-- View all categories
SELECT * FROM dbo.category;

-- Count active categories
SELECT COUNT(*) FROM dbo.category WHERE is_active = TRUE;

-- Test connection
SELECT 'Connected!' as status, NOW() as timestamp;
```

---

## 📞 Next Time You Need SQL

Just say:
- **"Generate SQL for [feature]"** → I'll create the appropriate file
- **"Add migration for [change]"** → I'll add to migrations folder
- **"Create seed data for [table]"** → I'll add to seeds folder
- **"Add query for [purpose]"** → I'll add to queries folder

All SQL will be tracked in version control! 🎉
