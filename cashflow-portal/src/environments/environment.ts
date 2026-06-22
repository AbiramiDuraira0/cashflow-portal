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
  },
  // 2FA Configuration - DISABLED for dev/demo
  enable2FA: false,
  // Email configuration for OTP delivery - EmailJS
  otpConfig: {
    recipientEmail: 'demo@example.com',
    recipientName: 'Demo User',
    emailJsServiceId: 'demo-service-id',
    emailJsTemplateId: 'demo-template-id',
    emailJsPublicKey: 'demo-public-key'
  },
  // QA Mode flag - when true, services return mock data instead of DB calls
  useMockData: true
};