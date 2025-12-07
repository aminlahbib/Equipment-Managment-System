import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { apiClient } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { Equipment } from '../../types';

const reservationSchema = z.object({
  equipmentId: z.string().min(1, 'Equipment is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end >= start;
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

type ReservationFormData = z.infer<typeof reservationSchema>;

interface CreateReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateReservationModal: React.FC<CreateReservationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useNotification();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
  });

  useEffect(() => {
    if (isOpen) {
      loadEquipment();
    } else {
      reset();
    }
  }, [isOpen, reset]);

  const loadEquipment = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getAvailableEquipment();
      setEquipment(data);
    } catch (error: any) {
      showToast(error.message || 'Failed to load equipment', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ReservationFormData) => {
    try {
      await apiClient.createReservation({
        equipmentId: parseInt(data.equipmentId),
        startDate: data.startDate,
        endDate: data.endDate,
      });
      showToast('Reservation created successfully', 'success');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      showToast(error.message || 'Failed to create reservation', 'error');
    }
  };

  const equipmentOptions = equipment.map((eq) => ({
    value: eq.id.toString(),
    label: `${eq.bezeichnung} (${eq.inventarnummer})`,
  }));

  // Set min date to today
  const today = new Date().toISOString().split('T')[0];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Reservation">
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
        <Select
          label="Equipment"
          options={equipmentOptions}
          disabled={isLoading}
          error={errors.equipmentId?.message}
          {...register('equipmentId')}
        />

        <Input
          label="Start Date"
          type="date"
          min={today}
          error={errors.startDate?.message}
          {...register('startDate')}
        />

        <Input
          label="End Date"
          type="date"
          min={today}
          error={errors.endDate?.message}
          {...register('endDate')}
        />

        <div className="flex gap-3 pt-4">
          <Button type="submit" className="flex-1" disabled={isSubmitting || isLoading}>
            {isSubmitting ? 'Creating...' : 'Create Reservation'}
          </Button>
          <Button variant="secondary" onClick={onClose} className="flex-1" type="button">
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

