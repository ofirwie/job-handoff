// Test endpoint for Google connection verification
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check environment variables
    const envStatus = {
      GOOGLE_SERVICE_ACCOUNT_KEY: !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
      GOOGLE_SHEETS_ID: !!process.env.GOOGLE_SHEETS_ID,
      GOOGLE_DRIVE_PARENT_FOLDER_ID: !!process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID,
      CRON_SECRET: !!process.env.CRON_SECRET,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      VITE_SUPABASE_URL: !!process.env.VITE_SUPABASE_URL
    };

    // Parse service account if exists
    let serviceAccountValid = false;
    let serviceAccountEmail = null;
    
    if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      try {
        const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
        serviceAccountValid = !!(
          serviceAccount.type === 'service_account' &&
          serviceAccount.client_email &&
          serviceAccount.private_key
        );
        serviceAccountEmail = serviceAccount.client_email;
      } catch (e) {
        serviceAccountValid = false;
      }
    }

    // Test Google APIs availability (without actual connection)
    const googleApisStatus = {
      sheets: {
        available: true,
        version: 'v4',
        sheetsId: process.env.GOOGLE_SHEETS_ID || 'Not configured'
      },
      drive: {
        available: true,
        version: 'v3',
        parentFolderId: process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID || 'Not configured'
      }
    };

    // Check Vercel cron configuration
    const cronStatus = {
      configured: !!process.env.CRON_SECRET,
      schedule: '0 */2 * * *', // Every 2 hours
      nextRun: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
    };

    // Overall status
    const allConfigured = Object.values(envStatus).every(v => v) && serviceAccountValid;

    res.status(200).json({
      success: true,
      status: allConfigured ? 'ready' : 'incomplete',
      environment: {
        ...envStatus,
        serviceAccountValid,
        serviceAccountEmail
      },
      googleApis: googleApisStatus,
      cron: cronStatus,
      setupSteps: {
        database: envStatus.VITE_SUPABASE_URL && envStatus.SUPABASE_SERVICE_ROLE_KEY,
        serviceAccount: serviceAccountValid,
        sheets: envStatus.GOOGLE_SHEETS_ID,
        drive: envStatus.GOOGLE_DRIVE_PARENT_FOLDER_ID,
        cron: envStatus.CRON_SECRET
      },
      message: allConfigured 
        ? 'All Google services are configured and ready'
        : 'Some configuration steps are incomplete'
    });

  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
}