import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  DebtService, 
  DebtEntry, 
  DebtType, 
  DebtStatus,
  PaymentFrequency 
} from '../../services/debt.service';

@Component({
  selector: 'app-debts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './debts.page.html',
  styleUrl: './debts.page.scss'
})
export class DebtsPage implements OnInit {
  // Inject service
  constructor(private debtService: DebtService) {}

  // Enums for template
  protected readonly DebtType = DebtType;
  protected readonly DebtStatus = DebtStatus;
  protected readonly PaymentFrequency = PaymentFrequency;
  protected readonly Math = Math;

  // Signals for UI state
  protected selectedTab = signal<'all' | 'open' | 'closed'>('all');
  protected showAddModal = signal<boolean>(false);
  protected showEditModal = signal<boolean>(false);
  protected showDeleteModal = signal<boolean>(false);
  protected showDetailsModal = signal<boolean>(false);
  protected showEMICalculator = signal<boolean>(false);
  protected selectedDebt = signal<DebtEntry | null>(null);
  protected toastMessage = signal<string>('');
  protected toastVisible = signal<boolean>(false);

  // Form data signals
  protected formType = signal<DebtType>(DebtType.PERSONAL_LOAN);
  protected formStatus = signal<DebtStatus>(DebtStatus.OPEN);
  protected formLenderName = signal<string>('');
  protected formAccountNumber = signal<string>('');
  protected formPrincipalAmount = signal<number>(0);
  protected formInterestRate = signal<number>(0);
  protected formTenure = signal<number>(12);
  protected formEmiAmount = signal<number>(0);
  protected formStartDate = signal<string>('');
  protected formEndDate = signal<string>('');
  protected formTotalPaid = signal<number>(0);
  protected formOutstandingAmount = signal<number>(0);
  protected formFrequency = signal<PaymentFrequency>(PaymentFrequency.MONTHLY);
  protected formNextPaymentDate = signal<string>('');
  protected formClosedDate = signal<string>('');
  protected formNotes = signal<string>('');

  // EMI Calculator signals
  protected calcPrincipal = signal<number>(0);
  protected calcRate = signal<number>(0);
  protected calcTenure = signal<number>(12);
  protected calculatedEMI = signal<number>(0);

  // Get data from service
  protected debts = computed(() => this.debtService.debts());
  protected totalPrincipal = computed(() => this.debtService.totalPrincipal());
  protected totalPaid = computed(() => this.debtService.totalPaid());
  protected totalOutstanding = computed(() => this.debtService.totalOutstanding());
  protected totalMonthlyEMI = computed(() => this.debtService.totalMonthlyEMI());
  protected openDebts = computed(() => this.debtService.openDebts());
  protected closedDebts = computed(() => this.debtService.closedDebts());
  protected debtFreePercentage = computed(() => this.debtService.debtFreePercentage());

  // Filtered debts based on selected tab
  protected filteredDebts = computed(() => {
    const tab = this.selectedTab();
    switch (tab) {
      case 'open':
        return this.openDebts();
      case 'closed':
        return this.closedDebts();
      default:
        return this.debts();
    }
  });

  // Debt types array for dropdown
  protected debtTypes = Object.values(DebtType);
  protected debtStatuses = Object.values(DebtStatus);
  protected paymentFrequencies = Object.values(PaymentFrequency);

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
    this.formStatus.set(debt.status);
    this.formLenderName.set(debt.lenderName);
    this.formAccountNumber.set(debt.accountNumber || '');
    this.formPrincipalAmount.set(debt.principalAmount);
    this.formInterestRate.set(debt.interestRate);
    this.formTenure.set(debt.tenure || 12);
    this.formEmiAmount.set(debt.emiAmount || 0);
    this.formStartDate.set(debt.startDate);
    this.formEndDate.set(debt.endDate || '');
    this.formTotalPaid.set(debt.totalPaid);
    this.formOutstandingAmount.set(debt.outstandingAmount);
    this.formFrequency.set(debt.frequency);
    this.formNextPaymentDate.set(debt.nextPaymentDate || '');
    this.formClosedDate.set(debt.closedDate || '');
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
    this.formType.set(DebtType.PERSONAL_LOAN);
    this.formStatus.set(DebtStatus.OPEN);
    this.formLenderName.set('');
    this.formAccountNumber.set('');
    this.formPrincipalAmount.set(0);
    this.formInterestRate.set(0);
    this.formTenure.set(12);
    this.formEmiAmount.set(0);
    this.formStartDate.set('');
    this.formEndDate.set('');
    this.formTotalPaid.set(0);
    this.formOutstandingAmount.set(0);
    this.formFrequency.set(PaymentFrequency.MONTHLY);
    this.formNextPaymentDate.set('');
    this.formClosedDate.set('');
    this.formNotes.set('');
  }

  // Calculate EMI in EMI calculator
  protected calculateEMI(): void {
    const emi = this.debtService.calculateEMI(
      this.calcPrincipal(),
      this.calcRate(),
      this.calcTenure()
    );
    this.calculatedEMI.set(emi);
  }

  // Auto-calculate EMI when form values change
  protected autoCalculateFormEMI(): void {
    if (this.formPrincipalAmount() > 0 && this.formTenure() > 0) {
      const emi = this.debtService.calculateEMI(
        this.formPrincipalAmount(),
        this.formInterestRate(),
        this.formTenure()
      );
      this.formEmiAmount.set(emi);
    }
  }

  // Save debt (add)
  protected async saveDebt(): Promise<void> {
    if (!this.formLenderName() || this.formPrincipalAmount() <= 0) {
      this.showToast('⚠️ Please fill required fields');
      return;
    }

    try {
      await this.debtService.addDebt({
        type: this.formType(),
        status: this.formStatus(),
        lenderName: this.formLenderName(),
        accountNumber: this.formAccountNumber() || undefined,
        principalAmount: this.formPrincipalAmount(),
        interestRate: this.formInterestRate(),
        tenure: this.formTenure() || undefined,
        emiAmount: this.formEmiAmount() || undefined,
        startDate: this.formStartDate(),
        endDate: this.formEndDate() || undefined,
        totalPaid: this.formTotalPaid(),
        outstandingAmount: this.formOutstandingAmount() || this.formPrincipalAmount(),
        frequency: this.formFrequency(),
        nextPaymentDate: this.formNextPaymentDate() || undefined,
        closedDate: this.formClosedDate() || undefined,
        notes: this.formNotes()
      });

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

    if (!this.formLenderName() || this.formPrincipalAmount() <= 0) {
      this.showToast('⚠️ Please fill required fields');
      return;
    }

    try {
      await this.debtService.updateDebt(debt.id, {
        type: this.formType(),
        status: this.formStatus(),
        lenderName: this.formLenderName(),
        accountNumber: this.formAccountNumber() || undefined,
        principalAmount: this.formPrincipalAmount(),
        interestRate: this.formInterestRate(),
        tenure: this.formTenure() || undefined,
        emiAmount: this.formEmiAmount() || undefined,
        startDate: this.formStartDate(),
        endDate: this.formEndDate() || undefined,
        totalPaid: this.formTotalPaid(),
        outstandingAmount: this.formOutstandingAmount(),
        frequency: this.formFrequency(),
        nextPaymentDate: this.formNextPaymentDate() || undefined,
        closedDate: this.formClosedDate() || undefined,
        notes: this.formNotes()
      });

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
    switch (status) {
      case DebtStatus.OPEN:
        return '🔓';
      case DebtStatus.CLOSED:
        return '✅';
      default:
        return '🏦';
    }
  }

  // Get type icon
  protected getTypeIcon(type: DebtType): string {
    switch (type) {
      case DebtType.EDUCATION_LOAN:
        return '🎓';
      case DebtType.GOLD_LOAN:
        return '🪙';
      case DebtType.PERSONAL_LOAN:
        return '💳';
      case DebtType.HOME_LOAN:
        return '🏠';
      case DebtType.CAR_LOAN:
        return '🚗';
      case DebtType.CREDIT_CARD:
        return '💳';
      default:
        return '🏦';
    }
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
  protected formatDate(dateString: string): string {
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
    return (debt.totalPaid / debt.principalAmount) * 100;
  }
}

