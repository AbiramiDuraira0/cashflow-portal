import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  DebtService, 
  DebtEntry,
  DebtFormData,
  DebtType,
  DebtStatus,
  LoanName
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
  protected selectedTab = signal<'all' | 'open' | 'closed' | 'debts' | 'receivables'>('all');
  protected showAddModal = signal<boolean>(false);
  protected showEditModal = signal<boolean>(false);
  protected showDeleteModal = signal<boolean>(false);
  protected showDetailsModal = signal<boolean>(false);
  protected showEMICalculator = signal<boolean>(false);
  protected selectedDebt = signal<DebtEntry | null>(null);
  protected toastMessage = signal<string>('');
  protected toastVisible = signal<boolean>(false);

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

  protected filteredDebts = computed(() => {
    const tab = this.selectedTab();
    const allDebts = this.debts();
    
    switch (tab) {
      case 'open':
        return allDebts.filter(d => d.status === 'open');
      case 'closed':
        return allDebts.filter(d => d.status === 'closed');
      case 'debts':
        return allDebts.filter(d => d.type === 'debt');
      case 'receivables':
        return allDebts.filter(d => d.type === 'receivable');
      default:
        return allDebts;
    }
  });

  // Loan names array for dropdown
  protected loanNames = Object.values(LoanName);

  ngOnInit(): void {
    console.log('🏦 Debts Page Initialized');
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

  // Open EMI calculator
  protected openEMICalculator(): void {
    this.showEMICalculator.set(true);
  }

  // Close all modals
  protected closeModals(): void {
    this.showAddModal.set(false);
    this.showEditModal.set(false);
    this.showDeleteModal.set(false);
    this.showDetailsModal.set(false);
    this.showEMICalculator.set(false);
    this.selectedDebt.set(null);
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
      this.showToast('✅ Debt deleted successfully!');
      this.closeModals();
    } catch (err) {
      this.showToast('❌ Failed to delete debt');
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
    return type === 'debt' ? '�' : '�';
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
}

