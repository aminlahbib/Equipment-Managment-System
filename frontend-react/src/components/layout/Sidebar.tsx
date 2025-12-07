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

  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-surface border border-border rounded-lg shadow-lg"
        aria-label="Toggle admin menu"
      >
        <svg
          className="w-6 h-6 text-text-primary"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isMobileOpen ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static top-20 left-0 z-40 w-64 bg-surface border-r border-border min-h-[calc(100vh-5rem)] p-6
          transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-1">Admin</h2>
          <p className="text-sm text-text-secondary">Management Console</p>
        </div>

        <nav>
          <ul className="space-y-2">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  onClick={() => {
                    onSectionChange(section.id);
                    setIsMobileOpen(false);
                  }}
                  className={`
                    w-full text-left px-4 py-2 rounded-lg transition-colors
                    ${
                      currentSection === section.id
                        ? 'bg-surfaceHighlight text-text-primary font-medium'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surfaceHighlight/50'
                    }
                  `}
                  aria-current={currentSection === section.id ? 'page' : undefined}
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

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30 top-20"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

