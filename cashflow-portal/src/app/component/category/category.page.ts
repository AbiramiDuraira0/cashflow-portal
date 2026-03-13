import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService, Category } from '../../services/category.service';
import { ConnectionTestService } from '../../services/connection-test.service';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category.page.html',
  styleUrls: ['./category.page.scss']
})
export class CategoryPage implements OnInit {
  private categoryService = inject(CategoryService);
  private connectionTest = inject(ConnectionTestService);
  
  // Reactive signals
  protected categories = this.categoryService.getCategoriesSignal();
  protected loading = this.categoryService.getLoadingSignal();
  protected query = signal<string>('');
  
  // Modal states
  protected showAddModal = signal<boolean>(false);
  protected showEditModal = signal<boolean>(false);
  protected showDeleteModal = signal<boolean>(false);
  protected showTestPopup = signal<boolean>(false);
  
  // Form data
  protected newCategoryName = signal<string>('');
  protected editingCategory = signal<Category | null>(null);
  protected deletingCategory = signal<Category | null>(null);
  
  // Test connection result
  protected testResult = signal<{ success: boolean; message: string; } | null>(null);
  
  // Operation loading states
  protected isAdding = signal<boolean>(false);
  protected isEditing = signal<boolean>(false);
  protected isDeleting = signal<boolean>(false);

  // Computed filtered categories
  protected filtered = computed(() => {
    const searchQuery = this.query().trim().toLowerCase();
    const allCategories = this.categories();
    
    if (!searchQuery) return allCategories;
    
    return allCategories.filter(cat => 
      cat.category_name.toLowerCase().includes(searchQuery)
    );
  });

  protected skeletons = Array.from({ length: 6 });

  async ngOnInit(): Promise<void> {
    await this.loadCategories();
  }

  private async loadCategories(): Promise<void> {
    try {
      await this.categoryService.loadCategories();
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }

  protected onSearchChange(value: string): void {
    this.query.set(value);
  }

  protected formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  /**
   * Get relevant icon for category based on name
   */
  protected getCategoryIcon(categoryName: string): string {
    const name = categoryName.toLowerCase();
    
    // Map category names to relevant icons
    const iconMap: Record<string, string> = {
      'food': '🍔',
      'groceries': '🛒',
      'grocery': '🛒',
      'transport': '🚗',
      'transportation': '🚗',
      'travel': '✈️',
      'entertainment': '🎬',
      'shopping': '🛍️',
      'health': '⚕️',
      'medical': '💊',
      'education': '📚',
      'utilities': '💡',
      'rent': '🏠',
      'housing': '🏡',
      'insurance': '🛡️',
      'investment': '💰',
      'savings': '💵',
      'salary': '💼',
      'income': '💳',
      'debt': '📉',
      'loan': '🏦',
      'restaurant': '🍽️',
      'cafe': '☕',
      'coffee': '☕',
      'gas': '⛽',
      'fuel': '⛽',
      'clothing': '👕',
      'gym': '💪',
      'fitness': '🏋️',
      'phone': '📱',
      'internet': '🌐',
      'subscription': '📺',
      'gift': '🎁',
      'charity': '🤝',
      'pet': '🐾',
      'beauty': '💄',
      'personal': '👤',
      'other': '📁',
      'miscellaneous': '📦'
    };
    
    // Find matching icon
    for (const [key, icon] of Object.entries(iconMap)) {
      if (name.includes(key)) {
        return icon;
      }
    }
    
    // Default icon
    return '📁';
  }

  // ============================================
  // TEST CONNECTION
  // ============================================
  
  protected async testConnection(): Promise<void> {
    console.log('🔌 Testing database connection...');
    const result = await this.connectionTest.testConnection();
    
    this.testResult.set({
      success: result.success,
      message: result.message
    });
    this.showTestPopup.set(true);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.showTestPopup.set(false);
    }, 5000);
  }

  protected closeTestPopup(): void {
    this.showTestPopup.set(false);
  }

  // ============================================
  // ADD CATEGORY
  // ============================================
  
  protected openAddModal(): void {
    this.newCategoryName.set('');
    this.showAddModal.set(true);
  }

  protected closeAddModal(): void {
    this.showAddModal.set(false);
    this.newCategoryName.set('');
  }

  protected async addCategory(): Promise<void> {
    const name = this.newCategoryName().trim();
    
    if (!name) {
      alert('Please enter a category name');
      return;
    }

    this.isAdding.set(true);
    
    try {
      await this.categoryService.addCategory(name);
      this.closeAddModal();
    } catch (error: any) {
      console.error('Failed to add category:', error);
      alert(`Failed to add category: ${error.message}`);
    } finally {
      this.isAdding.set(false);
    }
  }

  // ============================================
  // EDIT CATEGORY
  // ============================================
  
  protected openEditModal(category: Category): void {
    this.editingCategory.set({ ...category });
    this.showEditModal.set(true);
  }

  protected closeEditModal(): void {
    this.showEditModal.set(false);
    this.editingCategory.set(null);
  }

  protected async updateCategory(): Promise<void> {
    const cat = this.editingCategory();
    if (!cat) return;

    const name = cat.category_name.trim();
    if (!name) {
      alert('Please enter a category name');
      return;
    }

    this.isEditing.set(true);
    
    try {
      await this.categoryService.updateCategory(cat.category_id, name);
      this.closeEditModal();
    } catch (error: any) {
      console.error('Failed to update category:', error);
      alert(`Failed to update category: ${error.message}`);
    } finally {
      this.isEditing.set(false);
    }
  }

  protected onEditNameChange(value: string): void {
    const cat = this.editingCategory();
    if (cat) {
      this.editingCategory.set({ ...cat, category_name: value });
    }
  }

  // ============================================
  // DELETE CATEGORY
  // ============================================
  
  protected openDeleteModal(category: Category): void {
    this.deletingCategory.set(category);
    this.showDeleteModal.set(true);
  }

  protected closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.deletingCategory.set(null);
  }

  protected async confirmDelete(): Promise<void> {
    const cat = this.deletingCategory();
    if (!cat) return;

    this.isDeleting.set(true);
    
    try {
      await this.categoryService.deleteCategory(cat.category_id);
      this.closeDeleteModal();
    } catch (error: any) {
      console.error('Failed to delete category:', error);
      alert(`Failed to delete category: ${error.message}`);
    } finally {
      this.isDeleting.set(false);
    }
  }
}