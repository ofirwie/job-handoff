// Vercel API route for uploading files to Google Drive
import { createClient } from '@supabase/supabase-js';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import googleDriveUtils from '../../../src/utils/google-drive.ts';

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Disable default body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Parse multipart form data
 */
const parseForm = (req) => {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      keepExtensions: true,
      multiples: false
    });

    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};

/**
 * Get MIME type from file extension
 */
const getMimeType = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.txt': 'text/plain',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.zip': 'application/zip',
    '.rar': 'application/x-rar-compressed'
  };
  return mimeTypes[ext] || 'application/octet-stream';
};

/**
 * Validate task belongs to authenticated user
 */
const validateTaskAccess = async (taskId, userEmail) => {
  const { data: task, error } = await supabase
    .from('handover_tasks')
    .select(`
      id,
      handover_id,
      handovers!inner (
        employee_email,
        manager_email,
        drive_folder_id
      )
    `)
    .eq('id', taskId)
    .single();

  if (error || !task) {
    throw new Error('Task not found or access denied');
  }

  const handover = task.handovers;
  const hasAccess = handover.employee_email === userEmail || handover.manager_email === userEmail;
  
  if (!hasAccess) {
    throw new Error('Access denied to this task');
  }

  return {
    taskId: task.id,
    handoverId: task.handover_id,
    driveFolderId: handover.drive_folder_id
  };
};

/**
 * Get appropriate subfolder ID based on task type
 */
const getSubfolderId = async (mainFolderId, taskId) => {
  // Map task types to subfolder names
  const folderMapping = {
    'contacts_file': 'Contacts',
    'procedures_doc': 'Procedures', 
    'systems_access': 'Systems',
    'default': 'Documents'
  };

  const subfolderName = folderMapping[taskId] || folderMapping.default;
  
  try {
    // List existing subfolders
    const subfolders = await googleDriveUtils.listFolderFiles(mainFolderId);
    const targetFolder = subfolders.find(folder => 
      folder.name === subfolderName && folder.mimeType === 'application/vnd.google-apps.folder'
    );

    return targetFolder ? targetFolder.id : mainFolderId; // Fallback to main folder
  } catch (error) {
    console.warn('Could not determine subfolder, using main folder:', error);
    return mainFolderId;
  }
};

/**
 * Main API handler for file uploads
 */
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { taskId } = req.query;

  if (!taskId) {
    return res.status(400).json({ error: 'Task ID is required' });
  }

  try {
    // Get user from Authorization header (JWT token)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization required' });
    }

    // TODO: Implement proper JWT verification for user email
    // For now, we'll extract from a custom header or implement basic auth
    const userEmail = req.headers['x-user-email'];
    if (!userEmail) {
      return res.status(401).json({ error: 'User email required in x-user-email header' });
    }

    // Validate task access
    const taskInfo = await validateTaskAccess(taskId, userEmail);
    
    // Parse form data
    const { fields, files } = await parseForm(req);
    
    if (!files.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;
    
    // Validate file
    const validation = googleDriveUtils.validateFileUpload(
      uploadedFile.originalFilename || uploadedFile.newFilename,
      uploadedFile.size,
      ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.jpg', '.png'], // Allowed types
      10 * 1024 * 1024 // 10MB max
    );

    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }

    // Read file buffer
    const fileBuffer = fs.readFileSync(uploadedFile.filepath);
    const fileName = uploadedFile.originalFilename || uploadedFile.newFilename;
    const mimeType = getMimeType(fileName);

    // Get appropriate subfolder
    const targetFolderId = await getSubfolderId(taskInfo.driveFolderId, fields.taskType || 'default');

    // Upload to Google Drive
    const driveFile = await googleDriveUtils.uploadFileToGoogleDrive({
      folderId: targetFolderId,
      fileName,
      fileBuffer,
      mimeType
    });

    // Update task in database
    const { error: updateError } = await supabase
      .from('handover_tasks') 
      .update({
        is_completed: true,
        drive_file_id: driveFile.id,
        drive_file_name: driveFile.name,
        drive_file_url: driveFile.webViewLink,
        drive_file_size: driveFile.size,
        drive_file_type: driveFile.mimeType,
        completed_at: new Date().toISOString(),
        notes: fields.notes || null
      })
      .eq('id', taskId);

    if (updateError) {
      console.error('Failed to update task:', updateError);
      // Don't fail the entire operation, file is already uploaded
    }

    // Clean up temporary file
    try {
      fs.unlinkSync(uploadedFile.filepath);
    } catch (cleanupError) {
      console.warn('Failed to cleanup temp file:', cleanupError);
    }

    // Calculate handover progress
    try {
      const { data: allTasks } = await supabase
        .from('handover_tasks')
        .select('is_completed')
        .eq('handover_id', taskInfo.handoverId);

      if (allTasks) {
        const completedTasks = allTasks.filter(task => task.is_completed).length;
        const progress = Math.round((completedTasks / allTasks.length) * 100);

        // Update handover progress
        await supabase
          .from('handovers')
          .update({ 
            updated_at: new Date().toISOString(),
            // Add progress field if it exists in your schema
          })
          .eq('id', taskInfo.handoverId);
      }
    } catch (progressError) {
      console.warn('Failed to update progress:', progressError);
    }

    res.status(200).json({
      success: true,
      file: {
        id: driveFile.id,
        name: driveFile.name,
        url: driveFile.webViewLink,
        size: driveFile.size,
        type: driveFile.mimeType
      },
      task: {
        id: taskId,
        completed: true
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up temp file if it exists
    try {
      if (req.file?.filepath) {
        fs.unlinkSync(req.file.filepath);
      }
    } catch (cleanupError) {
      console.warn('Failed to cleanup temp file after error:', cleanupError);
    }

    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
}