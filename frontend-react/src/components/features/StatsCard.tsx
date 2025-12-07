import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color?: string;
  active?: boolean;
  isLoading?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  icon: Icon,
  color = 'text-text-secondary',
  active = false,
  isLoading = false,
}) => {
  return (
    <div className="bg-surface border border-border rounded-xl p-6 flex items-start justify-between hover:border-text-secondary/20 transition-colors">
      <div>
        <p className="text-sm font-medium text-text-secondary">{label}</p>
        {isLoading ? (
          <div className="h-8 w-16 mt-2 bg-surfaceHighlight animate-pulse rounded-lg" />
        ) : (
          <p className={`text-3xl font-semibold mt-2 ${active ? 'text-danger' : 'text-text-primary'}`}>
            {value}
          </p>
        )}
      </div>
      <div className={`p-2 rounded-lg bg-surfaceHighlight ${active ? 'text-danger' : color}`}>
        <Icon size={20} />
      </div>
    </div>
  );
};

