import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CategoryService, Category } from '../../services/category.service';
import { ErrorHandler } from '../../utils/error-handler.util';
import { 
  PaginationHelper, 
  SortingHelper, 
  IconMapper, 
  Status, 
  StatusHelper,
  ErrorPopupComponent,
  type ErrorType
} from '../../shared';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTooltipModule, ErrorPopupComponent],
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
  protected sortColumn = signal<'category_name' | 'sub_category' | 'created_at' | 'updated_at'>('category_name');
  protected sortDirection = signal<'asc' | 'desc'>('asc');
  protected currentPage = signal<number>(1);
  protected pageSize = signal<number>(10);
  protected readonly pageSizeOptions = PaginationHelper.PAGE_SIZE_OPTIONS;
  
  // Expose utilities to template
  protected readonly Status = Status;
  protected readonly StatusHelper = StatusHelper;
  
  // Expose Math to template
  protected Math = Math;
  
  // Modal states
  protected showAddModal = signal<boolean>(false);
  protected showEditModal = signal<boolean>(false);
  protected showDeleteModal = signal<boolean>(false);
  
  // Error modal state
  protected errorModal = {
    isOpen: signal<boolean>(false),
    title: signal<string>(''),
    message: signal<string>(''),
    details: signal<string>(''),
    type: signal<ErrorType>('error')
  };
  
  // Form data
  protected newCategoryName = signal<string>('');
  protected newSubCategoryName = signal<string>('');
  protected newCategoryIcon = signal<string>('');
  protected newSubCategoryIcon = signal<string>('');
  protected editingCategory = signal<Category | null>(null);
  protected deletingCategory = signal<Category | null>(null);
  
  // Operation loading states
  protected isAdding = signal<boolean>(false);
  protected isEditing = signal<boolean>(false);
  protected isDeleting = signal<boolean>(false);

  // Computed filtered categories - now shows ALL categories (active and deactivated)
  protected filtered = computed(() => {
    const searchQuery = this.query().trim().toLowerCase();
    const allCategories = this.categories();
    
    if (!searchQuery) return allCategories;
    
    return allCategories.filter(cat => 
      cat.category_name.toLowerCase().includes(searchQuery) ||
      cat.sub_category?.toLowerCase().includes(searchQuery)
    );
  });

  // Computed sorted categories using SortingHelper
  protected sorted = computed(() => {
    const cats = this.filtered();
    const col = this.sortColumn();
    const dir = this.sortDirection();
    
    return SortingHelper.sort(cats, col, dir);
  });

  // Computed total items
  protected totalItems = computed(() => this.sorted().length);

  // Computed paginated categories using PaginationHelper
  protected paginationResult = computed(() => {
    return PaginationHelper.paginate(
      this.sorted(),
      this.currentPage(),
      this.pageSize()
    );
  });
  
  protected paginated = computed(() => this.paginationResult().items);
  protected totalPages = computed(() => this.paginationResult().totalPages);
  protected paginationInfo = computed(() => 
    PaginationHelper.getPaginationInfo(this.paginationResult())
  );

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

  protected sortBy(column: 'category_name' | 'sub_category' | 'created_at' | 'updated_at'): void {
    if (this.sortColumn() === column) {
      // Toggle direction if same column
      this.sortDirection.set(SortingHelper.toggleDirection(this.sortDirection()));
    } else {
      // New column, default to ascending
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
    this.currentPage.set(1); // Reset to first page on sort
  }

  protected getSortIcon(column: 'category_name' | 'sub_category' | 'created_at' | 'updated_at'): string {
    return SortingHelper.getSortIcon(column, this.sortColumn(), this.sortDirection());
  }

  protected goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
  }

  protected nextPage(): void {
    if (PaginationHelper.canGoNext(this.currentPage(), this.totalPages())) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }

  protected prevPage(): void {
    if (PaginationHelper.canGoPrevious(this.currentPage())) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  protected getPageNumbers(): number[] {
    return PaginationHelper.getPageNumbers(
      this.currentPage(),
      this.totalPages()
    );
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
   * Show error popup (replaces alert)
   */
  private showError(title: string, message: string, details?: string, type: ErrorType = 'error'): void {
    this.errorModal.title.set(title);
    this.errorModal.message.set(message);
    this.errorModal.details.set(details || '');
    this.errorModal.type.set(type);
    this.errorModal.isOpen.set(true);
  }

  /**
   * Close error popup
   */
  protected closeErrorModal(): void {
    this.errorModal.isOpen.set(false);
  }

  /**
   * Get relevant icon for category based on name using IconMapper
   */
  protected getCategoryIcon(categoryName: string): string {
    return IconMapper.getIcon(categoryName);
  }

  // ============================================
  // ADD CATEGORY
  // ============================================
  
  protected openAddModal(): void {
    this.newCategoryName.set('');
    this.newSubCategoryName.set('');
    this.newCategoryIcon.set('');
    this.newSubCategoryIcon.set('');
    this.showAddModal.set(true);
  }

  protected closeAddModal(): void {
    this.showAddModal.set(false);
    this.newCategoryName.set('');
    this.newSubCategoryName.set('');
    this.newCategoryIcon.set('');
    this.newSubCategoryIcon.set('');
  }

  protected async addCategory(): Promise<void> {
    const name = this.newCategoryName().trim();
    const subCategory = this.newSubCategoryName().trim();
    const categoryIcon = this.newCategoryIcon().trim();
    const subcategoryIcon = this.newSubCategoryIcon().trim();
    
    if (!name) {
      this.showError(
        'Validation Error',
        'Category name is required.',
        'Please enter a valid category name before submitting.',
        'warning'
      );
      return;
    }

    this.isAdding.set(true);
    
    try {
      await this.categoryService.addCategory(
        name, 
        subCategory || undefined, 
        categoryIcon || undefined, 
        subcategoryIcon || undefined
      );
      this.closeAddModal();
      console.log('✅ Category added successfully:', name, subCategory || '(no subcategory)');
    } catch (error: any) {
      ErrorHandler.logError('Add Category', error);
      const errorResult = ErrorHandler.handleDatabaseError(error, 'add');
      this.showError(
        errorResult.title,
        errorResult.message,
        errorResult.details,
        'error'
      );
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
    const categoryIcon = cat.category_icon?.trim();
    const subcategoryIcon = cat.subcategory_icon?.trim();
    
    if (!name) {
      this.showError(
        'Validation Error',
        'Category name is required.',
        'Please enter a valid category name before submitting.',
        'warning'
      );
      return;
    }

    this.isEditing.set(true);
    
    try {
      await this.categoryService.updateCategory(
        cat.category_id, 
        name, 
        subCategory || undefined, 
        categoryIcon || undefined, 
        subcategoryIcon || undefined
      );
      this.closeEditModal();
      console.log('✅ Category updated successfully:', name, subCategory || '(no subcategory)');
    } catch (error: any) {
      ErrorHandler.logError('Update Category', error);
      const errorResult = ErrorHandler.handleDatabaseError(error, 'update');
      this.showError(
        errorResult.title,
        errorResult.message,
        errorResult.details,
        'error'
      );
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

  protected onEditCategoryIconChange(value: string): void {
    const cat = this.editingCategory();
    if (cat) {
      this.editingCategory.set({ ...cat, category_icon: value });
    }
  }

  protected onEditSubCategoryIconChange(value: string): void {
    const cat = this.editingCategory();
    if (cat) {
      this.editingCategory.set({ ...cat, subcategory_icon: value });
    }
  }

  // ============================================
  // DELETE CATEGORY (Soft Delete)
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
      console.log('✅ Category deactivated successfully:', cat.category_name);
    } catch (error: any) {
      ErrorHandler.logError('Delete Category', error);
      const errorResult = ErrorHandler.handleDatabaseError(error, 'delete');
      this.showError(
        errorResult.title,
        errorResult.message,
        errorResult.details,
        'error'
      );
    } finally {
      this.isDeleting.set(false);
    }
  }

  // ============================================
  // ACTIVATE CATEGORY
  // ============================================
  
  protected async activateCategory(category: Category): Promise<void> {
    if (category.is_active) return; // Already active

    try {
      await this.categoryService.activateCategory(category.category_id);
      console.log('✅ Category activated successfully:', category.category_name);
    } catch (error: any) {
      ErrorHandler.logError('Activate Category', error);
      const errorResult = ErrorHandler.handleDatabaseError(error, 'update');
      this.showError(
        errorResult.title,
        errorResult.message,
        errorResult.details,
        'error'
      );
    }
  }
}