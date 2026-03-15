/**
 * Table Configuration Helper
 * Reusable table configuration and utilities
 */

export interface TableColumn<T = any> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  cellClass?: string;
  headerClass?: string;
}

export interface TableConfig<T = any> {
  columns: TableColumn<T>[];
  sortable?: boolean;
  paginated?: boolean;
  searchable?: boolean;
  defaultPageSize?: number;
  pageSizeOptions?: readonly number[];
}

export class TableConfigHelper {
  /**
   * Default table configuration
   */
  static readonly DEFAULT_CONFIG: Partial<TableConfig> = {
    sortable: true,
    paginated: true,
    searchable: true,
    defaultPageSize: 10,
    pageSizeOptions: [10, 25, 50, 100]
  };

  /**
   * Create table configuration with defaults
   */
  static createConfig<T>(config: Partial<TableConfig<T>>): TableConfig<T> {
    return {
      ...this.DEFAULT_CONFIG,
      ...config,
      columns: config.columns || []
    } as TableConfig<T>;
  }

  /**
   * Get sortable columns
   */
  static getSortableColumns<T>(columns: TableColumn<T>[]): TableColumn<T>[] {
    return columns.filter(col => col.sortable !== false);
  }

  /**
   * Get column by key
   */
  static getColumn<T>(
    columns: TableColumn<T>[],
    key: keyof T
  ): TableColumn<T> | undefined {
    return columns.find(col => col.key === key);
  }

  /**
   * Get column label
   */
  static getColumnLabel<T>(
    columns: TableColumn<T>[],
    key: keyof T
  ): string {
    return this.getColumn(columns, key)?.label || String(key);
  }

  /**
   * Check if column is sortable
   */
  static isColumnSortable<T>(
    columns: TableColumn<T>[],
    key: keyof T
  ): boolean {
    const column = this.getColumn(columns, key);
    return column?.sortable !== false;
  }
}
