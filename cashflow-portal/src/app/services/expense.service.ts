import { Injectable, signal, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { CategoryService, Category } from './category.service';
import { IncomeService } from './income.service';
import { ExpenseAuditService } from './expense-audit.service';
import { MOCK_EXPENSE_DATA } from './mock-data';

// ============================================
// Database Expense Entry Type (matches DB schema)
// ============================================

export type DbExpenseEntry = {
  expense_id: number;
  month: string;
  year: number;
  category_id: number;
  category_name: string;
  category_icon: string | null;
  sub_category: string | null;
  subcategory_icon: string | null;
  amount_inr: number;
  notes: string | null;
  is_delete: boolean;
  created_at: string;
  updated_at: string;
};

// ============================================
// Application Expense Entry Type (for UI)
// ============================================

export type ExpenseEntry = {
  id: number;
  month: string;           // January, February, etc.
  year: number;
  categoryId: number;
  categoryName: string;
  categoryIcon?: string;
  subcategory?: string;
  subcategoryIcon?: string;
  amount: number;
  notes?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ExpenseFormData = {
  month: string;
  year: number;
  categoryId: number;
  amount: number;
  notes?: string;
};

export type MonthlySummary = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
};

// ============================================
// Mock Data (used until DB table is created)
// ============================================

const MOCK_EXPENSES: ExpenseEntry[] = [
  {
    id: 1, month: 'March', year: 2026,
    categoryId: 1, categoryName: 'Rent', categoryIcon: '🏠',
    subcategory: 'Monthly Rent', subcategoryIcon: '🏡',
    amount: 15000, notes: 'March rent payment',
    isDeleted: false, createdAt: '2026-03-01T10:00:00Z', updatedAt: '2026-03-01T10:00:00Z'
  },
  {
    id: 2, month: 'March', year: 2026,
    categoryId: 2, categoryName: 'Groceries', categoryIcon: '🛒',
    subcategory: 'Vegetables', subcategoryIcon: '🥬',
    amount: 2500, notes: 'Weekly vegetables',
    isDeleted: false, createdAt: '2026-03-02T11:00:00Z', updatedAt: '2026-03-02T11:00:00Z'
  },
  {
    id: 3, month: 'March', year: 2026,
    categoryId: 3, categoryName: 'Transport', categoryIcon: '🚗',
    subcategory: 'Fuel', subcategoryIcon: '⛽',
    amount: 3000, notes: 'Petrol filling',
    isDeleted: false, createdAt: '2026-03-05T09:00:00Z', updatedAt: '2026-03-05T09:00:00Z'
  },
  {
    id: 4, month: 'March', year: 2026,
    categoryId: 4, categoryName: 'Utilities', categoryIcon: '💡',
    subcategory: 'Electricity', subcategoryIcon: '⚡',
    amount: 1800, notes: 'EB bill March',
    isDeleted: false, createdAt: '2026-03-08T14:00:00Z', updatedAt: '2026-03-08T14:00:00Z'
  },
  {
    id: 5, month: 'March', year: 2026,
    categoryId: 5, categoryName: 'Food', categoryIcon: '🍔',
    subcategory: 'Dining Out', subcategoryIcon: '🍽️',
    amount: 1200, notes: 'Weekend dinner',
    isDeleted: false, createdAt: '2026-03-10T20:00:00Z', updatedAt: '2026-03-10T20:00:00Z'
  },
  {
    id: 6, month: 'March', year: 2026,
    categoryId: 6, categoryName: 'Health', categoryIcon: '🏥',
    subcategory: 'Medicine', subcategoryIcon: '💊',
    amount: 800, notes: 'Monthly medicines',
    isDeleted: false, createdAt: '2026-03-12T10:00:00Z', updatedAt: '2026-03-12T10:00:00Z'
  },
  {
    id: 7, month: 'March', year: 2026,
    categoryId: 2, categoryName: 'Groceries', categoryIcon: '🛒',
    subcategory: 'Fruits', subcategoryIcon: '🍎',
    amount: 1500, notes: 'Weekly fruits',
    isDeleted: false, createdAt: '2026-03-15T11:30:00Z', updatedAt: '2026-03-15T11:30:00Z'
  },
  {
    id: 8, month: 'March', year: 2026,
    categoryId: 7, categoryName: 'Entertainment', categoryIcon: '🎬',
    subcategory: 'Movies', subcategoryIcon: '🎥',
    amount: 600, notes: 'Movie tickets',
    isDeleted: false, createdAt: '2026-03-18T18:00:00Z', updatedAt: '2026-03-18T18:00:00Z'
  },
  {
    id: 9, month: 'March', year: 2026,
    categoryId: 4, categoryName: 'Utilities', categoryIcon: '💡',
    subcategory: 'Internet', subcategoryIcon: '📡',
    amount: 999, notes: 'Broadband bill',
    isDeleted: false, createdAt: '2026-03-20T10:00:00Z', updatedAt: '2026-03-20T10:00:00Z'
  },
  {
    id: 10, month: 'March', year: 2026,
    categoryId: 8, categoryName: 'Shopping', categoryIcon: '🛍️',
    subcategory: 'Clothing', subcategoryIcon: '👕',
    amount: 3500, notes: 'New shirts',
    isDeleted: false, createdAt: '2026-03-22T15:00:00Z', updatedAt: '2026-03-22T15:00:00Z'
  },
  // February entries
  {
    id: 11, month: 'February', year: 2026,
    categoryId: 1, categoryName: 'Rent', categoryIcon: '🏠',
    subcategory: 'Monthly Rent', subcategoryIcon: '🏡',
    amount: 15000, notes: 'Feb rent',
    isDeleted: false, createdAt: '2026-02-01T10:00:00Z', updatedAt: '2026-02-01T10:00:00Z'
  },
  {
    id: 12, month: 'February', year: 2026,
    categoryId: 2, categoryName: 'Groceries', categoryIcon: '🛒',
    subcategory: 'Vegetables', subcategoryIcon: '🥬',
    amount: 2200, notes: 'Weekly groceries',
    isDeleted: false, createdAt: '2026-02-05T11:00:00Z', updatedAt: '2026-02-05T11:00:00Z'
  },
  {
    id: 13, month: 'February', year: 2026,
    categoryId: 3, categoryName: 'Transport', categoryIcon: '🚗',
    subcategory: 'Fuel', subcategoryIcon: '⛽',
    amount: 2800, notes: 'Petrol',
    isDeleted: false, createdAt: '2026-02-10T09:00:00Z', updatedAt: '2026-02-10T09:00:00Z'
  },
  {
    id: 14, month: 'February', year: 2026,
    categoryId: 5, categoryName: 'Food', categoryIcon: '🍔',
    subcategory: 'Dining Out', subcategoryIcon: '🍽️',
    amount: 1500, notes: 'Valentine dinner',
    isDeleted: false, createdAt: '2026-02-15T20:00:00Z', updatedAt: '2026-02-15T20:00:00Z'
  },
  // January entries
  {
    id: 15, month: 'January', year: 2026,
    categoryId: 1, categoryName: 'Rent', categoryIcon: '🏠',
    subcategory: 'Monthly Rent', subcategoryIcon: '🏡',
    amount: 15000, notes: 'Jan rent',
    isDeleted: false, createdAt: '2026-01-01T10:00:00Z', updatedAt: '2026-01-01T10:00:00Z'
  },
  {
    id: 16, month: 'January', year: 2026,
    categoryId: 2, categoryName: 'Groceries', categoryIcon: '🛒',
    subcategory: 'Vegetables', subcategoryIcon: '🥬',
    amount: 3000, notes: 'New year groceries',
    isDeleted: false, createdAt: '2026-01-10T11:00:00Z', updatedAt: '2026-01-10T11:00:00Z'
  },
];

// ============================================
// Service
// ============================================

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private supabase = inject(SupabaseService);
  private categoryService = inject(CategoryService);
  private incomeService = inject(IncomeService);
  private auditService = inject(ExpenseAuditService);

  // Reactive state (same pattern as IncomeService)
  private expenseData = signal<ExpenseEntry[]>([]);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);

  // Flag: set to true once the 'expense' table exists in Supabase
  // For now, false → uses mock data
  // Set to false for QA environment with static demo data
  private readonly USE_DB = false;

  private nextMockId = 100;

  constructor() {
    // Auto-load on service initialization (same as IncomeService)
    // Don't await in constructor - let component control the loading
    this.loadExpenseData().catch(err => {
      console.error('❌ Failed to auto-load expenses in constructor:', err);
    });
  }

  // ============================================
  // Year-Based Table Name Helper
  // ============================================

  /**
   * Get the table name for a specific year
   * Tables: expense_2021, expense_2022, expense_2023, expense_2024, expense_2025, expense_2026
   */
  private getTableNameForYear(year: number): string {
    // Supported years: 2021-2026
    if (year >= 2021 && year <= 2026) {
      return `expense_${year}`;
    }
    // Default to current year table if outside range
    console.warn(`⚠️ Year ${year} outside supported range (2021-2026). Using expense_2026.`);
    return 'expense_2026';
  }

  // ============================================
  // Public Signals (same pattern as IncomeService)
  // ============================================

  getExpensesSignal() {
    return this.expenseData;
  }

  getLoadingSignal() {
    return this.loading;
  }

  getErrorSignal() {
    return this.error;
  }

  // ============================================
  // DB ↔ App Type Transformers
  // (same pattern as IncomeService)
  // ============================================

  private transformDbToApp(dbEntry: DbExpenseEntry): ExpenseEntry {
    return {
      id: dbEntry.expense_id,
      month: dbEntry.month,
      year: dbEntry.year,
      categoryId: dbEntry.category_id,
      categoryName: dbEntry.category_name,
      categoryIcon: dbEntry.category_icon || undefined,
      subcategory: dbEntry.sub_category || undefined,
      subcategoryIcon: dbEntry.subcategory_icon || undefined,
      amount: Number(dbEntry.amount_inr),
      notes: dbEntry.notes || undefined,
      isDeleted: dbEntry.is_delete,
      createdAt: dbEntry.created_at,
      updatedAt: dbEntry.updated_at
    };
  }

  private transformAppToDb(appEntry: Partial<ExpenseEntry>): Partial<DbExpenseEntry> {
    const dbEntry: any = {};

    if (appEntry.month !== undefined) dbEntry.month = appEntry.month;
    if (appEntry.year !== undefined) dbEntry.year = appEntry.year;
    if (appEntry.categoryId !== undefined) dbEntry.category_id = appEntry.categoryId;
    if (appEntry.categoryName !== undefined) dbEntry.category_name = appEntry.categoryName;
    if (appEntry.categoryIcon !== undefined) dbEntry.category_icon = appEntry.categoryIcon || null;
    if (appEntry.subcategory !== undefined) dbEntry.sub_category = appEntry.subcategory || null;
    if (appEntry.subcategoryIcon !== undefined) dbEntry.subcategory_icon = appEntry.subcategoryIcon || null;
    if (appEntry.amount !== undefined) dbEntry.amount_inr = appEntry.amount;
    if (appEntry.notes !== undefined) dbEntry.notes = appEntry.notes || null;

    return dbEntry;
  }

  private getMonthIndex(monthName: string): number {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months.indexOf(monthName);
  }

  private getMonthName(index: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[index] || 'January';
  }

  // ============================================
  // Data Loading
  // ============================================

  /**
   * Load all expense entries from Supabase (excluding soft-deleted)
   * Falls back to mock data if DB table doesn't exist yet
   * Note: Queries from year-based tables (expense_2021 through expense_2026)
   */
  async loadExpenseData(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      // QA MOCK MODE: Return mock data instead of DB calls
      if (this.supabase.isMockMode) {
        console.log('🧪 [QA MODE] Loading MOCK expense data...');
        await new Promise(resolve => setTimeout(resolve, 300));
        const entries = MOCK_EXPENSE_DATA.map(this.transformDbToApp.bind(this));
        this.expenseData.set(entries);
        console.log('✅ Loaded mock expense entries:', entries.length);
        return;
      }

      if (this.USE_DB) {
        console.log('📂 Loading expense data from year-based tables...');

        // Query all year tables (2021-2026)
        const years = [2021, 2022, 2023, 2024, 2025, 2026];
        const allEntries: ExpenseEntry[] = [];

        for (const year of years) {
          const tableName = this.getTableNameForYear(year);
          
          try {
            const { data, error } = await this.supabase.db
              .from(tableName)
              .select('*')
              .eq('is_delete', false)
              .order('year', { ascending: false })
              .order('month', { ascending: false });

            if (error) {
              console.warn(`⚠️ Error loading from ${tableName}:`, error.message);
              continue; // Skip this year if table doesn't exist or has errors
            }

            if (data && data.length > 0) {
              const entries = data.map(this.transformDbToApp.bind(this));
              allEntries.push(...entries);
              console.log(`✅ Loaded ${entries.length} entries from ${tableName}`);
            }
          } catch (err: any) {
            console.warn(`⚠️ Failed to load from ${tableName}:`, err.message);
            continue; // Skip this year and continue with others
          }
        }

        this.expenseData.set(allEntries);
        console.log('✅ Total expense entries loaded from all tables:', allEntries.length);
      } else {
        // Use mock data
        console.log('📂 Loading expense mock data...');
        await new Promise(resolve => setTimeout(resolve, 300));
        this.expenseData.set([...MOCK_EXPENSES]);
        console.log('✅ Loaded mock expenses:', this.expenseData().length);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load expense data';
      this.error.set(errorMsg);
      console.error('❌ Expense load error:', err);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  // ============================================
  // CRUD Operations
  // (same pattern as IncomeService)
  // ============================================

  /**
   * Add new expense entry
   */
  async addExpense(data: ExpenseFormData): Promise<ExpenseEntry> {
    this.loading.set(true);
    this.error.set(null);

    const tableName = this.getTableNameForYear(data.year);

    try {
      // Lookup category details from CategoryService
      const category = this.categoryService.getCategoryById(data.categoryId);

      // QA MOCK MODE: Simulate add without DB
      if (this.supabase.isMockMode) {
        console.log('🧪 [QA MODE] Simulating expense add...');
        await new Promise(resolve => setTimeout(resolve, 200));
        const mockEntry: ExpenseEntry = {
          id: Date.now(),
          month: data.month,
          year: data.year,
          categoryId: data.categoryId,
          categoryName: category?.category_name || 'Unknown',
          categoryIcon: category?.category_icon || '📁',
          subcategory: category?.sub_category || undefined,
          subcategoryIcon: category?.subcategory_icon || undefined,
          amount: data.amount,
          notes: data.notes || undefined,
          isDeleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        this.expenseData.set([...this.expenseData(), mockEntry]);
        console.log('✅ [QA MODE] Mock expense added');
        return mockEntry;
      }

      if (this.USE_DB) {
        // Determine which table to insert into based on year

        const newEntry = {
          month: data.month,
          year: data.year,
          category_id: data.categoryId,
          category_name: category?.category_name || 'Unknown',
          category_icon: category?.category_icon || null,
          sub_category: category?.sub_category || null,
          subcategory_icon: category?.subcategory_icon || null,
          amount_inr: data.amount,
          notes: data.notes || null,
          is_delete: false
        };

        console.log(`➕ Adding new expense entry to ${tableName}:`, newEntry);

        // 🔍 AUDIT: Log INSERT request
        await this.auditService.logOperation(
          'INSERT',
          tableName,
          null, // No ID yet
          data.year,
          data.month,
          { formData: data, dbEntry: newEntry },
          null,
          null,
          'SUCCESS'
        );

        const { data: dbData, error } = await this.supabase.db
          .from(tableName)
          .insert([newEntry])
          .select()
          .single();

        if (error) {
          // 🔍 AUDIT: Log INSERT error
          await this.auditService.logOperation(
            'INSERT',
            tableName,
            null,
            data.year,
            data.month,
            { formData: data, dbEntry: newEntry },
            null,
            null,
            'ERROR',
            error.message
          );
          console.error('❌ Database error:', error.message);
          throw error;
        }

        const addedEntry = this.transformDbToApp(dbData);
        this.expenseData.set([...this.expenseData(), addedEntry]);
        console.log(`✅ Expense entry added to ${tableName}. Total:`, this.expenseData().length);

        // 🔍 AUDIT: Log successful INSERT with response
        await this.auditService.logOperation(
          'INSERT',
          tableName,
          addedEntry.id,
          data.year,
          data.month,
          { formData: data, dbEntry: newEntry },
          dbData,
          null,
          'SUCCESS'
        );

        return addedEntry;
      } else {
        // Mock implementation
        await new Promise(resolve => setTimeout(resolve, 200));

        const newEntry: ExpenseEntry = {
          id: this.nextMockId++,
          month: data.month,
          year: data.year,
          categoryId: data.categoryId,
          categoryName: category?.category_name || 'Unknown',
          categoryIcon: category?.category_icon || '📁',
          subcategory: category?.sub_category || undefined,
          subcategoryIcon: category?.subcategory_icon || undefined,
          amount: data.amount,
          notes: data.notes || undefined,
          isDeleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        this.expenseData.set([...this.expenseData(), newEntry]);
        console.log('✅ Expense added (mock):', newEntry.categoryName, newEntry.amount);

        return newEntry;
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to add expense entry';
      this.error.set(errorMsg);
      console.error('❌ Add expense error:', err);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Update existing expense entry
   * Note: If year changes, deletes from old table and inserts into new table.
   * This is necessary because of year constraints on each table.
   */
  async updateExpense(id: number, data: ExpenseFormData): Promise<ExpenseEntry> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const category = this.categoryService.getCategoryById(data.categoryId);

      if (this.USE_DB) {
        // Find the existing entry to determine which table it's in
        const existingEntry = this.expenseData().find(e => e.id === id);
        if (!existingEntry) {
          throw new Error('Expense entry not found');
        }

        const oldTableName = this.getTableNameForYear(existingEntry.year);
        const newTableName = this.getTableNameForYear(data.year);

        // 🔍 AUDIT: Log the BEFORE state
        const beforeState = { ...existingEntry };

        // Check if year has changed (requires moving between tables)
        if (existingEntry.year !== data.year) {
          console.log(`🔄 Year changed: ${existingEntry.year} → ${data.year}`);
          console.log(`🔄 Moving record from ${oldTableName} to ${newTableName}`);

          // 🔍 AUDIT: Log YEAR_MOVE operation
          await this.auditService.logOperation(
            'YEAR_MOVE',
            `${oldTableName} → ${newTableName}`,
            id,
            existingEntry.year,
            existingEntry.month,
            { formData: data, oldYear: existingEntry.year, newYear: data.year },
            null,
            beforeState,
            'SUCCESS'
          );

          // Step 1: Delete from old table (hard delete since we're moving)
          const { error: deleteError } = await this.supabase.db
            .from(oldTableName)
            .delete()
            .eq('expense_id', id);

          if (deleteError) {
            // 🔍 AUDIT: Log DELETE error during year move
            await this.auditService.logOperation(
              'DELETE',
              oldTableName,
              id,
              existingEntry.year,
              existingEntry.month,
              { reason: 'YEAR_MOVE', formData: data },
              null,
              beforeState,
              'ERROR',
              deleteError.message
            );
            console.error('❌ Delete error:', deleteError.message);
            throw new Error(`Failed to delete from ${oldTableName}: ${deleteError.message}`);
          }

          console.log(`✅ Deleted from ${oldTableName}`);

          // Step 2: Insert into new table
          const newEntry = {
            month: data.month,
            year: data.year,
            category_id: data.categoryId,
            category_name: category?.category_name || 'Unknown',
            category_icon: category?.category_icon || null,
            sub_category: category?.sub_category || null,
            subcategory_icon: category?.subcategory_icon || null,
            amount_inr: data.amount,
            notes: data.notes || null,
            is_delete: false
          };

          const { data: insertedData, error: insertError } = await this.supabase.db
            .from(newTableName)
            .insert([newEntry])
            .select()
            .single();

          if (insertError) {
            // 🔍 AUDIT: Log INSERT error during year move
            await this.auditService.logOperation(
              'INSERT',
              newTableName,
              null,
              data.year,
              data.month,
              { reason: 'YEAR_MOVE', formData: data, dbEntry: newEntry },
              null,
              beforeState,
              'ERROR',
              insertError.message
            );
            console.error('❌ Insert error:', insertError.message);
            throw new Error(`Failed to insert into ${newTableName}: ${insertError.message}`);
          }

          console.log(`✅ Inserted into ${newTableName} with new ID:`, insertedData.expense_id);

          const updatedEntry = this.transformDbToApp(insertedData);

          // 🔍 AUDIT: Log successful YEAR_MOVE
          await this.auditService.logOperation(
            'YEAR_MOVE',
            `${oldTableName} → ${newTableName}`,
            updatedEntry.id,
            data.year,
            data.month,
            { formData: data, oldId: id, newId: updatedEntry.id },
            insertedData,
            beforeState,
            'SUCCESS'
          );

          // Update local state (replace old entry with new one)
          const currentEntries = this.expenseData();
          const index = currentEntries.findIndex(e => e.id === id);
          if (index !== -1) {
            const newEntries = [...currentEntries];
            newEntries[index] = updatedEntry;
            this.expenseData.set(newEntries);
          }

          console.log(`✅ Expense moved from ${oldTableName} to ${newTableName}`);
          return updatedEntry;
        } else {
          // Year hasn't changed - simple update in same table
          const dbUpdates = {
            month: data.month,
            year: data.year,
            category_id: data.categoryId,
            category_name: category?.category_name || 'Unknown',
            category_icon: category?.category_icon || null,
            sub_category: category?.sub_category || null,
            subcategory_icon: category?.subcategory_icon || null,
            amount_inr: data.amount,
            notes: data.notes || null
          };

          console.log(`✏️ Updating expense entry in ${oldTableName}:`, id, dbUpdates);

          // 🔍 AUDIT: Log UPDATE request
          await this.auditService.logOperation(
            'UPDATE',
            oldTableName,
            id,
            data.year,
            data.month,
            { formData: data, dbUpdates: dbUpdates },
            null,
            beforeState,
            'SUCCESS'
          );

          const { data: dbData, error } = await this.supabase.db
            .from(oldTableName)
            .update(dbUpdates)
            .eq('expense_id', id)
            .eq('is_delete', false)
            .select()
            .single();

          if (error) {
            // 🔍 AUDIT: Log UPDATE error
            await this.auditService.logOperation(
              'UPDATE',
              oldTableName,
              id,
              data.year,
              data.month,
              { formData: data, dbUpdates: dbUpdates },
              null,
              beforeState,
              'ERROR',
              error.message
            );
            console.error('❌ Database error:', error.message);
            throw error;
          }

          if (!dbData) {
            throw new Error('Expense entry not found or already deleted');
          }

          const updatedEntry = this.transformDbToApp(dbData);

          // 🔍 AUDIT: Log successful UPDATE
          await this.auditService.logOperation(
            'UPDATE',
            oldTableName,
            id,
            data.year,
            data.month,
            { formData: data, dbUpdates: dbUpdates },
            dbData,
            beforeState,
            'SUCCESS'
          );

          // Update local state
          const currentEntries = this.expenseData();
          const index = currentEntries.findIndex(e => e.id === id);
          if (index !== -1) {
            const newEntries = [...currentEntries];
            newEntries[index] = updatedEntry;
            this.expenseData.set(newEntries);
          }

          console.log(`✅ Expense entry updated in ${oldTableName}`);
          return updatedEntry;
        }
      } else {
        // Mock implementation
        await new Promise(resolve => setTimeout(resolve, 200));

        const currentEntries = this.expenseData();
        const index = currentEntries.findIndex(e => e.id === id);

        if (index === -1) {
          throw new Error('Expense entry not found');
        }

        const updatedEntry: ExpenseEntry = {
          ...currentEntries[index],
          month: data.month,
          year: data.year,
          categoryId: data.categoryId,
          categoryName: category?.category_name || 'Unknown',
          categoryIcon: category?.category_icon || '📁',
          subcategory: category?.sub_category || undefined,
          subcategoryIcon: category?.subcategory_icon || undefined,
          amount: data.amount,
          notes: data.notes || undefined,
          updatedAt: new Date().toISOString()
        };

        const newEntries = [...currentEntries];
        newEntries[index] = updatedEntry;
        this.expenseData.set(newEntries);

        console.log('✅ Expense updated (mock):', updatedEntry.categoryName, updatedEntry.amount);
        return updatedEntry;
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to update expense entry';
      this.error.set(errorMsg);
      console.error('❌ Update expense error:', err);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Soft delete expense entry (same as IncomeService pattern)
   */
  async deleteExpense(id: number): Promise<boolean> {
    this.loading.set(true);
    this.error.set(null);

    try {
      // QA MOCK MODE: Simulate delete without DB
      if (this.supabase.isMockMode) {
        console.log('🧪 [QA MODE] Simulating expense delete...');
        await new Promise(resolve => setTimeout(resolve, 200));
        const filtered = this.expenseData().filter(e => e.id !== id);
        this.expenseData.set(filtered);
        console.log('✅ [QA MODE] Mock expense deleted');
        return true;
      }

      if (this.USE_DB) {
        // Find the existing entry to determine which table it's in
        const existingEntry = this.expenseData().find(e => e.id === id);
        if (!existingEntry) {
          throw new Error('Expense entry not found');
        }

        // 🔍 AUDIT: Log the BEFORE state
        const beforeState = { ...existingEntry };

        // Use the table based on the entry's year
        const tableName = this.getTableNameForYear(existingEntry.year);

        console.log(`🗑️ Soft deleting expense entry from ${tableName}:`, id);

        // 🔍 AUDIT: Log SOFT_DELETE request
        await this.auditService.logOperation(
          'SOFT_DELETE',
          tableName,
          id,
          existingEntry.year,
          existingEntry.month,
          { action: 'soft_delete', expense_id: id },
          null,
          beforeState,
          'SUCCESS'
        );

        const { error } = await this.supabase.db
          .from(tableName)
          .update({ is_delete: true })
          .eq('expense_id', id);

        if (error) {
          // 🔍 AUDIT: Log SOFT_DELETE error
          await this.auditService.logOperation(
            'SOFT_DELETE',
            tableName,
            id,
            existingEntry.year,
            existingEntry.month,
            { action: 'soft_delete', expense_id: id },
            null,
            beforeState,
            'ERROR',
            error.message
          );
          console.error('❌ Database error:', error.message);
          throw error;
        }

        // Remove from local state
        const filtered = this.expenseData().filter(e => e.id !== id);
        this.expenseData.set(filtered);

        // 🔍 AUDIT: Log successful SOFT_DELETE
        await this.auditService.logOperation(
          'SOFT_DELETE',
          tableName,
          id,
          existingEntry.year,
          existingEntry.month,
          { action: 'soft_delete', expense_id: id },
          { is_delete: true },
          beforeState,
          'SUCCESS'
        );

        console.log(`✅ Expense entry soft deleted from ${tableName}. Remaining:`, filtered.length);
      } else {
        // Mock implementation
        await new Promise(resolve => setTimeout(resolve, 200));

        const updated = this.expenseData().map(e =>
          e.id === id ? { ...e, isDeleted: true, updatedAt: new Date().toISOString() } : e
        );
        this.expenseData.set(updated);

        console.log('✅ Expense soft deleted (mock):', id);
      }

      return true;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to delete expense entry';
      this.error.set(errorMsg);
      console.error('❌ Delete expense error:', err);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  // ============================================
  // Query Helpers (synchronous signal access)
  // ============================================

  /**
   * Get all expense entries (synchronous access to signal)
   */
  getAllEntries(): ExpenseEntry[] {
    return this.expenseData();
  }

  /**
   * Get entries for specific year
   */
  getEntriesByYear(year: number): ExpenseEntry[] {
    return this.expenseData().filter(e => e.year === year && !e.isDeleted);
  }

  /**
   * Get active expenses for a specific month/year
   */
  getExpensesByMonthYear(month: string, year: number): ExpenseEntry[] {
    return this.expenseData().filter(
      e => e.month === month && e.year === year && !e.isDeleted
    );
  }

  /**
   * Get total expenses for a specific month/year
   */
  getMonthlyTotal(month: string, year: number): number {
    return this.getExpensesByMonthYear(month, year)
      .reduce((sum, e) => sum + e.amount, 0);
  }

  /**
   * Get income for a specific month/year (from IncomeService → from DB)
   */
  getMonthlyIncome(month: string, year: number): number {
    const incomeEntries = this.incomeService.getAllEntries();
    const entry = incomeEntries.find(e => e.month === month && e.year === year);
    return entry?.amount || 0;
  }

  /**
   * Get monthly summary (income, expense, balance)
   */
  getMonthlySummary(month: string, year: number): MonthlySummary {
    const totalIncome = this.getMonthlyIncome(month, year);
    const totalExpense = this.getMonthlyTotal(month, year);
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense
    };
  }

  /**
   * Get total expenses across all years
   */
  getTotalExpenses(): number {
    return this.expenseData()
      .filter(e => !e.isDeleted)
      .reduce((sum, e) => sum + e.amount, 0);
  }

  /**
   * Get total expenses for a specific year
   */
  getYearlyTotal(year: number): number {
    return this.getEntriesByYear(year).reduce((sum, e) => sum + e.amount, 0);
  }

  /**
   * Reload data from database
   */
  async reloadData(): Promise<void> {
    await this.loadExpenseData();
  }
}
