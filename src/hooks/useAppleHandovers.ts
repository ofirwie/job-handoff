import { useState, useEffect } from 'react';

interface SimpleHandover {
  id: string;
  employeeName: string;
  role: string;
  department: string;
  progress: number;
  status: 'pending' | 'in_progress' | 'review' | 'completed' | 'overdue';
  statusLabel: string;
  dueDate: string;
  timeLeft: string;
  priority: 'high' | 'medium' | 'low';
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

    // For now, return mock data in Apple-style format
    const mockHandovers: SimpleHandover[] = [
      {
        id: '1',
        employeeName: 'John Smith',
        role: 'Senior Developer',
        department: 'Engineering',
        progress: 75,
        status: 'in_progress',
        statusLabel: 'In Progress',
        dueDate: '2025-08-15',
        timeLeft: getTimeLeft('2025-08-15'),
        priority: 'high'
      },
      {
        id: '2',
        employeeName: 'Lisa Garcia',
        role: 'Marketing Manager',
        department: 'Marketing',
        progress: 45,
        status: 'in_progress',
        statusLabel: 'In Progress',
        dueDate: '2025-08-20',
        timeLeft: getTimeLeft('2025-08-20'),
        priority: 'medium'
      },
      {
        id: '3',
        employeeName: 'Mike Chen',
        role: 'Data Analyst',
        department: 'Analytics',
        progress: 90,
        status: 'review',
        statusLabel: 'Ready for Review',
        dueDate: '2025-08-10',
        timeLeft: 'Review needed',
        priority: 'low'
      },
      {
        id: '4',
        employeeName: 'Sarah Williams',
        role: 'HR Specialist',
        department: 'Human Resources',
        progress: 20,
        status: 'pending',
        statusLabel: 'Just Started',
        dueDate: '2025-09-01',
        timeLeft: getTimeLeft('2025-09-01'),
        priority: 'medium'
      }
    ];

    // Check for urgent actions - Apple style intelligence
    const reviewNeeded = mockHandovers.filter(h => h.status === 'review');
    const overdue = mockHandovers.filter(h => h.timeLeft === 'Overdue');
    const dueToday = mockHandovers.filter(h => h.timeLeft === 'Due today');

    if (overdue.length > 0) {
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
    }

    // Simulate loading with smooth transition
    setTimeout(() => {
      setHandovers(mockHandovers);
      setLoading(false);
    }, 300);
  }, []);

  return {
    handovers,
    loading,
    urgentAction
  };
}