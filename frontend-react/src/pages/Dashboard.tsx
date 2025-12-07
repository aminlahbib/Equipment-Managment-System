import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, Layers, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { StatsCard } from '../components/features/StatsCard';
import { EquipmentCard } from '../components/features/EquipmentCard';
import { CategoryFilter } from '../components/features/CategoryFilter';
import { SearchBar } from '../components/features/SearchBar';
import { ViewToggle } from '../components/features/ViewToggle';
import { EquipmentDetailsModal } from '../components/features/EquipmentDetailsModal';
import { ActivitySidebar } from '../components/features/ActivitySidebar';
import { ReservationsSection } from '../components/features/ReservationsSection';
import { apiClient } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Equipment, EquipmentStatus, Loan } from '../types';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  // Data State
  const [equipmentData, setEquipmentData] = useState<Equipment[]>([]);
  const [loanData, setLoanData] = useState<Loan[]>([]);
  const [isGlobalLoading, setIsGlobalLoading] = useState(true);
  const [isEquipmentRefreshing, setIsEquipmentRefreshing] = useState(false);

  // UI States
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [returningIds, setReturningIds] = useState<Set<number>>(new Set());

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsGlobalLoading(true);
      const [equipment, loans] = await Promise.all([
        apiClient.getAvailableEquipment(),
        apiClient.getMyBorrowedEquipment(),
      ]);
      setEquipmentData(equipment);
      setLoanData(loans);
    } catch (error: any) {
      showToast(error.message || 'Failed to load data', 'error');
    } finally {
      setIsGlobalLoading(false);
    }
  };

  const refreshEquipment = async () => {
    setIsEquipmentRefreshing(true);
    try {
      const equipment = await apiClient.getAvailableEquipment();
      setEquipmentData(equipment);
      setSearchQuery('');
      setActiveCategory('All');
      showToast('Equipment refreshed', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to refresh', 'error');
    } finally {
      setIsEquipmentRefreshing(false);
    }
  };

  // Get unique categories
  const categories = [
    'All',
    ...Array.from(new Set(equipmentData.map((item) => item.category).filter(Boolean))),
  ];

  // Filter equipment
  const filteredEquipment = equipmentData.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch =
      item.bezeichnung.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.specs?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.inventarnummer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Stats
  const availableCount = equipmentData.filter((e) => e.status === EquipmentStatus.AVAILABLE).length;
  const borrowedCount = equipmentData.filter((e) => e.status === EquipmentStatus.BORROWED).length;
  const overdueCount = loanData.filter((l) => l.status === 'Overdue').length;

  // Handle borrow
  const handleBorrow = async () => {
    if (!selectedEquipment) return;
    try {
      await apiClient.borrowEquipment(selectedEquipment.id);
      showToast(`${selectedEquipment.bezeichnung} borrowed successfully`, 'success');
      setSelectedEquipment(null);
      await loadData();
    } catch (error: any) {
      showToast(error.message || 'Failed to borrow equipment', 'error');
    }
  };

  // Handle return
  const handleReturn = async (loan: Loan) => {
    if (window.confirm(`Return ${loan.equipmentName}?`)) {
      try {
        await apiClient.returnEquipment(loan.equipmentId);
        showToast(`${loan.equipmentName} returned successfully`, 'success');
        await loadData();
      } catch (error: any) {
        showToast(error.message || 'Failed to return equipment', 'error');
      }
    }
  };

  const handleQuickReturn = async (loan: Loan) => {
    setReturningIds((prev) => new Set(prev).add(loan.id));
    try {
      await apiClient.returnEquipment(loan.equipmentId);
      showToast(`${loan.equipmentName} returned`, 'success');
      await loadData();
    } catch (error: any) {
      showToast(error.message || 'Failed to return equipment', 'error');
    } finally {
      setReturningIds((prev) => {
        const next = new Set(prev);
        next.delete(loan.id);
        return next;
      });
    }
  };

  const handleReturnAll = async () => {
    const activeLoans = loanData.filter((l) => l.status === 'Active' || l.status === 'Overdue');
    if (activeLoans.length === 0) return;
    if (window.confirm(`Return all ${activeLoans.length} active loans?`)) {
      try {
        await Promise.all(activeLoans.map((loan) => apiClient.returnEquipment(loan.equipmentId)));
        showToast('All items returned successfully', 'success');
        await loadData();
      } catch (error: any) {
        showToast(error.message || 'Failed to return all items', 'error');
      }
    }
  };

  return (
    <div className="pt-28 pb-16 px-6 max-w-7xl mx-auto space-y-12">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-text-primary">Dashboard</h1>
          <p className="text-text-secondary mt-1">
            Overview for {user?.vorname} {user?.nachname}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={refreshEquipment}
            className="h-10 w-10 p-0 rounded-full"
          >
            <RefreshCw
              size={16}
              className={`text-text-secondary ${isEquipmentRefreshing ? 'animate-spin' : ''}`}
            />
          </Button>
          <Button size="md" className="h-10 gap-2">
            <Plus size={16} /> New Request
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          label="Available Items"
          value={availableCount}
          icon={Layers}
          color="text-primary"
          isLoading={isGlobalLoading}
        />
        <StatsCard
          label="Active Loans"
          value={borrowedCount}
          icon={ArrowUpRight}
          isLoading={isGlobalLoading}
        />
        <StatsCard
          label="Overdue"
          value={overdueCount}
          icon={AlertTriangle}
          color="text-danger"
          active={overdueCount > 0}
          isLoading={isGlobalLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Feed */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CategoryFilter
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
              <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
            </div>
          </div>

          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 gap-6'
                : 'flex flex-col gap-3'
            }
          >
            {isGlobalLoading ? (
              [1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`bg-surfaceHighlight animate-pulse rounded-xl ${
                    viewMode === 'grid' ? 'aspect-[4/3]' : 'h-20'
                  }`}
                />
              ))
            ) : filteredEquipment.length === 0 ? (
              <div className="col-span-full py-16 text-center border border-dashed border-border rounded-xl">
                <p className="text-text-secondary text-sm">
                  No equipment found matching your criteria.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('All');
                  }}
                  className="text-primary mt-2 text-sm hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              filteredEquipment.map((item) => (
                <EquipmentCard
                  key={item.id}
                  equipment={item}
                  viewMode={viewMode}
                  onClick={() => setSelectedEquipment(item)}
                />
              ))
            )}
          </div>
        </div>

        {/* Sidebar - Loans */}
        <div className="lg:col-span-4 space-y-8">
          <ActivitySidebar
            loans={loanData}
            isLoading={isGlobalLoading}
            onReturn={handleReturn}
            onQuickReturn={handleQuickReturn}
            onReturnAll={handleReturnAll}
            returningIds={returningIds}
          />
        </div>
      </div>

      {/* Reservations Section */}
      <ReservationsSection />

      {/* Equipment Details Modal */}
      <EquipmentDetailsModal
        equipment={selectedEquipment}
        isOpen={!!selectedEquipment}
        onClose={() => setSelectedEquipment(null)}
        onBorrow={handleBorrow}
      />
    </div>
  );
};

