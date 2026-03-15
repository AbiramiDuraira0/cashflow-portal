/**
 * Status Enum
 * Centralized status definitions for entities
 */

export enum Status {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  DEACTIVATED = 'Deactivated',
  PENDING = 'Pending',
  ARCHIVED = 'Archived',
  DELETED = 'Deleted'
}

/**
 * Status Badge Configuration
 * UI styling for status badges
 */
export interface StatusBadgeConfig {
  label: string;
  cssClass: string;
  icon?: string;
}

/**
 * Status Helper
 * Utility methods for status management
 */
export class StatusHelper {
  /**
   * Get badge configuration for status
   */
  static getBadgeConfig(status: Status): StatusBadgeConfig {
    switch (status) {
      case Status.ACTIVE:
        return {
          label: 'Active',
          cssClass: 'status-badge status-active',
          icon: '✓'
        };
      
      case Status.INACTIVE:
        return {
          label: 'Inactive',
          cssClass: 'status-badge status-inactive',
          icon: '○'
        };
      
      case Status.DEACTIVATED:
        return {
          label: 'Deactivated',
          cssClass: 'status-badge status-deactivated',
          icon: '⊗'
        };
      
      case Status.PENDING:
        return {
          label: 'Pending',
          cssClass: 'status-badge status-pending',
          icon: '⏳'
        };
      
      case Status.ARCHIVED:
        return {
          label: 'Archived',
          cssClass: 'status-badge status-archived',
          icon: '📦'
        };
      
      case Status.DELETED:
        return {
          label: 'Deleted',
          cssClass: 'status-badge status-deleted',
          icon: '🗑️'
        };
      
      default:
        return {
          label: 'Unknown',
          cssClass: 'status-badge status-unknown',
          icon: '?'
        };
    }
  }

  /**
   * Check if status is active
   */
  static isActive(status: Status): boolean {
    return status === Status.ACTIVE;
  }

  /**
   * Check if status is deleted/deactivated
   */
  static isDeleted(status: Status): boolean {
    return status === Status.DELETED || status === Status.DEACTIVATED;
  }

  /**
   * Get CSS color for status
   */
  static getStatusColor(status: Status): string {
    switch (status) {
      case Status.ACTIVE:
        return '#28a745'; // green
      case Status.INACTIVE:
        return '#6c757d'; // gray
      case Status.DEACTIVATED:
        return '#dc3545'; // red
      case Status.PENDING:
        return '#ffc107'; // yellow
      case Status.ARCHIVED:
        return '#17a2b8'; // cyan
      case Status.DELETED:
        return '#dc3545'; // red
      default:
        return '#6c757d'; // gray
    }
  }

  /**
   * Get status from boolean (for backwards compatibility)
   */
  static fromBoolean(isActive: boolean): Status {
    return isActive ? Status.ACTIVE : Status.DEACTIVATED;
  }

  /**
   * Convert status to boolean
   */
  static toBoolean(status: Status): boolean {
    return status === Status.ACTIVE;
  }
}
