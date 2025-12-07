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
  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-2">Access Denied</h1>
          <p className="text-text-secondary">You need admin privileges to access this page.</p>
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

