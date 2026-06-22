import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaginationHelper, SortingHelper, SortDirection } from '../../shared';
import { ExpenseService, ExpenseEntry } from '../../services/expense.service';
import { DebtService, DebtEntry } from '../../services/debt.service';
import { InvestmentService, InvestmentEntry } from '../../services/investment.service';
import { IncomeService } from '../../services/income.service';

type HlaRecord = {
  id: number;
  name: string;
  icon: string;
  type: 'debt' | 'investment' | 'expense' | 'family' | 'asset' | 'subscription';
  status: 'active' | 'pending' | 'completed';
  amount: number;
  isHardcoded: boolean;
};

type SortColumn = 'name' | 'type' | 'status' | 'amount';

type HlaCategoryConfig = {
  id: number;
  name: string;
  icon: string;
  type: 'debt' | 'investment' | 'expense' | 'family' | 'asset' | 'subscription';
  status: 'active' | 'pending' | 'completed';
  dataSource: 'expense' | 'debt' | 'investment' | 'fixed';
  fixedAmount?: number;
  categoryPatterns?: string[];
  subcategoryPatterns?: RegExp[];
  includeAllFromCategories?: string[];  // Categories where ALL expenses should be included
  debtLoanName?: string;
  investmentNamePattern?: RegExp;
};

@Component({
  selector: 'app-hla-view',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './hla-view.page.html',
  styleUrls: ['./hla-view.page.scss']
})
export class HlaViewPage {
  private expenseService = inject(ExpenseService);
  private debtService = inject(DebtService);
  private investmentService = inject(InvestmentService);
  private incomeService = inject(IncomeService);
  
  protected loading = signal<boolean>(false);
  protected pageTitle = 'High Level Allocation Overview';
  protected currentDate: string;

  private readonly hlaConfigs: HlaCategoryConfig[] = [
    { id: 1, name: 'Family EMI - Debts', icon: '💳', type: 'debt', status: 'active', dataSource: 'expense', categoryPatterns: ['Family'], subcategoryPatterns: [/^(emi|kadan|hault)/i] },
    { id: 2, name: 'Gold Loan + Education Loan', icon: '🥇', type: 'expense', status: 'completed', dataSource: 'fixed', fixedAmount: 570000 },
    { id: 3, name: 'Stock + MF + PPF + RD + NPS', icon: '📈', type: 'investment', status: 'active', dataSource: 'expense', categoryPatterns: ['Investment'], subcategoryPatterns: [/stock|mf|sip|mutual|ppf|rd|recurring|nps/i] },
    { id: 4, name: 'Crypto Loss', icon: '₿', type: 'expense', status: 'completed', dataSource: 'fixed', fixedAmount: 150000 },
    { id: 5, name: 'Jewelry', icon: '💍', type: 'investment', status: 'completed', dataSource: 'fixed', fixedAmount: 60000 },
    { id: 6, name: 'Furniture', icon: '🪑', type: 'family', status: 'completed', dataSource: 'expense', categoryPatterns: ['Home'], subcategoryPatterns: [/^(sofa\s*cupboard|ac|dress\s*plast|furniture)/i] },
    { id: 7, name: 'Trips', icon: '✈️', type: 'expense', status: 'completed', dataSource: 'fixed', fixedAmount: 100000 },
    { id: 8, name: 'Wifi + Recharge', icon: '📶', type: 'expense', status: 'active', dataSource: 'expense', includeAllFromCategories: ['Wifi'], categoryPatterns: ['Home', 'Family', 'Personal'], subcategoryPatterns: [/recharge|jio|phone\s*recharge|netflix|prime|hotstar|spotify|subscription|google|youtube/i] },
    { id: 9, name: 'Friend A - Debts', icon: '👩', type: 'debt', status: 'active', dataSource: 'fixed', fixedAmount: 42500 },
    { id: 10, name: 'Chit Fund', icon: '📝', type: 'investment', status: 'completed', dataSource: 'expense', categoryPatterns: ['Home'], subcategoryPatterns: [/chit/i] },
    { id: 11, name: 'Parent 1', icon: '👩', type: 'family', status: 'active', dataSource: 'fixed', fixedAmount: 30000 },
    { id: 12, name: 'Parent 2', icon: '👨‍🦳', type: 'family', status: 'active', dataSource: 'fixed', fixedAmount: 30000 },
    { id: 13, name: 'Sibling', icon: '👦', type: 'family', status: 'active', dataSource: 'fixed', fixedAmount: 10000 },
    { id: 14, name: 'Vehicle', icon: '🛵', type: 'expense', status: 'active', dataSource: 'expense', categoryPatterns: ['Personal'], subcategoryPatterns: [/scooty|vehicle|bike/i] },
    { id: 15, name: 'Friend B - Debts', icon: '👨', type: 'debt', status: 'active', dataSource: 'fixed', fixedAmount: 9000 },
    { id: 16, name: 'Medical', icon: '🏥', type: 'expense', status: 'active', dataSource: 'expense', categoryPatterns: ['Family', 'Personal'], subcategoryPatterns: [/medical|hospital|doctor/i] },
    { id: 17, name: 'Self', icon: '🧿', type: 'family', status: 'active', dataSource: 'fixed', fixedAmount: 100000 },
    { id: 18, name: 'Religious', icon: '🛕', type: 'family', status: 'active', dataSource: 'fixed', fixedAmount: 12000 },
    { id: 19, name: 'Family Gifts', icon: '🎁', type: 'family', status: 'active', dataSource: 'fixed', fixedAmount: 50000 },
  ];

  private expenseData = this.expenseService.getExpensesSignal();
  private debtData = this.debtService.getDebtsSignal();
  private investmentData = this.investmentService.investments;

  protected hlaRecords = computed<HlaRecord[]>(() => {
    const expenses = this.expenseData().filter((e: ExpenseEntry) => !e.isDeleted);
    const debts = this.debtData().filter((d: DebtEntry) => !d.isDeleted);
    const investments = this.investmentData().filter((i: InvestmentEntry) => !i.is_deleted);
    
    return this.hlaConfigs.map(config => {
      let totalAmount = 0;
      
      if (config.dataSource === 'expense') {
        const matchingExpenses = expenses.filter((exp: ExpenseEntry) => {
          const categoryLower = exp.categoryName.toLowerCase();
          
          // Check if this expense belongs to a category where ALL should be included
          const includeAll = config.includeAllFromCategories?.some(
            cat => categoryLower.includes(cat.toLowerCase()) || cat.toLowerCase().includes(categoryLower)
          );
          if (includeAll) return true;
          
          // Otherwise, check category + subcategory pattern match
          const categoryMatch = config.categoryPatterns?.some(
            pattern => categoryLower === pattern.toLowerCase()
          );
          if (!categoryMatch) return false;
          const subcategory = exp.subcategory || '';
          return config.subcategoryPatterns?.some(pattern => pattern.test(subcategory));
        });
        totalAmount = matchingExpenses.reduce((sum: number, exp: ExpenseEntry) => sum + exp.amount, 0);
      } else if (config.dataSource === 'debt') {
        const matchingDebts = debts.filter((debt: DebtEntry) => debt.loanName === config.debtLoanName);
        totalAmount = matchingDebts.reduce((sum: number, debt: DebtEntry) => sum + debt.amountPaid, 0);
      } else if (config.dataSource === 'investment') {
        const matchingInvestments = investments.filter((inv: InvestmentEntry) => config.investmentNamePattern?.test(inv.name));
        totalAmount = matchingInvestments.reduce((sum: number, inv: InvestmentEntry) => sum + inv.invested_amount + (inv.interest_earned || 0), 0);
      } else if (config.dataSource === 'fixed') {
        totalAmount = config.fixedAmount || 0;
      }
      
      return { id: config.id, name: config.name, icon: config.icon, type: config.type, status: config.status, amount: totalAmount, isHardcoded: config.dataSource === 'fixed' };
    });
  });

  protected sortColumn = signal<SortColumn>('amount');
  protected sortDirection = signal<SortDirection>('desc');
  protected currentPage = signal<number>(1);
  protected pageSize = signal<number>(25);
  protected readonly pageSizeOptions = PaginationHelper.PAGE_SIZE_OPTIONS;

  protected sortedRecords = computed(() => SortingHelper.sort(this.hlaRecords(), this.sortColumn(), this.sortDirection()));
  protected paginationResult = computed(() => PaginationHelper.paginate(this.sortedRecords(), this.currentPage(), this.pageSize()));
  protected paginatedRecords = computed(() => this.paginationResult().items);
  protected totalPages = computed(() => this.paginationResult().totalPages);
  protected paginationInfo = computed(() => PaginationHelper.getPaginationInfo(this.paginationResult()));
  protected totalAmount = computed(() => this.hlaRecords().reduce((sum, record) => sum + record.amount, 0));
  protected totalIncome = computed(() => this.incomeService.getTotalIncome());
  protected balance = computed(() => this.totalIncome() - this.totalAmount());
  protected investmentTotal = computed(() => this.hlaRecords().filter(r => r.type === 'investment').reduce((sum, r) => sum + r.amount, 0));
  protected debtTotal = computed(() => this.hlaRecords().filter(r => r.type === 'debt').reduce((sum, r) => sum + r.amount, 0));
  protected familyTotal = computed(() => this.hlaRecords().filter(r => r.type === 'family').reduce((sum, r) => sum + r.amount, 0));
  protected expenseTotal = computed(() => this.hlaRecords().filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0));

  // Popup state
  protected showPopup = signal<boolean>(false);
  protected popupType = signal<string>('');
  protected popupTitle = computed(() => {
    const typeMap: Record<string, string> = {
      'investment': 'Investment',
      'debt': 'Debts',
      'family': 'Family',
      'expense': 'Expense'
    };
    return typeMap[this.popupType()] || '';
  });
  protected popupRecords = computed(() => this.hlaRecords().filter(r => r.type === this.popupType()));
  protected popupTotal = computed(() => this.popupRecords().reduce((sum, r) => sum + r.amount, 0));

  constructor() {
    const now = new Date();
    this.currentDate = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  getActiveCount(): number { return this.hlaRecords().filter((r: HlaRecord) => r.status === 'active').length; }
  getPendingCount(): number { return this.hlaRecords().filter((r: HlaRecord) => r.status === 'pending').length; }

  sortBy(column: SortColumn): void {
    if (this.sortColumn() === column) {
      this.sortDirection.set(SortingHelper.toggleDirection(this.sortDirection()));
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
    this.currentPage.set(1);
  }

  getSortIcon(column: SortColumn): string { return SortingHelper.getSortIcon(column, this.sortColumn(), this.sortDirection()); }
  getPageNumbers(): number[] { return PaginationHelper.getPageNumbers(this.currentPage(), this.totalPages()); }
  goToPage(page: number): void { if (page >= 1 && page <= this.totalPages()) this.currentPage.set(page); }
  nextPage(): void { if (this.currentPage() < this.totalPages()) this.currentPage.set(this.currentPage() + 1); }
  prevPage(): void { if (this.currentPage() > 1) this.currentPage.set(this.currentPage() - 1); }
  onPageSizeChange(): void { this.currentPage.set(1); }
  getRowNumber(index: number): number { return (this.currentPage() - 1) * this.pageSize() + index + 1; }
  formatCurrency(amount: number): string { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount); }

  showTypePopup(type: string): void {
    this.popupType.set(type);
    this.showPopup.set(true);
  }

  closePopup(): void {
    this.showPopup.set(false);
    this.popupType.set('');
  }

  async refreshData(): Promise<void> {
    this.loading.set(true);
    try {
      await Promise.all([
        this.expenseService.loadExpenseData(),
        this.debtService.loadDebtData(),
        this.investmentService.loadInvestmentData(),
        this.incomeService.loadIncomeData()
      ]);
    } finally {
      this.loading.set(false);
    }
  }
}
