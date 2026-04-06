import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  DebtService, 
  DebtEntry,
  DebtFormData,
  DebtType,
  DebtStatus,
  LoanName,
  RepaymentSchedule
} from '../../services/debt.service';

@Component({
  selector: 'app-debts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './debts.page.html',
  styleUrl: './debts.page.scss'
})
export class DebtsPage implements OnInit {
  private debtService = inject(DebtService);

  // Loan names enum for template
  protected readonly LoanName = LoanName;
  protected readonly Math = Math;

  // Signals for UI state
  protected selectedTab = signal<'all' | 'open' | 'closed' | 'deactivated'>('all');
  protected showAddModal = signal<boolean>(false);
  protected showEditModal = signal<boolean>(false);
  protected showDeleteModal = signal<boolean>(false);
  protected showDetailsModal = signal<boolean>(false);
  protected showRepaymentScheduleModal = signal<boolean>(false);
  protected showConsolidatedModal = signal<boolean>(false);
  protected showEMICalculator = signal<boolean>(false);
  protected showInterestBreakdownModal = signal<boolean>(false);
  protected selectedDebt = signal<DebtEntry | null>(null);
  protected repaymentSchedule = signal<RepaymentSchedule[]>([]);
  protected loadingSchedule = signal<boolean>(false);
  protected toastMessage = signal<string>('');
  protected toastVisible = signal<boolean>(false);

  // Sorting state for consolidated table
  protected sortColumn = signal<string>('');
  protected sortDirection = signal<'asc' | 'desc'>('asc');

  // Sorting state for interest breakdown
  protected interestSortColumn = signal<string>('');
  protected interestSortDirection = signal<'asc' | 'desc'>('asc');

  // Form data signals
  protected formType = signal<DebtType>('debt');
  protected formLoanName = signal<string>('');
  protected formBankOrPerson = signal<string>('');
  protected formPrincipalAmount = signal<number>(0);
  protected formInterestRate = signal<number>(0);
  protected formEmiAmount = signal<number>(0);
  protected formEmiStartDate = signal<string>('');
  protected formEmiEndDate = signal<string>('');
  protected formAmountPaid = signal<number>(0);
  protected formOutstandingAmount = signal<number>(0);
  protected formStatus = signal<DebtStatus>('open');
  protected formNotes = signal<string>('');

  // EMI Calculator signals
  protected calcPrincipal = signal<number>(0);
  protected calcRate = signal<number>(0);
  protected calcTenure = signal<number>(12);
  protected calculatedEMI = signal<number>(0);

  // Get data from service
  protected debts = this.debtService.getDebtsSignal();
  protected loading = this.debtService.getLoadingSignal();

  // Computed values
  protected summary = computed(() => this.debtService.getSummary());

  protected activeCount = computed(() => this.debts().filter(d => !d.isDeleted).length);
  protected deactivatedCount = computed(() => this.debts().filter(d => d.isDeleted).length);
  
  // Active debts with sorting
  protected activeDebts = computed(() => {
    const debts = this.debts().filter(d => !d.isDeleted);
    const column = this.sortColumn();
    const direction = this.sortDirection();
    
    if (!column) return debts;
    
    return [...debts].sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (column) {
        case 'loanName':
          aVal = a.loanName.toLowerCase();
          bVal = b.loanName.toLowerCase();
          break;
        case 'bankOrPerson':
          aVal = a.bankOrPerson.toLowerCase();
          bVal = b.bankOrPerson.toLowerCase();
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        case 'principalAmount':
          aVal = a.principalAmount;
          bVal = b.principalAmount;
          break;
        case 'amountPaid':
          aVal = a.amountPaid;
          bVal = b.amountPaid;
          break;
        case 'interestPaid':
          aVal = a.amountPaid - a.principalAmount;
          bVal = b.amountPaid - b.principalAmount;
          break;
        case 'outstandingAmount':
          aVal = a.outstandingAmount;
          bVal = b.outstandingAmount;
          break;
        case 'percentPaid':
          aVal = a.principalAmount > 0 ? (a.amountPaid / a.principalAmount) * 100 : 0;
          bVal = b.principalAmount > 0 ? (b.amountPaid / b.principalAmount) * 100 : 0;
          break;
        default:
          return 0;
      }
      
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  });
  
  // Computed values for consolidated summary
  protected totalPrincipal = computed(() => 
    this.activeDebts().reduce((sum, d) => sum + d.principalAmount, 0)
  );
  protected totalPaid = computed(() => 
    this.activeDebts().reduce((sum, d) => sum + d.amountPaid, 0)
  );
  protected totalPercentPaid = computed(() => 
    this.totalPrincipal() > 0 ? (this.totalPaid() / this.totalPrincipal()) * 100 : 0
  );

  protected filteredDebts = computed(() => {
    const tab = this.selectedTab();
    const allDebts = this.debts();
    
    switch (tab) {
      case 'deactivated':
        return allDebts.filter(d => d.isDeleted);
      case 'open':
        return allDebts.filter(d => d.status === 'open' && !d.isDeleted);
      case 'closed':
        return allDebts.filter(d => d.status === 'closed' && !d.isDeleted);
      case 'all':
      default:
        return allDebts.filter(d => !d.isDeleted);
    }
  });

  // Sorted interest breakdown
  protected sortedInterestBreakdown = computed(() => {
    const debts = this.activeDebts();
    const column = this.interestSortColumn();
    const direction = this.interestSortDirection();
    
    if (!column) return debts;
    
    return [...debts].sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (column) {
        case 'loanName':
          aVal = a.loanName.toLowerCase();
          bVal = b.loanName.toLowerCase();
          break;
        case 'bankOrPerson':
          aVal = a.bankOrPerson.toLowerCase();
          bVal = b.bankOrPerson.toLowerCase();
          break;
        case 'interestPaid':
          aVal = this.getInterestPaid(a);
          bVal = this.getInterestPaid(b);
          break;
        default:
          return 0;
      }
      
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  });

  // Loan names array for dropdown
  protected loanNames = Object.values(LoanName);

  ngOnInit(): void {
    console.log('🏦 Debts Page Initialized');
  }

  // Sort table
  protected sortTable(column: string): void {
    if (this.sortColumn() === column) {
      // Toggle direction if same column
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to ascending
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  // Sort interest breakdown table
  protected sortInterestBreakdown(column: string): void {
    if (this.interestSortColumn() === column) {
      // Toggle direction if same column
      this.interestSortDirection.set(this.interestSortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to ascending
      this.interestSortColumn.set(column);
      this.interestSortDirection.set('asc');
    }
  }

  // Open add modal
  protected openAddModal(): void {
    this.resetForm();
    this.showAddModal.set(true);
  }

  // Open edit modal
  protected openEditModal(debt: DebtEntry): void {
    this.selectedDebt.set(debt);
    this.formType.set(debt.type);
    this.formLoanName.set(debt.loanName);
    this.formBankOrPerson.set(debt.bankOrPerson);
    this.formPrincipalAmount.set(debt.principalAmount);
    this.formInterestRate.set(debt.interestRate || 0);
    this.formEmiAmount.set(debt.emiAmount || 0);
    this.formEmiStartDate.set(debt.emiStartDate || '');
    this.formEmiEndDate.set(debt.emiEndDate || '');
    this.formAmountPaid.set(debt.amountPaid);
    this.formOutstandingAmount.set(debt.outstandingAmount);
    this.formStatus.set(debt.status);
    this.formNotes.set(debt.notes || '');
    this.showEditModal.set(true);
  }

  // Open delete confirmation
  protected openDeleteModal(debt: DebtEntry): void {
    this.selectedDebt.set(debt);
    this.showDeleteModal.set(true);
  }

  // Open details modal
  protected openDetailsModal(debt: DebtEntry): void {
    this.selectedDebt.set(debt);
    this.showDetailsModal.set(true);
  }

  // Open repayment schedule modal
  protected async openRepaymentScheduleModal(debt: DebtEntry): Promise<void> {
    this.selectedDebt.set(debt);
    this.showRepaymentScheduleModal.set(true);
    
    // Load repayment schedule if it's the Personal Loan - Top Up
    if (debt.loanName === 'Personal Loan - Top Up') {
      this.loadingSchedule.set(true);
      try {
        console.log('Loading repayment schedule for:', debt.loanName);
        const schedule = await this.debtService.getRepaymentSchedule(debt.id);
        console.log('Loaded schedule entries:', schedule.length);
        this.repaymentSchedule.set(schedule);
      } catch (err) {
        console.error('Failed to load repayment schedule:', err);
      } finally {
        this.loadingSchedule.set(false);
      }
    } else {
      console.log('No schedule for loan type:', debt.loanName);
      this.repaymentSchedule.set([]);
    }
  }

  // Open consolidated view modal
  protected openConsolidatedModal(): void {
    this.showConsolidatedModal.set(true);
  }

  // Open repayment schedule for Personal Loan - Top Up from widget
  protected async openRepaymentScheduleFromWidget(): Promise<void> {
    // Find the Personal Loan - Top Up debt
    const personalLoanTopUp = this.activeDebts().find(d => d.loanName === 'Personal Loan - Top Up');
    
    if (personalLoanTopUp) {
      await this.openRepaymentScheduleModal(personalLoanTopUp);
    } else {
      // If no Personal Loan - Top Up found, show consolidated modal as fallback
      this.openConsolidatedModal();
    }
  }

  // Open EMI calculator
  protected openEMICalculator(): void {
    this.showEMICalculator.set(true);
  }

  // Open interest breakdown modal
  protected openInterestBreakdownModal(): void {
    this.showInterestBreakdownModal.set(true);
  }

  // Close interest breakdown modal
  protected closeInterestBreakdownModal(): void {
    this.showInterestBreakdownModal.set(false);
  }

  // Close all modals
  protected closeModals(): void {
    this.showAddModal.set(false);
    this.showEditModal.set(false);
    this.showDeleteModal.set(false);
    this.showDetailsModal.set(false);
    this.showRepaymentScheduleModal.set(false);
    this.showConsolidatedModal.set(false);
    this.showEMICalculator.set(false);
    this.showInterestBreakdownModal.set(false);
    this.selectedDebt.set(null);
    this.repaymentSchedule.set([]);
  }

  // Reset form
  protected resetForm(): void {
    this.formType.set('debt');
    this.formLoanName.set('');
    this.formBankOrPerson.set('');
    this.formPrincipalAmount.set(0);
    this.formInterestRate.set(0);
    this.formEmiAmount.set(0);
    this.formEmiStartDate.set('');
    this.formEmiEndDate.set('');
    this.formAmountPaid.set(0);
    this.formOutstandingAmount.set(0);
    this.formStatus.set('open');
    this.formNotes.set('');
  }

  // Save debt (add)
  protected async saveDebt(): Promise<void> {
    if (!this.formLoanName() || this.formPrincipalAmount() <= 0) {
      this.showToast('⚠️ Please fill required fields');
      return;
    }

    try {
      const data: DebtFormData = {
        type: this.formType(),
        loanName: this.formLoanName(),
        bankOrPerson: this.formBankOrPerson(),
        principalAmount: this.formPrincipalAmount(),
        interestRate: this.formInterestRate() || undefined,
        emiAmount: this.formEmiAmount() || undefined,
        emiStartDate: this.formEmiStartDate() || undefined,
        emiEndDate: this.formEmiEndDate() || undefined,
        amountPaid: this.formAmountPaid(),
        outstandingAmount: this.formOutstandingAmount() || this.formPrincipalAmount(),
        status: this.formStatus(),
        notes: this.formNotes() || undefined
      };

      await this.debtService.addDebt(data);
      this.showToast('✅ Debt added successfully!');
      this.closeModals();
    } catch (err) {
      this.showToast('❌ Failed to add debt');
      console.error(err);
    }
  }

  // Update debt
  protected async updateDebt(): Promise<void> {
    const debt = this.selectedDebt();
    if (!debt) return;

    if (!this.formLoanName() || this.formPrincipalAmount() <= 0) {
      this.showToast('⚠️ Please fill required fields');
      return;
    }

    try {
      const data: DebtFormData = {
        type: this.formType(),
        loanName: this.formLoanName(),
        bankOrPerson: this.formBankOrPerson(),
        principalAmount: this.formPrincipalAmount(),
        interestRate: this.formInterestRate() || undefined,
        emiAmount: this.formEmiAmount() || undefined,
        emiStartDate: this.formEmiStartDate() || undefined,
        emiEndDate: this.formEmiEndDate() || undefined,
        amountPaid: this.formAmountPaid(),
        outstandingAmount: this.formOutstandingAmount(),
        status: this.formStatus(),
        notes: this.formNotes() || undefined
      };

      await this.debtService.updateDebt(debt.id, data);
      this.showToast('✅ Debt updated successfully!');
      this.closeModals();
    } catch (err) {
      this.showToast('❌ Failed to update debt');
      console.error(err);
    }
  }

  // Delete debt
  protected async deleteDebt(): Promise<void> {
    const debt = this.selectedDebt();
    if (!debt) return;

    try {
      await this.debtService.deleteDebt(debt.id);
      this.showToast('✅ Debt deactivated! Switch to "Deactivated" tab to view.');
      this.closeModals();
      // Switch to "All" tab to show the deactivated item
      this.selectedTab.set('all');
    } catch (err) {
      this.showToast('❌ Failed to deactivate debt');
      console.error(err);
    }
  }

  // Reactivate debt
  protected async reactivateDebt(debt: DebtEntry): Promise<void> {
    try {
      await this.debtService.reactivateDebt(debt.id);
      this.showToast('✅ Debt reactivated successfully!');
      // Switch to "All" tab to show the reactivated item
      this.selectedTab.set('all');
    } catch (err) {
      this.showToast('❌ Failed to reactivate debt');
      console.error(err);
    }
  }

  // Show toast notification
  protected showToast(message: string): void {
    this.toastMessage.set(message);
    this.toastVisible.set(true);
    setTimeout(() => this.toastVisible.set(false), 3000);
  }

  // Get status icon
  protected getStatusIcon(status: DebtStatus): string {
    return status === 'open' ? '🔓' : '✅';
  }

  // Get type icon
  protected getTypeIcon(type: DebtType): string {
    return type === 'debt' ? '💸' : '💰';
  }

  // Format currency
  protected formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Format date
  protected formatDate(dateString: string | undefined): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  }

  // Calculate debt progress percentage
  protected getDebtProgress(debt: DebtEntry): number {
    if (debt.principalAmount === 0) return 0;
    return (debt.amountPaid / debt.principalAmount) * 100;
  }

  // Calculate interest paid for a specific debt
  protected getInterestPaid(debt: DebtEntry): number {
    const principalRepaid = debt.principalAmount - debt.outstandingAmount;
    const interestPaid = debt.amountPaid - principalRepaid;
    return interestPaid > 0 ? interestPaid : 0;
  }

  // Calculate EMI in EMI calculator
  protected calculateEMI(): void {
    const principal = this.calcPrincipal();
    const rate = this.calcRate();
    const tenure = this.calcTenure();

    if (principal <= 0 || tenure <= 0) {
      this.calculatedEMI.set(0);
      return;
    }

    if (rate === 0) {
      // Simple division if no interest
      this.calculatedEMI.set(principal / tenure);
      return;
    }

    // EMI = [P x R x (1+R)^N] / [(1+R)^N-1]
    // P = Principal, R = Monthly interest rate, N = Tenure in months
    const monthlyRate = rate / 12 / 100;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                (Math.pow(1 + monthlyRate, tenure) - 1);
    
    this.calculatedEMI.set(Math.round(emi));
  }

  // Auto-calculate EMI when form values change
  protected autoCalculateFormEMI(): void {
    if (this.formPrincipalAmount() > 0 && this.formInterestRate() > 0) {
      const principal = this.formPrincipalAmount();
      const rate = this.formInterestRate();
      
      // Estimate tenure from EMI dates if available
      let tenure = 12; // default
      if (this.formEmiStartDate() && this.formEmiEndDate()) {
        const start = new Date(this.formEmiStartDate());
        const end = new Date(this.formEmiEndDate());
        const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                       (end.getMonth() - start.getMonth());
        if (months > 0) {
          tenure = months;
        }
      }

      const monthlyRate = rate / 12 / 100;
      const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                  (Math.pow(1 + monthlyRate, tenure) - 1);
      
      this.formEmiAmount.set(Math.round(emi));
    }
  }

  // Get repayment schedule summary
  protected getScheduleSummary() {
    const schedules = this.repaymentSchedule();
    if (schedules.length === 0) return null;
    return this.debtService.getScheduleSummary(schedules);
  }

  // Format date for display
  protected formatDateShort(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}

