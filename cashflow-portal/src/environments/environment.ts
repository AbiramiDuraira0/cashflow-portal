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
  },
  // 2FA Configuration
  // Set to false for local development (passcode only)
  // Set to true for deployed environments (passcode + OTP)
  enable2FA: false, // disabled for local testing
  // Email configuration for OTP delivery
  otpConfig: {
    recipientEmail: 'abiramigomathy99@gmail.com', // Email to receive OTP
    recipientName: 'Abirami',
    // EmailJS configuration (free service - https://www.emailjs.com/)
    // Sign up and get your credentials from EmailJS dashboard
    emailJsServiceId: 'service_u3m9btm',
    emailJsTemplateId: 'template_xxu2g8r',
    emailJsPublicKey: 'aFLX1jetnaml-g_Jd' // Your EmailJS public key
  }
};