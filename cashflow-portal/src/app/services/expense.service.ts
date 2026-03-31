import { Injectable, signal, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { CategoryService, Category } from './category.service';
import { IncomeService } from './income.service';

// ============================================
// Database Expense Entry Type (matches DB schema)
// ============================================

export type DbExpenseEntry = {
  expense_id: number;
  date: string;
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
  date: string;            // YYYY-MM-DD
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
  date: string;
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
    id: 1, date: '2026-03-01', month: 'March', year: 2026,
    categoryId: 1, categoryName: 'Rent', categoryIcon: '🏠',
    subcategory: 'Monthly Rent', subcategoryIcon: '🏡',
    amount: 15000, notes: 'March rent payment',
    isDeleted: false, createdAt: '2026-03-01T10:00:00Z', updatedAt: '2026-03-01T10:00:00Z'
  },
  {
    id: 2, date: '2026-03-02', month: 'March', year: 2026,
    categoryId: 2, categoryName: 'Groceries', categoryIcon: '🛒',
    subcategory: 'Vegetables', subcategoryIcon: '🥬',
    amount: 2500, notes: 'Weekly vegetables',
    isDeleted: false, createdAt: '2026-03-02T11:00:00Z', updatedAt: '2026-03-02T11:00:00Z'
  },
  {
    id: 3, date: '2026-03-05', month: 'March', year: 2026,
    categoryId: 3, categoryName: 'Transport', categoryIcon: '🚗',
    subcategory: 'Fuel', subcategoryIcon: '⛽',
    amount: 3000, notes: 'Petrol filling',
    isDeleted: false, createdAt: '2026-03-05T09:00:00Z', updatedAt: '2026-03-05T09:00:00Z'
  },
  {
    id: 4, date: '2026-03-08', month: 'March', year: 2026,
    categoryId: 4, categoryName: 'Utilities', categoryIcon: '💡',
    subcategory: 'Electricity', subcategoryIcon: '⚡',
    amount: 1800, notes: 'EB bill March',
    isDeleted: false, createdAt: '2026-03-08T14:00:00Z', updatedAt: '2026-03-08T14:00:00Z'
  },
  {
    id: 5, date: '2026-03-10', month: 'March', year: 2026,
    categoryId: 5, categoryName: 'Food', categoryIcon: '🍔',
    subcategory: 'Dining Out', subcategoryIcon: '🍽️',
    amount: 1200, notes: 'Weekend dinner',
    isDeleted: false, createdAt: '2026-03-10T20:00:00Z', updatedAt: '2026-03-10T20:00:00Z'
  },
  {
    id: 6, date: '2026-03-12', month: 'March', year: 2026,
    categoryId: 6, categoryName: 'Health', categoryIcon: '🏥',
    subcategory: 'Medicine', subcategoryIcon: '💊',
    amount: 800, notes: 'Monthly medicines',
    isDeleted: false, createdAt: '2026-03-12T10:00:00Z', updatedAt: '2026-03-12T10:00:00Z'
  },
  {
    id: 7, date: '2026-03-15', month: 'March', year: 2026,
    categoryId: 2, categoryName: 'Groceries', categoryIcon: '🛒',
    subcategory: 'Fruits', subcategoryIcon: '🍎',
    amount: 1500, notes: 'Weekly fruits',
    isDeleted: false, createdAt: '2026-03-15T11:30:00Z', updatedAt: '2026-03-15T11:30:00Z'
  },
  {
    id: 8, date: '2026-03-18', month: 'March', year: 2026,
    categoryId: 7, categoryName: 'Entertainment', categoryIcon: '🎬',
    subcategory: 'Movies', subcategoryIcon: '🎥',
    amount: 600, notes: 'Movie tickets',
    isDeleted: false, createdAt: '2026-03-18T18:00:00Z', updatedAt: '2026-03-18T18:00:00Z'
  },
  {
    id: 9, date: '2026-03-20', month: 'March', year: 2026,
    categoryId: 4, categoryName: 'Utilities', categoryIcon: '💡',
    subcategory: 'Internet', subcategoryIcon: '📡',
    amount: 999, notes: 'Broadband bill',
    isDeleted: false, createdAt: '2026-03-20T10:00:00Z', updatedAt: '2026-03-20T10:00:00Z'
  },
  {
    id: 10, date: '2026-03-22', month: 'March', year: 2026,
    categoryId: 8, categoryName: 'Shopping', categoryIcon: '🛍️',
    subcategory: 'Clothing', subcategoryIcon: '👕',
    amount: 3500, notes: 'New shirts',
    isDeleted: false, createdAt: '2026-03-22T15:00:00Z', updatedAt: '2026-03-22T15:00:00Z'
  },
  // February entries
  {
    id: 11, date: '2026-02-01', month: 'February', year: 2026,
    categoryId: 1, categoryName: 'Rent', categoryIcon: '🏠',
    subcategory: 'Monthly Rent', subcategoryIcon: '🏡',
    amount: 15000, notes: 'Feb rent',
    isDeleted: false, createdAt: '2026-02-01T10:00:00Z', updatedAt: '2026-02-01T10:00:00Z'
  },
  {
    id: 12, date: '2026-02-05', month: 'February', year: 2026,
    categoryId: 2, categoryName: 'Groceries', categoryIcon: '🛒',
    subcategory: 'Vegetables', subcategoryIcon: '🥬',
    amount: 2200, notes: 'Weekly groceries',
    isDeleted: false, createdAt: '2026-02-05T11:00:00Z', updatedAt: '2026-02-05T11:00:00Z'
  },
  {
    id: 13, date: '2026-02-10', month: 'February', year: 2026,
    categoryId: 3, categoryName: 'Transport', categoryIcon: '🚗',
    subcategory: 'Fuel', subcategoryIcon: '⛽',
    amount: 2800, notes: 'Petrol',
    isDeleted: false, createdAt: '2026-02-10T09:00:00Z', updatedAt: '2026-02-10T09:00:00Z'
  },
  {
    id: 14, date: '2026-02-15', month: 'February', year: 2026,
    categoryId: 5, categoryName: 'Food', categoryIcon: '🍔',
    subcategory: 'Dining Out', subcategoryIcon: '🍽️',
    amount: 1500, notes: 'Valentine dinner',
    isDeleted: false, createdAt: '2026-02-15T20:00:00Z', updatedAt: '2026-02-15T20:00:00Z'
  },
  // January entries
  {
    id: 15, date: '2026-01-01', month: 'January', year: 2026,
    categoryId: 1, categoryName: 'Rent', categoryIcon: '🏠',
    subcategory: 'Monthly Rent', subcategoryIcon: '🏡',
    amount: 15000, notes: 'Jan rent',
    isDeleted: false, createdAt: '2026-01-01T10:00:00Z', updatedAt: '2026-01-01T10:00:00Z'
  },
  {
    id: 16, date: '2026-01-10', month: 'January', year: 2026,
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

  // Reactive state (same pattern as IncomeService)
  private expenseData = signal<ExpenseEntry[]>([]);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);

  // Flag: set to true once the 'expense' table exists in Supabase
  // For now, false → uses mock data
  // TODO: Set to true after running sql/schemas/003_expense.sql in DBeaver
  private readonly USE_DB = true;

  private nextMockId = 100;

  constructor() {
    // Auto-load on service initialization (same as IncomeService)
    // Don't await in constructor - let component control the loading
    this.loadExpenseData().catch(err => {
      console.error('❌ Failed to auto-load expenses in constructor:', err);
    });
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
      date: dbEntry.date || '',
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

    if (appEntry.date !== undefined) {
      // Ensure date is stored as plain YYYY-MM-DD string (same pattern as IncomeService)
      if (typeof appEntry.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(appEntry.date)) {
        dbEntry.date = appEntry.date;
      } else if (appEntry.date) {
        const d = new Date(appEntry.date);
        dbEntry.date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      } else {
        dbEntry.date = null;
      }
    }

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
   */
  async loadExpenseData(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      if (this.USE_DB) {
        console.log('📂 Loading expense data from database...');

        const { data, error } = await this.supabase.db
          .from('expense')
          .select('*')
          .eq('is_delete', false)
          .order('year', { ascending: false })
          .order('date', { ascending: false });

        if (error) {
          console.error('❌ Database error:', error.message);
          throw error;
        }

        const entries: ExpenseEntry[] = (data || []).map(this.transformDbToApp.bind(this));
        this.expenseData.set(entries);
        console.log('✅ Loaded expense entries from DB:', entries.length);
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

    try {
      const date = new Date(data.date);
      const month = this.getMonthName(date.getMonth());
      const year = date.getFullYear();

      // Lookup category details from CategoryService
      const category = this.categoryService.getCategoryById(data.categoryId);

      if (this.USE_DB) {
        const newEntry = {
          date: data.date,
          month: month,
          year: year,
          category_id: data.categoryId,
          category_name: category?.category_name || 'Unknown',
          category_icon: category?.category_icon || null,
          sub_category: category?.sub_category || null,
          subcategory_icon: category?.subcategory_icon || null,
          amount_inr: data.amount,
          notes: data.notes || null,
          is_delete: false
        };

        console.log('➕ Adding new expense entry:', newEntry);

        const { data: dbData, error } = await this.supabase.db
          .from('expense')
          .insert([newEntry])
          .select()
          .single();

        if (error) {
          console.error('❌ Database error:', error.message);
          throw error;
        }

        const addedEntry = this.transformDbToApp(dbData);
        this.expenseData.set([...this.expenseData(), addedEntry]);
        console.log('✅ Expense entry added to DB. Total:', this.expenseData().length);

        return addedEntry;
      } else {
        // Mock implementation
        await new Promise(resolve => setTimeout(resolve, 200));

        const newEntry: ExpenseEntry = {
          id: this.nextMockId++,
          date: data.date,
          month: month,
          year: year,
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
   */
  async updateExpense(id: number, data: ExpenseFormData): Promise<ExpenseEntry> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const date = new Date(data.date);
      const month = this.getMonthName(date.getMonth());
      const year = date.getFullYear();

      const category = this.categoryService.getCategoryById(data.categoryId);

      if (this.USE_DB) {
        const dbUpdates = {
          date: data.date,
          month: month,
          year: year,
          category_id: data.categoryId,
          category_name: category?.category_name || 'Unknown',
          category_icon: category?.category_icon || null,
          sub_category: category?.sub_category || null,
          subcategory_icon: category?.subcategory_icon || null,
          amount_inr: data.amount,
          notes: data.notes || null
        };

        console.log('✏️ Updating expense entry:', id, dbUpdates);

        const { data: dbData, error } = await this.supabase.db
          .from('expense')
          .update(dbUpdates)
          .eq('expense_id', id)
          .eq('is_delete', false)
          .select()
          .single();

        if (error) {
          console.error('❌ Database error:', error.message);
          throw error;
        }

        if (!dbData) {
          throw new Error('Expense entry not found or already deleted');
        }

        const updatedEntry = this.transformDbToApp(dbData);

        // Update local state
        const currentEntries = this.expenseData();
        const index = currentEntries.findIndex(e => e.id === id);
        if (index !== -1) {
          const newEntries = [...currentEntries];
          newEntries[index] = updatedEntry;
          this.expenseData.set(newEntries);
        }

        console.log('✅ Expense entry updated in DB');
        return updatedEntry;
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
          date: data.date,
          month: month,
          year: year,
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
      if (this.USE_DB) {
        console.log('🗑️ Soft deleting expense entry:', id);

        const { error } = await this.supabase.db
          .from('expense')
          .update({ is_delete: true })
          .eq('expense_id', id);

        if (error) {
          console.error('❌ Database error:', error.message);
          throw error;
        }

        // Remove from local state
        const filtered = this.expenseData().filter(e => e.id !== id);
        this.expenseData.set(filtered);

        console.log('✅ Expense entry soft deleted from DB. Remaining:', filtered.length);
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
