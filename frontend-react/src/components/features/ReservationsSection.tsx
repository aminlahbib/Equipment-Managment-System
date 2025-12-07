import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { ReservationCard } from './ReservationCard';
import { CreateReservationModal } from './CreateReservationModal';
import { apiClient } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { Reservation } from '../../types';

interface ReservationsSectionProps {
  className?: string;
}

export const ReservationsSection: React.FC<ReservationsSectionProps> = ({ className = '' }) => {
  const { showToast } = useNotification();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getMyReservations();
      setReservations(data);
    } catch (error: any) {
      showToast(error.message || 'Failed to load reservations', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (reservation: Reservation) => {
    if (window.confirm('Are you sure you want to cancel this reservation?')) {
      try {
        await apiClient.cancelReservation(reservation.id);
        showToast('Reservation cancelled successfully', 'success');
        await loadReservations();
      } catch (error: any) {
        showToast(error.message || 'Failed to cancel reservation', 'error');
      }
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Your Reservations</h2>
          <p className="text-text-secondary text-sm mt-1">Manage your equipment reservations</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus size={16} /> New Reservation
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-surfaceHighlight animate-pulse rounded-xl" />
          ))
        ) : reservations.length === 0 ? (
          <div className="col-span-full py-12 text-center border border-dashed border-border rounded-xl bg-surface/50">
            <p className="text-text-secondary text-sm">No reservations yet.</p>
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(true)}
              className="mt-4"
            >
              Create Your First Reservation
            </Button>
          </div>
        ) : (
          reservations.map((reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              onCancel={handleCancel}
            />
          ))
        )}
      </div>

      <CreateReservationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadReservations}
      />
    </div>
  );
};

