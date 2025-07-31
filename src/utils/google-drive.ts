// Google Drive API utilities for handover file management
import { google } from 'googleapis';

// Types for Google Drive operations
export interface DriveFolder {
  id: string;
  name: string;
  webViewLink: string;
}

export interface DriveFile {
  id: string;
  name: string;
  webViewLink: string;
  size: number;
  mimeType: string;
}

export interface UploadFileOptions {
  folderId: string;
  fileName: string;
  fileBuffer: Buffer;
  mimeType: string;
}

/**
 * Get authenticated Google Drive client
 * Uses service account authentication from environment variables
 */
const getDriveClient = () => {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable is required');
  }

  let credentials;
  try {
    credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
  } catch (error) {
    throw new Error('Invalid GOOGLE_SERVICE_ACCOUNT_KEY format. Must be valid JSON.');
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.file'
    ]
  });

  return google.drive({ version: 'v3', auth });
};

/**
 * Create a new folder in Google Drive for handover files
 * @param folderName - Name of the folder to create
 * @param parentFolderId - Optional parent folder ID (defaults to env variable)
 * @returns Promise<DriveFolder> - Created folder details
 */
export const createGoogleDriveFolder = async (
  folderName: string,
  parentFolderId?: string
): Promise<DriveFolder> => {
  const drive = getDriveClient();
  
  const parentId = parentFolderId || process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID;
  
  try {
    // Create the folder
    const response = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentId ? [parentId] : undefined
      },
      fields: 'id, name'
    });

    if (!response.data.id) {
      throw new Error('Failed to create folder - no ID returned');
    }

    // Make folder viewable by anyone with the link
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });

    // Get the shareable link
    const folder = await drive.files.get({
      fileId: response.data.id,
      fields: 'webViewLink, name'
    });

    return {
      id: response.data.id,
      name: folder.data.name || folderName,
      webViewLink: folder.data.webViewLink || ''
    };
  } catch (error) {
    console.error('Error creating Google Drive folder:', error);
    throw new Error(`Failed to create folder "${folderName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Upload a file to Google Drive
 * @param options - Upload options including folder, file name, buffer, and MIME type
 * @returns Promise<DriveFile> - Uploaded file details
 */
export const uploadFileToGoogleDrive = async (
  options: UploadFileOptions
): Promise<DriveFile> => {
  const { folderId, fileName, fileBuffer, mimeType } = options;
  const drive = getDriveClient();

  try {
    // Upload the file
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [folderId]
      },
      media: {
        mimeType,
        body: fileBuffer
      },
      fields: 'id, name, size, mimeType'
    });

    if (!response.data.id) {
      throw new Error('Failed to upload file - no ID returned');
    }

    // Make file viewable by anyone with the link
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });

    // Get the shareable link
    const file = await drive.files.get({
      fileId: response.data.id,
      fields: 'webViewLink'
    });

    return {
      id: response.data.id,
      name: response.data.name || fileName,
      webViewLink: file.data.webViewLink || '',
      size: parseInt(response.data.size || '0'),
      mimeType: response.data.mimeType || mimeType
    };
  } catch (error) {
    console.error('Error uploading file to Google Drive:', error);
    throw new Error(`Failed to upload file "${fileName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Create subfolders within a handover folder for organized file storage
 * @param parentFolderId - ID of the parent handover folder
 * @param subfolderNames - Array of subfolder names to create
 * @returns Promise<DriveFolder[]> - Array of created subfolders
 */
export const createHandoverSubfolders = async (
  parentFolderId: string,
  subfolderNames: string[] = ['Contacts', 'Procedures', 'Systems', 'Documents']
): Promise<DriveFolder[]> => {
  const subfolders: DriveFolder[] = [];

  for (const folderName of subfolderNames) {
    try {
      const subfolder = await createGoogleDriveFolder(folderName, parentFolderId);
      subfolders.push(subfolder);
    } catch (error) {
      console.error(`Failed to create subfolder "${folderName}":`, error);
      // Continue creating other folders even if one fails
    }
  }

  return subfolders;
};

/**
 * List files in a Google Drive folder
 * @param folderId - ID of the folder to list files from
 * @returns Promise<DriveFile[]> - Array of files in the folder
 */
export const listFolderFiles = async (folderId: string): Promise<DriveFile[]> => {
  const drive = getDriveClient();

  try {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id, name, webViewLink, size, mimeType, createdTime)',
      orderBy: 'createdTime desc'
    });

    return (response.data.files || []).map(file => ({
      id: file.id || '',
      name: file.name || '',
      webViewLink: file.webViewLink || '',
      size: parseInt(file.size || '0'),
      mimeType: file.mimeType || ''
    }));
  } catch (error) {
    console.error('Error listing folder files:', error);
    throw new Error(`Failed to list files in folder: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Delete a file from Google Drive
 * @param fileId - ID of the file to delete
 * @returns Promise<boolean> - Success status
 */
export const deleteFileFromDrive = async (fileId: string): Promise<boolean> => {
  const drive = getDriveClient();

  try {
    await drive.files.delete({
      fileId
    });
    return true;
  } catch (error) {
    console.error('Error deleting file from Drive:', error);
    throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Get file metadata from Google Drive
 * @param fileId - ID of the file
 * @returns Promise<DriveFile> - File metadata
 */
export const getFileMetadata = async (fileId: string): Promise<DriveFile> => {
  const drive = getDriveClient();

  try {
    const response = await drive.files.get({
      fileId,
      fields: 'id, name, webViewLink, size, mimeType'
    });

    return {
      id: response.data.id || '',
      name: response.data.name || '',
      webViewLink: response.data.webViewLink || '',
      size: parseInt(response.data.size || '0'),
      mimeType: response.data.mimeType || ''
    };
  } catch (error) {
    console.error('Error getting file metadata:', error);
    throw new Error(`Failed to get file metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Validate file type and size constraints
 * @param fileName - Name of the file
 * @param fileSize - Size of the file in bytes
 * @param allowedTypes - Array of allowed MIME types
 * @param maxSizeBytes - Maximum file size in bytes (default 10MB)
 * @returns boolean - Whether the file passes validation
 */
export const validateFileUpload = (
  fileName: string,
  fileSize: number,
  allowedTypes: string[] = [],
  maxSizeBytes: number = 10 * 1024 * 1024 // 10MB default
): { isValid: boolean; error?: string } => {
  // Check file size
  if (fileSize > maxSizeBytes) {
    return {
      isValid: false,
      error: `File size ${Math.round(fileSize / 1024 / 1024)}MB exceeds maximum of ${Math.round(maxSizeBytes / 1024 / 1024)}MB`
    };
  }

  // Check file extension if allowed types are specified
  if (allowedTypes.length > 0) {
    const fileExtension = fileName.toLowerCase().split('.').pop();
    const hasValidExtension = allowedTypes.some(type => {
      if (type.startsWith('.')) {
        return type.toLowerCase() === `.${fileExtension}`;
      }
      return type.toLowerCase().includes(fileExtension || '');
    });

    if (!hasValidExtension) {
      return {
        isValid: false,
        error: `File type .${fileExtension} is not allowed. Allowed types: ${allowedTypes.join(', ')}`
      };
    }
  }

  return { isValid: true };
};

/**
 * Generate a standardized handover folder name
 * @param employeeName - Name of the departing employee
 * @param jobTitle - Job title of the employee
 * @param departureDate - Optional departure date
 * @returns string - Formatted folder name
 */
export const generateHandoverFolderName = (
  employeeName: string,
  jobTitle: string,
  departureDate?: string
): string => {
  const dateSuffix = departureDate ? ` - ${departureDate}` : '';
  return `${employeeName} - ${jobTitle} - חפיפה${dateSuffix}`;
};

export default {
  createGoogleDriveFolder,
  uploadFileToGoogleDrive,
  createHandoverSubfolders,
  listFolderFiles,
  deleteFileFromDrive,
  getFileMetadata,
  validateFileUpload,
  generateHandoverFolderName
};