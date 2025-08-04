import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface StatItem {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  change?: number;
  iconBg?: string;
  iconColor?: string;
}

interface StatsGridProps {
  stats: StatItem[];
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  return (
    <div className="stats-grid">
      {stats.map((stat, index) => (
        <div key={index} className="stat-card">
          <div
            className="stat-icon"
            style={{ background: stat.iconBg || '#F0F3FF', color: stat.iconColor || '#5C6AC4' }}
          >
            {stat.icon}
          </div>
          
          <div className="stat-value">{stat.value}</div>
          <div className="stat-label">{stat.label}</div>
          
          {stat.change !== undefined && (
            <div className={`stat-change ${stat.change > 0 ? 'positive' : 'negative'}`}>
              {stat.change > 0 ? (
                <TrendingUp size={12} style={{ marginLeft: '4px' }} />
              ) : (
                <TrendingDown size={12} style={{ marginLeft: '4px' }} />
              )}
              {Math.abs(stat.change)}% השבוע
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;