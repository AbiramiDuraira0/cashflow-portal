import { Injectable, signal, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

export type Category = {
  category_id: number;
  category_name: string;
  category_icon?: string | null;
  sub_category?: string | null;
  subcategory_icon?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private supabase = inject(SupabaseService);
  private categories = signal<Category[]>([]);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);

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
   * Load all active categories from database
   */
  async loadCategories(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    
    try {
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
    subcategoryIcon?: string
  ): Promise<Category> {
    try {
      console.log('➕ Adding new category:', name, subCategory || '(no subcategory)');
      
      const { data, error } = await this.supabase.db
        .from('category')
        .insert([{
          category_name: name,
          category_icon: categoryIcon || null,
          sub_category: subCategory || null,
          subcategory_icon: subcategoryIcon || null,
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
    subcategoryIcon?: string
  ): Promise<Category> {
    try {
      console.log('✏️ Updating category:', id, name, subCategory || '(no subcategory)');
      
      const { data, error } = await this.supabase.db
        .from('category')
        .update({ 
          category_name: name,
          category_icon: categoryIcon || null,
          sub_category: subCategory || null,
          subcategory_icon: subcategoryIcon || null,
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
    } catch (err: any) {
      console.error('❌ Update subcategory icon error:', err);
      throw err;
    }
  }
}
