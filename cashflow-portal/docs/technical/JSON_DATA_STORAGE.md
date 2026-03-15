# Income Data - JSON File Storage (Temporary)

> **Version:** 1.0  
> **Created:** March 13, 2026  
> **Purpose:** Temporary data storage solution while Supabase connectivity is unavailable  
> **Status:** 🔄 Temporary (Will migrate to Supabase)

## Overview

Due to office IP restrictions preventing Supabase connectivity, income data is temporarily stored in a local JSON file. This provides a file-based "database" that can easily be migrated to Supabase later.

## File Structure

### Data File Location
```
src/app/data/income-data.json
```

### JSON Schema
```json
{
  "incomeEntries": [
    {
      "id": "string",           // Unique identifier
      "month": "string",        // Month name (e.g., "March")
      "year": number,          // Year (e.g., 2026)
      "amount": number,        // Income amount in INR
      "source": "string",      // Income source
      "notes": "string",       // Optional notes
      "date": "ISO string"     // ISO 8601 date string
    }
  ]
}
```

## How It Works

### 1. Data Loading
- On app startup, `IncomeService` loads data from `/assets/data/income-data.json`
- Uses Angular's `HttpClient` to fetch the JSON file
- Falls back to `localStorage` if JSON file fails to load

### 2. Data Operations (CRUD)

#### Create
```typescript
await incomeService.addEntry({
  month: 'March',
  year: 2026,
  amount: 50000,
  source: 'Salary',
  notes: 'Monthly salary'
});
```

#### Read
```typescript
const entries = incomeService.getAllEntries();
const yearEntries = incomeService.getEntriesByYear(2026);
```

#### Update
```typescript
await incomeService.updateEntry('income_id', {
  amount: 55000,
  notes: 'Updated amount'
});
```

#### Delete
```typescript
await incomeService.deleteEntry('income_id');
```

### 3. Data Persistence
- **Primary:** Data stored in `localStorage` as `cashflow_income_data`
- **Fallback:** JSON file acts as initial data source
- **Note:** Browser-based only, no actual file write-back

## Configuration Files Modified

### 1. `angular.json`
Added JSON file as asset:
```json
"assets": [
  {
    "glob": "**/*",
    "input": "public"
  },
  {
    "glob": "**/*.json",
    "input": "src/app/data",
    "output": "/assets/data"
  }
]
```

### 2. `tsconfig.app.json`
Enabled JSON module resolution:
```json
"compilerOptions": {
  "resolveJsonModule": true,
  "allowSyntheticDefaultImports": true
},
"include": [
  "src/**/*.ts",
  "src/**/*.json"
]
```

### 3. `app.config.ts`
Added HttpClient provider:
```typescript
provideHttpClient(withFetch())
```

## Service Architecture

### `IncomeService` (`src/app/services/income.service.ts`)
Provides abstraction layer for data operations:

- **Loading:** Fetches from JSON, falls back to localStorage
- **CRUD Operations:** Add, update, delete with async/await pattern
- **Statistics:** Total income, yearly totals, monthly averages
- **Validation:** Duplicate entry checking

### Key Methods
```typescript
getAllEntries(): IncomeEntry[]
addEntry(entry): Promise<IncomeEntry>
updateEntry(id, updates): Promise<IncomeEntry>
deleteEntry(id): Promise<boolean>
getEntriesByYear(year): IncomeEntry[]
getTotalIncome(): number
getYearlyTotal(year): number
getMonthlyAverage(year): number
entryExists(month, year): boolean
```

## Sample Data

The JSON file includes 4 sample entries:
- August 2021 (₹45,000) - First earning month
- September 2021 (₹45,000)
- January 2026 (₹55,000)
- February 2026 (₹58,000)

## Migration Path to Supabase

### Phase 1: Current (JSON + localStorage)
```
User Input → Component → IncomeService → localStorage
                                      ↑
                                  JSON file (initial load)
```

### Phase 2: Supabase Migration
```
User Input → Component → IncomeService → Supabase DB
```

### Migration Steps

1. **Create Supabase Table**
```sql
CREATE TABLE income_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  source TEXT NOT NULL,
  notes TEXT,
  date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, month, year)
);

-- Add index for faster queries
CREATE INDEX idx_income_entries_user_year ON income_entries(user_id, year);
```

2. **Update `IncomeService` Methods**

Replace `loadIncomeData()`:
```typescript
private async loadIncomeData(): Promise<void> {
  const { data, error } = await this.supabase
    .from('income_entries')
    .select('*')
    .order('date', { ascending: false });
    
  if (!error && data) {
    this.incomeData.set(data);
  }
}
```

Replace `addEntry()`:
```typescript
async addEntry(entry: Omit<IncomeEntry, 'id' | 'date'>): Promise<IncomeEntry> {
  const newEntry = {
    ...entry,
    date: new Date(entry.year, this.getMonthIndex(entry.month), 1).toISOString()
  };
  
  const { data, error } = await this.supabase
    .from('income_entries')
    .insert([newEntry])
    .select()
    .single();
    
  if (error) throw error;
  return data;
}
```

3. **Remove localStorage fallback**
4. **Delete `income-data.json` file**
5. **Update angular.json** to remove JSON asset configuration

## Advantages of Current Approach

✅ **Easy Migration** - Service layer abstracts data source  
✅ **No Backend Required** - Works offline during development  
✅ **Type Safety** - Full TypeScript types for data structures  
✅ **Testable** - Can mock service in tests  
✅ **Fast Development** - No network latency  

## Limitations

❌ **No Multi-Device Sync** - Data stored locally only  
❌ **No Backup** - Data lost if browser cache cleared  
❌ **No User Authentication** - Single user only  
❌ **No Concurrent Access** - Browser-specific  
❌ **File Not Actually Written** - Can't persist new entries to JSON file from browser  

## Testing the Setup

1. Navigate to `/income` route
2. Click "Add Income"
3. Fill in month, year, amount, source
4. Save entry
5. Entry appears in list (stored in localStorage)
6. Refresh page - data persists
7. Open DevTools → Application → Local Storage → `cashflow_income_data`

## Troubleshooting

### JSON file not loading
- Check browser console for errors
- Verify file exists at `src/app/data/income-data.json`
- Ensure `ng serve` restarted after angular.json changes

### Data not persisting
- Check localStorage in DevTools
- Verify `saveToFile()` method is called
- Look for console logs: "💾 Data saved to localStorage"

### Service not found error
- Ensure `providedIn: 'root'` in service decorator
- Check imports in component

## Next Steps

1. **When Supabase is accessible:** Follow migration steps above
2. **Data Export:** Can export localStorage data to JSON for backup
3. **Data Import:** Can import existing data into Supabase

## Related Files

- `src/app/services/income.service.ts` - Service with migration notes
- `src/app/data/income-data.json` - JSON data file
- `src/app/component/income/income.page.ts` - Component using service
- `docs/features/INCOME_TRACKER.md` - Feature documentation

---

**Remember:** This is a temporary solution. Once Supabase is accessible, migrate to database for proper multi-device sync and data persistence!
