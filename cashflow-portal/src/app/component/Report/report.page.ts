import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IncomeService, IncomeEntry } from '../../services/income.service';
import { ExpenseService, ExpenseEntry } from '../../services/expense.service';
import { DebtService, DebtEntry } from '../../services/debt.service';
import { InvestmentService, InvestmentEntry, InvestmentStatus } from '../../services/investment.service';
import { TaxService, TaxEntry } from '../../services/tax.service';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report.page.html',
  styleUrls: ['./report.page.scss']
})
export class ReportPage implements OnInit {
  private incomeService = inject(IncomeService);
  private expenseService = inject(ExpenseService);
  private debtService = inject(DebtService);
  private investmentService = inject(InvestmentService);
  private taxService = inject(TaxService);

  protected readonly months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  protected isLoading = signal(true);
  protected selectedYear = signal<number>(new Date().getFullYear());
  protected showDownloadMenu = signal(false);

  protected incomeData = signal<IncomeEntry[]>([]);
  protected expenseData = signal<ExpenseEntry[]>([]);
  protected debtData = signal<DebtEntry[]>([]);
  protected investmentData = signal<InvestmentEntry[]>([]);
  protected taxData = signal<TaxEntry[]>([]);

  protected availableYears = computed(() => {
    const years = new Set<number>();
    this.incomeData().forEach(i => years.add(i.year));
    this.expenseData().forEach(e => years.add(e.year));
    years.add(new Date().getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  });

  protected financialOverview = computed(() => {
    const year = this.selectedYear();
    const totalIncome = this.incomeData().filter(i => i.year === year).reduce((sum, i) => sum + i.amount, 0);
    const totalExpense = this.expenseData().filter(e => e.year === year && !e.isDeleted).reduce((sum, e) => sum + e.amount, 0);
    const totalDebts = this.debtData().filter(d => d.type === 'debt' && d.status === 'open' && !d.isDeleted).reduce((sum, d) => sum + d.outstandingAmount, 0);
    const totalInvestments = this.investmentData().filter(inv => inv.status === InvestmentStatus.ACTIVE && !inv.is_deleted).reduce((sum, inv) => sum + inv.invested_amount, 0);
    const totalInvestmentReturns = this.investmentData().filter(inv => inv.status === InvestmentStatus.ACTIVE && !inv.is_deleted).reduce((sum, inv) => sum + (inv.interest_earned || 0), 0);
    const totalTaxPaid = this.taxData().filter(t => t.year === year && !t.is_deleted).reduce((sum, t) => sum + t.tax_paid, 0);
    return { totalIncome, totalExpense, totalBalance: totalIncome - totalExpense, totalDebts, totalInvestments, totalInvestmentReturns, totalTaxPaid };
  });

  protected chartData = computed(() => {
    const year = this.selectedYear();
    const incomeEntries = this.incomeData();
    console.log(`📊 Chart Data for ${year}:`, incomeEntries.filter(i => i.year === year));
    return this.months.map(month => {
      const monthIncome = incomeEntries.filter(i => i.year === year && i.month === month);
      const income = monthIncome.reduce((sum, i) => sum + i.amount, 0);
      const expense = this.expenseData().filter(e => e.year === year && e.month === month && !e.isDeleted).reduce((sum, e) => sum + e.amount, 0);
      if (income > 0) console.log(`  ${month}: Income ₹${income}`);
      return { label: month.substring(0, 3), income, expense };
    });
  });

  protected maxChartValue = computed(() => Math.max(...this.chartData().flatMap(d => [d.income, d.expense]), 1));

  async ngOnInit(): Promise<void> {
    this.isLoading.set(true);
    try {
      await Promise.all([
        this.incomeService.loadIncomeData(),
        this.expenseService.loadExpenseData(),
        this.debtService.loadDebtData(),
        this.investmentService.loadInvestmentData(),
        this.taxService.loadTaxEntries()
      ]);
      this.incomeData.set(this.incomeService.getEntriesSignal()());
      this.expenseData.set(this.expenseService.getExpensesSignal()());
      this.debtData.set(this.debtService.getDebtsSignal()());
      this.investmentData.set(this.investmentService.investments());
      this.taxData.set(this.taxService.getTaxEntriesSignal()());
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  protected selectYear(year: number): void { this.selectedYear.set(year); }
  protected toggleDownloadMenu(): void { this.showDownloadMenu.update(v => !v); }
  protected getChartBarHeight(value: number): number { return this.maxChartValue() > 0 ? (value / this.maxChartValue()) * 100 : 0; }
  
  protected formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  }

  protected formatCompactCurrency(value: number): string {
    if (value >= 10000000) return '₹' + (value / 10000000).toFixed(1) + ' Cr';
    if (value >= 100000) return '₹' + (value / 100000).toFixed(1) + ' L';
    if (value >= 1000) return '₹' + (value / 1000).toFixed(0) + ' K';
    return '₹' + value.toFixed(0);
  }

  protected downloadReport(format: 'csv' | 'excel'): void {
    this.showDownloadMenu.set(false);
    const year = this.selectedYear();
    const overview = this.financialOverview();
    const chartData = this.chartData();
    
    let content = format === 'excel' ? '\uFEFF' : '';
    content += `Financial Report - ${year}\n\n`;
    content += `Summary\nTotal Income,${overview.totalIncome}\nTotal Expenses,${overview.totalExpense}\nNet Balance,${overview.totalBalance}\nTotal Investments,${overview.totalInvestments}\nOutstanding Debts,${overview.totalDebts}\nTax Paid,${overview.totalTaxPaid}\n\n`;
    content += `Monthly Breakdown\nMonth,Income,Expense,Balance\n`;
    chartData.forEach(m => { content += `${m.label},${m.income},${m.expense},${m.income - m.expense}\n`; });
    
    const blob = new Blob([content], { type: format === 'excel' ? 'application/vnd.ms-excel;charset=utf-8;' : 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Financial_Report_${year}.${format === 'excel' ? 'xls' : 'csv'}`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  protected printReport(): void {
    this.showDownloadMenu.set(false);
    const year = this.selectedYear();
    const overview = this.financialOverview();
    const printContent = `<html><head><title>Financial Report ${year}</title><style>body{font-family:Arial,sans-serif;padding:20px}h1{color:#1e3a5f}table{width:100%;border-collapse:collapse;margin:15px 0}th,td{border:1px solid #ddd;padding:10px;text-align:left}th{background:#f1f5f9}.positive{color:#16a34a}.negative{color:#dc2626}</style></head><body><h1>Financial Report - ${year}</h1><table><tr><th>Metric</th><th>Amount</th></tr><tr><td>Total Income</td><td class="positive">${this.formatCurrency(overview.totalIncome)}</td></tr><tr><td>Total Expenses</td><td class="negative">${this.formatCurrency(overview.totalExpense)}</td></tr><tr><td>Net Balance</td><td class="${overview.totalBalance >= 0 ? 'positive' : 'negative'}">${this.formatCurrency(overview.totalBalance)}</td></tr><tr><td>Investments</td><td>${this.formatCurrency(overview.totalInvestments)}</td></tr><tr><td>Outstanding Debts</td><td class="negative">${this.formatCurrency(overview.totalDebts)}</td></tr><tr><td>Tax Paid</td><td>${this.formatCurrency(overview.totalTaxPaid)}</td></tr></table></body></html>`;
    const printWindow = window.open('', '_blank');
    if (printWindow) { printWindow.document.write(printContent); printWindow.document.close(); printWindow.onload = () => printWindow.print(); }
  }

  protected async refreshData(): Promise<void> { await this.ngOnInit(); }
}
