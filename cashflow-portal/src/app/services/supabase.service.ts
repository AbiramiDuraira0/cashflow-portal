import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private client: SupabaseClient;
  private _isMockMode: boolean;

  constructor() {
    this._isMockMode = !!(environment as any).useMockData;

    if (this._isMockMode) {
      console.log('🧪 [QA MODE] Supabase running in MOCK mode - no real DB connections');
      // Create a dummy client (won't actually connect since URL/key are placeholders)
      this.client = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
    } else {
      this.client = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
    }
  }

  get db() {
    return this.client;
  }

  /**
   * Check if the app is running in mock data mode (QA branch)
   */
  get isMockMode(): boolean {
    return this._isMockMode;
  }
}