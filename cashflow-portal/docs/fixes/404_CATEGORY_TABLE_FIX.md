# 🔴 404 Error - Table Not Found via REST API

## 🎯 **Root Cause Identified**

**Network Error**: `404 Not Found`  
**URL**: `https://bbaxjrihnfnpqmlttioh.supabase.co/rest/v1/category`

**Reason**: Supabase REST API only exposes tables in the **`public`** schema by default. Your `category` table is in the **`dbo`** schema, which is not accessible via REST API.

---

## ✅ **Recommended Fix: Move Table to Public Schema**

### **Step 1: Run This SQL in Supabase SQL Editor**

```sql
-- Move category table from dbo to public schema
ALTER TABLE dbo.category SET SCHEMA public;

-- Disable RLS to allow reads (testing only)
ALTER TABLE public.category DISABLE ROW LEVEL SECURITY;

-- Verify the move
SELECT * FROM public.category WHERE is_active = true;
```

### **Step 2: Refresh Your App**

After running the SQL:
1. Refresh browser: `Ctrl + R`
2. Navigate to Categories page
3. Should see 12 categories loaded! ✅

---

## 🔄 **Alternative: Keep DBO Schema (More Complex)**

If you must keep the `dbo` schema, you'll need to:

### **Option A: Use SQL Function (Recommended)**

Run in Supabase SQL Editor:
```sql
-- Create function in public schema that wraps dbo table
CREATE OR REPLACE FUNCTION public.get_categories()
RETURNS TABLE (
  category_id INTEGER,
  category_name VARCHAR(50),
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT category_id, category_name, is_active, created_at, updated_at
  FROM dbo.category
  WHERE is_active = true
  ORDER BY category_name;
$$;

GRANT EXECUTE ON FUNCTION public.get_categories() TO anon, authenticated;
```

Then update `category.service.ts`:
```typescript
// Change from:
const { data, error } = await this.supabase.db
  .from('category')
  .select('*')

// To:
const { data, error } = await this.supabase.db
  .rpc('get_categories');
```

---

## 🎯 **Easiest Path Forward**

**I strongly recommend Option 1** (move to public schema):
- ✅ Simple one-line SQL command
- ✅ Works immediately with existing Angular code
- ✅ No code changes needed
- ✅ Standard Supabase practice

---

## 📋 **Action Required:**

1. **Open Supabase SQL Editor**: https://supabase.com/dashboard → SQL Editor
2. **Run this command**:
   ```sql
   ALTER TABLE dbo.category SET SCHEMA public;
   ALTER TABLE public.category DISABLE ROW LEVEL SECURITY;
   ```
3. **Refresh your browser** (http://localhost:54720)
4. **Check Categories page** - should work! 🎉

---

## 📁 **Reference Files Created**

- `sql/fixes/MOVE_CATEGORY_TO_PUBLIC_SCHEMA.sql` - Complete migration script
- `sql/fixes/EXPOSE_DBO_SCHEMA_TO_API.sql` - Alternative using functions
- `sql/fixes/FIX_RLS_POLICIES.sql` - RLS policy examples

---

**Please run the SQL command and let me know if categories load!** 🚀
