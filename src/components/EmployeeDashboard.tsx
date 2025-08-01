import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import TaskEditor from './TaskEditor';
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

interface HandoverData {
  id: string;
  employee_name: string;
  job_title: string;
  departure_date: string;
  template_name: string;
  progress: number;
  total_tasks: number;
  completed_tasks: number;
  days_remaining: number;
}

interface EmployeeDashboardProps {
  employeeEmail: string;
  employeeName?: string;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
  employeeEmail,
  employeeName = "Employee"
}) => {
  const [handover, setHandover] = useState<HandoverData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showTaskEditor, setShowTaskEditor] = useState(false);

  useEffect(() => {
    loadHandoverData();
  }, [employeeEmail]);

  useEffect(() => {
    filterTasks();
  }, [tasks, searchTerm, statusFilter, priorityFilter]);

  const loadHandoverData = async () => {
    setLoading(true);
    try {
      // Load handover data
      const { data: handoverData, error: handoverError } = await supabase
        .from('handovers')
        .select(`
          *,
          templates (name),
          handover_tasks (*)
        `)
        .eq('employee_email', employeeEmail)
        .eq('status', 'in_progress')
        .single();

      if (handoverError) {
        console.error('Error loading handover:', handoverError);
        return;
      }

      if (handoverData) {
        const totalTasks = handoverData.handover_tasks?.length || 0;
        const completedTasks = handoverData.handover_tasks?.filter((task: any) => task.is_completed).length || 0;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        const departureDate = new Date(handoverData.departure_date);
        const today = new Date();
        const daysRemaining = Math.ceil((departureDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        setHandover({
          id: handoverData.id,
          employee_name: handoverData.employee_name,
          job_title: handoverData.job_title,
          departure_date: handoverData.departure_date,
          template_name: handoverData.templates?.name || 'Unknown Template',
          progress,
          total_tasks: totalTasks,
          completed_tasks: completedTasks,
          days_remaining: Math.max(0, daysRemaining)
        });

        // Transform tasks
        const transformedTasks = handoverData.handover_tasks?.map((task: any) => ({
          id: task.id,
          description: task.description || task.title,
          category: task.category || 'General',
          priority: task.priority || 'medium',
          status: task.is_completed ? 'done' : (task.status || 'not_started'),
          due_date: task.due_date || handoverData.departure_date,
          is_required: task.is_required || false,
          notes: task.notes,
          files: task.files || [],
          estimated_hours: task.estimated_hours
        })) || [];

        setTasks(transformedTasks);
      }
    } catch (error) {
      console.error('Error loading handover data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = tasks;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    setFilteredTasks(filtered);
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const isCompleted = newStatus === 'done';
      const { error } = await supabase
        .from('handover_tasks')
        .update({ 
          status: newStatus,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null
        })
        .eq('id', taskId);

      if (!error) {
        // Update local state
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === taskId ? { ...task, status: newStatus as any } : task
          )
        );
        // Reload handover data to update progress
        loadHandoverData();
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleTaskSave = (updatedTask: Task) => {
    if (editingTask) {
      // Update existing task
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === updatedTask.id ? updatedTask : task
        )
      );
    } else {
      // Add new task
      setTasks(prevTasks => [...prevTasks, updatedTask]);
    }
    
    // Reload handover data to update progress
    loadHandoverData();
    setEditingTask(null);
    setShowTaskEditor(false);
    setShowAddTask(false);
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setShowTaskEditor(true);
    setShowAddTask(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskEditor(true);
    setShowAddTask(false);
    setSelectedTask(null);
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      done: 'status-badge status-done',
      working: 'status-badge status-working',
      stuck: 'status-badge status-stuck',
      not_started: 'status-badge status-not-started',
      pending: 'status-badge status-pending'
    };
    
    const statusText = {
      done: 'הושלם',
      working: 'בעבודה',
      stuck: 'תקוע',
      not_started: 'לא התחיל',
      pending: 'ממתין'
    };

    return (
      <span className={statusClasses[status as keyof typeof statusClasses]}>
        {statusText[status as keyof typeof statusText]}
      </span>
    );
  };

  const getPriorityIndicator = (priority: string) => {
    const priorityClasses = {
      high: 'priority-indicator priority-high',
      medium: 'priority-indicator priority-medium',
      low: 'priority-indicator priority-low'
    };

    return <div className={priorityClasses[priority as keyof typeof priorityClasses]}></div>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'היום';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'מחר';
    } else {
      return date.toLocaleDateString('he-IL');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="loading-spinner mx-auto"></div>
            <p className="text-muted-foreground">טוען נתוני חפיפה...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!handover) {
    return (
      <div className="p-6">
        <div className="monday-card">
          <div className="monday-card-content">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">אין חפיפה פעילה</h2>
              <p className="text-muted-foreground">לא נמצאה חפיפה פעילה עבור המשתמש הזה.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">החפיפה שלי</h1>
          <p className="text-muted-foreground mt-1">
            {handover.employee_name} • {handover.job_title}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="btn-monday btn-monday-secondary btn-monday-sm">
            ⚙ תאריך יעד
          </button>
          <button 
            className="btn-monday btn-monday-primary btn-monday-sm"
            onClick={handleAddTask}
          >
            + הוסף מטלה
          </button>
        </div>
      </div>

      {/* Progress Card */}
      <div className="monday-card">
        <div className="monday-card-content">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">התקדמות כללית</h3>
              <span className="text-2xl font-bold">{handover.progress}%</span>
            </div>
            
            <div className="progress-container">
              <div 
                className="progress-fill" 
                style={{ width: `${handover.progress}%` }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{handover.completed_tasks} מתוך {handover.total_tasks} מטלות</span>
              <span>נותרו {handover.days_remaining} ימים</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="monday-card">
        <div className="monday-card-content">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <div className="monday-search">
                <input
                  type="text"
                  placeholder="חיפוש מטלות..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="monday-input monday-search-input"
                />
                <span className="monday-search-icon">🔍</span>
              </div>
            </div>
            
            <div className="monday-select">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="monday-select-trigger"
              >
                <option value="all">כל הסטטוסים</option>
                <option value="done">הושלם</option>
                <option value="working">בעבודה</option>
                <option value="stuck">תקוע</option>
                <option value="not_started">לא התחיל</option>
                <option value="pending">ממתין</option>
              </select>
            </div>
            
            <div className="monday-select">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="monday-select-trigger"
              >
                <option value="all">כל העדיפויות</option>
                <option value="high">גבוה</option>
                <option value="medium">בינוני</option>
                <option value="low">נמוך</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="monday-card">
        <div className="monday-card-header">
          <h3 className="monday-card-title">מטלות חפיפה ({filteredTasks.length})</h3>
        </div>
        <div className="monday-card-content p-0">
          {filteredTasks.length > 0 ? (
            <div className="monday-table">
              <div className="monday-table-header">
                <table style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'right' }}>מטלה</th>
                      <th style={{ textAlign: 'center' }}>סטטוס</th>
                      <th style={{ textAlign: 'center' }}>עדיפות</th>
                      <th style={{ textAlign: 'right' }}>תאריך יעד</th>
                      <th style={{ textAlign: 'center' }}>פעולות</th>
                    </tr>
                  </thead>
                </table>
              </div>
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                <table style={{ width: '100%' }}>
                  <tbody>
                    {filteredTasks.map((task) => (
                      <tr 
                        key={task.id} 
                        className="monday-table-row"
                        tabIndex={0}
                        onClick={() => setSelectedTask(task)}
                      >
                        <td className="monday-table-cell" style={{ textAlign: 'right' }}>
                          <div className="flex items-center space-x-2">
                            <div>
                              <div className="font-medium">{task.description}</div>
                              <div className="text-xs text-muted-foreground">{task.category}</div>
                              {task.is_required && (
                                <span className="status-badge" style={{ backgroundColor: '#fee2e2', color: '#991b1b', fontSize: '10px' }}>
                                  חובה
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="monday-table-cell" style={{ textAlign: 'center' }}>
                          <div className="monday-select">
                            <select
                              value={task.status}
                              onChange={(e) => {
                                e.stopPropagation();
                                updateTaskStatus(task.id, e.target.value);
                              }}
                              className="monday-select-trigger"
                              style={{ minWidth: '120px' }}
                            >
                              <option value="not_started">לא התחיל</option>
                              <option value="working">בעבודה</option>
                              <option value="stuck">תקוע</option>
                              <option value="pending">ממתין</option>
                              <option value="done">הושלם</option>
                            </select>
                          </div>
                        </td>
                        <td className="monday-table-cell" style={{ textAlign: 'center' }}>
                          <div className="flex items-center justify-center">
                            {getPriorityIndicator(task.priority)}
                          </div>
                        </td>
                        <td className="monday-table-cell" style={{ textAlign: 'right' }}>
                          {formatDate(task.due_date)}
                        </td>
                        <td className="monday-table-cell" style={{ textAlign: 'center' }}>
                          <button
                            className="btn-monday btn-monday-ghost btn-monday-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditTask(task);
                            }}
                          >
                            ערוך
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">אין מטלות התואמות לקריטריונים</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile View (Cards) */}
      <div className="mobile-card-view space-y-4">
        {filteredTasks.map((task) => (
          <div key={task.id} className="monday-card">
            <div className="monday-card-content">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{task.description}</h4>
                    <p className="text-sm text-muted-foreground">{task.category}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getPriorityIndicator(task.priority)}
                    {getStatusBadge(task.status)}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span>תאריך יעד: {formatDate(task.due_date)}</span>
                  {task.is_required && (
                    <span className="status-badge" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
                      חובה
                    </span>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    className="btn-monday btn-monday-primary btn-monday-sm flex-1"
                    onClick={() => setSelectedTask(task)}
                  >
                    צפה
                  </button>
                  <button 
                    className="btn-monday btn-monday-secondary btn-monday-sm flex-1"
                    onClick={() => handleEditTask(task)}
                  >
                    ערוך
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="monday-card" style={{ maxWidth: '600px', width: '100%', maxHeight: '80vh', overflow: 'auto' }}>
            <div className="monday-card-header">
              <div className="flex items-center justify-between">
                <h3 className="monday-card-title">{selectedTask.description}</h3>
                <button 
                  className="btn-monday btn-monday-ghost btn-monday-sm"
                  onClick={() => setSelectedTask(null)}
                >
                  ×
                </button>
              </div>
            </div>
            <div className="monday-card-content space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">סטטוס</label>
                  {getStatusBadge(selectedTask.status)}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">עדיפות</label>
                  <div className="flex items-center space-x-2">
                    {getPriorityIndicator(selectedTask.priority)}
                    <span className="capitalize">{selectedTask.priority}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">קטגוריה</label>
                  <p>{selectedTask.category}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">תאריך יעד</label>
                  <p>{formatDate(selectedTask.due_date)}</p>
                </div>
              </div>
              
              {selectedTask.notes && (
                <div>
                  <label className="block text-sm font-medium mb-1">הערות</label>
                  <p className="text-sm text-muted-foreground">{selectedTask.notes}</p>
                </div>
              )}
              
              {selectedTask.files && selectedTask.files.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-1">קבצים</label>
                  <div className="space-y-2">
                    {selectedTask.files.map((file, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <span>📄</span>
                        <span>{file}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex space-x-2 pt-4">
                <button 
                  className="btn-monday btn-monday-primary flex-1"
                  onClick={() => handleEditTask(selectedTask)}
                >
                  ערוך מטלה
                </button>
                <button 
                  className="btn-monday btn-monday-secondary flex-1"
                  onClick={() => setSelectedTask(null)}
                >
                  סגור
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Editor Modal */}
      <TaskEditor
        task={editingTask}
        isOpen={showTaskEditor}
        onClose={() => {
          setShowTaskEditor(false);
          setEditingTask(null);
          setShowAddTask(false);
        }}
        onSave={handleTaskSave}
        isNewTask={showAddTask}
        handoverId={handover?.id}
      />
    </div>
  );
};

export default EmployeeDashboard;