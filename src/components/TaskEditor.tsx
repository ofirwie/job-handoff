import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import '../styles/monday-design-system.css';

interface Task {
  id: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'done' | 'working' | 'stuck' | 'not_started' | 'pending';
  due_date: string;
  is_required: boolean;
  notes?: string;
  files?: string[];
  estimated_hours?: number;
}

interface TaskEditorProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTask: Task) => void;
  isNewTask?: boolean;
  handoverId?: string;
}

export const TaskEditor: React.FC<TaskEditorProps> = ({
  task,
  isOpen,
  onClose,
  onSave,
  isNewTask = false,
  handoverId
}) => {
  const [formData, setFormData] = useState<Partial<Task>>({
    description: '',
    category: 'General',
    priority: 'medium',
    status: 'not_started',
    due_date: '',
    is_required: false,
    notes: '',
    files: [],
    estimated_hours: 1
  });
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [loading, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (task) {
      setFormData({
        ...task,
        due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : ''
      });
    } else if (isNewTask) {
      setFormData({
        description: '',
        category: 'General',
        priority: 'medium',
        status: 'not_started',
        due_date: '',
        is_required: false,
        notes: '',
        files: [],
        estimated_hours: 1
      });
    }
  }, [task, isNewTask]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.description?.trim()) {
      newErrors.description = 'תיאור המטלה נדרש';
    }

    if (!formData.due_date) {
      newErrors.due_date = 'תאריך יעד נדרש';
    }

    if (!formData.category?.trim()) {
      newErrors.category = 'קטגוריה נדרשת';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadingFiles(files);
  };

  const handleRemoveFile = (fileName: string) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files?.filter(file => file !== fileName) || []
    }));
  };

  const uploadFiles = async (): Promise<string[]> => {
    if (uploadingFiles.length === 0) return formData.files || [];

    try {
      const uploadPromises = uploadingFiles.map(async (file) => {
        const fileName = `handover-files/${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
          .from('handover-files')
          .upload(fileName, file);

        if (error) throw error;
        return fileName;
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      return [...(formData.files || []), ...uploadedFiles];
    } catch (error) {
      console.error('Error uploading files:', error);
      throw new Error('שגיאה בהעלאת קבצים');
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setErrors({});

    try {
      // Upload files if any
      const allFiles = await uploadFiles();

      const updatedTask = {
        ...formData,
        files: allFiles,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : new Date().toISOString()
      } as Task;

      if (isNewTask && handoverId) {
        // Create new task
        const { data, error } = await supabase
          .from('handover_tasks')
          .insert([{
            handover_id: handoverId,
            description: updatedTask.description,
            category: updatedTask.category,
            priority: updatedTask.priority,
            status: updatedTask.status,
            due_date: updatedTask.due_date,
            is_required: updatedTask.is_required,
            notes: updatedTask.notes,
            files: updatedTask.files,
            estimated_hours: updatedTask.estimated_hours
          }])
          .select()
          .single();

        if (error) throw error;
        updatedTask.id = data.id;
      } else if (task) {
        // Update existing task
        const { error } = await supabase
          .from('handover_tasks')
          .update({
            description: updatedTask.description,
            category: updatedTask.category,
            priority: updatedTask.priority,
            status: updatedTask.status,
            due_date: updatedTask.due_date,
            is_required: updatedTask.is_required,
            notes: updatedTask.notes,
            files: updatedTask.files,
            estimated_hours: updatedTask.estimated_hours,
            updated_at: new Date().toISOString()
          })
          .eq('id', task.id);

        if (error) throw error;
        updatedTask.id = task.id;
      }

      onSave(updatedTask);
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
      setErrors({ general: error instanceof Error ? error.message : 'שגיאה בשמירת המטלה' });
    } finally {
      setSaving(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!task) return;

    try {
      const { error } = await supabase
        .from('handover_tasks')
        .update({
          status: 'done',
          is_completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('id', task.id);

      if (error) throw error;

      const updatedTask = { ...task, status: 'done' as const };
      onSave(updatedTask);
      onClose();
    } catch (error) {
      console.error('Error marking task complete:', error);
      setErrors({ general: 'שגיאה בסימון משימה כהושלמה' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="monday-card" style={{ maxWidth: '700px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
        <div className="monday-card-header">
          <div className="flex items-center justify-between">
            <h3 className="monday-card-title">
              {isNewTask ? 'מטלה חדשה' : `מטלה: ${task?.description}`}
            </h3>
            <button 
              className="btn-monday btn-monday-ghost btn-monday-sm"
              onClick={onClose}
            >
              ← חזרה
            </button>
          </div>
        </div>
        
        <div className="monday-card-content space-y-6">
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {errors.general}
            </div>
          )}

          {/* General Information */}
          <div className="space-y-4">
            <h4 className="font-semibold border-b pb-2">מידע כללי</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">כותרת *</label>
                <input
                  type="text"
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className={`monday-input ${errors.description ? 'border-red-500' : ''}`}
                  placeholder="תיאור המטלה..."
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">קטגוריה *</label>
                <div className="monday-select">
                  <select
                    value={formData.category || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className={`monday-select-trigger ${errors.category ? 'border-red-500' : ''}`}
                  >
                    <option value="General">כללי</option>
                    <option value="Documentation">תיעוד</option>
                    <option value="Systems">מערכות</option>
                    <option value="Contacts">אנשי קשר</option>
                    <option value="Processes">תהליכים</option>
                    <option value="Files">קבצים</option>
                    <option value="Training">הדרכה</option>
                    <option value="Meetings">פגישות</option>
                  </select>
                </div>
                {errors.category && (
                  <p className="text-red-500 text-xs mt-1">{errors.category}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">תאריך יעד *</label>
                <input
                  type="date"
                  value={formData.due_date || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                  className={`monday-input ${errors.due_date ? 'border-red-500' : ''}`}
                />
                {errors.due_date && (
                  <p className="text-red-500 text-xs mt-1">{errors.due_date}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">עדיפות</label>
                <div className="monday-select">
                  <select
                    value={formData.priority || 'medium'}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="monday-select-trigger"
                  >
                    <option value="high">גבוה</option>
                    <option value="medium">בינוני</option>
                    <option value="low">נמוך</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">זמן משוער (שעות)</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={formData.estimated_hours || 1}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimated_hours: parseFloat(e.target.value) }))}
                  className="monday-input"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="required"
                checked={formData.is_required || false}
                onChange={(e) => setFormData(prev => ({ ...prev, is_required: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="required" className="text-sm font-medium">
                מטלה חובה
              </label>
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <h4 className="font-semibold border-b pb-2">העלאת קבצים</h4>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="space-y-2">
                  <div className="text-4xl text-gray-400">📁</div>
                  <p className="text-sm text-gray-600">גרור קבצים כאן או לחץ לבחירה</p>
                  <button type="button" className="btn-monday btn-monday-secondary btn-monday-sm">
                    בחר קבצים
                  </button>
                </div>
              </label>
            </div>
            
            {/* Existing Files */}
            {formData.files && formData.files.length > 0 && (
              <div>
                <h5 className="font-medium mb-2">קבצים קיימים:</h5>
                <div className="space-y-2">
                  {formData.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <span>📄</span>
                        <span className="text-sm">{file.split('/').pop()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          type="button"
                          className="btn-monday btn-monday-ghost btn-monday-sm"
                          onClick={() => window.open(`/api/files/${file}`, '_blank')}
                        >
                          🔗 צפה
                        </button>
                        <button 
                          type="button"
                          className="btn-monday btn-monday-ghost btn-monday-sm text-red-600"
                          onClick={() => handleRemoveFile(file)}
                        >
                          🗑 מחק
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* New Files to Upload */}
            {uploadingFiles.length > 0 && (
              <div>
                <h5 className="font-medium mb-2">קבצים חדשים להעלאה:</h5>
                <div className="space-y-2">
                  {uploadingFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                      <div className="flex items-center space-x-2">
                        <span>📄</span>
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <h4 className="font-semibold border-b pb-2">הערות</h4>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="monday-input"
              rows={4}
              placeholder="הערות נוספות..."
              style={{ resize: 'vertical', minHeight: '100px' }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-4 border-t">
            <button 
              type="button"
              className="btn-monday btn-monday-secondary"
              onClick={onClose}
              disabled={loading}
            >
              ביטול
            </button>
            
            <button 
              type="button"
              className="btn-monday btn-monday-primary flex-1"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="loading-spinner"></div>
                  <span>שומר...</span>
                </div>
              ) : (
                'שמירה'
              )}
            </button>
            
            {!isNewTask && task && task.status !== 'done' && (
              <button 
                type="button"
                className="btn-monday btn-monday-primary"
                onClick={handleMarkComplete}
                disabled={loading}
                style={{ backgroundColor: 'var(--priority-low)' }}
              >
                סמן כהושלם
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskEditor;