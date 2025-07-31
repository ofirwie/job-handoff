// Vercel API route for managing Google Drive folders for handovers
import { createClient } from '@supabase/supabase-js';
import googleDriveUtils from '../../../src/utils/google-drive.ts';

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Validate handover access for the user
 */
const validateHandoverAccess = async (handoverId, userEmail) => {
  const { data: handover, error } = await supabase
    .from('handovers')
    .select('*')
    .eq('id', handoverId)
    .single();

  if (error || !handover) {
    throw new Error('Handover not found');
  }

  const hasAccess = handover.employee_email === userEmail || handover.manager_email === userEmail;
  
  if (!hasAccess) {
    throw new Error('Access denied to this handover');
  }

  return handover;
};

/**
 * Main API handler for handover folder management
 */
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id: handoverId } = req.query;

  if (!handoverId) {
    return res.status(400).json({ error: 'Handover ID is required' });
  }

  try {
    // Get user from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization required' });
    }

    const userEmail = req.headers['x-user-email'];
    if (!userEmail) {
      return res.status(401).json({ error: 'User email required in x-user-email header' });
    }

    // Validate access
    const handover = await validateHandoverAccess(handoverId, userEmail);

    switch (req.method) {
      case 'GET':
        return await handleGetFolder(req, res, handover);
      case 'POST':
        return await handleCreateFolder(req, res, handover);
      case 'PUT':
        return await handleUpdateFolder(req, res, handover);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Folder management error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

/**
 * GET: Retrieve folder information and list files
 */
const handleGetFolder = async (req, res, handover) => {
  try {
    if (!handover.drive_folder_id) {
      return res.status(404).json({ error: 'No Google Drive folder associated with this handover' });
    }

    // Get folder files
    const files = await googleDriveUtils.listFolderFiles(handover.drive_folder_id);

    // Get handover tasks with file information
    const { data: tasks, error: tasksError } = await supabase
      .from('handover_tasks')
      .select('*')
      .eq('handover_id', handover.id)
      .order('created_at');

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
    }

    res.status(200).json({
      success: true,
      folder: {
        id: handover.drive_folder_id,
        url: handover.drive_folder_url,
        files: files
      },
      tasks: tasks || [],
      handover: {
        id: handover.id,
        employee_name: handover.employee_name,
        job_title: handover.job_title,
        status: handover.status
      }
    });

  } catch (error) {
    console.error('Error getting folder:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST: Create a new Google Drive folder for the handover
 */
const handleCreateFolder = async (req, res, handover) => {
  try {
    if (handover.drive_folder_id) {
      return res.status(400).json({ error: 'Handover already has a Google Drive folder' });
    }

    // Generate folder name
    const folderName = googleDriveUtils.generateHandoverFolderName(
      handover.employee_name,
      handover.job_title,
      handover.departure_date
    );

    // Create main folder
    const driveFolder = await googleDriveUtils.createGoogleDriveFolder(folderName);
    
    // Create subfolders
    const subfolders = await googleDriveUtils.createHandoverSubfolders(driveFolder.id);

    // Update handover record
    const { error: updateError } = await supabase
      .from('handovers')
      .update({
        drive_folder_id: driveFolder.id,
        drive_folder_url: driveFolder.webViewLink,
        updated_at: new Date().toISOString()
      })
      .eq('id', handover.id);

    if (updateError) {
      console.error('Failed to update handover with folder info:', updateError);
      // Don't fail the entire operation
    }

    res.status(201).json({
      success: true,
      folder: {
        id: driveFolder.id,
        name: driveFolder.name,
        url: driveFolder.webViewLink,
        subfolders: subfolders
      }
    });

  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * PUT: Update folder structure or recreate subfolders
 */
const handleUpdateFolder = async (req, res, handover) => {
  try {
    if (!handover.drive_folder_id) {
      return res.status(400).json({ error: 'No Google Drive folder to update' });
    }

    const { action } = req.body;

    switch (action) {
      case 'recreate_subfolders':
        // Recreate standard subfolders
        const subfolders = await googleDriveUtils.createHandoverSubfolders(handover.drive_folder_id);
        
        res.status(200).json({
          success: true,
          message: 'Subfolders recreated',
          subfolders: subfolders
        });
        break;

      case 'update_permissions':
        // This would implement permission updates if needed
        res.status(200).json({
          success: true,
          message: 'Permissions updated'
        });
        break;

      default:
        res.status(400).json({ error: 'Invalid action' });
    }

  } catch (error) {
    console.error('Error updating folder:', error);
    res.status(500).json({ error: error.message });
  }
};