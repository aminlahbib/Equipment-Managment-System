import React, { useState, useEffect } from 'react';
import { Layers, Users, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { StatsCard } from '../../../components/features/StatsCard';
import { apiClient } from '../../../services/api';
import { useNotification } from '../../../context/NotificationContext';

export const Overview: React.FC = () => {
  const { showToast } = useNotification();
  const [stats, setStats] = useState({
    totalEquipment: 0,
    activeLoans: 0,
    totalUsers: 0,
    overdueLoans: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const [equipment, loans, users, overdue] = await Promise.all([
        apiClient.getAllEquipment(),
        apiClient.getCurrentLoans(),
        apiClient.getAllUsers(),
        apiClient.getOverdueLoans(),
      ]);
      setStats({
        totalEquipment: equipment.length,
        activeLoans: loans.length,
        totalUsers: users.length,
        overdueLoans: overdue.length,
      });
    } catch (error: any) {
      showToast(error.message || 'Failed to load statistics', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary">Dashboard Overview</h1>
        <p className="text-text-secondary mt-1">System statistics and quick actions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          label="Total Equipment"
          value={stats.totalEquipment}
          icon={Layers}
          color="text-primary"
          isLoading={isLoading}
        />
        <StatsCard
          label="Active Loans"
          value={stats.activeLoans}
          icon={ArrowUpRight}
          isLoading={isLoading}
        />
        <StatsCard
          label="Total Users"
          value={stats.totalUsers}
          icon={Users}
          isLoading={isLoading}
        />
        <StatsCard
          label="Overdue Loans"
          value={stats.overdueLoans}
          icon={AlertTriangle}
          color="text-danger"
          active={stats.overdueLoans > 0}
          isLoading={isLoading}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => (window.location.hash = 'admin?section=equipment')}
            className="p-4 bg-surfaceHighlight rounded-lg hover:bg-surfaceHighlight/80 transition-colors text-left"
          >
            <h3 className="font-medium text-text-primary mb-1">Add Equipment</h3>
            <p className="text-sm text-text-secondary">Add new equipment to inventory</p>
          </button>
          <button
            onClick={() => (window.location.hash = 'admin?section=maintenance')}
            className="p-4 bg-surfaceHighlight rounded-lg hover:bg-surfaceHighlight/80 transition-colors text-left"
          >
            <h3 className="font-medium text-text-primary mb-1">Schedule Maintenance</h3>
            <p className="text-sm text-text-secondary">Schedule equipment maintenance</p>
          </button>
          <button
            onClick={() => (window.location.hash = 'admin?section=loans')}
            className="p-4 bg-surfaceHighlight rounded-lg hover:bg-surfaceHighlight/80 transition-colors text-left"
          >
            <h3 className="font-medium text-text-primary mb-1">View Overdue Loans</h3>
            <p className="text-sm text-text-secondary">Check overdue equipment loans</p>
          </button>
        </div>
      </div>
    </div>
  );
};

