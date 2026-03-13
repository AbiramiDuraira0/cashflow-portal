# Supabase Migration Guide - Income Tracker

> **Status:** 🟡 Ready to migrate when DB connectivity is established  
> **Current:** localStorage (temporary)  
> **Target:** Supabase (permanent)

---

## Prerequisites

### 1. Supabase Setup Checklist
- [ ] Supabase project created
- [ ] Database table created for income entries
- [ ] API keys obtained (anon key + URL)
- [ ] Office IP whitelisted (if required)
- [ ] Environment variables configured

### 2. Database Schema

Create this table in Supabase:

```sql
-- Income entries table
CREATE TABLE income_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  source TEXT NOT NULL,
  notes TEXT,
  date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month, year)
);

-- Index for faster queries
CREATE INDEX idx_income_user_year ON income_entries(user_id, year);

-- Row Level Security (RLS)
ALTER TABLE income_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own data
CREATE POLICY "Users can view own income entries"
  ON income_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own income entries"
  ON income_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own income entries"
  ON income_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own income entries"
  ON income_entries FOR DELETE
  USING (auth.uid() = user_id);
```

---

## Migration Steps

### Step 1: Update Environment Configuration

**File:** `src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  supabase: {
    url: 'YOUR_SUPABASE_PROJECT_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY'
  }
};
```

### Step 2: Verify SupabaseService Exists

Check if `src/app/services/supabase.service.ts` is already set up:
- ✅ If exists: Update with income table methods
- ❌ If not: Create new service

### Step 3: Update IncomeService

**File:** `src/app/services/income.service.ts`

Replace the localStorage methods with Supabase calls:

```typescript
// OLD: Load from localStorage/JSON
private async loadIncomeData(): Promise<void> {
  const stored = localStorage.getItem('cashflow_income_data');
  // ... localStorage logic
}

// NEW: Load from Supabase
private async loadIncomeData(): Promise<void> {
  try {
    const { data, error } = await this.supabase
      .from('income_entries')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    this.incomeData.set(data || []);
    console.log('💾 Loaded from Supabase:', data?.length || 0, 'entries');
  } catch (error) {
    console.error('Error loading from Supabase:', error);
    this.incomeData.set([]);
  }
}

// OLD: Save to localStorage
private async saveToFile(): Promise<void> {
  localStorage.setItem('cashflow_income_data', JSON.stringify(data));
}

// NEW: No need for saveToFile - Supabase handles it in each operation
// Remove this method entirely

// OLD: Add entry (local)
async addEntry(entry: Omit<IncomeEntry, 'id' | 'date'>): Promise<IncomeEntry> {
  const newEntry = { ...entry, id: this.generateId(), date: ... };
  this.incomeData.set([...currentEntries, newEntry]);
  await this.saveToFile(); // ❌ Remove
  return newEntry;
}

// NEW: Add entry (Supabase)
async addEntry(entry: Omit<IncomeEntry, 'id' | 'date'>): Promise<IncomeEntry> {
  const { data, error } = await this.supabase
    .from('income_entries')
    .insert([{
      month: entry.month,
      year: entry.year,
      amount: entry.amount,
      source: entry.source,
      notes: entry.notes,
      date: new Date(entry.year, this.getMonthIndex(entry.month), 1).toISOString()
    }])
    .select()
    .single();
  
  if (error) throw error;
  
  // Update local signal
  this.incomeData.set([...this.incomeData(), data]);
  return data;
}

// Similar updates for updateEntry() and deleteEntry()
```

### Step 4: Data Migration (One-Time)

When ready to switch to Supabase, migrate existing localStorage data:

```typescript
// Migration utility (run once)
async migrateLocalStorageToSupabase(): Promise<void> {
  const stored = localStorage.getItem('cashflow_income_data');
  if (!stored) return;
  
  const data = JSON.parse(stored);
  
  for (const entry of data.incomeEntries) {
    await this.supabase
      .from('income_entries')
      .insert([{
        month: entry.month,
        year: entry.year,
        amount: entry.amount,
        source: entry.source,
        notes: entry.notes,
        date: entry.date
      }]);
  }
  
  console.log('✅ Migrated', data.incomeEntries.length, 'entries to Supabase');
  
  // Optional: Clear localStorage after successful migration
  // localStorage.removeItem('cashflow_income_data');
}
```

---

## Testing Plan After Migration

### 1. Test Data Load
- [ ] Page loads without errors
- [ ] All entries appear in UI
- [ ] Year filtering works correctly

### 2. Test Add Operation
- [ ] Can add new entry
- [ ] Entry appears immediately in UI
- [ ] Entry persists after refresh
- [ ] Duplicate check still works

### 3. Test Update Operation
- [ ] Can edit existing entry
- [ ] Changes appear immediately
- [ ] Changes persist after refresh

### 4. Test Delete Operation
- [ ] Can delete entry
- [ ] Entry removed from UI immediately
- [ ] Deletion persists after refresh

### 5. Test Multi-Device
- [ ] Add entry on Device A
- [ ] Refresh on Device B
- [ ] Entry should appear on Device B

---

## Known Issues to Address During Migration

### Current Issue: Add Not Working
**Symptoms:**
- October 2021 shows "already exists" error
- But not visible in UI
- Not sure if saved to localStorage

**Before migrating to Supabase, we need to:**
1. ✅ Verify localStorage actually has the data
2. ✅ Verify console logs show the add operation
3. ✅ Fix any UI refresh issues

**Action Items:**
- Run the browser console commands I provided
- Share the output with me
- I'll help diagnose the exact problem

---

## Quick Supabase Setup Reference

### Install Supabase Client (if not already installed)
```bash
npm install @supabase/supabase-js
```

### Create Supabase Service
```typescript
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey
    );
  }

  get client() {
    return this.supabase;
  }
}
```

---

## When You Come Back

Just let me know:
1. **"Supabase is ready"** - I'll help you migrate
2. **"Still debugging localStorage"** - Share console output and I'll help diagnose
3. **"Need help with IP whitelisting"** - I can guide you through Supabase network settings

Take your time! We'll get the DB connectivity sorted out first, then everything will work smoothly. 🚀
