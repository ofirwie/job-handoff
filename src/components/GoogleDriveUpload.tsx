import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, File, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

interface GoogleDriveUploadProps {
  taskId: string;
  taskDescription: string;
  allowedTypes?: string[];
  maxSizeMB?: number;
  onUploadComplete?: (result: UploadResult) => void;
  className?: string;
}

interface UploadResult {
  success: boolean;
  file?: {
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
  };
  error?: string;
}

const GoogleDriveUpload: React.FC<GoogleDriveUploadProps> = ({
  taskId,
  taskDescription,
  allowedTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.jpg', '.png'],
  maxSizeMB = 10,
  onUploadComplete,
  className = ""
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [notes, setNotes] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate file before upload
  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      return {
        isValid: false,
        error: `File size (${fileSizeMB.toFixed(1)}MB) exceeds maximum of ${maxSizeMB}MB`
      };
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (allowedTypes.length > 0 && !allowedTypes.includes(fileExtension)) {
      return {
        isValid: false,
        error: `File type ${fileExtension} is not allowed. Allowed types: ${allowedTypes.join(', ')}`
      };
    }

    return { isValid: true };
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.isValid) {
      setUploadResult({
        success: false,
        error: validation.error
      });
      return;
    }

    setSelectedFile(file);
    setUploadResult(null);
  };

  // Handle drag and drop
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.isValid) {
      setUploadResult({
        success: false,
        error: validation.error
      });
      return;
    }

    setSelectedFile(file);
    setUploadResult(null);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  // Upload file to Google Drive
  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);
    setUploadResult(null);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('taskType', taskId);
      if (notes) {
        formData.append('notes', notes);
      }

      // Get current user email (this would come from auth context in real implementation)
      const userEmail = 'user@company.com'; // TODO: Get from auth context

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload to API
      const response = await fetch(`/api/tasks/${taskId}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || 'dummy-token'}`,
          'x-user-email': userEmail
        },
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();

      if (result.success) {
        const uploadResult: UploadResult = {
          success: true,
          file: result.file
        };
        
        setUploadResult(uploadResult);
        
        if (onUploadComplete) {
          onUploadComplete(uploadResult);
        }
      } else {
        setUploadResult({
          success: false,
          error: result.error || 'Upload failed'
        });
      }

    } catch (error) {
      console.error('Upload error:', error);
      setUploadResult({
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      });
    } finally {
      setUploading(false);
    }
  };

  // Clear selection and start over
  const handleClear = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setNotes('');
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          {taskDescription}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!uploadResult?.success && (
          <>
            {/* File Drop Zone */}
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 cursor-pointer transition-colors"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600 mb-2">
                Drag and drop a file here, or click to select
              </p>
              <p className="text-xs text-gray-500">
                Allowed: {allowedTypes.join(', ')} • Max size: {maxSizeMB}MB
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={allowedTypes.join(',')}
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Selected File Display */}
            {selectedFile && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <File className="h-5 w-5 text-blue-500" />
                  <div className="flex-1">
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    disabled={uploading}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            )}

            {/* Notes Field */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Notes (optional)
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes about this file..."
                disabled={uploading}
                rows={3}
              />
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading to Google Drive...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="w-full"
            >
              {uploading ? 'Uploading...' : 'Upload to Google Drive'}
            </Button>
          </>
        )}

        {/* Upload Result */}
        {uploadResult && (
          <Alert className={uploadResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <div className="flex items-start gap-2">
              {uploadResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <AlertDescription>
                  {uploadResult.success ? (
                    <div>
                      <p className="font-medium text-green-800 mb-2">
                        File uploaded successfully!
                      </p>
                      {uploadResult.file && (
                        <div className="space-y-2">
                          <p className="text-sm text-green-700">
                            <strong>File:</strong> {uploadResult.file.name}
                          </p>
                          <p className="text-sm text-green-700">
                            <strong>Size:</strong> {formatFileSize(uploadResult.file.size)}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(uploadResult.file?.url, '_blank')}
                            className="border-green-300 text-green-700 hover:bg-green-100"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View in Google Drive
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium text-red-800 mb-1">Upload failed</p>
                      <p className="text-sm text-red-700">{uploadResult.error}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClear}
                        className="mt-2 border-red-300 text-red-700 hover:bg-red-100"
                      >
                        Try Again
                      </Button>
                    </div>
                  )}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default GoogleDriveUpload;