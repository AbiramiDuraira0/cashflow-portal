import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CategoryService, Category } from '../../services/category.service';
import { ErrorHandler } from '../../utils/error-handler.util';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTooltipModule],
  templateUrl: './category.page.html',
  styleUrls: ['./category.page.scss']
})
export class CategoryPage implements OnInit {
  private categoryService = inject(CategoryService);
  
  // Reactive signals
  protected categories = this.categoryService.getCategoriesSignal();
  protected loading = this.categoryService.getLoadingSignal();
  protected query = signal<string>('');
  
  // Sorting & Pagination
  protected sortColumn = signal<'name' | 'created' | 'updated'>('name');
  protected sortDirection = signal<'asc' | 'desc'>('asc');
  protected currentPage = signal<number>(1);
  protected pageSize = signal<number>(10);
  
  // Expose Math to template
  protected Math = Math;
  
  // Modal states
  protected showAddModal = signal<boolean>(false);
  protected showEditModal = signal<boolean>(false);
  protected showDeleteModal = signal<boolean>(false);
  protected showErrorModal = signal<boolean>(false);
  
  // Error modal data
  protected errorTitle = signal<string>('');
  protected errorMessage = signal<string>('');
  protected errorDetails = signal<string>('');
  protected errorIcon = signal<string>('⚠️');
  
  // Form data
  protected newCategoryName = signal<string>('');
  protected newSubCategoryName = signal<string>('');
  protected editingCategory = signal<Category | null>(null);
  protected deletingCategory = signal<Category | null>(null);
  
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
      cat.category_name.toLowerCase().includes(searchQuery) ||
      cat.sub_category?.toLowerCase().includes(searchQuery)
    );
  });

  // Computed sorted categories
  protected sorted = computed(() => {
    const cats = [...this.filtered()];
    const col = this.sortColumn();
    const dir = this.sortDirection();
    
    return cats.sort((a, b) => {
      let valA: string | Date;
      let valB: string | Date;
      
      switch (col) {
        case 'name':
          valA = a.category_name.toLowerCase();
          valB = b.category_name.toLowerCase();
          break;
        case 'created':
          valA = new Date(a.created_at);
          valB = new Date(b.created_at);
          break;
        case 'updated':
          valA = new Date(a.updated_at);
          valB = new Date(b.updated_at);
          break;
        default:
          return 0;
      }
      
      if (valA < valB) return dir === 'asc' ? -1 : 1;
      if (valA > valB) return dir === 'asc' ? 1 : -1;
      return 0;
    });
  });

  // Computed total items
  protected totalItems = computed(() => this.sorted().length);

  // Computed paginated categories
  protected paginated = computed(() => {
    const sorted = this.sorted();
    const page = this.currentPage();
    const perPage = this.pageSize();
    const start = (page - 1) * perPage;
    const end = start + perPage;
    
    return sorted.slice(start, end);
  });

  // Computed total pages
  protected totalPages = computed(() => {
    return Math.ceil(this.sorted().length / this.pageSize());
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
    this.currentPage.set(1); // Reset to first page on search
  }

  protected onPageSizeChange(): void {
    this.currentPage.set(1); // Reset to first page when changing page size
  }

  protected sortBy(column: 'name' | 'created' | 'updated'): void {
    if (this.sortColumn() === column) {
      // Toggle direction if same column
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to ascending
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
    this.currentPage.set(1); // Reset to first page on sort
  }

  protected getSortIcon(column: 'name' | 'created' | 'updated'): string {
    if (this.sortColumn() !== column) return '↕️';
    return this.sortDirection() === 'asc' ? '↑' : '↓';
  }

  protected goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
  }

  protected nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }

  protected prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  protected getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    
    // Always show first page
    pages.push(1);
    
    // Show pages around current page
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      if (!pages.includes(i)) pages.push(i);
    }
    
    // Always show last page
    if (total > 1 && !pages.includes(total)) {
      pages.push(total);
    }
    
    return pages;
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
    
    // Enhanced map with comprehensive keywords and better icons
    const iconMap: Record<string, string> = {
      // Food & Dining
      'food': '🍔',
      'groceries': '🛒',
      'grocery': '🛒',
      'supermarket': '🛒',
      'restaurant': '🍽️',
      'dining': '🍽️',
      'cafe': '☕',
      'coffee': '☕',
      'breakfast': '🍳',
      'lunch': '🍱',
      'dinner': '🍽️',
      'snack': '🍿',
      'drink': '🥤',
      'beverage': '🥤',
      
      // Transportation
      'transport': '🚗',
      'transportation': '🚗',
      'travel': '✈️',
      'car': '🚗',
      'vehicle': '🚗',
      'gas': '⛽',
      'fuel': '⛽',
      'petrol': '⛽',
      'parking': '🅿️',
      'taxi': '🚕',
      'uber': '🚕',
      'bus': '🚌',
      'train': '🚆',
      'flight': '✈️',
      'metro': '🚇',
      
      // Entertainment & Leisure
      'entertainment': '🎬',
      'movie': '🎬',
      'cinema': '🎬',
      'music': '🎵',
      'game': '🎮',
      'gaming': '🎮',
      'sport': '⚽',
      'sports': '⚽',
      'hobby': '🎨',
      'book': '📚',
      'reading': '📖',
      
      // Shopping
      'shopping': '🛍️',
      'clothing': '👕',
      'clothes': '👕',
      'fashion': '👗',
      'shoes': '👟',
      'accessories': '👜',
      'electronics': '💻',
      'gadget': '📱',
      
      // Health & Wellness
      'health': '🏥',
      'healthcare': '🏥',
      'medical': '💊',
      'medicine': '💊',
      'doctor': '👨‍⚕️',
      'hospital': '🏥',
      'pharmacy': '💊',
      'dental': '🦷',
      'gym': '💪',
      'fitness': '🏋️',
      'yoga': '🧘',
      'wellness': '�',
      
      // Home & Living
      'rent': '🏠',
      'housing': '🏡',
      'home': '🏠',
      'apartment': '🏢',
      'utilities': '💡',
      'electricity': '⚡',
      'water': '💧',
      'internet': '�',
      'wifi': '📶',
      'phone': '📱',
      'mobile': '📱',
      'maintenance': '🔧',
      'repair': '🔨',
      'furniture': '🛋️',
      'appliance': '🔌',
      
      // Bills & Services
      'bill': '📄',
      'subscription': '📺',
      'streaming': '📺',
      'netflix': '📺',
      'spotify': '�',
      'insurance': '🛡️',
      'tax': '💰',
      'fees': '💳',
      
      // Financial
      'investment': '�',
      'savings': '�',
      'salary': '💼',
      'income': '�',
      'wage': '💼',
      'bonus': '🎁',
      'debt': '📉',
      'loan': '🏦',
      'bank': '🏦',
      'credit': '💳',
      'payment': '💳',
      
      // Education
      'education': '📚',
      'school': '🎓',
      'college': '🎓',
      'university': '🎓',
      'course': '📖',
      'tuition': '�',
      'learning': '�',
      'training': '📚',
      
      // Personal Care
      'beauty': '💄',
      'cosmetic': '💄',
      'salon': '�',
      'haircut': '💇',
      'spa': '💆',
      'personal': '👤',
      'hygiene': '🧴',
      
      // Family & Kids
      'child': '👶',
      'kids': '👶',
      'baby': '👶',
      'family': '👨‍👩‍👧‍👦',
      'daycare': '👶',
      'toy': '🧸',
      
      // Pets
      'pet': '🐾',
      'dog': '🐕',
      'cat': '🐈',
      'veterinary': '�',
      'vet': '🏥',
      
      // Social
      'gift': '🎁',
      'charity': '🤝',
      'donation': '❤️',
      'party': '🎉',
      'event': '🎊',
      'wedding': '�',
      'birthday': '🎂',
      
      // Work & Business
      'business': '💼',
      'office': '🏢',
      'work': '💼',
      'meeting': '�',
      'conference': '🎤',
      
      // Miscellaneous
      'other': '�',
      'miscellaneous': '📦',
      'general': '📋',
      'misc': '📦',
      'emergency': '🚨'
    };
    
    // Find matching icon (check if any keyword is in the category name)
    for (const [key, icon] of Object.entries(iconMap)) {
      if (name.includes(key)) {
        return icon;
      }
    }
    
    // Enhanced default: try to guess based on common patterns
    if (name.match(/expense|cost|spend/)) return '💸';
    if (name.match(/save|saving/)) return '💰';
    if (name.match(/earn|revenue/)) return '💵';
    
    // Fallback to a more generic icon
    return '�';
  }

  // ============================================
  // ADD CATEGORY
  // ============================================
  
  protected openAddModal(): void {
    this.newCategoryName.set('');
    this.newSubCategoryName.set('');
    this.showAddModal.set(true);
  }

  protected closeAddModal(): void {
    this.showAddModal.set(false);
    this.newCategoryName.set('');
    this.newSubCategoryName.set('');
  }

  protected async addCategory(): Promise<void> {
    const name = this.newCategoryName().trim();
    const subCategory = this.newSubCategoryName().trim();
    
    if (!name) {
      alert('⚠️ Validation Error\n\nCategory name is required.\n\nPlease enter a valid category name.');
      return;
    }

    this.isAdding.set(true);
    
    try {
      await this.categoryService.addCategory(name, subCategory || undefined);
      this.closeAddModal();
      console.log('✅ Category added successfully:', name, subCategory || '(no subcategory)');
    } catch (error: any) {
      ErrorHandler.logError('Add Category', error);
      const errorMessage = ErrorHandler.getAlertMessage(error, 'add');
      alert(errorMessage);
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
    const subCategory = cat.sub_category?.trim();
    
    if (!name) {
      alert('⚠️ Validation Error\n\nCategory name is required.\n\nPlease enter a valid category name.');
      return;
    }

    this.isEditing.set(true);
    
    try {
      await this.categoryService.updateCategory(cat.category_id, name, subCategory || undefined);
      this.closeEditModal();
      console.log('✅ Category updated successfully:', name, subCategory || '(no subcategory)');
    } catch (error: any) {
      ErrorHandler.logError('Update Category', error);
      const errorMessage = ErrorHandler.getAlertMessage(error, 'update');
      alert(errorMessage);
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

  protected onEditSubCategoryChange(value: string): void {
    const cat = this.editingCategory();
    if (cat) {
      this.editingCategory.set({ ...cat, sub_category: value });
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
      console.log('✅ Category deleted successfully:', cat.category_name);
    } catch (error: any) {
      ErrorHandler.logError('Delete Category', error);
      const errorMessage = ErrorHandler.getAlertMessage(error, 'delete');
      alert(errorMessage);
    } finally {
      this.isDeleting.set(false);
    }
  }
}