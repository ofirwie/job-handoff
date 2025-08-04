import React from 'react';

// Status Badge Component
interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'working on it':
      case 'working':
      case 'in_progress':
        return 'status-working';
      case 'stuck':
        return 'status-stuck';
      case 'done':
      case 'completed':
        return 'status-done';
      case 'lead':
        return 'status-lead';
      case 'planning':
      case 'not_started':
        return 'status-planning';
      default:
        return 'status-working';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'working on it':
      case 'working':
      case 'in_progress':
        return 'בעבודה';
      case 'stuck':
        return 'תקוע';
      case 'done':
      case 'completed':
        return 'הושלם';
      case 'lead':
        return 'ליד';
      case 'planning':
      case 'not_started':
        return 'בתכנון';
      default:
        return status;
    }
  };

  return (
    <span className={`status-badge ${getStatusClass(status)}`}>
      {getStatusText(status)}
    </span>
  );
};

// Avatar Component
interface AvatarProps {
  name: string;
  color?: 'primary' | 'secondary' | 'accent';
}

export const Avatar: React.FC<AvatarProps> = ({ name, color = 'primary' }) => {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div className={`avatar avatar-${color}`}>
      {initials}
    </div>
  );
};

// Progress Bar Component
interface ProgressBarProps {
  percentage: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ percentage }) => {
  return (
    <div className="progress-bar-container">
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="progress-text">{percentage}%</span>
    </div>
  );
};

// Column Definition
export interface ColumnDef<T = any> {
  key: string;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

// Table Props
interface MondayTableProps<T = any> {
  data: T[];
  columns: ColumnDef<T>[];
  onRowClick?: (row: T) => void;
}

// Main Table Component
const MondayTable = <T extends Record<string, any>>({ 
  data, 
  columns,
  onRowClick 
}: MondayTableProps<T>) => {
  return (
    <div className="monday-table-container">
      <table className="monday-table">
        <thead className="table-header">
          <tr>
            {columns.map((column, index) => (
              <th key={index} style={{ width: column.width }}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr 
              key={rowIndex} 
              className="table-row"
              onClick={() => onRowClick && onRowClick(row)}
              style={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              {columns.map((column, colIndex) => (
                <td key={colIndex} className="table-cell">
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MondayTable;