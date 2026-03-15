export const environment = {
  production: false,
  supabaseUrl: 'https://bbaxjrihnfnpqmlttioh.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiYXhqcmlobmZucHFtbHR0aW9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5OTk3ODIsImV4cCI6MjA4NzU3NTc4Mn0.fNqDRIz7Dz0OggsnP1DlEAR38AqRPEnQrudd8cfoFwg',
  // Direct PostgreSQL connection details (for backend use only - cannot use in browser)
  postgres: {
    host: 'db.bbaxjrihnfnpqmlttioh.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    // password: stored in DATABASE_URL environment variable
  }
};