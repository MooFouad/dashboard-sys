const validateEnv = () => {
  const useMockData = process.env.USE_MOCK_DATA === 'true';
  const demoMode   = process.env.DEMO_MODE === 'true';
  const isMock     = useMockData || demoMode;

  // In mock/demo mode the only thing we truly need is JWT_SECRET.
  // Everything else (VAPID, email, DB) is optional and gets a warning.
  if (isMock) {
    if (!process.env.JWT_SECRET) {
      console.warn('⚠️  JWT_SECRET not set — using insecure fallback. Set a strong secret in production.');
      process.env.JWT_SECRET = 'demo-jwt-secret-change-in-production';
    }
    if (!process.env.PORT) {
      process.env.PORT = '5000';
    }
    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY || !process.env.VAPID_EMAIL) {
      console.warn('⚠️  VAPID keys not set — push notifications disabled in demo mode.');
    }
    console.log('✅ DEMO MODE: Environment validated (using mock data, no DB required)');
    return;
  }

  // ── Production / real-DB mode ────────────────────────────────────────────
  const required = [
    'MONGODB_URI',
    'JWT_SECRET',
    'PORT',
    'VAPID_PUBLIC_KEY',
    'VAPID_PRIVATE_KEY',
    'VAPID_EMAIL',
    'APP_URL',
  ];

  const missing = required.filter(v => !process.env[v]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(v => console.error(`   - ${v}`));
    console.error('\n💡 Set USE_MOCK_DATA=true to run without a database.\n');
    throw new Error('Missing required environment variables. Cannot start server.');
  }

  console.log('✅ All required environment variables are set');
};

module.exports = validateEnv;
