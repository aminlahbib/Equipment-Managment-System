import React from 'react';
import { Calendar, X } from 'lucide-react';
import { Reservation, ReservationStatus } from '../../types';
import { Badge } from '../ui/Badge';
import { format } from 'date-fns';
import { Button } from '../ui/Button';

interface ReservationCardProps {
  reservation: Reservation;
  onCancel?: (reservation: Reservation) => void;
}

export const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  onCancel,
}) => {
  const getStatusVariant = (status: ReservationStatus) => {
    switch (status) {
      case ReservationStatus.CONFIRMED:
        return 'success';
      case ReservationStatus.PENDING:
        return 'warning';
      case ReservationStatus.ACTIVE:
        return 'info';
      case ReservationStatus.CANCELLED:
      case ReservationStatus.EXPIRED:
        return 'default';
      default:
        return 'default';
    }
  };

  const canCancel =
    reservation.status === ReservationStatus.PENDING ||
    reservation.status === ReservationStatus.CONFIRMED;

  return (
    <div className="bg-surface border border-border rounded-xl p-4 hover:border-text-secondary/20 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-text-primary font-medium text-sm mb-1">
            {reservation.equipmentName || `Equipment #${reservation.equipmentId}`}
          </h3>
          <Badge variant={getStatusVariant(reservation.status)} size="sm">
            {reservation.status}
          </Badge>
        </div>
        {canCancel && onCancel && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onCancel(reservation)}
            className="text-text-secondary hover:text-danger"
          >
            <X size={16} />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs text-text-secondary">
        <span className="flex items-center gap-1">
          <Calendar size={12} />
          {format(new Date(reservation.startDate), 'MMM d')} -{' '}
          {format(new Date(reservation.endDate), 'MMM d, yyyy')}
        </span>
      </div>
    </div>
  );
};

