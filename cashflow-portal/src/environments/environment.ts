export const environment = {
  production: false,
  // Demo environment - using mock data, no real database connection needed
  supabaseUrl: 'https://demo-project.supabase.co',
  supabaseAnonKey: 'demo-key-not-real',
  // PostgreSQL connection not used in QA/Demo mode
  postgres: {
    host: 'demo-db.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    // password: not needed for demo mode
  }
};