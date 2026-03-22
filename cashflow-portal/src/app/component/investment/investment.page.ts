import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  InvestmentService, 
  InvestmentEntry, 
  InvestmentType, 
  InvestmentStatus 
} from '../../services/investment.service';

@Component({
  selector: 'app-investment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './investment.page.html',
  styleUrl: './investment.page.scss'
})
export class InvestmentPage implements OnInit {
  // Inject service
  constructor(private investmentService: InvestmentService) {}

  // Enums for template
  protected readonly InvestmentType = InvestmentType;
  protected readonly InvestmentStatus = InvestmentStatus;
  protected readonly Math = Math;

  // Signals for UI state
  protected selectedTab = signal<'all' | 'active' | 'past' | 'todo'>('all');
  protected showAddModal = signal<boolean>(false);
  protected showEditModal = signal<boolean>(false);
  protected showDeleteModal = signal<boolean>(false);
  protected showDetailsModal = signal<boolean>(false);
  protected selectedInvestment = signal<InvestmentEntry | null>(null);
  protected toastMessage = signal<string>('');
  protected toastVisible = signal<boolean>(false);

  // Form data signals
  protected formType = signal<InvestmentType>(InvestmentType.MUTUAL_FUND_SIP);
  protected formStatus = signal<InvestmentStatus>(InvestmentStatus.ACTIVE);
  protected formName = signal<string>('');
  protected formStartDate = signal<string>('');
  protected formEndDate = signal<string>('');
  protected formInvestedAmount = signal<number>(0);
  protected formCurrentValue = signal<number>(0);
  protected formMaturityValue = signal<number>(0);
  protected formMaturityDate = signal<string>('');
  protected formFrequency = signal<string>('');
  protected formUnits = signal<number>(0);
  protected formAvgPrice = signal<number>(0);
  protected formCurrentPrice = signal<number>(0);
  protected formNotes = signal<string>('');

  // Get data from service
  protected investments = computed(() => this.investmentService.investments());
  protected totalInvested = computed(() => this.investmentService.totalInvested());
  protected totalCurrentValue = computed(() => this.investmentService.totalCurrentValue());
  protected totalReturns = computed(() => this.investmentService.totalReturns());
  protected totalReturnsPercentage = computed(() => this.investmentService.totalReturnsPercentage());
  protected activeInvestments = computed(() => this.investmentService.activeInvestments());
  protected pastInvestments = computed(() => this.investmentService.pastInvestments());
  protected todoInvestments = computed(() => this.investmentService.todoInvestments());

  // Filtered investments based on selected tab
  protected filteredInvestments = computed(() => {
    const tab = this.selectedTab();
    switch (tab) {
      case 'active':
        return this.activeInvestments();
      case 'past':
        return this.pastInvestments();
      case 'todo':
        return this.todoInvestments();
      default:
        return this.investments();
    }
  });

  // Investment types array for dropdown
  protected investmentTypes = Object.values(InvestmentType);
  protected investmentStatuses = Object.values(InvestmentStatus);

  ngOnInit(): void {
    console.log('📊 Investment Page Initialized');
  }

  // Open add modal
  protected openAddModal(): void {
    this.resetForm();
    this.showAddModal.set(true);
  }

  // Open edit modal
  protected openEditModal(investment: InvestmentEntry): void {
    this.selectedInvestment.set(investment);
    this.formType.set(investment.type);
    this.formStatus.set(investment.status);
    this.formName.set(investment.name);
    this.formStartDate.set(investment.startDate);
    this.formEndDate.set(investment.endDate || '');
    this.formInvestedAmount.set(investment.investedAmount);
    this.formCurrentValue.set(investment.currentValue || 0);
    this.formMaturityValue.set(investment.maturityValue || 0);
    this.formMaturityDate.set(investment.maturityDate || '');
    this.formFrequency.set(investment.frequency || '');
    this.formUnits.set(investment.units || 0);
    this.formAvgPrice.set(investment.avgPrice || 0);
    this.formCurrentPrice.set(investment.currentPrice || 0);
    this.formNotes.set(investment.notes || '');
    this.showEditModal.set(true);
  }

  // Open delete confirmation
  protected openDeleteModal(investment: InvestmentEntry): void {
    this.selectedInvestment.set(investment);
    this.showDeleteModal.set(true);
  }

  // Open details modal
  protected openDetailsModal(investment: InvestmentEntry): void {
    this.selectedInvestment.set(investment);
    this.showDetailsModal.set(true);
  }

  // Close all modals
  protected closeModals(): void {
    this.showAddModal.set(false);
    this.showEditModal.set(false);
    this.showDeleteModal.set(false);
    this.showDetailsModal.set(false);
    this.selectedInvestment.set(null);
  }

  // Reset form
  protected resetForm(): void {
    this.formType.set(InvestmentType.MUTUAL_FUND_SIP);
    this.formStatus.set(InvestmentStatus.ACTIVE);
    this.formName.set('');
    this.formStartDate.set('');
    this.formEndDate.set('');
    this.formInvestedAmount.set(0);
    this.formCurrentValue.set(0);
    this.formMaturityValue.set(0);
    this.formMaturityDate.set('');
    this.formFrequency.set('');
    this.formUnits.set(0);
    this.formAvgPrice.set(0);
    this.formCurrentPrice.set(0);
    this.formNotes.set('');
  }

  // Save investment (add)
  protected async saveInvestment(): Promise<void> {
    if (!this.formName() || this.formInvestedAmount() <= 0) {
      this.showToast('⚠️ Please fill required fields');
      return;
    }

    try {
      await this.investmentService.addInvestment({
        type: this.formType(),
        status: this.formStatus(),
        name: this.formName(),
        startDate: this.formStartDate(),
        endDate: this.formEndDate() || undefined,
        investedAmount: this.formInvestedAmount(),
        currentValue: this.formCurrentValue() || undefined,
        maturityValue: this.formMaturityValue() || undefined,
        maturityDate: this.formMaturityDate() || undefined,
        frequency: this.formFrequency() || undefined,
        units: this.formUnits() || undefined,
        avgPrice: this.formAvgPrice() || undefined,
        currentPrice: this.formCurrentPrice() || undefined,
        notes: this.formNotes()
      });

      this.showToast('✅ Investment added successfully!');
      this.closeModals();
    } catch (err) {
      this.showToast('❌ Failed to add investment');
      console.error(err);
    }
  }

  // Update investment
  protected async updateInvestment(): Promise<void> {
    const investment = this.selectedInvestment();
    if (!investment) return;

    if (!this.formName() || this.formInvestedAmount() <= 0) {
      this.showToast('⚠️ Please fill required fields');
      return;
    }

    try {
      await this.investmentService.updateInvestment(investment.id, {
        type: this.formType(),
        status: this.formStatus(),
        name: this.formName(),
        startDate: this.formStartDate(),
        endDate: this.formEndDate() || undefined,
        investedAmount: this.formInvestedAmount(),
        currentValue: this.formCurrentValue() || undefined,
        maturityValue: this.formMaturityValue() || undefined,
        maturityDate: this.formMaturityDate() || undefined,
        frequency: this.formFrequency() || undefined,
        units: this.formUnits() || undefined,
        avgPrice: this.formAvgPrice() || undefined,
        currentPrice: this.formCurrentPrice() || undefined,
        notes: this.formNotes()
      });

      this.showToast('✅ Investment updated successfully!');
      this.closeModals();
    } catch (err) {
      this.showToast('❌ Failed to update investment');
      console.error(err);
    }
  }

  // Delete investment
  protected async deleteInvestment(): Promise<void> {
    const investment = this.selectedInvestment();
    if (!investment) return;

    try {
      await this.investmentService.deleteInvestment(investment.id);
      this.showToast('✅ Investment deleted successfully!');
      this.closeModals();
    } catch (err) {
      this.showToast('❌ Failed to delete investment');
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
  protected getStatusIcon(status: InvestmentStatus): string {
    switch (status) {
      case InvestmentStatus.ACTIVE:
        return '✅';
      case InvestmentStatus.PAST:
        return '📦';
      case InvestmentStatus.TODO:
        return '📋';
      default:
        return '📊';
    }
  }

  // Get type icon
  protected getTypeIcon(type: InvestmentType): string {
    switch (type) {
      case InvestmentType.PHYSICAL_GOLD:
        return '🪙';
      case InvestmentType.MUTUAL_FUND_SIP:
        return '📈';
      case InvestmentType.STOCKS:
        return '💹';
      case InvestmentType.PPF:
        return '🏛️';
      case InvestmentType.PF:
        return '💼';
      case InvestmentType.NPS:
        return '🎯';
      case InvestmentType.RD:
        return '💰';
      case InvestmentType.LAND:
        return '🏞️';
      case InvestmentType.HOUSE:
        return '🏠';
      default:
        return '📊';
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

  // Get returns color class
  protected getReturnsColorClass(returns: number | undefined): string {
    if (!returns) return 'neutral';
    return returns >= 0 ? 'positive' : 'negative';
  }
}
