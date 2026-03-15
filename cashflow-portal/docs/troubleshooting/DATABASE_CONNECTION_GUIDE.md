# Database Connection Troubleshooting Guide

## 🔴 Current Issue
**Error**: "Failed to load categories from database. Please check your connection."

## 📋 Root Cause Analysis

### **1. Invalid Supabase Anon Key**
Your current `environment.ts` has a placeholder key:
```typescript
supabaseAnonKey: 'YOUR_REAL_ANON_KEY_HERE'
```

**Real Supabase keys:**
- Start with `eyJhbGc...`
- Are 200+ characters long
- Are JWT tokens containing project configuration

### **2. How to Get Your Real Key**

#### **Step 1: Access Supabase Dashboard**
1. Go to: https://supabase.com/dashboard
2. Login with your credentials
3. Select project: `bbaxjrihnfnpqmlttioh`

#### **Step 2: Navigate to API Settings**
1. Click **Settings** (bottom left sidebar)
2. Click **API** tab
3. Scroll to **Project API keys** section

#### **Step 3: Copy Keys**
You'll see two keys:
- **anon public** - Use this for frontend (Angular)
- **service_role** - DO NOT use in frontend (backend only)

**Copy the `anon public` key** - it should look like:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiYXhqcmlobmZucHFtbHR0aW9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDI1MjY0MDAsImV4cCI6MTk1ODEwMjQwMH0.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

#### **Step 4: Update Environment File**
Replace in `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  supabaseUrl: 'https://bbaxjrihnfnpqmlttioh.supabase.co',
  supabaseAnonKey: 'PASTE_YOUR_REAL_KEY_HERE', // ← Paste the eyJhbGc... key
};
```

---

## 🔧 **Quick Diagnostic Steps**

### **Test 1: Use Test Connection Button**
1. Reload your Angular app (it should auto-reload)
2. Navigate to Categories page
3. Click **🔌 Test Connection** button (top right)
4. Check browser console (F12) for detailed error messages

### **Test 2: Check Browser Console**
Open browser DevTools (F12) and look for:
```
📂 Loading categories from Supabase...
❌ Error loading categories: [ERROR DETAILS]
```

Common errors:
- **"Invalid API key"** → Wrong anon key
- **"Failed to fetch"** → Network/firewall issue
- **"relation does not exist"** → Table name mismatch
- **"JWT expired"** → Regenerate anon key in dashboard

### **Test 3: Verify Supabase Table Exists**

Run in Supabase SQL Editor:
```sql
-- Check if category table exists
SELECT * FROM dbo.category LIMIT 5;

-- Check table schema
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'dbo' 
  AND table_name = 'category';
```

---

## 🛠️ **Common Issues & Solutions**

### **Issue 1: Office IP Restrictions**
**Symptom**: "Failed to fetch" or network timeout
**Solution**: 
1. Check if you can access: https://bbaxjrihnfnpqmlttioh.supabase.co
2. Add office IP to Supabase Dashboard → Settings → Database → Connection Pooler → IPv4 restrictions
3. Or test from home network first

### **Issue 2: Row Level Security (RLS)**
**Symptom**: Query returns empty array even though data exists
**Solution**: Disable RLS temporarily for testing
```sql
ALTER TABLE dbo.category DISABLE ROW LEVEL SECURITY;
```

Or create a public read policy:
```sql
CREATE POLICY "Allow public read access" 
ON dbo.category 
FOR SELECT 
USING (true);
```

### **Issue 3: Schema Name Mismatch**
**Symptom**: "relation 'category' does not exist"
**Solution**: Check if table is in `dbo` schema or `public` schema

Update `category.service.ts`:
```typescript
// If table is in dbo schema:
.from('dbo.category')

// If table is in public schema (default):
.from('category')  // ← Current code
```

### **Issue 4: CORS Issues**
**Symptom**: CORS policy error in console
**Solution**: 
1. Verify URL matches exactly: `https://bbaxjrihnfnpqmlttioh.supabase.co`
2. Check Supabase Dashboard → Settings → API → Site URL
3. Add your local dev URL: `http://localhost:4200`

---

## ✅ **Verification Checklist**

- [ ] **Supabase anon key updated** in `environment.ts`
- [ ] **Dev server restarted** (stop and run `ng serve` again)
- [ ] **Browser cache cleared** (Hard refresh: Ctrl+Shift+R)
- [ ] **Console checked** for error messages
- [ ] **Test connection button clicked** to see detailed error
- [ ] **Table exists** in Supabase (run SQL: `SELECT * FROM dbo.category;`)
- [ ] **RLS disabled** or policy created for public reads
- [ ] **Network accessible** (can you access Supabase URL in browser?)

---

## 📞 **Next Steps**

### **Step 1: Get Your Anon Key**
Follow the steps above to get your real Supabase anon key from the dashboard.

### **Step 2: Update Configuration**
Replace `YOUR_REAL_ANON_KEY_HERE` with your actual key.

### **Step 3: Restart & Test**
1. Stop the dev server (Ctrl+C)
2. Run: `ng serve`
3. Navigate to: http://localhost:4200/category
4. Click **🔌 Test Connection**
5. Share the error message from console

### **Step 4: Share Diagnostic Info**
If still not working, share:
- Browser console error messages
- Result of test connection button
- Can you access `https://bbaxjrihnfnpqmlttioh.supabase.co` in browser?

---

## 🎯 **Expected Success Output**

When working correctly, you should see:
```
📂 Loading categories from Supabase...
✅ Loaded categories: 12
```

And the category table should display 12 rows with data from your database.

---

## 🔄 **Alternative: Direct PostgreSQL Connection (Requires Backend)**

If you want to use the `postgres` package you mentioned, you'll need to:

1. Create a Node.js backend (Express/Fastify)
2. Install `postgres` in backend
3. Create REST API endpoints
4. Angular calls your backend API
5. Backend connects to PostgreSQL directly

**This is MORE complex** but gives you direct database access without Supabase SDK.

Would you like me to set up a simple Express backend for this?
