import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { X, CheckCircle, Upload, FileText, Users, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Apple Pages-style task workspace
const TaskFocusView = () => {
  const { handoverId, taskIndex } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [documentContent, setDocumentContent] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  useEffect(() => {
    // Mock task data
    const mockTasks = [
      {
        id: "1",
        title: "Transfer GitHub Repository Access",
        description: "Ensure all team members have appropriate access to the repositories",
        category: "Access & Permissions",
        type: "checklist",
        checklist: [
          { id: "1", label: "Add new team lead as admin", done: false },
          { id: "2", label: "Review and update team permissions", done: false },
          { id: "3", label: "Document repository structure", done: false },
          { id: "4", label: "Share access credentials securely", done: false }
        ]
      },
      {
        id: "2",
        title: "Document Current Projects",
        description: "Create comprehensive documentation for all ongoing projects",
        category: "Documentation",
        type: "documentation",
        template: `## Project Overview
[Provide a brief overview of the project]

## Current Status
[Describe the current state and progress]

## Key Contacts
[List important team members and stakeholders]

## Next Steps
[Outline immediate priorities and upcoming milestones]

## Important Notes
[Any critical information the successor needs to know]`
      },
      {
        id: "3",
        title: "Knowledge Transfer Session",
        description: "Schedule and conduct knowledge transfer meetings with the team",
        category: "Knowledge Transfer",
        type: "meeting",
        meetingDetails: {
          participants: ["New Team Lead", "Current Team Lead", "Core Team Members"],
          suggestedDuration: "2 hours",
          agenda: [
            "Project overview and history",
            "Current challenges and solutions",
            "Team dynamics and working style",
            "Q&A session"
          ]
        }
      },
      {
        id: "4",
        title: "Update Team Contact List",
        description: "Ensure all contact information is up to date",
        category: "Contacts",
        type: "contact_info",
        contacts: []
      },
      {
        id: "5",
        title: "Transfer Cloud Services",
        description: "Transfer ownership of AWS and other cloud service accounts",
        category: "Access & Permissions",
        type: "file_upload"
      }
    ];

    const taskIdx = parseInt(taskIndex || "0");
    setTimeout(() => {
      setTask(mockTasks[taskIdx]);
      if (mockTasks[taskIdx].type === "documentation") {
        setDocumentContent(mockTasks[taskIdx].template || "");
      }
      setLoading(false);
    }, 300);
  }, [taskIndex]);

  const handleClose = () => {
    navigate(`/handover/${handoverId}`);
  };

  const handleComplete = () => {
    // Mark task as complete and go to next task or back to list
    const nextIndex = parseInt(taskIndex || "0") + 1;
    if (nextIndex < 5) { // Assuming 5 tasks total
      navigate(`/handover/${handoverId}/task/${nextIndex}`);
    } else {
      navigate(`/handover/${handoverId}`);
    }
  };

  const SmartSuggestion = () => {
    if (!showSuggestion) return null;

    const suggestions: Record<string, string> = {
      checklist: "Pro tip: Use a password manager to securely share credentials with the new team lead.",
      documentation: "This template covers the essential points. Consider adding specific technical details relevant to your projects.",
      meeting: "Schedule this meeting at least 2 weeks before your last day to allow time for follow-up questions.",
      contact_info: "Include both work and emergency contact information for key team members.",
      file_upload: "Create a secure shared folder with all relevant access documentation and credentials."
    };

    return (
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex items-start space-x-2">
          <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm text-blue-900">{suggestions[task?.type] || "No suggestions available"}</p>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal navigation */}
      <div className="border-b sticky top-0 z-10 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-500">Task {parseInt(taskIndex || "0") + 1} of 5</p>
          </div>

          <Button
            onClick={handleComplete}
            className="bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            Done
          </Button>
        </div>
      </div>

      {/* Focus area - clean workspace */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">{task?.title}</h1>
          <p className="text-gray-600">{task?.description}</p>
        </div>

        {/* Task-specific work area */}
        <div className="space-y-6">
          {task?.type === "checklist" && (
            <ChecklistWorkArea items={task.checklist} />
          )}

          {task?.type === "documentation" && (
            <DocumentationWorkArea 
              content={documentContent}
              onChange={setDocumentContent}
            />
          )}

          {task?.type === "meeting" && (
            <MeetingWorkArea details={task.meetingDetails} />
          )}

          {task?.type === "contact_info" && (
            <ContactsWorkArea />
          )}

          {task?.type === "file_upload" && (
            <FileUploadWorkArea 
              files={uploadedFiles}
              onUpload={(file) => setUploadedFiles([...uploadedFiles, file])}
            />
          )}

          {/* Smart suggestion */}
          <div>
            <button
              onClick={() => setShowSuggestion(!showSuggestion)}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <Lightbulb className="h-4 w-4" />
              <span>{showSuggestion ? "Hide" : "Show"} suggestion</span>
            </button>
            <SmartSuggestion />
          </div>
        </div>
      </div>
    </div>
  );
};

// Component for checklist tasks
const ChecklistWorkArea = ({ items }: { items: any[] }) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <label
          key={item.id}
          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
        >
          <input
            type="checkbox"
            checked={checkedItems[item.id] || false}
            onChange={() => toggleItem(item.id)}
            className="h-5 w-5 text-blue-600 rounded"
          />
          <span className={cn(
            "text-gray-900",
            checkedItems[item.id] && "line-through text-gray-500"
          )}>
            {item.label}
          </span>
        </label>
      ))}
    </div>
  );
};

// Component for documentation tasks
const DocumentationWorkArea = ({ content, onChange }: any) => {
  return (
    <div>
      <Textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[400px] font-mono text-sm"
        placeholder="Start documenting..."
      />
      <p className="text-xs text-gray-500 mt-2">
        Markdown formatting supported
      </p>
    </div>
  );
};

// Component for meeting tasks
const MeetingWorkArea = ({ details }: any) => {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="font-medium mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Participants
        </h3>
        <ul className="space-y-2">
          {details.participants.map((p: string, i: number) => (
            <li key={i} className="text-gray-600">• {p}</li>
          ))}
        </ul>
      </Card>

      <Card className="p-6">
        <h3 className="font-medium mb-4">Suggested Agenda</h3>
        <ol className="space-y-2">
          {details.agenda.map((item: string, i: number) => (
            <li key={i} className="text-gray-600">{i + 1}. {item}</li>
          ))}
        </ol>
      </Card>

      <Card className="p-6 bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-900">
          <strong>Duration:</strong> {details.suggestedDuration}
        </p>
      </Card>
    </div>
  );
};

// Component for contact info tasks
const ContactsWorkArea = () => {
  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="font-medium mb-4">Team Contacts Template</h3>
        <Textarea
          placeholder="Name | Role | Email | Phone | Notes"
          className="min-h-[200px] font-mono text-sm"
        />
      </Card>
      <p className="text-sm text-gray-600">
        Include all key team members and stakeholders
      </p>
    </div>
  );
};

// Component for file upload tasks
const FileUploadWorkArea = ({ files, onUpload }: any) => {
  return (
    <div className="space-y-4">
      <Card className="p-8 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
        <div className="text-center">
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Drop files here or click to upload</p>
          <Button variant="outline" size="sm">
            Choose Files
          </Button>
        </div>
      </Card>

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Uploaded Files</h4>
          {files.map((file: string, i: number) => (
            <div key={i} className="flex items-center space-x-2 text-sm text-gray-600">
              <FileText className="h-4 w-4" />
              <span>{file}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskFocusView;