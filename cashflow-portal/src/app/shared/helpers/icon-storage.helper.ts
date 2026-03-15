/**
 * Icon Storage Helper
 * 
 * Manages localStorage persistence for user-selected category icons.
 * Icons are stored as key-value pairs where key is the category name
 * and value is the selected emoji.
 */

const STORAGE_KEY = 'cashflow_category_icons';

interface IconStorage {
  [categoryName: string]: string;
}

export class IconStorageHelper {
  /**
   * Save an icon for a specific category name
   */
  static saveIcon(categoryName: string, icon: string): void {
    if (!categoryName || !icon) return;
    
    const storage = this.getAll();
    storage[categoryName.toLowerCase().trim()] = icon;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
  }

  /**
   * Get saved icon for a category name
   * Returns null if no custom icon is saved
   */
  static getIcon(categoryName: string): string | null {
    if (!categoryName) return null;
    
    const storage = this.getAll();
    return storage[categoryName.toLowerCase().trim()] || null;
  }

  /**
   * Remove saved icon for a category name
   */
  static removeIcon(categoryName: string): void {
    if (!categoryName) return;
    
    const storage = this.getAll();
    delete storage[categoryName.toLowerCase().trim()];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
  }

  /**
   * Get all saved icons
   */
  static getAll(): IconStorage {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.warn('Failed to load icon storage:', error);
      return {};
    }
  }

  /**
   * Clear all saved icons
   */
  static clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Update icon when category name changes
   */
  static updateCategoryName(oldName: string, newName: string): void {
    if (!oldName || !newName) return;
    
    const icon = this.getIcon(oldName);
    if (icon) {
      this.removeIcon(oldName);
      this.saveIcon(newName, icon);
    }
  }
}
