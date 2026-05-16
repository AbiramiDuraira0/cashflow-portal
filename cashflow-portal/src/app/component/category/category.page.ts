import { Component, OnInit, signal, computed, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService, Category } from '../../services/category.service';
import { ErrorHandler } from '../../utils/error-handler.util';
import { 
  PaginationHelper, 
  SortingHelper, 
  IconMapper, 
  Status, 
  StatusHelper,
  ErrorPopupComponent,
  IconStorageHelper,
  type ErrorType
} from '../../shared';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, FormsModule, ErrorPopupComponent],
  templateUrl: './category.page.html',
  styleUrls: ['./category.page.scss']
})
export class CategoryPage implements OnInit {
  private categoryService = inject(CategoryService);
  
  // ViewChild for auto-focus
  @ViewChild('categoryNameInput') categoryNameInput!: ElementRef<HTMLInputElement>;
  
  // Reactive signals
  protected categories = this.categoryService.getCategoriesSignal();
  protected loading = this.categoryService.getLoadingSignal();
  protected query = signal<string>('');
  
  // Sorting & Pagination
  protected sortColumn = signal<'category_name' | 'sub_category' | 'is_active' | 'created_at' | 'updated_at'>('category_name');
  protected sortDirection = signal<'asc' | 'desc'>('asc');
  protected secondarySortColumn = signal<'sub_category' | null>(null);
  protected secondarySortDirection = signal<'asc' | 'desc'>('asc');
  protected currentPage = signal<number>(1);
  protected pageSize = signal<number>(25);
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
  protected newNotes = signal<string>('');
  protected editingCategory = signal<Category | null>(null);
  protected editCategoryIcon = signal<string>('');
  protected editSubCategoryIcon = signal<string>('');
  protected editNotes = signal<string>('');
  protected deletingCategory = signal<Category | null>(null);
  
  // Icon picker states
  protected showCategoryIconPicker = signal<boolean>(false);
  protected showSubCategoryIconPicker = signal<boolean>(false);
  protected showEditCategoryIconPicker = signal<boolean>(false);
  protected showEditSubCategoryIconPicker = signal<boolean>(false);
  
  // All available icons
  protected filteredIcons = computed(() => {
    return IconMapper.getAllIcons();
  });

  // Grouped icons for organized dropdown display
  protected groupedIcons = computed(() => {
    return IconMapper.getGroupedIcons();
  });
  
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
      cat.sub_category?.toLowerCase().includes(searchQuery) ||
      cat.notes?.toLowerCase().includes(searchQuery)
    );
  });

  // Computed sorted categories using SortingHelper with multi-level sorting
  protected sorted = computed(() => {
    const cats = this.filtered();
    const col = this.sortColumn();
    const dir = this.sortDirection();
    const secondaryCol = this.secondarySortColumn();
    const secondaryDir = this.secondarySortDirection();
    
    // Primary sort
    let sorted = SortingHelper.sort(cats, col, dir);
    
    // Apply secondary sort if enabled (only for category_name primary sort)
    if (col === 'category_name' && secondaryCol === 'sub_category') {
      sorted = this.applySecondarySort(sorted, secondaryDir);
    }
    
    // Move inactive categories to the end
    const activeCategories = sorted.filter(cat => cat.is_active);
    const inactiveCategories = sorted.filter(cat => !cat.is_active);
    
    return [...activeCategories, ...inactiveCategories];
  });

  /**
   * Apply secondary sorting on subcategory while maintaining category grouping
   */
  private applySecondarySort(categories: Category[], direction: 'asc' | 'desc'): Category[] {
    // Group by category name
    const grouped = new Map<string, Category[]>();
    
    categories.forEach(cat => {
      const key = cat.category_name;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(cat);
    });
    
    // Sort each group by sub_category
    const result: Category[] = [];
    grouped.forEach(group => {
      const sorted = group.sort((a, b) => {
        const aVal = (a.sub_category || '').toLowerCase();
        const bVal = (b.sub_category || '').toLowerCase();
        const comparison = aVal.localeCompare(bVal);
        return direction === 'asc' ? comparison : -comparison;
      });
      result.push(...sorted);
    });
    
    return result;
  }

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

  protected async refreshData(): Promise<void> {
    await this.loadCategories();
  }

  protected onSearchChange(value: string): void {
    this.query.set(value);
    this.currentPage.set(1); // Reset to first page on search
  }

  protected onPageSizeChange(): void {
    this.currentPage.set(1); // Reset to first page when changing page size
  }

  protected sortBy(column: 'category_name' | 'sub_category' | 'is_active' | 'created_at' | 'updated_at'): void {
    const currentPrimary = this.sortColumn();
    const currentSecondary = this.secondarySortColumn();
    
    // If clicking on sub_category and category_name is already primary sort
    if (column === 'sub_category' && currentPrimary === 'category_name') {
      if (currentSecondary === 'sub_category') {
        // Toggle secondary sort direction
        this.secondarySortDirection.set(SortingHelper.toggleDirection(this.secondarySortDirection()));
      } else {
        // Enable secondary sort
        this.secondarySortColumn.set('sub_category');
        this.secondarySortDirection.set('asc');
      }
    }
    // If clicking on category_name
    else if (column === 'category_name') {
      if (currentPrimary === 'category_name') {
        // Toggle primary sort direction
        this.sortDirection.set(SortingHelper.toggleDirection(this.sortDirection()));
      } else {
        // Set as new primary sort, reset secondary
        this.sortColumn.set('category_name');
        this.sortDirection.set('asc');
        this.secondarySortColumn.set(null);
      }
    }
    // Any other column
    else {
      if (this.sortColumn() === column) {
        // Toggle direction if same column
        this.sortDirection.set(SortingHelper.toggleDirection(this.sortDirection()));
      } else {
        // New column, default to ascending, clear secondary sort
        this.sortColumn.set(column);
        this.sortDirection.set('asc');
        this.secondarySortColumn.set(null);
      }
    }
    
    this.currentPage.set(1); // Reset to first page on sort
  }

  protected getSortIcon(column: 'category_name' | 'sub_category' | 'is_active' | 'created_at' | 'updated_at'): string {
    const isPrimary = this.sortColumn() === column;
    const isSecondary = this.secondarySortColumn() === column;
    
    if (isPrimary) {
      return SortingHelper.getSortIcon(column, this.sortColumn(), this.sortDirection());
    }
    
    if (isSecondary && column === 'sub_category') {
      // Show secondary sort indicator (smaller/different style)
      return this.secondarySortDirection() === 'asc' ? '▲²' : '▼²';
    }
    
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
   * Get relevant icon for category based on name or database value
   * Priority: 1) Database icon, 2) localStorage, 3) IconMapper auto-generation
   */
  protected getCategoryIcon(categoryName: string, dbIcon?: string | null): string {
    // First check database icon
    if (dbIcon) {
      return dbIcon;
    }
    // Then check if user has selected a custom icon (stored in localStorage)
    const customIcon = IconStorageHelper.getIcon(categoryName);
    if (customIcon) {
      return customIcon;
    }
    // Fall back to auto-generated icon
    return IconMapper.getIcon(categoryName);
  }

  // ============================================
  // ICON PICKER METHODS
  // ============================================

  protected toggleCategoryIconPicker(): void {
    this.showCategoryIconPicker.update(v => !v);
    if (this.showCategoryIconPicker()) {
      this.showSubCategoryIconPicker.set(false);
      this.showEditCategoryIconPicker.set(false);
      this.showEditSubCategoryIconPicker.set(false);
    }
  }

  protected toggleSubCategoryIconPicker(): void {
    this.showSubCategoryIconPicker.update(v => !v);
    if (this.showSubCategoryIconPicker()) {
      this.showCategoryIconPicker.set(false);
      this.showEditCategoryIconPicker.set(false);
      this.showEditSubCategoryIconPicker.set(false);
    }
  }

  protected toggleEditCategoryIconPicker(): void {
    this.showEditCategoryIconPicker.update(v => !v);
    if (this.showEditCategoryIconPicker()) {
      this.showCategoryIconPicker.set(false);
      this.showSubCategoryIconPicker.set(false);
      this.showEditSubCategoryIconPicker.set(false);
    }
  }

  protected toggleEditSubCategoryIconPicker(): void {
    this.showEditSubCategoryIconPicker.update(v => !v);
    if (this.showEditSubCategoryIconPicker()) {
      this.showCategoryIconPicker.set(false);
      this.showSubCategoryIconPicker.set(false);
      this.showEditCategoryIconPicker.set(false);
    }
  }

  protected selectCategoryIcon(icon: string): void {
    this.newCategoryIcon.set(icon);
    this.showCategoryIconPicker.set(false);
  }

  protected selectSubCategoryIcon(icon: string): void {
    this.newSubCategoryIcon.set(icon);
    this.showSubCategoryIconPicker.set(false);
  }

  protected selectEditCategoryIcon(icon: string): void {
    this.editCategoryIcon.set(icon);
    this.showEditCategoryIconPicker.set(false);
  }

  protected selectEditSubCategoryIcon(icon: string): void {
    this.editSubCategoryIcon.set(icon);
    this.showEditSubCategoryIconPicker.set(false);
  }

  // ============================================
  // ADD CATEGORY
  // ============================================
  
  protected openAddModal(): void {
    this.newCategoryName.set('');
    this.newSubCategoryName.set('');
    this.newCategoryIcon.set('');
    this.newSubCategoryIcon.set('');
    this.newNotes.set('');
    this.showAddModal.set(true);
    
    // Auto-focus on category name input
    setTimeout(() => {
      this.categoryNameInput?.nativeElement?.focus();
    }, 100);
  }

  protected duplicateCategory(category: Category): void {
    // Pre-fill the add modal with the selected category's data
    this.newCategoryName.set(category.category_name);
    this.newSubCategoryName.set(category.sub_category || '');
    this.newCategoryIcon.set(category.category_icon || '');
    this.newSubCategoryIcon.set(category.subcategory_icon || '');
    this.newNotes.set(category.notes || '');
    this.showAddModal.set(true);
  }

  protected closeAddModal(): void {
    this.showAddModal.set(false);
    this.newCategoryName.set('');
    this.newSubCategoryName.set('');
    this.newCategoryIcon.set('');
    this.newSubCategoryIcon.set('');
    this.newNotes.set('');
  }

  protected onAddModalKeyDown(event: KeyboardEvent): void {
    // Handle Enter key to submit form
    if (event.key === 'Enter' && !event.shiftKey) {
      // Allow Shift+Enter in textarea for new lines
      const target = event.target as HTMLElement;
      if (target.tagName !== 'TEXTAREA') {
        event.preventDefault();
        this.addCategory();
      }
    }
    
    // Handle Escape key to close modal
    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeAddModal();
    }
  }

  protected async addCategory(): Promise<void> {
    const name = this.newCategoryName().trim();
    const subCategory = this.newSubCategoryName().trim();
    const categoryIcon = this.newCategoryIcon() || IconMapper.getIcon(name);
    const subcategoryIcon = subCategory ? (this.newSubCategoryIcon() || IconMapper.getIcon(subCategory)) : undefined;
    const notes = this.newNotes().trim();
    
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
      // Add the category with icons and notes
      await this.categoryService.addCategory(
        name,
        categoryIcon,
        subCategory || undefined,
        subcategoryIcon,
        notes || undefined
      );
      
      // Update ALL existing records with the same category name to have the same icon
      await this.categoryService.updateCategoryIconByName(name, categoryIcon);
      
      // Update ALL existing records with the same subcategory name to have the same icon
      if (subCategory && subcategoryIcon) {
        await this.categoryService.updateSubcategoryIconByName(subCategory, subcategoryIcon);
      }
      
      this.closeAddModal();
      console.log('✅ Category added successfully with consistent icons across all records');
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
    this.editCategoryIcon.set(''); // Reset to show auto-generated icon
    this.editSubCategoryIcon.set(''); // Reset to show auto-generated icon
    this.editNotes.set(category.notes || ''); // Load existing notes
    this.showEditModal.set(true);
  }

  protected closeEditModal(): void {
    this.showEditModal.set(false);
    this.editingCategory.set(null);
    this.editCategoryIcon.set('');
    this.editSubCategoryIcon.set('');
    this.editNotes.set('');
  }

  protected async updateCategory(): Promise<void> {
    const cat = this.editingCategory();
    if (!cat) return;

    const name = cat.category_name.trim();
    const subCategory = cat.sub_category?.trim();
    const oldName = this.categories().find(c => c.category_id === cat.category_id)?.category_name;
    const oldSubCategory = this.categories().find(c => c.category_id === cat.category_id)?.sub_category;
    
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
      const categoryIcon = this.editCategoryIcon() || cat.category_icon || IconMapper.getIcon(name);
      const subcategoryIcon = subCategory ? (this.editSubCategoryIcon() || cat.subcategory_icon || IconMapper.getIcon(subCategory)) : undefined;
      const notes = this.editNotes().trim();
      
      // First update this specific record
      await this.categoryService.updateCategory(
        cat.category_id, 
        name,
        categoryIcon,
        subCategory || undefined,
        subcategoryIcon,
        notes || undefined
      );
      
      // Then update ALL records with the same category name to have consistent icons
      if (categoryIcon && (this.editCategoryIcon() || oldName !== name)) {
        await this.categoryService.updateCategoryIconByName(name, categoryIcon);
      }
      
      // Update ALL records with the same subcategory name to have consistent icons
      if (subCategory && subcategoryIcon && (this.editSubCategoryIcon() || oldSubCategory !== subCategory)) {
        await this.categoryService.updateSubcategoryIconByName(subCategory, subcategoryIcon);
      }
      
      this.closeEditModal();
      console.log('✅ Category and all matching records updated successfully with consistent icons');
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