import React from 'react';
import { RotateCcw, Zap, Check } from 'lucide-react';
import { Loan } from '../../types';
import { Tooltip } from '../ui/Tooltip';
import { SortMenu, SortOption } from './SortMenu';
import { format } from 'date-fns';

interface ActivitySidebarProps {
  loans: Loan[];
  isLoading: boolean;
  onReturn: (loan: Loan) => void;
  onQuickReturn: (loan: Loan) => void;
  onReturnAll: () => void;
  returningIds: Set<number>;
}

export const ActivitySidebar: React.FC<ActivitySidebarProps> = ({
  loans,
  isLoading,
  onReturn,
  onQuickReturn,
  onReturnAll,
  returningIds,
}) => {
  const [sortConfig, setSortConfig] = React.useState<SortOption>({
    label: 'Due Soonest',
    key: 'expectedReturnDate',
    direction: 'asc',
  });

  const sortOptions: SortOption[] = [
    { label: 'Due Soonest', key: 'expectedReturnDate', direction: 'asc' },
    { label: 'Due Latest', key: 'expectedReturnDate', direction: 'desc' },
    { label: 'Recent Loans', key: 'ausleihe', direction: 'desc' },
  ];

  const sortedLoans = [...loans].sort((a, b) => {
    const dateA = new Date(a[sortConfig.key as keyof Loan] as string).getTime();
    const dateB = new Date(b[sortConfig.key as keyof Loan] as string).getTime();
    return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
  });

  const activeLoanCount = loans.filter(
    (l) => l.status === 'Active' || l.status === 'Overdue'
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-text-primary">Your Activity</h2>
        <div className="flex items-center gap-3">
          <SortMenu
            options={sortOptions}
            selectedOption={sortConfig}
            onSelect={setSortConfig}
          />
          {!isLoading && loans.length > 0 && (
            <>
              <div className="w-px h-3 bg-border"></div>
              <button
                onClick={onReturnAll}
                className="text-xs text-text-secondary hover:text-text-primary transition-colors"
                disabled={activeLoanCount === 0}
              >
                Return All
              </button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          [1, 2].map((i) => (
            <div key={i} className="h-14 w-full bg-surfaceHighlight animate-pulse rounded-xl" />
          ))
        ) : loans.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-border rounded-xl bg-surface/50">
            <div className="w-10 h-10 bg-surfaceHighlight rounded-full flex items-center justify-center mx-auto mb-3 text-text-tertiary">
              <Check size={16} />
            </div>
            <p className="text-text-secondary text-sm">No active loans.</p>
          </div>
        ) : (
          sortedLoans.map((loan) => (
            <div
              key={loan.id}
              className={`
                group relative p-3 bg-surface border border-border rounded-xl flex items-center gap-3 transition-all
                ${returningIds.has(loan.id) ? 'opacity-0 scale-95' : 'hover:border-text-secondary/20'}
              `}
            >
              <div className="w-10 h-10 rounded-lg object-cover bg-surfaceHighlight flex items-center justify-center text-text-tertiary text-xs">
                {loan.equipmentName?.[0] || 'E'}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-text-primary truncate">
                  {loan.equipmentName}
                </h4>
                <p
                  className={`text-[10px] uppercase font-semibold tracking-wide mt-0.5 ${
                    loan.status === 'Overdue' ? 'text-danger' : 'text-text-tertiary'
                  }`}
                >
                  Due{' '}
                  {loan.expectedReturnDate
                    ? format(new Date(loan.expectedReturnDate), 'MMM d')
                    : 'N/A'}
                </p>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Tooltip content="Quick Return">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickReturn(loan);
                    }}
                    className="p-1.5 hover:bg-surfaceHighlight text-text-secondary hover:text-text-primary rounded-md transition-colors"
                  >
                    <Zap size={14} />
                  </button>
                </Tooltip>
                <Tooltip content="Return">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReturn(loan);
                    }}
                    className="p-1.5 hover:bg-surfaceHighlight text-text-secondary hover:text-text-primary rounded-md transition-colors"
                  >
                    <RotateCcw size={14} />
                  </button>
                </Tooltip>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

