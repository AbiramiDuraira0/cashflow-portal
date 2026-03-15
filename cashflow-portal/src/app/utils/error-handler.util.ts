/**
 * Error Handler Utility
 * Provides user-friendly error messages for database and application errors
 */

export interface ErrorResult {
  title: string;
  message: string;
  details?: string;
  type: 'error' | 'warning' | 'info';
}

export class ErrorHandler {
  /**
   * Parse and format database errors into user-friendly messages
   */
  static handleDatabaseError(error: any, operation: 'add' | 'update' | 'delete' = 'add'): ErrorResult {
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    const errorCode = error?.code || '';

    // Duplicate key constraint violation
    if (errorMessage.includes('duplicate key value violates unique constraint') || 
        errorMessage.includes('ux_category_name_subcategory_ci')) {
      return {
        title: 'Duplicate Category',
        message: 'A category with this name and subcategory combination already exists.',
        details: 'Please use a different category name or subcategory combination.',
        type: 'warning'
      };
    }

    // Duplicate category name (old constraint)
    if (errorMessage.includes('ux_category_name_ci')) {
      return {
        title: 'Duplicate Category Name',
        message: 'This category name already exists.',
        details: 'Please choose a different category name.',
        type: 'warning'
      };
    }

    // Foreign key constraint violation
    if (errorMessage.includes('foreign key constraint') || errorCode === '23503') {
      return {
        title: 'Cannot Delete',
        message: 'This category is being used by other records.',
        details: 'Please remove all related transactions before deleting this category.',
        type: 'error'
      };
    }

    // Not null constraint violation
    if (errorMessage.includes('null value in column') || errorCode === '23502') {
      return {
        title: 'Required Field Missing',
        message: 'Category name is required.',
        details: 'Please provide a valid category name.',
        type: 'warning'
      };
    }

    // Check constraint violation
    if (errorMessage.includes('check constraint') || errorCode === '23514') {
      return {
        title: 'Invalid Data',
        message: 'The data provided does not meet the requirements.',
        details: 'Please check your input and try again.',
        type: 'warning'
      };
    }

    // String too long
    if (errorMessage.includes('value too long') || errorCode === '22001') {
      return {
        title: 'Text Too Long',
        message: 'Category name or subcategory exceeds maximum length.',
        details: 'Maximum length is 50 characters.',
        type: 'warning'
      };
    }

    // Connection errors
    if (errorMessage.includes('connection') || errorMessage.includes('network')) {
      return {
        title: 'Connection Error',
        message: 'Unable to connect to the database.',
        details: 'Please check your internet connection and try again.',
        type: 'error'
      };
    }

    // Permission errors
    if (errorMessage.includes('permission denied') || errorCode === '42501') {
      return {
        title: 'Permission Denied',
        message: 'You do not have permission to perform this action.',
        details: 'Please contact your administrator.',
        type: 'error'
      };
    }

    // Timeout errors
    if (errorMessage.includes('timeout')) {
      return {
        title: 'Request Timeout',
        message: 'The operation took too long to complete.',
        details: 'Please try again.',
        type: 'error'
      };
    }

    // Generic operation-specific messages
    const operationText = {
      add: 'add',
      update: 'update',
      delete: 'delete'
    }[operation];

    return {
      title: `Failed to ${operationText} category`,
      message: errorMessage.length > 100 
        ? 'An unexpected error occurred.' 
        : errorMessage,
      details: errorMessage.length > 100 ? errorMessage : undefined,
      type: 'error'
    };
  }

  /**
   * Format validation errors
   */
  static handleValidationError(field: string, issue: string): ErrorResult {
    return {
      title: 'Validation Error',
      message: `${field}: ${issue}`,
      details: 'Please correct the error and try again.',
      type: 'warning'
    };
  }

  /**
   * Get a friendly error message for display in alerts
   */
  static getAlertMessage(error: any, operation: 'add' | 'update' | 'delete' = 'add'): string {
    const result = this.handleDatabaseError(error, operation);
    let message = `${result.title}\n\n${result.message}`;
    if (result.details) {
      message += `\n\n${result.details}`;
    }
    return message;
  }

  /**
   * Log error with context
   */
  static logError(context: string, error: any): void {
    console.error(`[${context}]`, {
      message: error?.message || error,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
      stack: error?.stack
    });
  }
}
