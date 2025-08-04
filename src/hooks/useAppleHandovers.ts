import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface SimpleHandover {
  id: string;
  employeeName: string;
  role: string;
  department: string;
  progress: number;
  status: 'created' | 'in_progress' | 'completed' | 'approved' | 'rejected' | 'needs_revision';
  statusLabel: string;
  dueDate: string;
  timeLeft: string;
  priority: 'high' | 'medium' | 'low';
  driveFolder?: string;
  jobCode?: string;
}

interface UrgentAction {
  handoverId: string;
  title: string;
  description: string;
}

export function useHandovers() {
  const [handovers, setHandovers] = useState<SimpleHandover[]>([]);
  const [loading, setLoading] = useState(true);
  const [urgentAction, setUrgentAction] = useState<UrgentAction | null>(null);

  useEffect(() => {
    // Calculate time left in human-readable format
    const getTimeLeft = (dueDate: string): string => {
      if (!dueDate) return 'No deadline';
      
      const now = new Date();
      const due = new Date(dueDate);
      const diffTime = due.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return 'Overdue';
      if (diffDays === 0) return 'Due today';
      if (diffDays === 1) return 'Due tomorrow';
      if (diffDays <= 7) return `${diffDays} days left`;
      if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks left`;
      return `${Math.ceil(diffDays / 30)} months left`;
    };

    // Get status label for UI display
    const getStatusLabel = (status: string): string => {
      switch (status) {
        case 'created': return 'Just Created';
        case 'in_progress': return 'In Progress';
        case 'completed': return 'Completed';
        case 'approved': return 'Approved';
        case 'rejected': return 'Needs Changes';
        case 'needs_revision': return 'Needs Revision';
        default: return 'Unknown';
      }
    };

    // Calculate priority based on due date and status
    const calculatePriority = (dueDate: string, status: string): 'high' | 'medium' | 'low' => {
      if (status === 'completed') return 'medium'; // Completed items
      
      const timeLeft = getTimeLeft(dueDate);
      if (timeLeft === 'Overdue' || timeLeft === 'Due today') return 'high';
      if (timeLeft.includes('days left') && parseInt(timeLeft) <= 3) return 'high';
      if (timeLeft.includes('week')) return 'medium';
      return 'low';
    };

    // Fetch handovers from Supabase
    const fetchHandovers = async () => {
      try {
        const { data, error } = await supabase
          .from('handover_summary')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching handovers:', error);
          setLoading(false);
          return;
        }

        const processedHandovers: SimpleHandover[] = (data || []).map(handover => ({
          id: handover.id,
          employeeName: handover.employee_name || 'Unknown Employee',
          role: handover.job_title || 'Unknown Role',
          department: handover.department || 'Unknown Department',
          progress: handover.progress_percentage || 0,
          status: handover.status,
          statusLabel: getStatusLabel(handover.status),
          dueDate: handover.departure_date || '',
          timeLeft: getTimeLeft(handover.departure_date),
          priority: calculatePriority(handover.departure_date, handover.status),
          driveFolder: handover.drive_folder_url,
          jobCode: handover.job_code
        }));

        setHandovers(processedHandovers);

        // Find urgent actions
        const reviewNeeded = processedHandovers.filter(h => h.status === 'completed');
        const overdue = processedHandovers.filter(h => h.timeLeft === 'Overdue');
        const dueToday = processedHandovers.filter(h => h.timeLeft === 'Due today');
        const needsRevision = processedHandovers.filter(h => h.status === 'needs_revision');

        if (needsRevision.length > 0) {
          setUrgentAction({
            handoverId: needsRevision[0].id,
            title: 'Revision Required',
            description: `${needsRevision[0].employeeName}'s handover needs revision`
          });
        } else if (overdue.length > 0) {
          setUrgentAction({
            handoverId: overdue[0].id,
            title: 'Overdue Handover',
            description: `${overdue[0].employeeName}'s handover is overdue and needs immediate attention`
          });
        } else if (dueToday.length > 0) {
          setUrgentAction({
            handoverId: dueToday[0].id,
            title: 'Due Today',
            description: `${dueToday[0].employeeName}'s handover is due today`
          });
        } else if (reviewNeeded.length > 0) {
          setUrgentAction({
            handoverId: reviewNeeded[0].id,
            title: 'Review Required',
            description: `${reviewNeeded[0].employeeName}'s handover is ready for your review`
          });
        } else {
          setUrgentAction(null);
        }

      } catch (error) {
        console.error('Error in fetchHandovers:', error);
      } finally {
        setLoading(false);
      }
    };

    // Call the fetch function
    fetchHandovers();
  }, []);

  return {
    handovers,
    loading,
    urgentAction
  };
}