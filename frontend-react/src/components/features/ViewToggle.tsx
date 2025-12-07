import React from 'react';
import { LayoutGrid, List } from 'lucide-react';

interface ViewToggleProps {
  viewMode: 'grid' | 'list';
  onViewChange: (mode: 'grid' | 'list') => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, onViewChange }) => {
  return (
    <div className="flex items-center p-1 bg-surface border border-border rounded-lg shrink-0">
      <button
        onClick={() => onViewChange('grid')}
        className={`p-1.5 rounded-md transition-all ${
          viewMode === 'grid'
            ? 'bg-surfaceHighlight text-text-primary shadow-sm'
            : 'text-text-tertiary hover:text-text-primary'
        }`}
      >
        <LayoutGrid size={14} />
      </button>
      <button
        onClick={() => onViewChange('list')}
        className={`p-1.5 rounded-md transition-all ${
          viewMode === 'list'
            ? 'bg-surfaceHighlight text-text-primary shadow-sm'
            : 'text-text-tertiary hover:text-text-primary'
        }`}
      >
        <List size={14} />
      </button>
    </div>
  );
};

