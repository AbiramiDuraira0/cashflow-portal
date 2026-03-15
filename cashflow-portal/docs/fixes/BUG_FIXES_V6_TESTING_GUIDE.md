# Bug Fixes v6 - Testing Guide

## ✅ Pre-Testing Setup

### 1. Run Database Migration
Execute the SQL migration file:
```sql
-- File: sql/migrations/BUG_FIXES_V6_ICONS_SOFT_DELETE.sql
```

This adds:
- `category_icon` column (VARCHAR(2))
- `subcategory_icon` column (VARCHAR(2))
- `is_active` column (BOOLEAN)

### 2. Restart Application
```bash
# Clear cache
rm -rf .angular/cache

# Restart dev server
ng serve

# Hard refresh browser (Ctrl+Shift+R)
```

---

## 🧪 Test Cases

### Test 1: Subcategory Sorting ✓
**Steps:**
1. Go to Categories page
2. Ensure you have categories with subcategories
3. Click on "Sub Category" column header

**Expected:**
- Sort icon appears (↕️ → ↑ → ↓)
- Subcategories sort alphabetically
- Empty subcategories appear first or last consistently

---

### Test 2: Subcategory Icons Display ✓
**Steps:**
1. View category table
2. Look at subcategory column

**Expected:**
- Categories with subcategories show icon + name (e.g., "🛒 Groceries")
- Categories without subcategories show "-"
- Icons are relevant to subcategory name

---

### Test 3: Custom Category Icon ✓
**Steps:**
1. Click "Add Category"
2. Enter category name "Food"
3. Observe auto-suggested icon (🍔)
4. Click on icon input field
5. Enter different emoji "🍕"
6. Click "Add Category"

**Expected:**
- Auto-suggested icon appears initially
- Icon preview updates when you type
- Custom icon (🍕) is saved and displayed in table

---

### Test 4: Custom Subcategory Icon ✓
**Steps:**
1. Click "Add Category"
2. Enter category name "Food"
3. Enter subcategory name "Italian"
4. Observe auto-suggested subcategory icon
5. Change subcategory icon to "🍝"
6. Click "Add Category"

**Expected:**
- Both category and subcategory have custom icons
- Icons display correctly in table
- Icons can be edited later

---

### Test 5: Edit Icons ✓
**Steps:**
1. Click Edit (✏️) on any category
2. Change category icon
3. Change subcategory icon
4. Click "Save Changes"

**Expected:**
- Icons update in database
- Table reflects new icons immediately
- Preview shows correct icons

---

### Test 6: Modal Width ✓
**Steps:**
1. Click "Add Category"
2. Observe modal width
3. Check label "Category Name *"

**Expected:**
- Modal is wider (750px)
- "required star (*)" stays on same line as label
- No horizontal scrolling needed
- Icon inputs fit comfortably

---

### Test 7: Search Bar Size ✓
**Steps:**
1. View Categories page
2. Measure/observe search bar

**Expected:**
- Search bar is wider (380px vs 320px)
- Search bar is shorter (38px height vs 44px)
- Still looks proportional
- Search icon aligned correctly

---

### Test 8: Soft Delete (Deactivate) ✓
**Steps:**
1. Find an active category
2. Click Deactivate button (🚫)
3. Confirm deactivation

**Expected:**
- Confirmation modal says "Deactivate Category"
- After confirmation:
  - Category stays in list
  - Status badge shows "⊗ Deactivated" (red)
  - Deactivate button changes to Activate button (✅)
  - Can still edit the category

---

### Test 9: Activate Category ✓
**Steps:**
1. Find a deactivated category
2. Click Activate button (✅)

**Expected:**
- Category immediately becomes active
- Status badge shows "✓ Active" (green)
- Activate button changes to Deactivate button (🚫)
- No confirmation modal (instant activation)

---

### Test 10: Edit Deactivated Category ✓
**Steps:**
1. Find a deactivated category
2. Click Edit (✏️)
3. Change name or icons
4. Save changes

**Expected:**
- Edit modal opens normally
- Can modify all fields
- Category remains deactivated after save
- Changes persist

---

### Test 11: Search with Deactivated ✓
**Steps:**
1. Have both active and deactivated categories
2. Type in search bar

**Expected:**
- Search includes both active and deactivated
- Results show correct status badges
- Filter works on category name and subcategory

---

### Test 12: Sort with Deactivated ✓
**Steps:**
1. Have both active and deactivated categories
2. Sort by any column

**Expected:**
- Both active and deactivated categories sort together
- Status doesn't affect sort order
- All categories visible

---

### Test 13: Pagination with Deactivated ✓
**Steps:**
1. Have enough categories to span multiple pages
2. Include deactivated categories
3. Navigate pages

**Expected:**
- All categories (active and deactivated) included in pagination
- Page count accurate
- Status badges correct on all pages

---

### Test 14: Icon Fallback ✓
**Steps:**
1. Add category without setting custom icon
2. Let it use auto-suggested icon

**Expected:**
- Icon auto-suggested from IconMapper
- Relevant icon appears (e.g., 🍔 for "Food")
- Falls back to 📦 for unknown categories

---

### Test 15: Empty Icon Handling ✓
**Steps:**
1. Edit a category
2. Delete the custom icon (leave field empty)
3. Save

**Expected:**
- Falls back to auto-suggested icon
- No broken display
- Icon still shows in table

---

## 🎯 Success Criteria

All tests should pass with:
- ✅ No console errors
- ✅ No visual glitches
- ✅ Data persists after page refresh
- ✅ Responsive on mobile/tablet
- ✅ Smooth animations
- ✅ Intuitive user experience

---

## 🐛 Common Issues & Solutions

### Issue: Icons not saving
**Solution:** Check database migration ran successfully. Verify `category_icon` and `subcategory_icon` columns exist.

### Issue: Deactivated categories disappear
**Solution:** Check `filtered` computed in TypeScript - should NOT filter by `is_active`.

### Issue: Modal too narrow
**Solution:** Verify `modal-wide` class is applied to modal in HTML.

### Issue: Search bar looks wrong
**Solution:** Clear browser cache and hard refresh.

### Issue: Activate button not appearing
**Solution:** Check HTML has conditional rendering for activate/deactivate buttons based on `is_active`.

---

## 📊 Test Results Template

| Test Case | Status | Notes |
|-----------|--------|-------|
| 1. Subcategory Sorting | ⬜ | |
| 2. Subcategory Icons Display | ⬜ | |
| 3. Custom Category Icon | ⬜ | |
| 4. Custom Subcategory Icon | ⬜ | |
| 5. Edit Icons | ⬜ | |
| 6. Modal Width | ⬜ | |
| 7. Search Bar Size | ⬜ | |
| 8. Soft Delete | ⬜ | |
| 9. Activate Category | ⬜ | |
| 10. Edit Deactivated | ⬜ | |
| 11. Search with Deactivated | ⬜ | |
| 12. Sort with Deactivated | ⬜ | |
| 13. Pagination | ⬜ | |
| 14. Icon Fallback | ⬜ | |
| 15. Empty Icon Handling | ⬜ | |

---

*Testing Guide for Bug Fixes v6*  
*Date: March 15, 2026*
