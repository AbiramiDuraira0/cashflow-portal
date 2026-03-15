# 🔴 ERROR 42501: Permission Denied

## 📊 **Error Details**

```
Status: 401 Unauthorized
Error Code: 42501
Message: permission denied for table category
```

## 🎯 **Root Cause**

The PostgreSQL `anon` role (used by Supabase anon key) **doesn't have permission** to SELECT from the `category` table.

When you created the table, it was owned by the `postgres` user, but you didn't grant read permissions to the `anon` role.

---

## ✅ **THE FIX (Run This Now)**

### **Copy this SQL and run in Supabase SQL Editor:**

```sql
-- Grant SELECT permission to anon role
GRANT SELECT ON public.category TO anon, authenticated;

-- Disable RLS (optional, for simpler testing)
ALTER TABLE public.category DISABLE ROW LEVEL SECURITY;

-- Test it works
SELECT * FROM public.category WHERE is_active = true;
```

### **Steps:**
1. Open: https://supabase.com/dashboard → **SQL Editor**
2. Click **New Query**
3. Paste the SQL above
4. Click **Run** (or Ctrl+Enter)
5. Should see your 12 category rows returned ✅

---

## 🔄 **Then Refresh Your App:**

1. Go back to your browser: http://localhost:54720
2. Press **Ctrl + R** to refresh
3. Navigate to **Categories** page
4. Should see **12 categories loaded!** 🎉

---

## 📋 **Console Output After Fix:**

You should see in browser console:
```
=== CATEGORY LOAD DEBUG START ===
📂 Loading categories from Supabase...
📋 Query: FROM category WHERE is_active=true ORDER BY category_name
📦 Response received:
  - Data: Array(12) [...]
  - Error: null
  - Data length: 12
✅ Loaded categories: 12
=== CATEGORY LOAD DEBUG END ===
```

And network tab:
```
Status: 200 OK ✅ (instead of 401)
```

---

## 💡 **Why This Happened:**

PostgreSQL tables have owners and permissions:
- **Table owner**: `postgres` user (you)
- **Anon role**: No permissions by default
- **Fix**: Grant SELECT permission with `GRANT` command

---

## 🚀 **Next:**

**Run the SQL command above and let me know when categories load!** 🎯

---

## 📁 **Reference:**
Full SQL script saved at: `sql/fixes/GRANT_PERMISSIONS_TO_ANON_ROLE.sql`
