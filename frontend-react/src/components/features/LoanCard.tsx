import React from 'react';
import { Calendar } from 'lucide-react';
import { Loan } from '../../types';
import { Badge } from '../ui/Badge';
import { format } from 'date-fns';

interface LoanCardProps {
  loan: Loan;
  onReturn?: (loan: Loan) => void;
}

export const LoanCard: React.FC<LoanCardProps> = ({ loan, onReturn }) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Active':
        return 'info';
      case 'Overdue':
        return 'danger';
      case 'Returned':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center hover:border-text-secondary/20 transition-all">
      <div className="w-12 h-12 bg-surfaceHighlight rounded-lg overflow-hidden shrink-0 flex items-center justify-center text-text-tertiary text-xs">
        {loan.equipmentName?.[0] || 'E'}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-text-primary font-medium text-sm">{loan.equipmentName}</h3>
          <Badge variant={getStatusVariant(loan.status)} size="sm">
            {loan.status}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-xs text-text-secondary flex-wrap">
          <span className="flex items-center gap-1">
            <Calendar size={12} /> Borrowed:{' '}
            {format(new Date(loan.ausleihe), 'MMM d, yyyy')}
          </span>
          {loan.expectedReturnDate && (
            <>
              <span>•</span>
              <span className={loan.status === 'Overdue' ? 'text-danger' : ''}>
                Due: {format(new Date(loan.expectedReturnDate), 'MMM d, yyyy')}
              </span>
            </>
          )}
        </div>
      </div>

      {onReturn && loan.status !== 'Returned' && (
        <button
          onClick={() => onReturn(loan)}
          className="px-4 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
        >
          Return
        </button>
      )}
    </div>
  );
};

