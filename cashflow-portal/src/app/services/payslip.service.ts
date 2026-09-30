import { Injectable, signal, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

/**
 * Database Payslip Entry Type (matches DB schema)
 */
export type DbPayslipEntry = {
  payslip_id: number;
  month: string;
  year: number;
  file_name: string;
  file_path: string;
  file_size: number | null;
  notes: string | null;
  is_delete: boolean;
  created_at: string;
  updated_at: string;
};

/**
 * Application Payslip Entry Type (for UI)
 */
export type PayslipEntry = {
  id: number;
  month: string;
  year: number;
  fileName: string;
  filePath: string;
  fileSize: number | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_BUCKET = 'payslips';
const TABLE_NAME = 'payslip';

@Injectable({
  providedIn: 'root'
})
export class PayslipService {
  private supabase = inject(SupabaseService);

  private payslipData = signal<PayslipEntry[]>([]);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);

  constructor() {
    this.loadPayslips().catch(err => {
      console.error('❌ Failed to auto-load payslips:', err);
    });
  }

  getPayslipsSignal() {
    return this.payslipData;
  }

  getLoadingSignal() {
    return this.loading;
  }

  getErrorSignal() {
    return this.error;
  }

  private transformDbToApp(dbEntry: DbPayslipEntry): PayslipEntry {
    return {
      id: dbEntry.payslip_id,
      month: dbEntry.month,
      year: dbEntry.year,
      fileName: dbEntry.file_name,
      filePath: dbEntry.file_path,
      fileSize: dbEntry.file_size,
      notes: dbEntry.notes || undefined,
      createdAt: dbEntry.created_at,
      updatedAt: dbEntry.updated_at
    };
  }

  /**
   * Load all payslip records (excluding soft-deleted)
   */
  async loadPayslips(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const { data, error } = await this.supabase.db
        .from(TABLE_NAME)
        .select('*')
        .eq('is_delete', false)
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (error) {
        console.error('❌ Database error:', error.message);
        throw error;
      }

      const entries = (data || []).map(this.transformDbToApp.bind(this));
      this.payslipData.set(entries);
      console.log('✅ Loaded payslip entries:', entries.length);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load payslips';
      this.error.set(errorMsg);
      console.error('❌ Payslip load error:', err);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Upload a payslip PDF for a given month/year.
   * If a payslip already exists for that month/year, the old file is replaced.
   */
  async uploadPayslip(month: string, year: number, file: File, notes?: string): Promise<PayslipEntry> {
    if (file.type !== 'application/pdf') {
      throw new Error('Only PDF files are allowed for payslips');
    }
    const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
    if (file.size > MAX_SIZE_BYTES) {
      throw new Error('File is too large. Maximum allowed size is 10 MB');
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      // Replace any existing payslip for the same month/year first
      const existing = this.payslipData().find(p => p.month === month && p.year === year);
      if (existing) {
        await this.deletePayslip(existing.id, existing.filePath);
      }

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `${year}/${month}_${year}_${Date.now()}_${safeName}`;

      const { error: uploadError } = await this.supabase.db.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, file, { contentType: 'application/pdf', upsert: false });

      if (uploadError) {
        console.error('❌ Storage upload error:', uploadError.message);
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }

      const { data: dbData, error: insertError } = await this.supabase.db
        .from(TABLE_NAME)
        .insert([{
          month,
          year,
          file_name: file.name,
          file_path: storagePath,
          file_size: file.size,
          notes: notes || null,
          is_delete: false
        }])
        .select()
        .single();

      if (insertError) {
        // Roll back the uploaded file if the metadata insert fails
        await this.supabase.db.storage.from(STORAGE_BUCKET).remove([storagePath]);
        console.error('❌ Insert error:', insertError.message);
        throw insertError;
      }

      const newEntry = this.transformDbToApp(dbData);
      this.payslipData.update(entries => [newEntry, ...entries.filter(e => e.id !== newEntry.id)]);
      console.log('✅ Uploaded payslip:', newEntry.id);
      return newEntry;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to upload payslip';
      this.error.set(errorMsg);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Get a temporary signed URL to view/download a payslip PDF
   */
  /**
   * Get the public URL to view/download a payslip PDF.
   * The "payslips" bucket is public (free Supabase tier), so this is a direct,
   * non-expiring URL rather than a signed one.
   */
  async getDownloadUrl(filePath: string): Promise<string> {
    const { data } = this.supabase.db.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    if (!data?.publicUrl) {
      throw new Error('Failed to generate download link');
    }

    return data.publicUrl;
  }

  /**
   * Soft delete a payslip record and remove its file from Storage
   */
  async deletePayslip(id: number, filePath: string): Promise<boolean> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const { data: dbData, error } = await this.supabase.db
        .from(TABLE_NAME)
        .update({ is_delete: true })
        .eq('payslip_id', id)
        .eq('is_delete', false)
        .select()
        .maybeSingle();

      if (error) {
        console.error('❌ Database error:', error.message);
        throw error;
      }

      if (!dbData) {
        throw new Error('Payslip not found or already deleted');
      }

      const { error: removeError } = await this.supabase.db.storage
        .from(STORAGE_BUCKET)
        .remove([filePath]);

      if (removeError) {
        // Metadata is already soft-deleted; log but don't fail the operation for a storage cleanup issue
        console.warn('⚠️ Failed to remove file from storage:', removeError.message);
      }

      this.payslipData.update(entries => entries.filter(e => e.id !== id));
      console.log('✅ Deleted payslip:', id);
      return true;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to delete payslip';
      this.error.set(errorMsg);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }
}
