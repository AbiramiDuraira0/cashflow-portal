import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class ConnectionTestService {
  private supabase = inject(SupabaseService);

  /**
   * Test basic Supabase connection
   */
  async testConnection(): Promise<{
    success: boolean;
    message: string;
    details?: any;
  }> {
    try {
      console.log('🔍 Testing Supabase connection...');
      console.log('📍 URL:', 'https://bbaxjrihnfnpqmlttioh.supabase.co');
      
      // Test 1: Basic health check
      const { data: healthData, error: healthError } = await this.supabase.db
        .from('category')
        .select('count')
        .limit(1);

      if (healthError) {
        console.error('❌ Connection test failed:', healthError);
        return {
          success: false,
          message: `Connection Error: ${healthError.message}`,
          details: {
            code: healthError.code,
            hint: healthError.hint,
            details: healthError.details
          }
        };
      }

      console.log('✅ Connection successful!');
      
      // Test 2: Fetch actual categories
      const { data: categories, error: catError } = await this.supabase.db
        .from('category')
        .select('*')
        .limit(5);

      if (catError) {
        return {
          success: false,
          message: `Query Error: ${catError.message}`,
          details: catError
        };
      }

      return {
        success: true,
        message: `✅ Connected ! Fetched First ${categories?.length || 0} categories`,
        details: categories
      };

    } catch (err: any) {
      console.error('❌ Unexpected error:', err);
      return {
        success: false,
        message: `Unexpected Error: ${err.message || 'Unknown error'}`,
        details: err
      };
    }
  }
}
