# Error Handling - Quick Reference

## 🚀 Quick Start

### Import the Error Handler
```typescript
import { ErrorHandler } from '../../utils/error-handler.util';
```

### Basic Usage in Try-Catch
```typescript
try {
  // Your operation
  await this.categoryService.addCategory(name, subCategory);
  console.log('✅ Operation successful');
} catch (error: any) {
  ErrorHandler.logError('Operation Name', error);
  const errorMessage = ErrorHandler.getAlertMessage(error, 'add');
  alert(errorMessage);
}
```

---

## 📋 Common Error Messages

| Error Type | User Sees |
|------------|-----------|
| Duplicate category | ⚠️ **Duplicate Category**<br>A category with this name and subcategory combination already exists.<br>Please use a different combination. |
| Empty name | ⚠️ **Validation Error**<br>Category name is required.<br>Please enter a valid category name. |
| String too long | ⚠️ **Text Too Long**<br>Category name or subcategory exceeds maximum length.<br>Maximum length is 50 characters. |
| Foreign key violation | ❌ **Cannot Delete**<br>This category is being used by other records.<br>Please remove all related transactions first. |
| Connection error | ❌ **Connection Error**<br>Unable to connect to the database.<br>Please check your internet connection. |
| Permission denied | ❌ **Permission Denied**<br>You do not have permission to perform this action.<br>Please contact your administrator. |

---

## 🎯 Operations

### Add Operation
```typescript
ErrorHandler.getAlertMessage(error, 'add')
```

### Update Operation
```typescript
ErrorHandler.getAlertMessage(error, 'update')
```

### Delete Operation
```typescript
ErrorHandler.getAlertMessage(error, 'delete')
```

---

## 🔍 Method Reference

### handleDatabaseError()
```typescript
ErrorHandler.handleDatabaseError(error, 'add')
// Returns: { title, message, details, type }
```

### getAlertMessage()
```typescript
ErrorHandler.getAlertMessage(error, 'add')
// Returns: "⚠️ Title\n\nMessage\n\nDetails"
```

### logError()
```typescript
ErrorHandler.logError('Context', error)
// Logs detailed error info to console
```

### handleValidationError()
```typescript
ErrorHandler.handleValidationError('Field Name', 'issue description')
// Returns: { title, message, details, type }
```

---

## ✅ Best Practices

1. **Always log before alerting:**
   ```typescript
   ErrorHandler.logError('Add Category', error);
   alert(ErrorHandler.getAlertMessage(error, 'add'));
   ```

2. **Validate before API call:**
   ```typescript
   if (!name) {
     alert('⚠️ Category name is required.');
     return;
   }
   ```

3. **Show success messages:**
   ```typescript
   console.log('✅ Category added successfully:', name);
   ```

4. **Use appropriate operation type:**
   ```typescript
   getAlertMessage(error, 'add')    // For create
   getAlertMessage(error, 'update') // For edit
   getAlertMessage(error, 'delete') // For remove
   ```

---

## 📝 Full Example

```typescript
protected async addCategory(): Promise<void> {
  const name = this.newCategoryName().trim();
  const subCategory = this.newSubCategoryName().trim();
  
  // Validation
  if (!name) {
    alert('⚠️ Validation Error\n\nCategory name is required.\n\nPlease enter a valid category name.');
    return;
  }

  this.isAdding.set(true);
  
  try {
    // Operation
    await this.categoryService.addCategory(name, subCategory || undefined);
    this.closeAddModal();
    
    // Success
    console.log('✅ Category added successfully:', name, subCategory || '(no subcategory)');
  } catch (error: any) {
    // Error handling
    ErrorHandler.logError('Add Category', error);
    const errorMessage = ErrorHandler.getAlertMessage(error, 'add');
    alert(errorMessage);
  } finally {
    this.isAdding.set(false);
  }
}
```

---

## 🎨 Error Icons

| Type | Icon | When to Use |
|------|------|-------------|
| error | ❌ | Critical failures (connection, permissions, foreign keys) |
| warning | ⚠️ | User input issues (validation, duplicates, length) |
| info | ℹ️ | Informational messages |

---

## 🐛 Debugging Tips

1. **Check console logs** - Full error details are logged
2. **Look for error code** - Database error codes help identify issues
3. **Read the details** - Error hints from database are included
4. **Test with invalid data** - Verify error messages display correctly

---

## 🔗 Related Files

- Implementation: `src/app/utils/error-handler.util.ts`
- Usage: `src/app/component/category/category.page.ts`
- Documentation: `docs/features/ERROR_HANDLING_IMPLEMENTATION.md`
