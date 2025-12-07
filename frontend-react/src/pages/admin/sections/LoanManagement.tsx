import React, { useState, useEffect } from 'react';
import { FilterTabs } from '../../../components/features/FilterTabs';
import { SearchBar } from '../../../components/features/SearchBar';
import { LoanCard } from '../../../components/features/LoanCard';
import { apiClient } from '../../../services/api';
import { useNotification } from '../../../context/NotificationContext';
import { Loan } from '../../../types';

export const LoanManagement: React.FC = () => {
  const { showToast } = useNotification();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Current' | 'History' | 'Overdue'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadLoans();
  }, [filter]);

  const loadLoans = async () => {
    try {
      setIsLoading(true);
      let data: Loan[] = [];
      switch (filter) {
        case 'Current':
          data = await apiClient.getCurrentLoans();
          break;
        case 'History':
          data = await apiClient.getLoanHistory();
          break;
        case 'Overdue':
          data = await apiClient.getOverdueLoans();
          break;
        default:
          const [current, history] = await Promise.all([
            apiClient.getCurrentLoans(),
            apiClient.getLoanHistory(),
          ]);
          data = [...current, ...history];
      }
      setLoans(data);
    } catch (error: any) {
      showToast(error.message || 'Failed to load loans', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLoans = loans.filter((loan) => {
    const matchesSearch = loan.equipmentName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary">Loan Management</h1>
        <p className="text-text-secondary mt-1">View and manage all equipment loans</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <FilterTabs
          tabs={['All', 'Current', 'History', 'Overdue']}
          activeTab={filter}
          onTabChange={(tab) => setFilter(tab as any)}
        />
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search loans..."
          className="w-full sm:w-64"
        />
      </div>

      <div className="space-y-4">
        {isLoading ? (
          [1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-surfaceHighlight animate-pulse rounded-xl" />
          ))
        ) : filteredLoans.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-border rounded-xl">
            <p className="text-text-secondary text-sm">No loans found.</p>
          </div>
        ) : (
          filteredLoans.map((loan) => <LoanCard key={loan.id} loan={loan} />)
        )}
      </div>
    </div>
  );
};

