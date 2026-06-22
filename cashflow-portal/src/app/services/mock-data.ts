/**
 * ============================================================
 * MOCK DATA FOR QA BRANCH
 * ============================================================
 * This file contains sample/demo data used across all services
 * when the app is running in QA/demo mode (useMockData = true).
 * No real personal or financial data is exposed here.
 * ============================================================
 */

// ============================================
// MOCK INCOME DATA
// ============================================
export const MOCK_INCOME_DATA = [
  { income_id: 1, year: 2026, month: 'January', date: '2026-01-05', amount_inr: 85000, source: 'Salary', mnc_company: 'TechCorp Inc', notes: 'Monthly salary', is_delete: false, created_at: '2026-01-05T10:00:00Z', updated_at: '2026-01-05T10:00:00Z' },
  { income_id: 2, year: 2026, month: 'February', date: '2026-02-05', amount_inr: 85000, source: 'Salary', mnc_company: 'TechCorp Inc', notes: 'Monthly salary', is_delete: false, created_at: '2026-02-05T10:00:00Z', updated_at: '2026-02-05T10:00:00Z' },
  { income_id: 3, year: 2026, month: 'March', date: '2026-03-05', amount_inr: 85000, source: 'Salary', mnc_company: 'TechCorp Inc', notes: 'Monthly salary', is_delete: false, created_at: '2026-03-05T10:00:00Z', updated_at: '2026-03-05T10:00:00Z' },
  { income_id: 4, year: 2026, month: 'April', date: '2026-04-05', amount_inr: 90000, source: 'Salary', mnc_company: 'TechCorp Inc', notes: 'Monthly salary + increment', is_delete: false, created_at: '2026-04-05T10:00:00Z', updated_at: '2026-04-05T10:00:00Z' },
  { income_id: 5, year: 2026, month: 'May', date: '2026-05-05', amount_inr: 90000, source: 'Salary', mnc_company: 'TechCorp Inc', notes: 'Monthly salary', is_delete: false, created_at: '2026-05-05T10:00:00Z', updated_at: '2026-05-05T10:00:00Z' },
  { income_id: 6, year: 2026, month: 'June', date: '2026-06-05', amount_inr: 90000, source: 'Salary', mnc_company: 'TechCorp Inc', notes: 'Monthly salary', is_delete: false, created_at: '2026-06-05T10:00:00Z', updated_at: '2026-06-05T10:00:00Z' },
  { income_id: 7, year: 2025, month: 'October', date: '2025-10-05', amount_inr: 80000, source: 'Salary', mnc_company: 'TechCorp Inc', notes: 'Monthly salary', is_delete: false, created_at: '2025-10-05T10:00:00Z', updated_at: '2025-10-05T10:00:00Z' },
  { income_id: 8, year: 2025, month: 'November', date: '2025-11-05', amount_inr: 80000, source: 'Salary', mnc_company: 'TechCorp Inc', notes: 'Monthly salary', is_delete: false, created_at: '2025-11-05T10:00:00Z', updated_at: '2025-11-05T10:00:00Z' },
  { income_id: 9, year: 2025, month: 'December', date: '2025-12-05', amount_inr: 80000, source: 'Salary', mnc_company: 'TechCorp Inc', notes: 'Monthly salary', is_delete: false, created_at: '2025-12-05T10:00:00Z', updated_at: '2025-12-05T10:00:00Z' },
  { income_id: 10, year: 2025, month: 'January', date: '2025-01-15', amount_inr: 15000, source: 'Freelance', mnc_company: null, notes: 'Web dev project', is_delete: false, created_at: '2025-01-15T10:00:00Z', updated_at: '2025-01-15T10:00:00Z' },
];

// ============================================
// MOCK EXPENSE DATA
// ============================================
export const MOCK_EXPENSE_DATA = [
  // ============================================
  // HOME EXPENSES (for Home Heatmap)
  // ============================================
  { expense_id: 1, month: 'January', year: 2026, category_id: 1, category_name: 'Home', category_icon: '🏠', sub_category: 'Monthly Rent', subcategory_icon: '🏡', amount_inr: 18000, notes: 'Apartment rent', is_delete: false, created_at: '2026-01-01T10:00:00Z', updated_at: '2026-01-01T10:00:00Z' },
  { expense_id: 2, month: 'January', year: 2026, category_id: 1, category_name: 'Home', category_icon: '🏠', sub_category: 'Electricity', subcategory_icon: '⚡', amount_inr: 2200, notes: 'EB bill', is_delete: false, created_at: '2026-01-12T10:00:00Z', updated_at: '2026-01-12T10:00:00Z' },
  { expense_id: 3, month: 'January', year: 2026, category_id: 1, category_name: 'Home', category_icon: '🏠', sub_category: 'Groceries', subcategory_icon: '🛒', amount_inr: 4500, notes: 'Monthly groceries', is_delete: false, created_at: '2026-01-05T10:00:00Z', updated_at: '2026-01-05T10:00:00Z' },
  { expense_id: 4, month: 'February', year: 2026, category_id: 1, category_name: 'Home', category_icon: '🏠', sub_category: 'Monthly Rent', subcategory_icon: '🏡', amount_inr: 18000, notes: 'Apartment rent', is_delete: false, created_at: '2026-02-01T10:00:00Z', updated_at: '2026-02-01T10:00:00Z' },
  { expense_id: 5, month: 'February', year: 2026, category_id: 1, category_name: 'Home', category_icon: '🏠', sub_category: 'Internet', subcategory_icon: '📡', amount_inr: 999, notes: 'Broadband bill', is_delete: false, created_at: '2026-02-15T10:00:00Z', updated_at: '2026-02-15T10:00:00Z' },
  { expense_id: 6, month: 'March', year: 2026, category_id: 1, category_name: 'Home', category_icon: '🏠', sub_category: 'Monthly Rent', subcategory_icon: '🏡', amount_inr: 18000, notes: 'Apartment rent', is_delete: false, created_at: '2026-03-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  { expense_id: 7, month: 'March', year: 2026, category_id: 1, category_name: 'Home', category_icon: '🏠', sub_category: 'Maintenance', subcategory_icon: '�', amount_inr: 1500, notes: 'Society maintenance', is_delete: false, created_at: '2026-03-05T10:00:00Z', updated_at: '2026-03-05T10:00:00Z' },
  { expense_id: 8, month: 'April', year: 2026, category_id: 1, category_name: 'Home', category_icon: '🏠', sub_category: 'Monthly Rent', subcategory_icon: '🏡', amount_inr: 18000, notes: 'Apartment rent', is_delete: false, created_at: '2026-04-01T10:00:00Z', updated_at: '2026-04-01T10:00:00Z' },
  { expense_id: 9, month: 'May', year: 2026, category_id: 1, category_name: 'Home', category_icon: '�', sub_category: 'Monthly Rent', subcategory_icon: '�', amount_inr: 18000, notes: 'Apartment rent', is_delete: false, created_at: '2026-05-01T10:00:00Z', updated_at: '2026-05-01T10:00:00Z' },
  { expense_id: 10, month: 'June', year: 2026, category_id: 1, category_name: 'Home', category_icon: '🏠', sub_category: 'Monthly Rent', subcategory_icon: '🏡', amount_inr: 18000, notes: 'Apartment rent', is_delete: false, created_at: '2026-06-01T10:00:00Z', updated_at: '2026-06-01T10:00:00Z' },

  // ============================================
  // ABI EXPENSES (for Abi Heatmap - Personal spending)
  // ============================================
  { expense_id: 11, month: 'January', year: 2026, category_id: 2, category_name: 'Abi', category_icon: '👩', sub_category: 'Personal Care', subcategory_icon: '💄', amount_inr: 3500, notes: 'Skincare products', is_delete: false, created_at: '2026-01-08T10:00:00Z', updated_at: '2026-01-08T10:00:00Z' },
  { expense_id: 12, month: 'January', year: 2026, category_id: 2, category_name: 'Abi', category_icon: '👩', sub_category: 'Clothing', subcategory_icon: '👗', amount_inr: 5000, notes: 'Winter wear', is_delete: false, created_at: '2026-01-15T10:00:00Z', updated_at: '2026-01-15T10:00:00Z' },
  { expense_id: 13, month: 'February', year: 2026, category_id: 2, category_name: 'Abi', category_icon: '�', sub_category: 'Entertainment', subcategory_icon: '�', amount_inr: 1200, notes: 'Movies & concerts', is_delete: false, created_at: '2026-02-10T10:00:00Z', updated_at: '2026-02-10T10:00:00Z' },
  { expense_id: 14, month: 'February', year: 2026, category_id: 2, category_name: 'Abi', category_icon: '👩', sub_category: 'Food & Dining', subcategory_icon: '🍽️', amount_inr: 2500, notes: 'Restaurant visits', is_delete: false, created_at: '2026-02-14T10:00:00Z', updated_at: '2026-02-14T10:00:00Z' },
  { expense_id: 15, month: 'March', year: 2026, category_id: 2, category_name: 'Abi', category_icon: '👩', sub_category: 'Travel', subcategory_icon: '✈️', amount_inr: 8000, notes: 'Weekend trip', is_delete: false, created_at: '2026-03-20T10:00:00Z', updated_at: '2026-03-20T10:00:00Z' },
  { expense_id: 16, month: 'March', year: 2026, category_id: 2, category_name: 'Abi', category_icon: '👩', sub_category: 'Health & Fitness', subcategory_icon: '🏋️', amount_inr: 2000, notes: 'Gym membership', is_delete: false, created_at: '2026-03-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  { expense_id: 17, month: 'April', year: 2026, category_id: 2, category_name: 'Abi', category_icon: '👩', sub_category: 'Education', subcategory_icon: '📚', amount_inr: 4500, notes: 'Online course', is_delete: false, created_at: '2026-04-05T10:00:00Z', updated_at: '2026-04-05T10:00:00Z' },
  { expense_id: 18, month: 'May', year: 2026, category_id: 2, category_name: 'Abi', category_icon: '👩', sub_category: 'Personal Care', subcategory_icon: '💄', amount_inr: 2800, notes: 'Beauty products', is_delete: false, created_at: '2026-05-12T10:00:00Z', updated_at: '2026-05-12T10:00:00Z' },
  { expense_id: 19, month: 'June', year: 2026, category_id: 2, category_name: 'Abi', category_icon: '👩', sub_category: 'Clothing', subcategory_icon: '👗', amount_inr: 6000, notes: 'Summer collection', is_delete: false, created_at: '2026-06-10T10:00:00Z', updated_at: '2026-06-10T10:00:00Z' },

  // ============================================
  // BB EXPENSES (for BB Heatmap - Family spending)
  // ============================================
  { expense_id: 20, month: 'January', year: 2026, category_id: 3, category_name: 'BB', category_icon: '👶', sub_category: 'Baby Care', subcategory_icon: '🍼', amount_inr: 3000, notes: 'Diapers & formula', is_delete: false, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },
  { expense_id: 21, month: 'January', year: 2026, category_id: 3, category_name: 'BB', category_icon: '👶', sub_category: 'Toys & Games', subcategory_icon: '🧸', amount_inr: 1500, notes: 'Educational toys', is_delete: false, created_at: '2026-01-18T10:00:00Z', updated_at: '2026-01-18T10:00:00Z' },
  { expense_id: 22, month: 'February', year: 2026, category_id: 3, category_name: 'BB', category_icon: '👶', sub_category: 'Baby Care', subcategory_icon: '🍼', amount_inr: 3200, notes: 'Monthly supplies', is_delete: false, created_at: '2026-02-08T10:00:00Z', updated_at: '2026-02-08T10:00:00Z' },
  { expense_id: 23, month: 'February', year: 2026, category_id: 3, category_name: 'BB', category_icon: '👶', sub_category: 'Clothing', subcategory_icon: '👕', amount_inr: 2000, notes: 'Baby clothes', is_delete: false, created_at: '2026-02-20T10:00:00Z', updated_at: '2026-02-20T10:00:00Z' },
  { expense_id: 24, month: 'March', year: 2026, category_id: 3, category_name: 'BB', category_icon: '👶', sub_category: 'Medical', subcategory_icon: '💊', amount_inr: 1800, notes: 'Vaccination', is_delete: false, created_at: '2026-03-15T10:00:00Z', updated_at: '2026-03-15T10:00:00Z' },
  { expense_id: 25, month: 'April', year: 2026, category_id: 3, category_name: 'BB', category_icon: '�', sub_category: 'Baby Care', subcategory_icon: '🍼', amount_inr: 2800, notes: 'Monthly supplies', is_delete: false, created_at: '2026-04-10T10:00:00Z', updated_at: '2026-04-10T10:00:00Z' },
  { expense_id: 26, month: 'May', year: 2026, category_id: 3, category_name: 'BB', category_icon: '👶', sub_category: 'Toys & Games', subcategory_icon: '🧸', amount_inr: 2500, notes: 'Birthday gifts', is_delete: false, created_at: '2026-05-05T10:00:00Z', updated_at: '2026-05-05T10:00:00Z' },
  { expense_id: 27, month: 'June', year: 2026, category_id: 3, category_name: 'BB', category_icon: '👶', sub_category: 'Baby Care', subcategory_icon: '🍼', amount_inr: 3000, notes: 'Monthly supplies', is_delete: false, created_at: '2026-06-08T10:00:00Z', updated_at: '2026-06-08T10:00:00Z' },

  // ============================================
  // INVESTMENT EXPENSES (for Investment Heatmap)
  // ============================================
  { expense_id: 28, month: 'January', year: 2026, category_id: 4, category_name: 'Investment', category_icon: '📈', sub_category: 'MF - SIP', subcategory_icon: '📊', amount_inr: 10000, notes: 'Monthly SIP', is_delete: false, created_at: '2026-01-05T10:00:00Z', updated_at: '2026-01-05T10:00:00Z' },
  { expense_id: 29, month: 'January', year: 2026, category_id: 4, category_name: 'Investment', category_icon: '📈', sub_category: 'PPF', subcategory_icon: '�', amount_inr: 12500, notes: 'PPF contribution', is_delete: false, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },
  { expense_id: 30, month: 'February', year: 2026, category_id: 4, category_name: 'Investment', category_icon: '📈', sub_category: 'MF - SIP', subcategory_icon: '📊', amount_inr: 10000, notes: 'Monthly SIP', is_delete: false, created_at: '2026-02-05T10:00:00Z', updated_at: '2026-02-05T10:00:00Z' },
  { expense_id: 31, month: 'February', year: 2026, category_id: 4, category_name: 'Investment', category_icon: '📈', sub_category: 'Stocks', subcategory_icon: '📈', amount_inr: 15000, notes: 'Direct equity', is_delete: false, created_at: '2026-02-12T10:00:00Z', updated_at: '2026-02-12T10:00:00Z' },
  { expense_id: 32, month: 'March', year: 2026, category_id: 4, category_name: 'Investment', category_icon: '📈', sub_category: 'MF - SIP', subcategory_icon: '📊', amount_inr: 10000, notes: 'Monthly SIP', is_delete: false, created_at: '2026-03-05T10:00:00Z', updated_at: '2026-03-05T10:00:00Z' },
  { expense_id: 33, month: 'March', year: 2026, category_id: 4, category_name: 'Investment', category_icon: '�', sub_category: 'Physical Gold', subcategory_icon: '🥇', amount_inr: 20000, notes: 'Gold purchase', is_delete: false, created_at: '2026-03-18T10:00:00Z', updated_at: '2026-03-18T10:00:00Z' },
  { expense_id: 34, month: 'April', year: 2026, category_id: 4, category_name: 'Investment', category_icon: '📈', sub_category: 'MF - SIP', subcategory_icon: '�', amount_inr: 10000, notes: 'Monthly SIP', is_delete: false, created_at: '2026-04-05T10:00:00Z', updated_at: '2026-04-05T10:00:00Z' },
  { expense_id: 35, month: 'April', year: 2026, category_id: 4, category_name: 'Investment', category_icon: '📈', sub_category: 'NPS', subcategory_icon: '🏛️', amount_inr: 5000, notes: 'NPS contribution', is_delete: false, created_at: '2026-04-15T10:00:00Z', updated_at: '2026-04-15T10:00:00Z' },
  { expense_id: 36, month: 'May', year: 2026, category_id: 4, category_name: 'Investment', category_icon: '📈', sub_category: 'MF - SIP', subcategory_icon: '📊', amount_inr: 10000, notes: 'Monthly SIP', is_delete: false, created_at: '2026-05-05T10:00:00Z', updated_at: '2026-05-05T10:00:00Z' },
  { expense_id: 37, month: 'June', year: 2026, category_id: 4, category_name: 'Investment', category_icon: '📈', sub_category: 'MF - SIP', subcategory_icon: '📊', amount_inr: 10000, notes: 'Monthly SIP', is_delete: false, created_at: '2026-06-05T10:00:00Z', updated_at: '2026-06-05T10:00:00Z' },
  { expense_id: 38, month: 'June', year: 2026, category_id: 4, category_name: 'Investment', category_icon: '📈', sub_category: 'FD', subcategory_icon: '🏦', amount_inr: 25000, notes: 'Fixed deposit', is_delete: false, created_at: '2026-06-15T10:00:00Z', updated_at: '2026-06-15T10:00:00Z' },

  // ============================================
  // OTHER GENERAL EXPENSES
  // ============================================
  { expense_id: 39, month: 'January', year: 2026, category_id: 5, category_name: 'Transport', category_icon: '🚗', sub_category: 'Fuel', subcategory_icon: '⛽', amount_inr: 3500, notes: 'Petrol filling', is_delete: false, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },
  { expense_id: 40, month: 'February', year: 2026, category_id: 5, category_name: 'Transport', category_icon: '🚗', sub_category: 'Fuel', subcategory_icon: '⛽', amount_inr: 3800, notes: 'Petrol filling', is_delete: false, created_at: '2026-02-12T10:00:00Z', updated_at: '2026-02-12T10:00:00Z' },
  { expense_id: 41, month: 'March', year: 2026, category_id: 5, category_name: 'Transport', category_icon: '🚗', sub_category: 'Service', subcategory_icon: '🔧', amount_inr: 5000, notes: 'Car service', is_delete: false, created_at: '2026-03-08T10:00:00Z', updated_at: '2026-03-08T10:00:00Z' },
  { expense_id: 42, month: 'April', year: 2026, category_id: 6, category_name: 'Medical', category_icon: '🏥', sub_category: 'Medicine', subcategory_icon: '💊', amount_inr: 1200, notes: 'Monthly medicines', is_delete: false, created_at: '2026-04-15T10:00:00Z', updated_at: '2026-04-15T10:00:00Z' },
  { expense_id: 43, month: 'May', year: 2026, category_id: 6, category_name: 'Medical', category_icon: '�', sub_category: 'Checkup', subcategory_icon: '🩺', amount_inr: 2500, notes: 'Health checkup', is_delete: false, created_at: '2026-05-20T10:00:00Z', updated_at: '2026-05-20T10:00:00Z' },
  { expense_id: 44, month: 'June', year: 2026, category_id: 7, category_name: 'Misc', category_icon: '📦', sub_category: 'Gifts', subcategory_icon: '�', amount_inr: 3000, notes: 'Birthday gift', is_delete: false, created_at: '2026-06-18T10:00:00Z', updated_at: '2026-06-18T10:00:00Z' },
];

// ============================================
// MOCK CATEGORY DATA
// ============================================
export const MOCK_CATEGORY_DATA = [
  // Home categories
  { category_id: 1, category_name: 'Home', category_icon: '🏠', sub_category: 'Monthly Rent', subcategory_icon: '🏡', notes: 'Housing expenses', is_active: true, created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z' },
  { category_id: 2, category_name: 'Home', category_icon: '🏠', sub_category: 'Electricity', subcategory_icon: '⚡', notes: 'Utility bills', is_active: true, created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z' },
  { category_id: 3, category_name: 'Home', category_icon: '🏠', sub_category: 'Groceries', subcategory_icon: '🛒', notes: 'Monthly groceries', is_active: true, created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z' },
  { category_id: 4, category_name: 'Home', category_icon: '🏠', sub_category: 'Internet', subcategory_icon: '📡', notes: 'Broadband & Wi-Fi', is_active: true, created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z' },
  { category_id: 5, category_name: 'Home', category_icon: '🏠', sub_category: 'Maintenance', subcategory_icon: '🔧', notes: 'Society maintenance', is_active: true, created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z' },
  
  // Abi categories (Personal)
  { category_id: 6, category_name: 'Abi', category_icon: '�', sub_category: 'Personal Care', subcategory_icon: '💄', notes: 'Beauty & skincare', is_active: true, created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z' },
  { category_id: 7, category_name: 'Abi', category_icon: '👩', sub_category: 'Clothing', subcategory_icon: '👗', notes: 'Apparel shopping', is_active: true, created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z' },
  { category_id: 8, category_name: 'Abi', category_icon: '�', sub_category: 'Entertainment', subcategory_icon: '🎬', notes: 'Movies & events', is_active: true, created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z' },
  { category_id: 9, category_name: 'Abi', category_icon: '👩', sub_category: 'Food & Dining', subcategory_icon: '🍽️', notes: 'Restaurants', is_active: true, created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z' },
  { category_id: 10, category_name: 'Abi', category_icon: '👩', sub_category: 'Travel', subcategory_icon: '✈️', notes: 'Trips & vacations', is_active: true, created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z' },
  { category_id: 11, category_name: 'Abi', category_icon: '👩', sub_category: 'Health & Fitness', subcategory_icon: '�️', notes: 'Gym & wellness', is_active: true, created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z' },
  { category_id: 12, category_name: 'Abi', category_icon: '👩', sub_category: 'Education', subcategory_icon: '�', notes: 'Courses & learning', is_active: true, created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z' },
  
  // BB categories (Family/Baby)
  { category_id: 13, category_name: 'BB', category_icon: '👶', sub_category: 'Baby Care', subcategory_icon: '🍼', notes: 'Baby essentials', is_active: true, created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z' },
  { category_id: 14, category_name: 'BB', category_icon: '👶', sub_category: 'Toys & Games', subcategory_icon: '🧸', notes: 'Toys & educational', is_active: true, created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z' },
  { category_id: 15, category_name: 'BB', category_icon: '�', sub_category: 'Clothing', subcategory_icon: '👕', notes: 'Baby clothes', is_active: true, created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z' },
  { category_id: 16, category_name: 'BB', category_icon: '👶', sub_category: 'Medical', subcategory_icon: '💊', notes: 'Baby health', is_active: true, created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z' },
  
  // Investment categories
  { category_id: 17, category_name: 'Investment', category_icon: '📈', sub_category: 'MF - SIP', subcategory_icon: '📊', notes: 'Mutual fund SIP', is_active: true, created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z' },
  { category_id: 18, category_name: 'Investment', category_icon: '�', sub_category: 'PPF', subcategory_icon: '�', notes: 'Public Provident Fund', is_active: true, created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z' },
  { category_id: 19, category_name: 'Investment', category_icon: '📈', sub_category: 'Stocks', subcategory_icon: '�', notes: 'Direct equity', is_active: true, created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z' },
  { category_id: 20, category_name: 'Investment', category_icon: '📈', sub_category: 'Physical Gold', subcategory_icon: '🥇', notes: 'Gold coins & bars', is_active: true, created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z' },
  { category_id: 21, category_name: 'Investment', category_icon: '�', sub_category: 'NPS', subcategory_icon: '🏛️', notes: 'National Pension', is_active: true, created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z' },
  { category_id: 22, category_name: 'Investment', category_icon: '📈', sub_category: 'FD', subcategory_icon: '🏦', notes: 'Fixed Deposit', is_active: true, created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z' },
  
  // Other categories
  { category_id: 23, category_name: 'Transport', category_icon: '🚗', sub_category: 'Fuel', subcategory_icon: '⛽', notes: 'Vehicle fuel', is_active: true, created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z' },
  { category_id: 24, category_name: 'Transport', category_icon: '🚗', sub_category: 'Service', subcategory_icon: '🔧', notes: 'Vehicle service', is_active: true, created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z' },
  { category_id: 25, category_name: 'Medical', category_icon: '🏥', sub_category: 'Medicine', subcategory_icon: '💊', notes: 'Medical expenses', is_active: true, created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z' },
  { category_id: 26, category_name: 'Medical', category_icon: '🏥', sub_category: 'Checkup', subcategory_icon: '🩺', notes: 'Health checkups', is_active: true, created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z' },
  { category_id: 27, category_name: 'Misc', category_icon: '📦', sub_category: 'Gifts', subcategory_icon: '🎁', notes: 'Gifts & misc', is_active: true, created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z' },
];

// ============================================
// MOCK DEBT DATA
// ============================================
export const MOCK_DEBT_DATA = [
  { debt_id: 1, debt_type: 'debt' as const, loan_name: 'Education Loan', bank_or_person: 'State Bank', principal_amount: 500000, interest_rate: 8.5, emi_amount: 12500, emi_start_date: '2022-06-01', emi_end_date: '2027-06-01', outstanding_amount: 180000, amount_paid: 320000, status: 'open' as const, notes: 'UG degree loan', is_delete: false, created_at: '2022-06-01T10:00:00Z', updated_at: '2026-06-01T10:00:00Z' },
  { debt_id: 2, debt_type: 'debt' as const, loan_name: 'Personal Loan', bank_or_person: 'HDFC Bank', principal_amount: 300000, interest_rate: 12.0, emi_amount: 10000, emi_start_date: '2024-01-01', emi_end_date: '2027-01-01', outstanding_amount: 150000, amount_paid: 150000, status: 'open' as const, notes: 'Personal expenses', is_delete: false, created_at: '2024-01-01T10:00:00Z', updated_at: '2026-06-01T10:00:00Z' },
  { debt_id: 3, debt_type: 'debt' as const, loan_name: 'Gold Loan', bank_or_person: 'Indian Bank', principal_amount: 200000, interest_rate: 7.0, emi_amount: null, emi_start_date: '2023-03-01', emi_end_date: '2024-03-01', outstanding_amount: 0, amount_paid: 214000, status: 'closed' as const, notes: 'Closed in 2024', is_delete: false, created_at: '2023-03-01T10:00:00Z', updated_at: '2024-03-15T10:00:00Z' },
  { debt_id: 4, debt_type: 'receivable' as const, loan_name: 'Personal Loan', bank_or_person: 'Friend - Ravi', principal_amount: 50000, interest_rate: null, emi_amount: null, emi_start_date: null, emi_end_date: '2026-12-31', outstanding_amount: 30000, amount_paid: 20000, status: 'open' as const, notes: 'Lent to friend for emergency', is_delete: false, created_at: '2025-08-01T10:00:00Z', updated_at: '2026-02-01T10:00:00Z' },
  { debt_id: 5, debt_type: 'receivable' as const, loan_name: 'Other', bank_or_person: 'Cousin - Priya', principal_amount: 25000, interest_rate: null, emi_amount: null, emi_start_date: null, emi_end_date: null, outstanding_amount: 0, amount_paid: 25000, status: 'closed' as const, notes: 'Returned in full', is_delete: false, created_at: '2025-01-01T10:00:00Z', updated_at: '2025-06-01T10:00:00Z' },
];

// ============================================
// MOCK TAX DATA
// ============================================
export const MOCK_TAX_DATA = [
  { tax_id: 1, year: 2026, month: 1, tax_paid: 8500, taxable_income: 85000, status: 'paid' as const, payment_date: '2026-01-30', payment_mode: 'Online', notes: 'TDS deducted', is_deleted: false, created_at: '2026-01-30T10:00:00Z', updated_at: '2026-01-30T10:00:00Z' },
  { tax_id: 2, year: 2026, month: 2, tax_paid: 8500, taxable_income: 85000, status: 'paid' as const, payment_date: '2026-02-28', payment_mode: 'Online', notes: 'TDS deducted', is_deleted: false, created_at: '2026-02-28T10:00:00Z', updated_at: '2026-02-28T10:00:00Z' },
  { tax_id: 3, year: 2026, month: 3, tax_paid: 8500, taxable_income: 85000, status: 'paid' as const, payment_date: '2026-03-31', payment_mode: 'Online', notes: 'TDS deducted', is_deleted: false, created_at: '2026-03-31T10:00:00Z', updated_at: '2026-03-31T10:00:00Z' },
  { tax_id: 4, year: 2026, month: 4, tax_paid: 9000, taxable_income: 90000, status: 'paid' as const, payment_date: '2026-04-30', payment_mode: 'Online', notes: 'TDS deducted - post increment', is_deleted: false, created_at: '2026-04-30T10:00:00Z', updated_at: '2026-04-30T10:00:00Z' },
  { tax_id: 5, year: 2026, month: 5, tax_paid: 9000, taxable_income: 90000, status: 'paid' as const, payment_date: '2026-05-31', payment_mode: 'Online', notes: 'TDS deducted', is_deleted: false, created_at: '2026-05-31T10:00:00Z', updated_at: '2026-05-31T10:00:00Z' },
  { tax_id: 6, year: 2026, month: 6, tax_paid: 0, taxable_income: 90000, status: 'pending' as const, payment_date: null, payment_mode: null, notes: 'Pending for June', is_deleted: false, created_at: '2026-06-01T10:00:00Z', updated_at: '2026-06-01T10:00:00Z' },
  { tax_id: 7, year: 2025, month: 10, tax_paid: 8000, taxable_income: 80000, status: 'paid' as const, payment_date: '2025-10-31', payment_mode: 'Online', notes: 'TDS', is_deleted: false, created_at: '2025-10-31T10:00:00Z', updated_at: '2025-10-31T10:00:00Z' },
  { tax_id: 8, year: 2025, month: 11, tax_paid: 8000, taxable_income: 80000, status: 'paid' as const, payment_date: '2025-11-30', payment_mode: 'Online', notes: 'TDS', is_deleted: false, created_at: '2025-11-30T10:00:00Z', updated_at: '2025-11-30T10:00:00Z' },
  { tax_id: 9, year: 2025, month: 12, tax_paid: 8000, taxable_income: 80000, status: 'paid' as const, payment_date: '2025-12-31', payment_mode: 'Online', notes: 'TDS', is_deleted: false, created_at: '2025-12-31T10:00:00Z', updated_at: '2025-12-31T10:00:00Z' },
];

// ============================================
// MOCK INVESTMENT DATA
// ============================================
export const MOCK_INVESTMENT_DATA = [
  { investment_id: 1, type: 'MF - SIP', status: 'Active', name: 'Axis Bluechip Fund', year: 2024, invested_amount: 60000, interest_earned: 8500, notes: 'Monthly SIP ₹5000', is_deleted: false, created_at: '2024-01-01T10:00:00Z', updated_at: '2026-06-01T10:00:00Z' },
  { investment_id: 2, type: 'MF - SIP', status: 'Active', name: 'Axis Bluechip Fund', year: 2025, invested_amount: 60000, interest_earned: 6200, notes: 'Monthly SIP ₹5000', is_deleted: false, created_at: '2025-01-01T10:00:00Z', updated_at: '2026-06-01T10:00:00Z' },
  { investment_id: 3, type: 'MF - SIP', status: 'Active', name: 'Axis Bluechip Fund', year: 2026, invested_amount: 30000, interest_earned: 2100, notes: 'Monthly SIP ₹5000 (Jan-Jun)', is_deleted: false, created_at: '2026-01-01T10:00:00Z', updated_at: '2026-06-01T10:00:00Z' },
  { investment_id: 4, type: 'PPF', status: 'Active', name: 'PPF - Post Office', year: 2023, invested_amount: 150000, interest_earned: 11400, notes: 'Annual contribution', is_deleted: false, created_at: '2023-04-01T10:00:00Z', updated_at: '2024-04-01T10:00:00Z' },
  { investment_id: 5, type: 'PPF', status: 'Active', name: 'PPF - Post Office', year: 2024, invested_amount: 150000, interest_earned: 11400, notes: 'Annual contribution', is_deleted: false, created_at: '2024-04-01T10:00:00Z', updated_at: '2025-04-01T10:00:00Z' },
  { investment_id: 6, type: 'PPF', status: 'Active', name: 'PPF - Post Office', year: 2025, invested_amount: 150000, interest_earned: 11400, notes: 'Annual contribution', is_deleted: false, created_at: '2025-04-01T10:00:00Z', updated_at: '2026-04-01T10:00:00Z' },
  { investment_id: 7, type: 'Physical Gold', status: 'Active', name: 'Gold Coins 24K', year: 2024, invested_amount: 100000, interest_earned: 18000, notes: '10g gold coin', is_deleted: false, created_at: '2024-11-01T10:00:00Z', updated_at: '2026-06-01T10:00:00Z' },
  { investment_id: 8, type: 'Stocks', status: 'Active', name: 'NIFTY50 Index', year: 2025, invested_amount: 50000, interest_earned: 4200, notes: 'Direct equity', is_deleted: false, created_at: '2025-06-01T10:00:00Z', updated_at: '2026-06-01T10:00:00Z' },
  { investment_id: 9, type: 'RD', status: 'Past', name: 'SBI RD', year: 2023, invested_amount: 24000, interest_earned: 1680, notes: '₹2000/month RD - Matured', is_deleted: false, created_at: '2023-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z' },
  { investment_id: 10, type: 'NPS', status: 'Active', name: 'NPS Tier-1', year: 2025, invested_amount: 50000, interest_earned: 5500, notes: 'Tax saving NPS', is_deleted: false, created_at: '2025-03-01T10:00:00Z', updated_at: '2026-06-01T10:00:00Z' },
];

// ============================================
// MOCK LIFELINE DATA (Hand-in-hand / Savings tracker)
// ============================================
export const MOCK_LIFELINE_DATA = [
  { lifeline_id: 1, entry_date: '2026-06-01', amount_inr: 520000, notes: 'Total savings as of June 2026', is_delete: false, created_at: '2026-06-01T10:00:00Z', updated_at: '2026-06-01T10:00:00Z' },
  { lifeline_id: 2, entry_date: '2026-05-01', amount_inr: 485000, notes: 'Total savings as of May 2026', is_delete: false, created_at: '2026-05-01T10:00:00Z', updated_at: '2026-05-01T10:00:00Z' },
  { lifeline_id: 3, entry_date: '2026-04-01', amount_inr: 450000, notes: 'Total savings as of April 2026', is_delete: false, created_at: '2026-04-01T10:00:00Z', updated_at: '2026-04-01T10:00:00Z' },
  { lifeline_id: 4, entry_date: '2026-03-01', amount_inr: 420000, notes: 'Total savings as of March 2026', is_delete: false, created_at: '2026-03-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  { lifeline_id: 5, entry_date: '2026-02-01', amount_inr: 395000, notes: 'Total savings as of Feb 2026', is_delete: false, created_at: '2026-02-01T10:00:00Z', updated_at: '2026-02-01T10:00:00Z' },
  { lifeline_id: 6, entry_date: '2026-01-01', amount_inr: 370000, notes: 'Total savings as of Jan 2026', is_delete: false, created_at: '2026-01-01T10:00:00Z', updated_at: '2026-01-01T10:00:00Z' },
  { lifeline_id: 7, entry_date: '2025-12-01', amount_inr: 350000, notes: 'Year-end savings 2025', is_delete: false, created_at: '2025-12-01T10:00:00Z', updated_at: '2025-12-01T10:00:00Z' },
  { lifeline_id: 8, entry_date: '2025-06-01', amount_inr: 280000, notes: 'Mid-year savings 2025', is_delete: false, created_at: '2025-06-01T10:00:00Z', updated_at: '2025-06-01T10:00:00Z' },
];
