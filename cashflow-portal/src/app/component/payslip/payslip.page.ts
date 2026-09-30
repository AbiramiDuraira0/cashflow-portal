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

  protected availableYears = computed(() => {
    const years: number[] = [];
    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 5; year <= currentYear; year++) {
      years.push(year);
    }
    return years.reverse();
  });

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

  protected sortedPayslips = computed(() => {
    return [...this.payslips()].sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return this.months.indexOf(b.month) - this.months.indexOf(a.month);
    });
  });

  ngOnInit(): void {
    this.payslipService.loadPayslips().catch(() => {
      this.showToastNotification('Failed to load payslips', 'error');
    });
  }

  protected openUploadModal(): void {
    this.uploadMonth.set(this.months[new Date().getMonth()]);
    this.uploadYear.set(new Date().getFullYear());
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
