import React, { useState, useEffect } from 'react';
import { FilterTabs } from '../components/features/FilterTabs';
import { SearchBar } from '../components/features/SearchBar';
import { LoanCard } from '../components/features/LoanCard';
import { apiClient } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { Loan } from '../types';

export const Activity: React.FC = () => {
  const { showToast } = useNotification();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Active' | 'Returned' | 'Overdue'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    try {
      setIsLoading(true);
      const loanData = await apiClient.getMyBorrowedEquipment();
      setLoans(loanData);
    } catch (error: any) {
      showToast(error.message || 'Failed to load loans', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturn = async (loan: Loan) => {
    if (window.confirm(`Return ${loan.equipmentName}?`)) {
      try {
        await apiClient.returnEquipment(loan.equipmentId);
        showToast(`${loan.equipmentName} returned successfully`, 'success');
        await loadLoans();
      } catch (error: any) {
        showToast(error.message || 'Failed to return equipment', 'error');
      }
    }
  };

  const filteredLoans = loans.filter((loan) => {
    const matchesFilter =
      filter === 'All' ||
      (filter === 'Active' && loan.status === 'Active') ||
      (filter === 'Returned' && loan.status === 'Returned') ||
      (filter === 'Overdue' && loan.status === 'Overdue');
    const matchesSearch = loan.equipmentName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="pt-28 pb-16 px-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary">Activity</h1>
        <p className="text-text-secondary mt-1">History of your equipment loans</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <FilterTabs
          tabs={['All', 'Active', 'Returned', 'Overdue']}
          activeTab={filter}
          onTabChange={(tab) => setFilter(tab as any)}
        />
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search activity..."
          className="w-full sm:w-64"
        />
      </div>

      <div className="space-y-4">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-20 w-full bg-surfaceHighlight animate-pulse rounded-xl" />
          ))
        ) : filteredLoans.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-border rounded-xl bg-surface/50">
            <p className="text-text-secondary text-sm">
              {searchQuery || filter !== 'All'
                ? 'No loans found matching your criteria.'
                : 'No loan history yet.'}
            </p>
            {(searchQuery || filter !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilter('All');
                }}
                className="text-primary mt-2 text-sm hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          filteredLoans.map((loan) => (
            <LoanCard key={loan.id} loan={loan} onReturn={handleReturn} />
          ))
        )}
      </div>
    </div>
  );
};

