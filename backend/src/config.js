const dotenv = require('dotenv');

dotenv.config();

function parseOrigins(rawOrigins) {
  return String(rawOrigins || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const config = {
  port: Number.parseInt(process.env.PORT || '4000', 10),
  corsOrigins: parseOrigins(process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173'),
  supabaseUrl: (process.env.SUPABASE_URL || '').trim(),
  supabaseAnonKey: (process.env.SUPABASE_ANON_KEY || '').trim(),
  supabaseServiceRoleKey: (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim(),
  smtpHost: (process.env.SMTP_HOST || '').trim(),
  smtpPort: Number.parseInt(process.env.SMTP_PORT || '587', 10),
  smtpSecure: String(process.env.SMTP_SECURE || 'false').trim().toLowerCase() === 'true',
  smtpUser: (process.env.SMTP_USER || '').trim(),
  smtpPass: (process.env.SMTP_PASS || '').trim(),
  smtpFromEmail: (process.env.SMTP_FROM_EMAIL || '').trim(),
  smtpFromName: (process.env.SMTP_FROM_NAME || 'Smiles Dental Hub').trim(),
};

const missing = [];
if (!config.supabaseUrl) missing.push('SUPABASE_URL');
if (!config.supabaseAnonKey) missing.push('SUPABASE_ANON_KEY');

if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

module.exports = config;
