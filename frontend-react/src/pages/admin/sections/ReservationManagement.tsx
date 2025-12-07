import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { SearchBar } from '../../../components/features/SearchBar';
import { Select } from '../../../components/ui/Select';
import { apiClient } from '../../../services/api';
import { useNotification } from '../../../context/NotificationContext';
import { Reservation, ReservationStatus } from '../../../types';
import { Badge } from '../../../components/ui/Badge';
import { format } from 'date-fns';

export const ReservationManagement: React.FC = () => {
  const { showToast } = useNotification();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    loadReservations();
  }, [statusFilter]);

  const loadReservations = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getAllReservations();
      setReservations(data);
    } catch (error: any) {
      showToast(error.message || 'Failed to load reservations', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async (id: number) => {
    try {
      await apiClient.confirmReservation(id);
      showToast('Reservation confirmed', 'success');
      await loadReservations();
    } catch (error: any) {
      showToast(error.message || 'Failed to confirm reservation', 'error');
    }
  };

  const filteredReservations = reservations.filter((reservation) => {
    const matchesSearch =
      reservation.equipmentName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || reservation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: 'All', label: 'All Statuses' },
    ...Object.values(ReservationStatus).map((status) => ({ value: status, label: status })),
  ];

  const getStatusVariant = (status: ReservationStatus) => {
    switch (status) {
      case ReservationStatus.CONFIRMED:
        return 'success';
      case ReservationStatus.PENDING:
        return 'warning';
      case ReservationStatus.ACTIVE:
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary">Reservation Management</h1>
        <p className="text-text-secondary mt-1">View and manage equipment reservations</p>
      </div>

      {/* Filters */}
      <div className="bg-surface border border-border rounded-2xl p-4 flex flex-col lg:flex-row gap-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search reservations..."
          className="flex-1"
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={statusOptions}
          className="w-full lg:w-48"
        />
      </div>

      {/* Reservations List */}
      <div className="space-y-3">
        {isLoading ? (
          [1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 bg-surfaceHighlight animate-pulse rounded-xl" />
          ))
        ) : filteredReservations.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-border rounded-xl">
            <p className="text-text-secondary text-sm">No reservations found.</p>
          </div>
        ) : (
          filteredReservations.map((reservation) => (
            <div
              key={reservation.id}
              className="bg-surface border border-border rounded-xl p-4 hover:border-text-secondary/20 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-text-primary font-medium">
                      {reservation.equipmentName || `Equipment #${reservation.equipmentId}`}
                    </h3>
                    <Badge variant={getStatusVariant(reservation.status)}>
                      {reservation.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-text-secondary">
                    <span>
                      {format(new Date(reservation.startDate), 'MMM d')} -{' '}
                      {format(new Date(reservation.endDate), 'MMM d, yyyy')}
                    </span>
                    {reservation.createdAt && (
                      <span>Created: {format(new Date(reservation.createdAt), 'MMM d, yyyy')}</span>
                    )}
                  </div>
                </div>
                {reservation.status === ReservationStatus.PENDING && (
                  <Button size="sm" onClick={() => handleConfirm(reservation.id)} className="gap-2">
                    <CheckCircle size={16} /> Confirm
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

