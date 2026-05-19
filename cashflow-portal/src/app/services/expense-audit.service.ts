import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

/**
 * Audit log entry for tracking expense operations
 */
export interface ExpenseAuditLog {
  id?: number;
  timestamp: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE' | 'SOFT_DELETE' | 'LOAD' | 'YEAR_MOVE';
  table_name: string;
  expense_id: number | null;
  year: number;
  month: string;
  request_data: string; // JSON stringified request
  response_data: string | null; // JSON stringified response
  before_data: string | null; // JSON stringified data before change (for updates/deletes)
  user_agent: string;
  status: 'SUCCESS' | 'ERROR';
  error_message: string | null;
  stack_trace: string | null;
}

/**
 * Service to audit all expense database operations
 * Logs to both console and database for tracking data changes
 */
@Injectable({
  providedIn: 'root'
})
export class ExpenseAuditService {
  private supabase = inject(SupabaseService);
  
  // Years to monitor closely
  private readonly MONITORED_YEARS = [2021, 2022];
  
  // Local storage key for backup logs
  private readonly LOCAL_STORAGE_KEY = 'expense_audit_logs';
  
  // In-memory log buffer
  private logBuffer: ExpenseAuditLog[] = [];

  constructor() {
    console.log('🔍 ExpenseAuditService initialized - Monitoring years:', this.MONITORED_YEARS);
    this.loadLocalLogs();
  }

  /**
   * Log an expense operation
   */
  async logOperation(
    operation: ExpenseAuditLog['operation'],
    tableName: string,
    expenseId: number | null,
    year: number,
    month: string,
    requestData: any,
    responseData: any = null,
    beforeData: any = null,
    status: 'SUCCESS' | 'ERROR' = 'SUCCESS',
    errorMessage: string | null = null
  ): Promise<void> {
    const auditLog: ExpenseAuditLog = {
      timestamp: new Date().toISOString(),
      operation,
      table_name: tableName,
      expense_id: expenseId,
      year,
      month,
      request_data: JSON.stringify(requestData, null, 2),
      response_data: responseData ? JSON.stringify(responseData, null, 2) : null,
      before_data: beforeData ? JSON.stringify(beforeData, null, 2) : null,
      user_agent: navigator.userAgent,
      status,
      error_message: errorMessage,
      stack_trace: status === 'ERROR' ? new Error().stack || null : null
    };

    // Always log to console with detailed info
    this.logToConsole(auditLog);

    // Add to in-memory buffer
    this.logBuffer.push(auditLog);

    // Save to local storage as backup
    this.saveToLocalStorage(auditLog);

    // If it's a monitored year, also save to database
    if (this.MONITORED_YEARS.includes(year)) {
      await this.saveToDatabase(auditLog);
    }
  }

  /**
   * Log to console with color coding
   */
  private logToConsole(log: ExpenseAuditLog): void {
    const isMonitored = this.MONITORED_YEARS.includes(log.year);
    const prefix = isMonitored ? '🚨 [MONITORED]' : '📝';
    
    const styles = {
      INSERT: 'color: #22c55e; font-weight: bold;',
      UPDATE: 'color: #f59e0b; font-weight: bold;',
      DELETE: 'color: #ef4444; font-weight: bold;',
      SOFT_DELETE: 'color: #f97316; font-weight: bold;',
      LOAD: 'color: #3b82f6; font-weight: bold;',
      YEAR_MOVE: 'color: #8b5cf6; font-weight: bold;'
    };

    console.group(`${prefix} EXPENSE AUDIT - ${log.operation} [${log.status}]`);
    console.log('%c Operation:', styles[log.operation], log.operation);
    console.log('📅 Timestamp:', log.timestamp);
    console.log('📊 Table:', log.table_name);
    console.log('🔢 Expense ID:', log.expense_id);
    console.log('📆 Year:', log.year, '| Month:', log.month);
    console.log('📤 Request Data:', JSON.parse(log.request_data));
    
    if (log.before_data) {
      console.log('⏪ Before Data:', JSON.parse(log.before_data));
    }
    
    if (log.response_data) {
      console.log('📥 Response Data:', JSON.parse(log.response_data));
    }
    
    if (log.error_message) {
      console.error('❌ Error:', log.error_message);
    }
    
    console.groupEnd();

    // Extra warning for monitored years with destructive operations
    if (isMonitored && ['DELETE', 'SOFT_DELETE', 'UPDATE', 'YEAR_MOVE'].includes(log.operation)) {
      console.warn(
        `⚠️ ALERT: ${log.operation} operation on MONITORED YEAR ${log.year}!\n` +
        `Table: ${log.table_name}\n` +
        `Expense ID: ${log.expense_id}\n` +
        `Month: ${log.month}\n` +
        `Time: ${log.timestamp}`
      );
    }
  }

  /**
   * Save to local storage as backup
   */
  private saveToLocalStorage(log: ExpenseAuditLog): void {
    try {
      const existingLogs = this.getLocalLogs();
      existingLogs.push(log);
      
      // Keep only last 500 logs to prevent storage overflow
      const trimmedLogs = existingLogs.slice(-500);
      
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(trimmedLogs));
    } catch (error) {
      console.error('Failed to save audit log to local storage:', error);
    }
  }

  /**
   * Load logs from local storage
   */
  private loadLocalLogs(): void {
    try {
      const logs = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      if (logs) {
        this.logBuffer = JSON.parse(logs);
        console.log(`📂 Loaded ${this.logBuffer.length} audit logs from local storage`);
      }
    } catch (error) {
      console.error('Failed to load audit logs from local storage:', error);
    }
  }

  /**
   * Get logs from local storage
   */
  private getLocalLogs(): ExpenseAuditLog[] {
    try {
      const logs = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      return logs ? JSON.parse(logs) : [];
    } catch {
      return [];
    }
  }

  /**
   * Save to database audit table
   */
  private async saveToDatabase(log: ExpenseAuditLog): Promise<void> {
    try {
      const { error } = await this.supabase.db
        .from('expense_audit_log')
        .insert([{
          timestamp: log.timestamp,
          operation: log.operation,
          table_name: log.table_name,
          expense_id: log.expense_id,
          year: log.year,
          month: log.month,
          request_data: log.request_data,
          response_data: log.response_data,
          before_data: log.before_data,
          user_agent: log.user_agent,
          status: log.status,
          error_message: log.error_message,
          stack_trace: log.stack_trace
        }]);

      if (error) {
        // If table doesn't exist, just log to console - don't fail
        console.warn('⚠️ Could not save to expense_audit_log table:', error.message);
        console.log('💡 Create the table using the SQL script provided');
      } else {
        console.log('✅ Audit log saved to database');
      }
    } catch (error) {
      console.error('Failed to save audit log to database:', error);
    }
  }

  /**
   * Get all logs for a specific year
   */
  getLogsForYear(year: number): ExpenseAuditLog[] {
    return this.logBuffer.filter(log => log.year === year);
  }

  /**
   * Get all logs for monitored years
   */
  getMonitoredLogs(): ExpenseAuditLog[] {
    return this.logBuffer.filter(log => this.MONITORED_YEARS.includes(log.year));
  }

  /**
   * Get recent destructive operations (DELETE, UPDATE, SOFT_DELETE)
   */
  getDestructiveOperations(): ExpenseAuditLog[] {
    return this.logBuffer.filter(log => 
      ['DELETE', 'SOFT_DELETE', 'UPDATE', 'YEAR_MOVE'].includes(log.operation)
    );
  }

  /**
   * Export logs to JSON file for download
   */
  exportLogsToFile(): void {
    const monitoredLogs = this.getMonitoredLogs();
    const blob = new Blob([JSON.stringify(monitoredLogs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense_audit_logs_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    console.log(`📁 Exported ${monitoredLogs.length} audit logs to file`);
  }

  /**
   * Clear local logs (use with caution)
   */
  clearLocalLogs(): void {
    localStorage.removeItem(this.LOCAL_STORAGE_KEY);
    this.logBuffer = [];
    console.log('🗑️ Local audit logs cleared');
  }

  /**
   * Print summary of operations for monitored years
   */
  printSummary(): void {
    console.group('📊 EXPENSE AUDIT SUMMARY');
    
    for (const year of this.MONITORED_YEARS) {
      const yearLogs = this.getLogsForYear(year);
      console.group(`Year ${year}: ${yearLogs.length} operations`);
      
      const operationCounts = yearLogs.reduce((acc, log) => {
        acc[log.operation] = (acc[log.operation] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.table(operationCounts);
      console.groupEnd();
    }
    
    console.groupEnd();
  }
}
