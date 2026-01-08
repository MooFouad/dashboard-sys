const validateEnv = () => {
  const useMockData = process.env.USE_MOCK_DATA === 'true';
  const demoMode = process.env.DEMO_MODE === 'true';

  // Required variables that are ALWAYS needed
  const alwaysRequired = [
    'PORT',
    'VAPID_PUBLIC_KEY',
    'VAPID_PRIVATE_KEY',
    'VAPID_EMAIL',
    'APP_URL'
  ];

  // Variables only required in production (not in demo/mock mode)
  const productionOnly = [
    'MONGODB_URI',   // Not needed when using mock JSON data
    'EMAIL_USER',    // Not needed in demo mode
    'EMAIL_PASS'     // Not needed in demo mode
  ];

  const missing = [];

  // Check always required variables
  alwaysRequired.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  // Check production-only variables (skip if using mock data)
  if (!useMockData && !demoMode) {
    productionOnly.forEach(varName => {
      if (!process.env[varName]) {
        missing.push(varName);
      }
    });
  }

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\n💡 Please check your .env file and ensure all required variables are set.');
    console.error('   See .env.example for reference.\n');
    throw new Error('Missing required environment variables. Cannot start server.');
  }

  // Display mode info
  if (useMockData) {
    console.log('✅ DEMO MODE: Environment validated (using mock data)');
  } else {
    console.log('✅ All required environment variables are set');
  }
};

module.exports = validateEnv;
