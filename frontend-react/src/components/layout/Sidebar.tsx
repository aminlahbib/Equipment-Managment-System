import React from 'react';

interface SidebarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentSection, onSectionChange }) => {
  const sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'equipment', label: 'Equipment' },
    { id: 'users', label: 'Users' },
    { id: 'loans', label: 'Loans' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'reservations', label: 'Reservations' },
  ];

  return (
    <aside className="w-64 bg-surface border-r border-border min-h-screen p-6">
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-1">Admin</h2>
        <p className="text-sm text-text-secondary">Management Console</p>
      </div>

      <nav>
        <ul className="space-y-2">
          {sections.map((section) => (
            <li key={section.id}>
              <button
                onClick={() => onSectionChange(section.id)}
                className={`
                  w-full text-left px-4 py-2 rounded-lg transition-colors
                  ${
                    currentSection === section.id
                      ? 'bg-surfaceHighlight text-text-primary font-medium'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surfaceHighlight/50'
                  }
                `}
              >
                {section.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-8 pt-6 border-t border-border">
        <button
          onClick={() => (window.location.hash = 'dashboard')}
          className="w-full px-4 py-2 bg-surfaceHighlight text-text-primary rounded-lg hover:bg-surfaceHighlight/80 transition-colors text-sm"
        >
          Back to App
        </button>
      </div>
    </aside>
  );
};

