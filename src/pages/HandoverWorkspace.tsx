import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Circle, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// Apple-style full-screen handover workspace
const HandoverWorkspace = () => {
  const { handoverId } = useParams();
  const navigate = useNavigate();
  const [handover, setHandover] = useState<any>(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now
    const mockHandover = {
      id: handoverId,
      employeeName: "John Smith",
      role: "Senior Developer",
      progress: 75,
      tasks: [
        {
          id: "1",
          title: "Transfer GitHub Repository Access",
          description: "Ensure all team members have appropriate access to the repositories",
          category: "Access & Permissions",
          estimatedTime: 15,
          priority: "high",
          completed: true,
          type: "checklist"
        },
        {
          id: "2",
          title: "Document Current Projects",
          description: "Create comprehensive documentation for all ongoing projects",
          category: "Documentation",
          estimatedTime: 45,
          priority: "high",
          completed: true,
          type: "documentation"
        },
        {
          id: "3",
          title: "Knowledge Transfer Session",
          description: "Schedule and conduct knowledge transfer meetings with the team",
          category: "Knowledge Transfer",
          estimatedTime: 120,
          priority: "high",
          completed: true,
          type: "meeting"
        },
        {
          id: "4",
          title: "Update Team Contact List",
          description: "Ensure all contact information is up to date",
          category: "Contacts",
          estimatedTime: 20,
          priority: "medium",
          completed: false,
          type: "contact_info"
        },
        {
          id: "5",
          title: "Transfer Cloud Services",
          description: "Transfer ownership of AWS and other cloud service accounts",
          category: "Access & Permissions",
          estimatedTime: 30,
          priority: "high",
          completed: false,
          type: "checklist"
        }
      ]
    };

    setTimeout(() => {
      setHandover(mockHandover);
      setLoading(false);
    }, 300);
  }, [handoverId]);

  const handleTaskClick = (index: number) => {
    setCurrentTaskIndex(index);
    navigate(`/handover/${handoverId}/task/${index}`);
  };

  const markTaskComplete = (taskId: string) => {
    setHandover((prev: any) => ({
      ...prev,
      tasks: prev.tasks.map((task: any) =>
        task.id === taskId ? { ...task, completed: true } : task
      )
    }));
  };

  const goBack = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!handover) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Handover not found</p>
          <Button onClick={goBack} variant="outline">Go Back</Button>
        </div>
      </div>
    );
  }

  const completedTasks = handover.tasks.filter((t: any) => t.completed).length;
  const progressPercentage = (completedTasks / handover.tasks.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimal navigation bar */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            onClick={goBack}
            variant="ghost"
            size="sm"
            className="text-gray-600"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          
          <div className="text-center">
            <p className="text-sm font-medium">{handover.employeeName}</p>
            <p className="text-xs text-gray-500">{handover.role}</p>
          </div>

          <div className="text-right">
            <p className="text-sm font-medium">{completedTasks} of {handover.tasks.length}</p>
            <p className="text-xs text-gray-500">completed</p>
          </div>
        </div>
      </div>

      {/* Progress overview */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold">Handover Progress</h1>
            <span className="text-2xl font-bold text-blue-600">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </div>
      </div>

      {/* Task list - Apple style */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-2">
          {handover.tasks.map((task: any, index: number) => (
            <TaskItem
              key={task.id}
              task={task}
              onClick={() => handleTaskClick(index)}
              onComplete={() => markTaskComplete(task.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Apple-style task item component
const TaskItem = ({ task, onClick, onComplete }: any) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-50 border-red-200';
      case 'medium': return 'bg-yellow-50 border-yellow-200';
      case 'low': return 'bg-green-50 border-green-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.completed) {
      onComplete();
    }
  };

  return (
    <div
      className={cn(
        "bg-white rounded-2xl p-4 cursor-pointer transition-all",
        "hover:shadow-sm border",
        task.completed ? "opacity-60 bg-gray-50" : getPriorityColor(task.priority),
        "group"
      )}
      onClick={onClick}
    >
      <div className="flex items-start space-x-4">
        {/* Checkbox */}
        <button
          onClick={handleCheckboxClick}
          className="mt-0.5 focus:outline-none"
        >
          {task.completed ? (
            <CheckCircle className="h-6 w-6 text-green-500" />
          ) : (
            <Circle className="h-6 w-6 text-gray-300 group-hover:text-gray-400" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1">
          <h3 className={cn(
            "font-medium text-gray-900",
            task.completed && "line-through text-gray-500"
          )}>
            {task.title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
          
          {/* Meta information */}
          <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {task.estimatedTime} min
            </span>
            <span>{task.category}</span>
            {task.priority === 'high' && !task.completed && (
              <span className="flex items-center text-red-600">
                <AlertTriangle className="h-3 w-3 mr-1" />
                High Priority
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HandoverWorkspace;