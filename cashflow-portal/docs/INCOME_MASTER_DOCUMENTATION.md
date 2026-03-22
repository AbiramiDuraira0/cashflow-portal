# 📚 Income Tracker - Complete Documentation
## Cashflow Portal - Income Module Master Reference

**Last Updated**: March 22, 2026  
**Status**: Production Ready  
**Version**: 5.0

---

## 📑 Table of Contents

1. [Overview](#overview)
2. [Version History](#version-history)
3. [Database Schema](#database-schema)
4. [Features](#features)
5. [Component Structure](#component-structure)
6. [Bug Fixes](#bug-fixes)
7. [Testing Guide](#testing-guide)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The Income Tracker module allows users to track monthly income entries with full CRUD operations, visual grid layout, and company-wise earnings breakdown.

**Key Features**:
- ✅ Monthly income tracking with grid view (2 rows × 6 months)
- ✅ Full CRUD operations (Create, Read, Update, Delete with soft delete)
- ✅ MNC company tracking (Mindtree, LTIMindtree, Comcast)
- ✅ Company-wise earnings breakdown
- ✅ Year-wise filtering and totals
- ✅ Toast notifications for all operations
- ✅ Optional salary date field
- ✅ Supabase PostgreSQL integration

---

## Version History

### **Version 5.1** (March 22, 2026) - Current
**Features Added**:
- **Dynamic Company Periods**: MNC company periods now calculated automatically from actual income entries
- **Smart Period Detection**: Automatically detects if company is current ("Present") or past employment
- **LTIMindtree Icon**: Added professional briefcase icon (💼)
- Company display in month cards ("Salary • Comcast")
- Toast notifications for database operations

**Technical Improvements**:
- `mncCompanies` converted from static signal to computed property
- Periods dynamically calculated: "Jan 2023 - Jul 2024" based on first/last income entry
- "Present" label auto-detected for current employment
- Shows "No entries yet" for companies without income data

**Bug Fixes**:
- Year field now works correctly (not always 2026)
- Month dropdown shows current month
- Salary date properly saves to database
- Red asterisks on all required fields
- Delete modal icon displays properly

---

### **Version 5.0** (March 22, 2026)
**Features Added**:
- MNC Company column in database and UI
- Company-wise earnings breakdown modal
- MNC company field in add/edit form (required)

---

### **Version 4.0**
**Features Added**:
- "Year Wise Total Earnings" renamed to "MNC Worked"
- Clickable Total Earnings widget with modal breakdown
- Eye icon replaced with professional SVG
- "Selected Year Total" label with months count

**Bug Fixes**:
- Table alignment in Total Earnings modal
- Eye icon appearance improved

---

### **Version 3.0**
**Features Added**:
- Total Earnings widget clickable
- Year-wise breakdown table with gross total

**Bug Fixes**:
- Year selection fixed for add buttons
- Month dropdown defaults correctly
- Label changed: "Specific Date" → "Salary Date"

---

### **Version 2.0**
**Features Added**:
- Optional date field in form
- Year-locked form when adding from year button
- Monthly grid view (2 rows × 6 months)
- Year-specific add button

---

### **Version 1.0** - Initial Release
**Features**:
- Database table creation
- CRUD operations (localStorage → Supabase migration)
- Basic income tracking
- Reactive signals and zoneless change detection

---

## Database Schema

### Table: `income`

```sql
CREATE TABLE income (
    income_id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    month VARCHAR(20) NOT NULL,
    date DATE,                              -- Optional salary date
    amount_inr DECIMAL(15, 2) NOT NULL,
    source VARCHAR(100) DEFAULT 'Salary',
    mnc_company VARCHAR(100),               -- NEW in v5.0
    notes TEXT,
    is_delete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_income_year_month ON income(year, month) WHERE is_delete = FALSE;
CREATE INDEX idx_income_mnc_company ON income(mnc_company) WHERE mnc_company IS NOT NULL;

-- Unique Constraint (soft delete aware)
CREATE UNIQUE INDEX idx_unique_income_entry 
ON income(year, month) 
WHERE is_delete = FALSE;

-- Auto-update trigger
CREATE TRIGGER update_income_updated_at
    BEFORE UPDATE ON income
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

## Features

### 1. **Dashboard Summary Cards**

**Three widgets at top**:

#### Total Earnings (Clickable)
- Shows sum of all income since Aug 2021
- Click to see year-wise breakdown modal
- Eye icon (SVG) indicates clickable
- Modal shows table: Year | Amount | Total

#### Selected Year Total
- Shows total for currently selected year
- Format: "2026 Total Earnings"
- Subtitle: "Selected Year • 5 months"

#### MNC Worked (Clickable)
- Shows companies: "Mindtree • LTIMindtree • Comcast"
- Click to see earnings breakdown by company
- Modal shows:
  - Company icon, name, period
  - Total earnings per company
  - Grand total at bottom

---

### 2. **Year Filter Tabs**

- Horizontal tabs for years 2021-2026
- Active year highlighted
- "Add for [Year]" button next to tabs
- Clicking tab filters grid view

---

### 3. **Monthly Grid View**

**Layout**: 2 rows × 6 months
- **Row 1**: January - June
- **Row 2**: July - December

**Each Month Card Shows**:
- Month name
- Amount (₹ formatted)
- Source (Salary, Bonus, etc.)
- **Company name** ("Salary • Comcast")  ← NEW in v5.0
- Optional salary date
- Optional notes
- Edit and Delete buttons

**Empty Month Card**:
- 📝 icon
- "No data" text

---

### 4. **Add/Edit Income Form**

**Modal Form Fields**:
1. **Month** * (dropdown, required)
2. **Year** * (number input, readonly, required)
3. **Salary Date** (date picker, optional)
4. **Amount (₹)** * (number input, required)
5. **Income Source** * (dropdown, required)
   - Options: Salary, Bonus, Freelance, Investment Returns, Other
6. **MNC Company** * (dropdown, required) ← NEW in v5.0
   - Options: Mindtree, LTIMindtree, Comcast
7. **Notes** (textarea, optional)

**Validation**:
- Required fields marked with red asterisk (*)
- Year is readonly (pre-filled based on context)
- Amount must be > 0

**Smart Duplicate Handling**:
- Checks if entry exists for month+year
- If soft-deleted entry exists, offers to restore
- Otherwise prevents duplicates

---

### 5. **Delete Confirmation**

**Custom Modal** (not browser alert):
- Warning icon with pulse animation
- Shows: month, year, amount
- Explains: soft delete (can be restored)
- Cancel and Delete buttons
- Delete button: red gradient with loading state

---

### 6. **Toast Notifications** ← NEW in v5.0

**Position**: Top-right corner (fixed)
**Duration**: Auto-dismiss after 3 seconds
**Types**: Success (green ✅), Error (red ❌), Info (blue ℹ️)

**When Shown**:
- ✅ After adding income
- ✅ After updating income
- ✅ After restoring income
- ✅ After deleting income
- ❌ If save/delete fails

**Features**:
- Manual close button (X)
- Smooth slide-in animation
- Mobile responsive
- Color-coded gradients

---

## Component Structure

### Files

**TypeScript**: `src/app/component/income/income.page.ts` (423 lines)
- Signals for state management
- Computed properties for derived data
- CRUD methods
- Form validation
- Toast notifications

**HTML**: `src/app/component/income/income.page.html` (406 lines)
- Summary cards
- Year filter tabs
- Monthly grid (2 rows)
- Add/Edit modal
- Delete confirmation modal
- Total Earnings modal
- MNC Earnings modal
- Toast notification

**SCSS**: `src/app/component/income/income.page.scss` (~1600 lines)
- Responsive grid layout
- Card styling with gradients
- Modal styles
- Toast notifications
- Animations

**Service**: `src/app/services/income.service.ts` (474 lines)
- Supabase integration
- CRUD operations
- Data transformation
- Duplicate checking

---

## Bug Fixes

### Version 5.0 Fixes

#### **Bug: Year Always Shows 2026**
**Status**: ✅ FIXED  
**Solution**: Year now dynamically set based on context
- Top "Add Income" button: Uses current year/month
- "Add for [Year]" button: Uses selected year

#### **Bug: Month Defaults to March**
**Status**: ✅ WORKING AS EXPECTED  
**Note**: Month correctly defaults to current month (March on March 22, 2026)

#### **Bug: Salary Date Not Saving**
**Status**: ✅ FIXED  
**Solution**: Date field properly included in service transformation

#### **Bug: LTIMindtree Icon Not Finance-Relevant**
**Status**: ✅ FIXED  
**Solution**: Changed from 🔷 to 💳 (credit card)

#### **Bug: Required Fields Not Marked**
**Status**: ✅ FIXED  
**Solution**: Added red asterisk (*) to all required labels

#### **Bug: Delete Modal Icon CSS Issue**
**Status**: ✅ FIXED  
**Solution**: Added `line-height: 1` to warning icon

---

### Version 4.0 Fixes

#### **Bug: Eye Icon Not Looking Good**
**Status**: ✅ FIXED  
**Solution**: Replaced emoji with professional SVG icon

#### **Bug: Table Alignment in Modal**
**Status**: ✅ FIXED  
**Solution**: Added specific classes to table headers

---

## Testing Guide

### **1. Add Income**
- [ ] Click "Add Income" (top button)
- [ ] Verify form shows current month and year
- [ ] Fill all required fields (marked with *)
- [ ] Select company from dropdown
- [ ] Click "Save Income"
- [ ] See green toast: "✅ Income entry added successfully!"
- [ ] Verify entry appears in correct month card

### **2. Update Income**
- [ ] Click Edit (✏️) on any month card
- [ ] Modify amount or other fields
- [ ] Click "Update Income"
- [ ] See green toast: "✅ Income entry updated successfully!"
- [ ] Verify changes reflected in card

### **3. Delete Income**
- [ ] Click Delete (🗑️) on any month card
- [ ] See custom delete confirmation modal
- [ ] Verify warning icon animates (pulse)
- [ ] Click "Delete Entry"
- [ ] See green toast: "✅ Income entry deleted successfully!"
- [ ] Verify entry removed from grid

### **4. Company Display**
- [ ] Add income with company selected
- [ ] Verify month card shows: "Salary • Comcast"
- [ ] Format: `source • company`

### **5. MNC Earnings Breakdown**
- [ ] Click "MNC Worked" widget
- [ ] See modal with 3 company cards
- [ ] Verify each shows: Icon, Name, Period, **Earnings**
- [ ] Verify footer shows Total MNC Earnings
- [ ] Earnings should sum correctly

### **6. Total Earnings Breakdown**
- [ ] Click "Total Earnings" widget
- [ ] See modal with year-wise table
- [ ] Verify alignment: Year (left) | Amount (right)
- [ ] Verify footer shows Total Gross Earnings

### **7. Year Selection**
- [ ] Click year tab (e.g., 2025)
- [ ] Verify grid filters to that year
- [ ] Click "Add for 2025" button
- [ ] Verify form shows 2025 (not 2026)

### **8. Toast Notifications**
- [ ] Perform any CRUD operation
- [ ] See toast appear at top-right
- [ ] Verify correct color (green/red)
- [ ] Wait 3 seconds - toast auto-dismisses
- [ ] Or click X to close manually

---

## Troubleshooting

### **Issue: No data showing in grid**
**Cause**: Database connection or query error  
**Solution**: 
1. Check browser console for errors
2. Verify Supabase connection in `environment.ts`
3. Run SQL migration: `add_mnc_company_column.sql`

### **Issue: Form validation not working**
**Cause**: Required fields not filled  
**Solution**: Ensure all fields with red asterisk (*) are filled

### **Issue: Toast not appearing**
**Cause**: Z-index or positioning issue  
**Solution**: Check `.toast-notification` CSS has `z-index: 10000`

### **Issue: Company not showing in card**
**Cause**: Old entries don't have company data  
**Solution**: Edit old entries to add company

### **Issue: Duplicate entry error**
**Cause**: Entry already exists for month+year  
**Solution**: 
- Choose "Restore" to update existing entry
- Or change month/year to different values

---

## Quick Reference

### **Key Directories**:
- Component: `src/app/component/income/`
- Service: `src/app/services/income.service.ts`
- SQL: `sql/migrations/`
- Docs: `docs/features/INCOME_MASTER_DOCUMENTATION.md`

### **Key Methods**:
- `openAddForm()` - Open form with current date
- `openAddFormForYear(year)` - Open form for specific year
- `saveIncome()` - Add or update entry
- `deleteIncome(entry)` - Show delete confirmation
- `confirmDelete()` - Perform soft delete
- `showToastNotification(msg, type)` - Show toast

### **Key Signals**:
- `incomeEntries` - All income data
- `selectedYear` - Currently filtered year
- `filteredEntries` - Entries for selected year
- `yearWiseTotals` - Map of year→amount
- `companyWiseEarnings` - Map of company→amount
- `showToast` - Toast visibility state

---

## Database Migration Required

**File**: `sql/migrations/add_mnc_company_column.sql`

**Before using v5.0**, run this SQL in Supabase:

```sql
ALTER TABLE income
ADD COLUMN IF NOT EXISTS mnc_company VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_income_mnc_company
ON income(mnc_company)
WHERE mnc_company IS NOT NULL;
```

---

## Support

For issues or questions:
1. Check this documentation first
2. Review browser console for errors
3. Check SQL logs in Supabase
4. Verify all migrations have been run

---

**End of Income Tracker Documentation**  
**Version 5.0 - Production Ready** ✅
