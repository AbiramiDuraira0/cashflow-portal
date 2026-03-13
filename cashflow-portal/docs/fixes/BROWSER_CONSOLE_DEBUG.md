# Browser Console Debugging Commands

## Quick Diagnostic Commands

### 1. Check What's in localStorage
```javascript
// View all income data
const data = JSON.parse(localStorage.getItem('cashflow_income_data'));
console.table(data.incomeEntries);
```

### 2. Check for October 2021 Specifically
```javascript
const data = JSON.parse(localStorage.getItem('cashflow_income_data'));
const oct2021 = data.incomeEntries.filter(e => e.month === 'October' && e.year === 2021);
console.log('October 2021 entries:', oct2021);
```

### 3. Clear localStorage and Start Fresh
```javascript
localStorage.removeItem('cashflow_income_data');
console.log('✅ Cleared! Now refresh the page.');
location.reload();
```

### 4. Check Total Count
```javascript
const data = JSON.parse(localStorage.getItem('cashflow_income_data'));
console.log('Total entries in localStorage:', data.incomeEntries.length);
data.incomeEntries.forEach(e => console.log(`${e.month} ${e.year}: ₹${e.amount}`));
```

### 5. Manually Add October 2021 (Bypass UI)
```javascript
const data = JSON.parse(localStorage.getItem('cashflow_income_data'));
data.incomeEntries.push({
  id: 'manual_oct_2021',
  month: 'October',
  year: 2021,
  amount: 50000,
  source: 'Salary',
  notes: 'Manually added for testing',
  date: '2021-10-01T00:00:00.000Z'
});
localStorage.setItem('cashflow_income_data', JSON.stringify(data));
console.log('✅ Manually added October 2021. Now refresh!');
location.reload();
```

---

## What to Look For

### Expected localStorage Structure
```json
{
  "incomeEntries": [
    {
      "id": "income_sample_001",
      "month": "August",
      "year": 2021,
      "amount": 45000,
      "source": "Salary",
      "notes": "First month - Started earning",
      "date": "2021-08-01T00:00:00Z"
    },
    {
      "id": "income_sample_002",
      "month": "September",
      "year": 2021,
      "amount": 45000,
      "source": "Salary",
      "notes": "",
      "date": "2021-09-01T00:00:00Z"
    },
    {
      "id": "income_XXXXXXXXXX",
      "month": "October",
      "year": 2021,
      "amount": 45000,
      "source": "Salary",
      "notes": "",
      "date": "2021-10-01T00:00:00Z"
    }
  ]
}
```

### Console Log Sequence (When Working)

**On Page Load:**
```
💾 Loaded income data from localStorage: 5 entries
📊 getAllEntries() returning: 5 entries
🔄 Component: Ensuring service data is loaded...
✅ Component: Service data ready
```

**When Adding October 2021:**
```
🔍 Checking if October 2021 exists: false  ← Should be false for new entry
➕ Adding new entry. Current count: 4
➕ New entry: {month: "October", year: 2021, ...}
➕ After add, total count: 5
💾 Data saved to localStorage
✅ Income entry added successfully! Total entries: 5
```

---

## Troubleshooting

### Problem 1: "Already exists" error but can't see entry
**Diagnosis:**
```javascript
// Check if October 2021 is in the data
const data = JSON.parse(localStorage.getItem('cashflow_income_data'));
const oct = data.incomeEntries.filter(e => e.month === 'October' && e.year === 2021);
console.log('Found October 2021:', oct.length > 0 ? 'YES' : 'NO');
```

**If YES:** Entry is saved but UI not updating → Signal reactivity issue
**If NO:** Entry check is broken → Check entryExists() logic

### Problem 2: Duplicate entries with same month/year
**Diagnosis:**
```javascript
const data = JSON.parse(localStorage.getItem('cashflow_income_data'));
const duplicates = data.incomeEntries.reduce((acc, entry) => {
  const key = `${entry.month}-${entry.year}`;
  acc[key] = (acc[key] || 0) + 1;
  return acc;
}, {});
console.log('Duplicate check:', duplicates);
```

### Problem 3: Data not persisting
**Diagnosis:**
```javascript
// Before refresh
console.log('Before:', JSON.parse(localStorage.getItem('cashflow_income_data')).incomeEntries.length);

// After refresh
location.reload();

// Then run:
console.log('After:', JSON.parse(localStorage.getItem('cashflow_income_data')).incomeEntries.length);
```

---

## Clean Slate Reset

If all else fails, reset everything:

```javascript
// 1. Clear localStorage
localStorage.clear();

// 2. Clear all browser cache
// Chrome: Ctrl+Shift+Delete → Check "Cached images and files" → Clear

// 3. Hard refresh
// Windows: Ctrl+F5
// Or: Ctrl+Shift+R

// 4. Check fresh state
console.log('localStorage after clear:', localStorage.getItem('cashflow_income_data'));
// Should be: null
```
