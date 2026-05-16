export const environment = {
  production: true,
  supabaseUrl: 'https://bbaxjrihnfnpqmlttioh.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiYXhqcmlobmZucHFtbHR0aW9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5OTk3ODIsImV4cCI6MjA4NzU3NTc4Mn0.fNqDRIz7Dz0OggsnP1DlEAR38AqRPEnQrudd8cfoFwg',
  // Direct PostgreSQL connection details (for backend use only - cannot use in browser)
  postgres: {
    host: 'db.bbaxjrihnfnpqmlttioh.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    // password: stored in DATABASE_URL environment variable
  },
  // 2FA Configuration - ENABLED for production
  // OTP verification required for all logins in deployed environment
  enable2FA: true,
  // Email configuration for OTP delivery -EmailJS
  otpConfig: {
    recipientEmail: 'abiramigomathy99@gmail.com', // Email to receive OTP
    recipientName: 'Abirami',
    emailJsServiceId: 'service_u3m9btm',
    emailJsTemplateId: 'template_xxu2g8r',
    emailJsPublicKey: 'aFLX1jetnaml-g_Jd' // Your EmailJS public key
  }
};
