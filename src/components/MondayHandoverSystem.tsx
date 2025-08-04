import React, { useState } from 'react';
import { Search, Filter, ChevronDown, ChevronRight, MessageSquare, Bell } from 'lucide-react';

interface SubTask {
  id: number;
  title: string;
  isDone: boolean;
}

interface HandoverTask {
  id: number;
  title: string;
  group: string;
  groupColor: 'yellow' | 'blue';
  person: string;
  personColor: string;
  date: string;
  dateStyle: 'normal' | 'dark';
  status: string;
  statusType: 'working' | 'stuck' | 'lead' | 'done';
  hasAlert: boolean;
  hasComment: boolean;
  subTasks?: SubTask[];
}

interface ProgressCount {
  done: number;
  total: number;
}

interface TaskSection {
  section: string;
  sectionKey: string;
  progress: ProgressCount;
  items: HandoverTask[];
}

const MondayHandoverSystem: React.FC = () => {
  // ================= State =================
  const [hideCompleted, setHideCompleted] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    overdue: true,
    today: true,
    thisWeek: true,
    nextWeek: true,
  });
  const [expandedTasks, setExpandedTasks] = useState<Record<number, boolean>>({});

  // ================= Data (Hebrew handover tasks with sub-tasks) =================
  const handoverTasks: TaskSection[] = [
    {
      section: 'Overdue',
      sectionKey: 'overdue',
      progress: { done: 0, total: 1 },
      items: [
        {
          id: 1,
          title: 'העלאת רשימת אנשי קשר',
          group: 'On-going',
          groupColor: 'yellow',
          person: 'TH',
          personColor: 'bg-gray-600',
          date: '5 Sep',
          dateStyle: 'normal',
          status: 'Working on it',
          statusType: 'working',
          hasAlert: true,
          hasComment: false,
          subTasks: [
            { id: 11, title: 'איסוף רשימות מהמחלקות', isDone: true },
            { id: 12, title: 'אימות פרטי קשר', isDone: false },
            { id: 13, title: 'העלאה למערכת', isDone: false },
          ],
        },
      ],
    },
    {
      section: 'Today',
      sectionKey: 'today',
      progress: { done: 1, total: 2 },
      items: [
        {
          id: 2,
          title: 'תיעוד נוהלי עבודה',
          group: 'On-going',
          groupColor: 'yellow',
          person: 'TH',
          personColor: 'bg-gray-600',
          date: '9 Sep',
          dateStyle: 'normal',
          status: 'Stuck',
          statusType: 'stuck',
          hasAlert: false,
          hasComment: true,
          subTasks: [
            { id: 21, title: 'כתיבת נוהל גיבויים', isDone: true },
            { id: 22, title: 'נוהל אבטחת מידע', isDone: false },
          ],
        },
        {
          id: 5,
          title: 'סיום פרויקט ERP',
          group: 'Done',
          groupColor: 'blue',
          person: 'TH',
          personColor: 'bg-gray-600',
          date: '9 Sep',
          dateStyle: 'normal',
          status: 'Done',
          statusType: 'done',
          hasAlert: false,
          hasComment: false,
        },
      ],
    },
    {
      section: 'This week',
      sectionKey: 'thisWeek',
      progress: { done: 0, total: 1 },
      items: [
        {
          id: 3,
          title: 'מסירת גישות למערכות',
          group: 'Active Deals',
          groupColor: 'blue',
          person: 'TH',
          personColor: 'bg-gray-600',
          date: '10 Sep',
          dateStyle: 'normal',
          status: 'Lead',
          statusType: 'lead',
          hasAlert: false,
          hasComment: false,
          subTasks: [
            { id: 31, title: 'רשימת מערכות וסיסמאות', isDone: false },
            { id: 32, title: 'מסירה למחליף', isDone: false },
            { id: 33, title: 'בדיקת גישות', isDone: false },
          ],
        },
      ],
    },
    {
      section: 'Next week',
      sectionKey: 'nextWeek',
      progress: { done: 0, total: 1 },
      items: [
        {
          id: 4,
          title: 'פגישת מסירה עם מחליף',
          group: 'Planning',
          groupColor: 'blue',
          person: 'TH',
          personColor: 'bg-gray-600',
          date: '13 – 14 Sep',
          dateStyle: 'dark',
          status: 'Working on it',
          statusType: 'working',
          hasAlert: false,
          hasComment: false,
          subTasks: [
            { id: 41, title: 'קביעת מועד פגישה', isDone: false },
            { id: 42, title: 'הכנת חומרי הדרכה', isDone: false },
          ],
        },
      ],
    },
  ];

  // ================= Helpers =================
  const toggleSection = (key: string) =>
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleTask = (taskId: number) =>
    setExpandedTasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }));

  // ===== Components =====
  const TaskRow: React.FC<{ item: HandoverTask }> = ({ item }) => {
    const isExpanded = expandedTasks[item.id] || false;
    const hasSubTasks = item.subTasks && item.subTasks.length > 0;

    return (
      <>
        <div 
          className={`task-row ${hasSubTasks ? 'clickable' : ''} ${isExpanded ? 'open' : ''}`}
          onClick={hasSubTasks ? () => toggleTask(item.id) : undefined}
        >
          {/* Title with optional chevron */}
          <div className="task-title">
            {hasSubTasks && <ChevronRight className="chevron-row" />}
            {item.hasComment && <MessageSquare className="task-icon notification" />} 
            <span>{item.title}</span>
          </div>

          {/* Group */}
          <div className="group-container">
            <div className={`group-dot ${item.groupColor}`}></div>
            <span className="group-name">{item.group}</span>
          </div>

          {/* Person */}
          <div className="person-container">
            <div className={`person-avatar ${item.personColor}`}>{item.person}</div>
            {item.hasAlert && <div className="alert-badge">!</div>}
          </div>

          {/* Date */}
          <div className="date-container">
            <span className={`date-badge ${item.dateStyle === 'dark' ? 'dark' : ''}`}>{item.date}</span>
          </div>

          {/* Status */}
          <div className="status-container">
            <div className={`status-badge status-${item.statusType}`}>{item.status}</div>
          </div>
        </div>

        {/* Sub-tasks */}
        {isExpanded && hasSubTasks && item.subTasks!.map((subTask) => (
          <div key={subTask.id} className="task-row subtask">
            <div className="task-title">
              <span style={{ opacity: subTask.isDone ? 0.6 : 1, textDecoration: subTask.isDone ? 'line-through' : 'none' }}>
                {subTask.title}
              </span>
            </div>
            <div></div>
            <div></div>
            <div></div>
            <div className="status-container">
              <div className={`status-badge ${subTask.isDone ? 'status-done' : 'status-working'}`}>
                {subTask.isDone ? 'Done' : 'In Progress'}
              </div>
            </div>
          </div>
        ))}
      </>
    );
  };

  const TaskSection: React.FC<TaskSection> = ({ section, sectionKey, progress, items }) => {
    const isExpanded = expandedSections[sectionKey as keyof typeof expandedSections];
    return (
      <div className="task-section">
        <div className="section-header" onClick={() => toggleSection(sectionKey)}>
          <ChevronDown className={`chevron ${isExpanded ? 'expanded' : 'collapsed'}`} />
          <span>{section}</span>
          <span className="section-progress">{progress.done}/{progress.total}</span>
        </div>

        {isExpanded && (
          <>
            {/* Table Headers - Board column removed */}
            <div className="table-headers">
              <div className="table-header"></div>
              <div className="table-header">Group</div>
              <div className="table-header center">People</div>
              <div className="table-header center">Date</div>
              <div className="table-header center">Status</div>
            </div>

            {/* Items */}
            {items.map((item) => (
              <TaskRow key={item.id} item={item} />
            ))}
          </>
        )}
      </div>
    );
  };

  // ================= Render =================
  return (
    <div className="monday-layout" dir="rtl"> {/* RTL wrapper */}
      {/* Sidebar */}
      <div className="monday-sidebar">
        <div className="sidebar-logo">AI</div>

        <div className="sidebar-nav-item active" />
        <div className="sidebar-nav-item">
          <Bell size={20} color="#fff" />
        </div>
        <div className="sidebar-nav-item" />
        <div className="sidebar-nav-item" />
      </div>

      {/* Main */}
      <div className="monday-main">
        {/* Header */}
        <div className="monday-header">
          <h1 className="header-title">My Work</h1>

          <div className="header-controls">
            {/* Search */}
            <div className="search-container">
              <Search className="search-icon" />
              <input type="text" placeholder="Search" className="search-input" />
            </div>

            {/* Checkbox */}
            <div className="checkbox-container">
              <input
                type="checkbox"
                id="hideCompleted"
                checked={hideCompleted}
                onChange={(e) => setHideCompleted(e.target.checked)}
                className="checkbox"
              />
              <label htmlFor="hideCompleted" className="checkbox-label">
                Hide done items
              </label>
            </div>

            {/* Customize */}
            <button className="customize-btn">
              <Filter size={16} /> Customize
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="content-area">
          <div className="content-container">
            {handoverTasks.map((sec) => (
              <TaskSection
                key={sec.sectionKey}
                section={sec.section}
                sectionKey={sec.sectionKey}
                progress={sec.progress}
                items={sec.items}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MondayHandoverSystem;