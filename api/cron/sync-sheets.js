// Vercel Cron Job for automated Google Sheets synchronization
// This endpoint is called automatically every 2 hours by Vercel Cron

export default async function handler(req, res) {
  // Verify this is a cron request (Vercel sets this header)
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('Starting automated Google Sheets sync...');

    // Call the existing sync endpoint
    const syncResponse = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/sync/google-sheets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CRON_SECRET}`
      }
    });

    const syncResult = await syncResponse.json();

    if (syncResult.success) {
      console.log('Automated sync completed successfully:', syncResult.summary);
      
      res.status(200).json({
        success: true,
        message: 'Automated sync completed',
        timestamp: new Date().toISOString(),
        ...syncResult
      });
    } else {
      console.error('Automated sync failed:', syncResult.error);
      
      res.status(500).json({
        success: false,
        message: 'Automated sync failed',
        timestamp: new Date().toISOString(),
        error: syncResult.error
      });
    }

  } catch (error) {
    console.error('Cron job error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Cron job failed',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
}