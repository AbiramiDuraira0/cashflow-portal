export const environment = {
  production: true,
  // ============================================================
  // QA BRANCH - MOCK MODE ENABLED
  // All connection strings are placeholders for demo/reference use.
  // Replace with your own Supabase project credentials to connect.
  // ============================================================
  supabaseUrl: 'https://YOUR_SUPABASE_PROJECT_ID.supabase.co',
  supabaseAnonKey: 'YOUR_SUPABASE_ANON_KEY_HERE',
  // Direct PostgreSQL connection details (for backend use only - cannot use in browser)
  postgres: {
    host: 'db.YOUR_SUPABASE_PROJECT_ID.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    // password: stored in DATABASE_URL environment variable
  },
  // 2FA Configuration - DISABLED for QA/demo
  enable2FA: false,
  // Email configuration for OTP delivery - EmailJS
  otpConfig: {
    recipientEmail: 'demo@example.com', // Replace with your email
    recipientName: 'Demo User',
    emailJsServiceId: 'YOUR_EMAILJS_SERVICE_ID',
    emailJsTemplateId: 'YOUR_EMAILJS_TEMPLATE_ID',
    emailJsPublicKey: 'YOUR_EMAILJS_PUBLIC_KEY'
  },
  // QA Mode flag - when true, services return mock data instead of DB calls
  useMockData: true
};
