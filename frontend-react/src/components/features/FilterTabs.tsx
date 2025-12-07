import React from 'react';

interface FilterTabsProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const FilterTabs: React.FC<FilterTabsProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex gap-1 bg-surface border border-border p-1 rounded-lg w-full sm:w-auto">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
            activeTab === tab
              ? 'bg-surfaceHighlight text-text-primary shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

