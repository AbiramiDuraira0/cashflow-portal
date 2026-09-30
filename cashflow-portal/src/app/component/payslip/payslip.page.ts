import { Component, OnInit, signal, computed, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PayslipService, PayslipEntry } from '../../services/payslip.service';

@Component({
  selector: 'app-payslip',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payslip.page.html',
  styleUrls: ['./payslip.page.scss']
})
export class PayslipPage implements OnInit {
  private payslipService = inject(PayslipService);

  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  protected readonly months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  protected payslips = this.payslipService.getPayslipsSignal();
  protected isLoading = this.payslipService.getLoadingSignal();

  protected searchQuery = signal<string>('');

  // Year & month filter (same pattern as Expense/Income pages)
  protected selectedYear = signal<number>(new Date().getFullYear());
  protected selectedMonth = signal<string>('All');

  protected availableYears = computed(() => {
    const years = new Set<number>();
    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 5; year <= currentYear; year++) {
      years.add(year);
    }
    // Also include any year that already has an uploaded payslip
    this.payslips().forEach(p => years.add(p.year));
    return Array.from(years).sort((a, b) => b - a);
  });

  // Months that already have an uploaded payslip for the selected year (for the dot indicator)
  protected uploadedMonthsForYear = computed(() => {
    const year = this.selectedYear();
    return new Set(this.payslips().filter(p => p.year === year).map(p => p.month));
  });

  protected filteredPayslips = computed(() => {
    const year = this.selectedYear();
    const month = this.selectedMonth();
    const query = this.searchQuery().toLowerCase();

    let filtered = this.payslips().filter(p => p.year === year);
    if (month !== 'All') {
      filtered = filtered.filter(p => p.month === month);
    }
    if (query) {
      filtered = filtered.filter(p =>
        p.fileName.toLowerCase().includes(query) ||
        p.month.toLowerCase().includes(query) ||
        (p.notes || '').toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => this.months.indexOf(b.month) - this.months.indexOf(a.month));
  });

  // Summary card values
  protected totalForYear = computed(() => this.payslips().filter(p => p.year === this.selectedYear()).length);
  protected missingMonthsCount = computed(() => this.months.length - this.uploadedMonthsForYear().size);
  protected latestPayslip = computed(() => {
    const sorted = [...this.payslips()].sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return this.months.indexOf(b.month) - this.months.indexOf(a.month);
    });
    return sorted[0] ?? null;
  });
  protected totalStorageUsed = computed(() =>
    this.payslips().reduce((sum, p) => sum + (p.fileSize || 0), 0)
  );

  // Upload form state
  protected showUploadModal = signal(false);
  protected uploadMonth = signal<string>(this.months[new Date().getMonth()]);
  protected uploadYear = signal<number>(new Date().getFullYear());
  protected uploadNotes = signal<string>('');
  protected selectedFile = signal<File | null>(null);
  protected isUploading = signal(false);

  // Delete confirm state
  protected showDeleteConfirm = signal(false);
  protected deletingEntry = signal<PayslipEntry | null>(null);

  // Toast state
  protected showToast = signal(false);
  protected toastMessage = signal('');
  protected toastType = signal<'success' | 'error' | 'info'>('success');

  ngOnInit(): void {
    this.payslipService.loadPayslips().catch(() => {
      this.showToastNotification('Failed to load payslips', 'error');
    });
  }

  protected refreshData(): void {
    this.payslipService.loadPayslips().catch(() => {
      this.showToastNotification('Failed to refresh payslips', 'error');
    });
  }

  protected onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  protected changeYear(year: number): void {
    this.selectedYear.set(year);
  }

  protected changeMonth(month: string): void {
    this.selectedMonth.set(this.selectedMonth() === month ? 'All' : month);
  }

  protected openUploadModal(prefillMonth?: string): void {
    this.uploadMonth.set(prefillMonth ?? (this.selectedMonth() !== 'All' ? this.selectedMonth() : this.months[new Date().getMonth()]));
    this.uploadYear.set(this.selectedYear());
    this.uploadNotes.set('');
    this.selectedFile.set(null);
    this.showUploadModal.set(true);
  }

  protected closeUploadModal(): void {
    this.showUploadModal.set(false);
    this.selectedFile.set(null);
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (file && file.type !== 'application/pdf') {
      this.showToastNotification('Only PDF files are allowed', 'error');
      input.value = '';
      this.selectedFile.set(null);
      return;
    }

    this.selectedFile.set(file);
  }

  protected removeSelectedFile(): void {
    this.selectedFile.set(null);
    if (this.fileInputRef?.nativeElement) {
      this.fileInputRef.nativeElement.value = '';
    }
  }

  protected async submitUpload(): Promise<void> {
    const file = this.selectedFile();
    if (!file) {
      this.showToastNotification('Please choose a PDF file to upload', 'error');
      return;
    }

    this.isUploading.set(true);
    try {
      await this.payslipService.uploadPayslip(
        this.uploadMonth(),
        this.uploadYear(),
        file,
        this.uploadNotes() || undefined
      );
      this.showToastNotification('Payslip uploaded successfully!', 'success');
      this.closeUploadModal();
    } catch (error: any) {
      this.showToastNotification(error?.message || 'Failed to upload payslip', 'error');
    } finally {
      this.isUploading.set(false);
    }
  }

  protected async downloadPayslip(entry: PayslipEntry): Promise<void> {
    try {
      const url = await this.payslipService.getDownloadUrl(entry.filePath);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error: any) {
      this.showToastNotification(error?.message || 'Failed to open payslip', 'error');
    }
  }

  protected openDeleteConfirm(entry: PayslipEntry): void {
    this.deletingEntry.set(entry);
    this.showDeleteConfirm.set(true);
  }

  protected closeDeleteConfirm(): void {
    this.showDeleteConfirm.set(false);
    this.deletingEntry.set(null);
  }

  protected async confirmDelete(): Promise<void> {
    const entry = this.deletingEntry();
    if (!entry) return;

    try {
      await this.payslipService.deletePayslip(entry.id, entry.filePath);
      this.showToastNotification('Payslip deleted successfully!', 'success');
      this.closeDeleteConfirm();
    } catch (error: any) {
      this.showToastNotification(error?.message || 'Failed to delete payslip', 'error');
    }
  }

  protected formatFileSize(bytes: number | null): string {
    if (!bytes) return '—';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
  }

  private showToastNotification(message: string, type: 'success' | 'error' | 'info'): void {
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 3000);
  }
}
