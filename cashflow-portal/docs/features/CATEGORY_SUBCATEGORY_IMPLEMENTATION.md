# Category v2 - Subcategory Feature Implementation

## 📋 Overview
Added subcategory support to the category management system, allowing hierarchical organization of categories.

**Date:** March 15, 2026  
**Version:** 2.0  
**Author:** Copilot AI Assistant

---

## 🗄️ Database Changes

### 1. SQL Migration Script

**File:** `sql/DBEAVER_ADD_SUBCATEGORY.sql`

This script adds the `sub_category` column to the existing `dbo.category` table.

#### Run in DBeaver:

```sql
-- 1) Add subcategory column
ALTER TABLE dbo.category 
ADD COLUMN IF NOT EXISTS sub_category VARCHAR(50) NULL;

-- 2) Add index for performance
CREATE INDEX IF NOT EXISTS ix_category_subcategory 
  ON dbo.category(sub_category) 
  WHERE sub_category IS NOT NULL;

-- 3) Drop old unique index
DROP INDEX IF EXISTS dbo.ux_category_name_ci;

-- 4) Create new composite unique index
CREATE UNIQUE INDEX IF NOT EXISTS ux_category_name_subcategory_ci
  ON dbo.category (LOWER(category_name), LOWER(COALESCE(sub_category, '')));

-- 5) Add column comment
COMMENT ON COLUMN dbo.category.sub_category IS 
'Optional subcategory name (max 50 characters). Example: Category="Food", Subcategory="Groceries"';
```

#### What This Does:
- ✅ Adds `sub_category` column (VARCHAR(50), nullable)
- ✅ Creates performance index on subcategory
- ✅ Updates unique constraint to allow same category name with different subcategories
- ✅ Adds documentation comment

#### Verification:
```sql
-- View updated table structure
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'dbo' 
  AND table_name = 'category'
ORDER BY ordinal_position;

-- View all indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'dbo' 
  AND tablename = 'category';

-- View sample data
SELECT * FROM dbo.category LIMIT 10;
```

---

## 💻 Frontend Changes

### 2. TypeScript Model Update

**File:** `src/app/services/category.service.ts`

#### Updated Category Type:
```typescript
export type Category = {
  category_id: number;
  category_name: string;
  sub_category?: string | null;  // ✨ NEW FIELD
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
```

#### Updated Service Methods:

**addCategory():**
```typescript
async addCategory(name: string, subCategory?: string): Promise<Category> {
  const { data, error } = await this.supabase.db
    .from('category')
    .insert([{
      category_name: name,
      sub_category: subCategory || null,  // ✨ NEW
      is_active: true
    }])
    .select()
    .single();
  // ... error handling
}
```

**updateCategory():**
```typescript
async updateCategory(id: number, name: string, subCategory?: string): Promise<Category> {
  const { data, error } = await this.supabase.db
    .from('category')
    .update({ 
      category_name: name,
      sub_category: subCategory || null,  // ✨ NEW
      updated_at: new Date().toISOString()
    })
    .eq('category_id', id)
    .select()
    .single();
  // ... error handling
}
```

---

### 3. Component Updates

**File:** `src/app/component/category/category.page.ts`

#### New Signals:
```typescript
protected newSubCategoryName = signal<string>('');  // ✨ NEW
```

#### Updated Methods:

**openAddModal():**
```typescript
protected openAddModal(): void {
  this.newCategoryName.set('');
  this.newSubCategoryName.set('');  // ✨ NEW
  this.showAddModal.set(true);
}
```

**addCategory():**
```typescript
protected async addCategory(): Promise<void> {
  const name = this.newCategoryName().trim();
  const subCategory = this.newSubCategoryName().trim();  // ✨ NEW
  
  if (!name) {
    alert('Please enter a category name');
    return;
  }

  this.isAdding.set(true);
  
  try {
    await this.categoryService.addCategory(name, subCategory || undefined);  // ✨ NEW
    this.closeAddModal();
  } catch (error: any) {
    console.error('Failed to add category:', error);
    alert(`Failed to add category: ${error.message}`);
  } finally {
    this.isAdding.set(false);
  }
}
```

**updateCategory():**
```typescript
protected async updateCategory(): Promise<void> {
  const cat = this.editingCategory();
  if (!cat) return;

  const name = cat.category_name.trim();
  const subCategory = cat.sub_category?.trim();  // ✨ NEW
  
  if (!name) {
    alert('Please enter a category name');
    return;
  }

  this.isEditing.set(true);
  
  try {
    await this.categoryService.updateCategory(cat.category_id, name, subCategory || undefined);  // ✨ NEW
    this.closeEditModal();
  } catch (error: any) {
    console.error('Failed to update category:', error);
    alert(`Failed to update category: ${error.message}`);
  } finally {
    this.isEditing.set(false);
  }
}
```

**New Handler Method:**
```typescript
protected onEditSubCategoryChange(value: string): void {
  const cat = this.editingCategory();
  if (cat) {
    this.editingCategory.set({ ...cat, sub_category: value });
  }
}
```

---

### 4. HTML Template Updates

**File:** `src/app/component/category/category.page.html`

#### Table Header (added new column):
```html
<thead>
  <tr>
    <th class="col-icon">Icon</th>
    <th class="col-name sortable" (click)="sortBy('name')">
      <div class="header-content">
        <span>Category Name</span>
        <span class="sort-icon">{{ getSortIcon('name') }}</span>
      </div>
    </th>
    <th class="col-subcategory">Sub Category</th>  <!-- ✨ NEW -->
    <th class="col-status">Active</th>
    <th class="col-date sortable" (click)="sortBy('created')">...</th>
    <th class="col-date sortable" (click)="sortBy('updated')">...</th>
    <th class="col-actions">Actions</th>
  </tr>
</thead>
```

#### Table Body (added subcategory display):
```html
<tbody>
  @for (cat of paginated(); track cat.category_id) {
    <tr class="table-row">
      <td class="col-icon">
        <span class="category-icon">{{ getCategoryIcon(cat.category_name) }}</span>
      </td>
      <td class="col-name">
        <span class="category-name">{{ cat.category_name }}</span>
      </td>
      <td class="col-subcategory">  <!-- ✨ NEW -->
        <span class="subcategory-name">{{ cat.sub_category || '-' }}</span>
      </td>
      <!-- ... rest of columns -->
    </tr>
  }
</tbody>
```

#### Add Modal (added subcategory field):
```html
<div class="modal-body">
  <label class="form-label">
    Category Name <span class="required">*</span>
    <input 
      type="text" 
      class="form-input" 
      placeholder="e.g., Food, Transport, Entertainment" 
      [value]="newCategoryName()"
      (input)="newCategoryName.set($any($event.target).value)"
      maxlength="50"
    />
  </label>
  
  <!-- ✨ NEW FIELD -->
  <label class="form-label">
    Sub Category <span class="optional">(Optional)</span>
    <input 
      type="text" 
      class="form-input" 
      placeholder="e.g., Groceries, Restaurants, Gas" 
      [value]="newSubCategoryName()"
      (input)="newSubCategoryName.set($any($event.target).value)"
      maxlength="50"
    />
  </label>
  
  @if (newCategoryName()) {
    <div class="icon-preview">
      <span class="preview-icon">{{ getCategoryIcon(newCategoryName()) }}</span>
      <span class="preview-text">
        <strong>{{ newCategoryName() }}</strong>
        @if (newSubCategoryName()) {  <!-- ✨ NEW -->
          <span> → {{ newSubCategoryName() }}</span>
        }
      </span>
    </div>
  }
</div>
```

#### Edit Modal (added subcategory field):
```html
<div class="modal-body">
  <label class="form-label">
    Category Name <span class="required">*</span>
    <input 
      type="text" 
      class="form-input" 
      [value]="editingCategory()!.category_name"
      (input)="onEditNameChange($any($event.target).value)"
      maxlength="50"
    />
  </label>
  
  <!-- ✨ NEW FIELD -->
  <label class="form-label">
    Sub Category <span class="optional">(Optional)</span>
    <input 
      type="text" 
      class="form-input" 
      placeholder="e.g., Groceries, Restaurants, Gas"
      [value]="editingCategory()!.sub_category || ''"
      (input)="onEditSubCategoryChange($any($event.target).value)"
      maxlength="50"
    />
  </label>
  
  @if (editingCategory()!.category_name) {
    <div class="icon-preview">
      <span class="preview-icon">{{ getCategoryIcon(editingCategory()!.category_name) }}</span>
      <span class="preview-text">
        <strong>{{ editingCategory()!.category_name }}</strong>
        @if (editingCategory()!.sub_category) {  <!-- ✨ NEW -->
          <span> → {{ editingCategory()!.sub_category }}</span>
        }
      </span>
    </div>
  }
</div>
```

---

### 5. SCSS Styling Updates

**File:** `src/app/component/category/category.page.scss`

#### New Subcategory Column Styles:
```scss
.col-subcategory {
  min-width: 140px;
  max-width: 220px;
  text-align: left;
}

.col-subcategory .subcategory-name {
  display: block;
  font-weight: 400;
  color: var(--text-muted);
  font-size: 13px;
  font-style: italic;
}
```

#### Updated Form Label Styles:
```scss
.form-label {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  font-size: 12px;

  .required {
    color: #ef4444;
    margin-left: 4px;
    font-weight: 700;
  }
  
  .optional {  // ✨ NEW
    color: #94a3b8;
    margin-left: 4px;
    font-weight: 400;
    font-size: 11px;
    font-style: italic;
  }
}
```

---

## 🎯 Features

### What's New:

1. **Hierarchical Categories**
   - Main category (required): e.g., "Food"
   - Sub category (optional): e.g., "Groceries", "Restaurants"

2. **Database Changes**
   - New `sub_category` column (VARCHAR(50), nullable)
   - Composite unique index: prevents duplicate category+subcategory combinations
   - Performance index on subcategory field

3. **UI Enhancements**
   - New "Sub Category" column in table
   - Subcategory input field in Add/Edit modals
   - Real-time preview showing category → subcategory
   - Optional field indicator with styling

4. **Data Validation**
   - Category name required (max 50 chars)
   - Subcategory optional (max 50 chars)
   - Case-insensitive uniqueness check
   - Trimmed whitespace handling

---

## 📊 Example Usage

### Creating Categories:

| Category Name | Sub Category | Result |
|--------------|-------------|---------|
| Food | Groceries | ✅ Food → Groceries |
| Food | Restaurants | ✅ Food → Restaurants |
| Food | - | ✅ Food (no subcategory) |
| Transport | Gas | ✅ Transport → Gas |
| Transport | - | ✅ Transport (no subcategory) |

### Uniqueness Rules:

| Attempt | Result |
|---------|--------|
| Food + Groceries (first time) | ✅ Allowed |
| Food + Groceries (duplicate) | ❌ Blocked (duplicate) |
| food + GROCERIES | ❌ Blocked (case-insensitive) |
| Food + Restaurants | ✅ Allowed (different subcategory) |
| Food (no sub) + Food (no sub) | ❌ Blocked (duplicate) |

---

## 🚀 Deployment Steps

### Step 1: Run SQL Migration in DBeaver

1. Open DBeaver
2. Connect to your PostgreSQL database
3. Open `sql/DBEAVER_ADD_SUBCATEGORY.sql`
4. Execute the entire script
5. Verify results in the output

### Step 2: Deploy Frontend Code

All TypeScript, HTML, and SCSS files have been updated. The changes include:
- ✅ `src/app/services/category.service.ts`
- ✅ `src/app/component/category/category.page.ts`
- ✅ `src/app/component/category/category.page.html`
- ✅ `src/app/component/category/category.page.scss`

### Step 3: Test

1. Refresh the application
2. Test adding a category with subcategory
3. Test adding a category without subcategory
4. Test editing categories
5. Test duplicate validation
6. Test search functionality

---

## 🧪 Testing Checklist

- [ ] SQL migration runs successfully
- [ ] Table shows new "Sub Category" column
- [ ] Add category with subcategory works
- [ ] Add category without subcategory works
- [ ] Edit category subcategory works
- [ ] Duplicate category+subcategory is blocked
- [ ] Same category with different subcategories is allowed
- [ ] Search works with subcategory text
- [ ] Icon preview shows category → subcategory
- [ ] Form validation works correctly

---

## 📝 Notes

- Subcategory is **optional** - backward compatible with existing categories
- Existing categories will show "-" in the subcategory column
- Case-insensitive uniqueness applies to both category and subcategory
- Maximum length: 50 characters for both fields
- Subcategory can be empty/null in database

---

## 🔄 Rollback (if needed)

If you need to rollback the changes:

```sql
-- Remove composite unique index
DROP INDEX IF EXISTS dbo.ux_category_name_subcategory_ci;

-- Recreate old unique index
CREATE UNIQUE INDEX ux_category_name_ci
  ON dbo.category (LOWER(category_name));

-- Drop subcategory index
DROP INDEX IF EXISTS dbo.ix_category_subcategory;

-- Drop subcategory column
ALTER TABLE dbo.category DROP COLUMN IF EXISTS sub_category;
```

---

## ✅ Summary

The subcategory feature is now fully implemented across:
- **Database**: New column with indexes and constraints
- **Backend**: Updated TypeScript models and service methods
- **Frontend**: New UI fields, validation, and display
- **Styling**: Consistent design with form indicators

All CRUD operations (Create, Read, Update, Delete) now support subcategories!
