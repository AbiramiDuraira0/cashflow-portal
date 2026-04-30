import { Injectable, signal, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

export type Category = {
  category_id: number;
  category_name: string;
  category_icon?: string | null;
  sub_category?: string | null;
  subcategory_icon?: string | null;
  notes?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

// ============================================
// Mock Data for QA/Demo environment
// ============================================
const MOCK_CATEGORIES: Category[] = [
  {
    category_id: 1, category_name: 'Rent', category_icon: '🏠',
    sub_category: 'Monthly Rent', subcategory_icon: '🏡',
    notes: 'Housing expenses', is_active: true,
    created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z'
  },
  {
    category_id: 2, category_name: 'Groceries', category_icon: '🛒',
    sub_category: 'Vegetables', subcategory_icon: '🥬',
    notes: 'Food and groceries', is_active: true,
    created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z'
  },
  {
    category_id: 3, category_name: 'Groceries', category_icon: '🛒',
    sub_category: 'Fruits', subcategory_icon: '🍎',
    notes: 'Fresh fruits', is_active: true,
    created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z'
  },
  {
    category_id: 4, category_name: 'Transport', category_icon: '🚗',
    sub_category: 'Fuel', subcategory_icon: '⛽',
    notes: 'Transportation expenses', is_active: true,
    created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z'
  },
  {
    category_id: 5, category_name: 'Transport', category_icon: '🚗',
    sub_category: 'Public Transport', subcategory_icon: '🚌',
    notes: 'Bus, metro, etc.', is_active: true,
    created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z'
  },
  {
    category_id: 6, category_name: 'Utilities', category_icon: '💡',
    sub_category: 'Electricity', subcategory_icon: '⚡',
    notes: 'Electric bills', is_active: true,
    created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z'
  },
  {
    category_id: 7, category_name: 'Utilities', category_icon: '💡',
    sub_category: 'Internet', subcategory_icon: '📡',
    notes: 'Broadband and internet', is_active: true,
    created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z'
  },
  {
    category_id: 8, category_name: 'Utilities', category_icon: '💡',
    sub_category: 'Water', subcategory_icon: '💧',
    notes: 'Water bills', is_active: true,
    created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z'
  },
  {
    category_id: 9, category_name: 'Food', category_icon: '🍔',
    sub_category: 'Dining Out', subcategory_icon: '🍽️',
    notes: 'Restaurant and dining', is_active: true,
    created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z'
  },
  {
    category_id: 10, category_name: 'Food', category_icon: '🍔',
    sub_category: 'Takeaway', subcategory_icon: '🥡',
    notes: 'Food delivery', is_active: true,
    created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z'
  },
  {
    category_id: 11, category_name: 'Health', category_icon: '🏥',
    sub_category: 'Medicine', subcategory_icon: '💊',
    notes: 'Medical expenses', is_active: true,
    created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z'
  },
  {
    category_id: 12, category_name: 'Health', category_icon: '🏥',
    sub_category: 'Doctor Visit', subcategory_icon: '👨‍⚕️',
    notes: 'Consultation fees', is_active: true,
    created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z'
  },
  {
    category_id: 13, category_name: 'Entertainment', category_icon: '🎬',
    sub_category: 'Movies', subcategory_icon: '🎥',
    notes: 'Movie tickets and streaming', is_active: true,
    created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z'
  },
  {
    category_id: 14, category_name: 'Entertainment', category_icon: '🎬',
    sub_category: 'Gaming', subcategory_icon: '🎮',
    notes: 'Games and subscriptions', is_active: true,
    created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z'
  },
  {
    category_id: 15, category_name: 'Shopping', category_icon: '🛍️',
    sub_category: 'Clothing', subcategory_icon: '👕',
    notes: 'Clothes and accessories', is_active: true,
    created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z'
  },
  {
    category_id: 16, category_name: 'Shopping', category_icon: '🛍️',
    sub_category: 'Electronics', subcategory_icon: '📱',
    notes: 'Gadgets and electronics', is_active: true,
    created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z'
  },
  {
    category_id: 17, category_name: 'Education', category_icon: '📚',
    sub_category: 'Courses', subcategory_icon: '🎓',
    notes: 'Online courses', is_active: true,
    created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z'
  },
  {
    category_id: 18, category_name: 'Education', category_icon: '📚',
    sub_category: 'Books', subcategory_icon: '📖',
    notes: 'Books and study material', is_active: true,
    created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z'
  },
  {
    category_id: 19, category_name: 'Insurance', category_icon: '🛡️',
    sub_category: 'Health Insurance', subcategory_icon: '🏥',
    notes: 'Medical insurance premiums', is_active: true,
    created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z'
  },
  {
    category_id: 20, category_name: 'Insurance', category_icon: '🛡️',
    sub_category: 'Life Insurance', subcategory_icon: '❤️',
    notes: 'Life insurance premiums', is_active: true,
    created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z'
  }
];

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private supabase = inject(SupabaseService);
  private categories = signal<Category[]>([]);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);

  // Toggle between mock data (QA) and real DB (Production)
  private readonly USE_DB = false; // Set to false for QA environment with static demo data
  
  private nextMockId = 100; // For generating new IDs in mock mode

  /**
   * Get categories signal (reactive)
   */
  getCategoriesSignal() {
    return this.categories;
  }

  /**
   * Get loading state signal
   */
  getLoadingSignal() {
    return this.loading;
  }

  /**
   * Get error signal
   */
  getErrorSignal() {
    return this.error;
  }

  /**
   * Load all active categories from database or mock data
   */
  async loadCategories(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    
    try {
      if (this.USE_DB) {
        // Load from database
        console.log('📂 Loading categories from database...');
        
        const { data, error } = await this.supabase.db
          .from('category')
          .select('*')
          .order('category_name', { ascending: true });

        if (error) {
          console.error('❌ Database error:', error.message);
          throw error;
        }

        this.categories.set(data || []);
        console.log('✅ Loaded categories:', data?.length || 0);
      } else {
        // Use mock data for QA environment
        console.log('📂 Loading mock category data (QA mode)...');
        this.categories.set([...MOCK_CATEGORIES]);
        console.log('✅ Loaded mock categories:', MOCK_CATEGORIES.length);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load categories';
      this.error.set(errorMsg);
      console.error('❌ Category load error:', err);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Get all categories (synchronous access to signal)
   */
  getAllCategories(): Category[] {
    return this.categories();
  }

  /**
   * Get category by ID
   */
  getCategoryById(id: number): Category | undefined {
    return this.categories().find(cat => cat.category_id === id);
  }

  /**
   * Add new category
   */
  async addCategory(
    name: string, 
    categoryIcon?: string,
    subCategory?: string,
    subcategoryIcon?: string,
    notes?: string
  ): Promise<Category> {
    try {
      console.log('➕ Adding new category:', name, subCategory || '(no subcategory)');
      
      if (this.USE_DB) {
        const { data, error } = await this.supabase.db
          .from('category')
          .insert([{
            category_name: name,
            category_icon: categoryIcon || null,
            sub_category: subCategory || null,
            subcategory_icon: subcategoryIcon || null,
            notes: notes || null,
            is_active: true
          }])
          .select()
          .single();

        if (error) {
          console.error('❌ Error adding category:', error);
          throw error;
        }

        // Update local signal
        this.categories.set([...this.categories(), data]);
        console.log('✅ Category added:', data);
        
        return data;
      } else {
        // Mock mode - add to local data
        const newCategory: Category = {
          category_id: this.nextMockId++,
          category_name: name,
          category_icon: categoryIcon || null,
          sub_category: subCategory || null,
          subcategory_icon: subcategoryIcon || null,
          notes: notes || null,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        this.categories.set([...this.categories(), newCategory]);
        console.log('✅ Category added (mock):', newCategory);
        
        return newCategory;
      }
    } catch (err: any) {
      console.error('❌ Add category error:', err);
      throw err;
    }
  }

  /**
   * Update category
   */
  async updateCategory(
    id: number, 
    name: string, 
    categoryIcon?: string,
    subCategory?: string,
    subcategoryIcon?: string,
    notes?: string
  ): Promise<Category> {
    try {
      console.log('✏️ Updating category:', id, name, subCategory || '(no subcategory)');
      
      if (this.USE_DB) {
        const { data, error } = await this.supabase.db
          .from('category')
          .update({ 
            category_name: name,
            category_icon: categoryIcon || null,
            sub_category: subCategory || null,
            subcategory_icon: subcategoryIcon || null,
            notes: notes || null,
            updated_at: new Date().toISOString()
          })
          .eq('category_id', id)
          .select()
          .single();

        if (error) {
          console.error('❌ Error updating category:', error);
          throw error;
        }

        // Update local signal
        const updated = this.categories().map(cat => 
          cat.category_id === id ? data : cat
        );
        this.categories.set(updated);
        console.log('✅ Category updated:', data);
        
        return data;
      } else {
        // Mock mode - update in local data
        const updatedCategory: Category = {
          category_id: id,
          category_name: name,
          category_icon: categoryIcon || null,
          sub_category: subCategory || null,
          subcategory_icon: subcategoryIcon || null,
          notes: notes || null,
          is_active: this.categories().find(c => c.category_id === id)?.is_active ?? true,
          created_at: this.categories().find(c => c.category_id === id)?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const updated = this.categories().map(cat => 
          cat.category_id === id ? updatedCategory : cat
        );
        this.categories.set(updated);
        console.log('✅ Category updated (mock):', updatedCategory);
        
        return updatedCategory;
      }
    } catch (err: any) {
      console.error('❌ Update category error:', err);
      throw err;
    }
  }

  /**
   * Soft delete category (set is_active to false)
   */
  async deleteCategory(id: number): Promise<void> {
    try {
      console.log('🗑️ Deactivating category:', id);
      
      if (this.USE_DB) {
        const { data, error } = await this.supabase.db
          .from('category')
          .update({ 
            is_active: false,
            updated_at: new Date().toISOString()
          })
          .eq('category_id', id)
          .select()
          .single();

        if (error) {
          console.error('❌ Error deactivating category:', error);
          throw error;
        }

        // Update local signal with new status
        const updated = this.categories().map(cat => 
          cat.category_id === id ? data : cat
        );
        this.categories.set(updated);
        console.log('✅ Category deactivated');
      } else {
        // Mock mode - update is_active to false
        const updated = this.categories().map(cat => 
          cat.category_id === id 
            ? { ...cat, is_active: false, updated_at: new Date().toISOString() } 
            : cat
        );
        this.categories.set(updated);
        console.log('✅ Category deactivated (mock)');
      }
    } catch (err: any) {
      console.error('❌ Delete category error:', err);
      throw err;
    }
  }

  /**
   * Activate category (set is_active to true)
   */
  async activateCategory(id: number): Promise<void> {
    try {
      console.log('✅ Activating category:', id);
      
      if (this.USE_DB) {
        const { data, error } = await this.supabase.db
          .from('category')
          .update({ 
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('category_id', id)
          .select()
          .single();

        if (error) {
          console.error('❌ Error activating category:', error);
          throw error;
        }

        // Update local signal with new status
        const updated = this.categories().map(cat => 
          cat.category_id === id ? data : cat
        );
        this.categories.set(updated);
        console.log('✅ Category activated');
      } else {
        // Mock mode - update is_active to true
        const updated = this.categories().map(cat => 
          cat.category_id === id 
            ? { ...cat, is_active: true, updated_at: new Date().toISOString() } 
            : cat
        );
        this.categories.set(updated);
        console.log('✅ Category activated (mock)');
      }
    } catch (err: any) {
      console.error('❌ Activate category error:', err);
      throw err;
    }
  }

  /**
   * Search categories by name
   */
  searchCategories(query: string): Category[] {
    if (!query.trim()) return this.categories();
    
    const lowerQuery = query.toLowerCase().trim();
    return this.categories().filter(cat => 
      cat.category_name.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Update icon for ALL categories with matching category_name
   * This ensures consistency - one category name = one icon across all records
   */
  async updateCategoryIconByName(categoryName: string, icon: string): Promise<void> {
    try {
      console.log('🎨 Updating icon for all categories named:', categoryName, '→', icon);
      
      if (this.USE_DB) {
        const { data, error } = await this.supabase.db
          .from('category')
          .update({ 
            category_icon: icon,
            updated_at: new Date().toISOString()
          })
          .eq('category_name', categoryName)
          .select();

        if (error) {
          console.error('❌ Error updating category icons:', error);
          throw error;
        }

        // Update local signal - replace all matching categories
        const updated = this.categories().map(cat => {
          if (cat.category_name === categoryName) {
            return { ...cat, category_icon: icon, updated_at: new Date().toISOString() };
          }
          return cat;
        });
        this.categories.set(updated);
        
        console.log(`✅ Updated ${data?.length || 0} categories with name "${categoryName}"`);
      } else {
        // Mock mode - update all matching categories
        const updated = this.categories().map(cat => {
          if (cat.category_name === categoryName) {
            return { ...cat, category_icon: icon, updated_at: new Date().toISOString() };
          }
          return cat;
        });
        this.categories.set(updated);
        
        const count = updated.filter(c => c.category_name === categoryName).length;
        console.log(`✅ Updated ${count} categories with name "${categoryName}" (mock)`);
      }
    } catch (err: any) {
      console.error('❌ Update category icon error:', err);
      throw err;
    }
  }

  /**
   * Update icon for ALL subcategories with matching sub_category name
   * This ensures consistency - one subcategory name = one icon across all records
   */
  async updateSubcategoryIconByName(subcategoryName: string, icon: string): Promise<void> {
    try {
      console.log('🎨 Updating icon for all subcategories named:', subcategoryName, '→', icon);
      
      if (this.USE_DB) {
        const { data, error } = await this.supabase.db
          .from('category')
          .update({ 
            subcategory_icon: icon,
            updated_at: new Date().toISOString()
          })
          .eq('sub_category', subcategoryName)
          .select();

        if (error) {
          console.error('❌ Error updating subcategory icons:', error);
          throw error;
        }

        // Update local signal - replace all matching subcategories
        const updated = this.categories().map(cat => {
          if (cat.sub_category === subcategoryName) {
            return { ...cat, subcategory_icon: icon, updated_at: new Date().toISOString() };
          }
          return cat;
        });
        this.categories.set(updated);
        
        console.log(`✅ Updated ${data?.length || 0} subcategories with name "${subcategoryName}"`);
      } else {
        // Mock mode - update all matching subcategories
        const updated = this.categories().map(cat => {
          if (cat.sub_category === subcategoryName) {
            return { ...cat, subcategory_icon: icon, updated_at: new Date().toISOString() };
          }
          return cat;
        });
        this.categories.set(updated);
        
        const count = updated.filter(c => c.sub_category === subcategoryName).length;
        console.log(`✅ Updated ${count} subcategories with name "${subcategoryName}" (mock)`);
      }
    } catch (err: any) {
      console.error('❌ Update subcategory icon error:', err);
      throw err;
    }
  }
}
