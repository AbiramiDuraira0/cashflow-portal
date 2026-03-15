/**
 * Sorting Helper
 * Reusable sorting logic for tables across the application
 */

export type SortDirection = 'asc' | 'desc';

export interface SortConfig<T = any> {
  column: keyof T;
  direction: SortDirection;
}

export interface SortableColumn {
  key: string;
  label: string;
  sortable: boolean;
}

export class SortingHelper {
  /**
   * Sort array by column and direction
   */
  static sort<T>(
    items: T[],
    column: keyof T,
    direction: SortDirection
  ): T[] {
    return [...items].sort((a, b) => {
      const valA = a[column];
      const valB = b[column];

      // Handle null/undefined
      if (valA == null && valB == null) return 0;
      if (valA == null) return direction === 'asc' ? 1 : -1;
      if (valB == null) return direction === 'asc' ? -1 : 1;

      // String comparison (case-insensitive)
      if (typeof valA === 'string' && typeof valB === 'string') {
        const comparison = valA.toLowerCase().localeCompare(valB.toLowerCase());
        return direction === 'asc' ? comparison : -comparison;
      }

      // Date comparison
      if (valA instanceof Date && valB instanceof Date) {
        const comparison = valA.getTime() - valB.getTime();
        return direction === 'asc' ? comparison : -comparison;
      }

      // Numeric comparison
      if (typeof valA === 'number' && typeof valB === 'number') {
        return direction === 'asc' ? valA - valB : valB - valA;
      }

      // Default comparison
      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /**
   * Toggle sort direction
   */
  static toggleDirection(currentDirection: SortDirection): SortDirection {
    return currentDirection === 'asc' ? 'desc' : 'asc';
  }

  /**
   * Get sort icon based on column and current sort config
   */
  static getSortIcon(
    column: string,
    currentColumn: string,
    currentDirection: SortDirection
  ): string {
    if (column !== currentColumn) {
      return '↕️'; // Unsorted
    }
    return currentDirection === 'asc' ? '↑' : '↓';
  }

  /**
   * Check if column is currently sorted
   */
  static isColumnSorted(column: string, currentColumn: string): boolean {
    return column === currentColumn;
  }

  /**
   * Create sort function for use with Array.sort()
   */
  static createSortFn<T>(
    column: keyof T,
    direction: SortDirection
  ): (a: T, b: T) => number {
    return (a: T, b: T) => {
      const valA = a[column];
      const valB = b[column];

      if (valA == null && valB == null) return 0;
      if (valA == null) return direction === 'asc' ? 1 : -1;
      if (valB == null) return direction === 'asc' ? -1 : 1;

      if (typeof valA === 'string' && typeof valB === 'string') {
        const comparison = valA.toLowerCase().localeCompare(valB.toLowerCase());
        return direction === 'asc' ? comparison : -comparison;
      }

      if (valA instanceof Date && valB instanceof Date) {
        const comparison = valA.getTime() - valB.getTime();
        return direction === 'asc' ? comparison : -comparison;
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return direction === 'asc' ? valA - valB : valB - valA;
      }

      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    };
  }
}
