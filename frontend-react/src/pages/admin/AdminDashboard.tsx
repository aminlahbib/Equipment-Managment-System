import React, { useState } from 'react';
import { Sidebar } from '../../components/layout/Sidebar';
import { Overview } from './sections/Overview';
import { EquipmentManagement } from './sections/EquipmentManagement';
import { UserManagement } from './sections/UserManagement';
import { LoanManagement } from './sections/LoanManagement';
import { MaintenanceManagement } from './sections/MaintenanceManagement';
import { ReservationManagement } from './sections/ReservationManagement';
import { useAuth } from '../../context/AuthContext';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [currentSection, setCurrentSection] = useState('overview');

  // Check if user is admin
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Access Denied</h1>
          <p className="text-text-secondary mb-6">You need admin privileges to access this page.</p>
          <button
            onClick={() => (window.location.hash = 'dashboard')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const renderSection = () => {
    switch (currentSection) {
      case 'overview':
        return <Overview />;
      case 'equipment':
        return <EquipmentManagement />;
      case 'users':
        return <UserManagement />;
      case 'loans':
        return <LoanManagement />;
      case 'maintenance':
        return <MaintenanceManagement />;
      case 'reservations':
        return <ReservationManagement />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex pt-20">
      <Sidebar currentSection={currentSection} onSectionChange={setCurrentSection} />
      <main className="flex-1 lg:ml-64 p-4 md:p-8 transition-all">
        {renderSection()}
      </main>
    </div>
  );
};

