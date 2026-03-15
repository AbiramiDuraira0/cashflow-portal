/**
 * Pagination Helper
 * Reusable pagination logic for tables across the application
 */

export interface PaginationConfig {
  currentPage: number;
  pageSize: number;
  totalItems: number;
}

export interface PaginationResult<T> {
  items: T[];
  totalPages: number;
  currentPage: number;
  pageSize: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
}

export class PaginationHelper {
  /**
   * Default page size options
   */
  static readonly PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

  /**
   * Default page size
   */
  static readonly DEFAULT_PAGE_SIZE = 10;

  /**
   * Paginate an array of items
   */
  static paginate<T>(
    items: T[],
    currentPage: number,
    pageSize: number
  ): PaginationResult<T> {
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const validPage = Math.max(1, Math.min(currentPage, totalPages || 1));
    
    const startIndex = (validPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    const paginatedItems = items.slice(startIndex, endIndex);

    return {
      items: paginatedItems,
      totalPages,
      currentPage: validPage,
      pageSize,
      totalItems,
      startIndex: totalItems === 0 ? 0 : startIndex + 1,
      endIndex
    };
  }

  /**
   * Get page numbers to display in pagination controls
   * Shows first page, last page, and pages around current page
   */
  static getPageNumbers(currentPage: number, totalPages: number): number[] {
    const pages: number[] = [];
    
    if (totalPages <= 1) return [1];
    
    // Always show first page
    pages.push(1);
    
    // Show pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (!pages.includes(i)) pages.push(i);
    }
    
    // Always show last page
    if (totalPages > 1 && !pages.includes(totalPages)) {
      pages.push(totalPages);
    }
    
    return pages;
  }

  /**
   * Check if can go to next page
   */
  static canGoNext(currentPage: number, totalPages: number): boolean {
    return currentPage < totalPages;
  }

  /**
   * Check if can go to previous page
   */
  static canGoPrevious(currentPage: number): boolean {
    return currentPage > 1;
  }

  /**
   * Get pagination info text
   */
  static getPaginationInfo(config: PaginationConfig): string {
    const { currentPage, pageSize, totalItems } = config;
    
    if (totalItems === 0) {
      return 'No items to display';
    }
    
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalItems);
    
    return `Showing ${start} to ${end} of ${totalItems} entries`;
  }
}
