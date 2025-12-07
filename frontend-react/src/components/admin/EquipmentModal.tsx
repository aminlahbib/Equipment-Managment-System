import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Equipment, EquipmentStatus } from '../../types';

const equipmentSchema = z.object({
  inventarnummer: z.string().min(1, 'Inventory number is required'),
  bezeichnung: z.string().min(1, 'Description is required'),
  category: z.string().optional(),
  status: z.nativeEnum(EquipmentStatus),
  condition: z.string().optional(),
  location: z.string().optional(),
  serialNumber: z.string().optional(),
  specs: z.string().optional(),
});

type EquipmentFormData = z.infer<typeof equipmentSchema>;

interface EquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EquipmentFormData) => Promise<void>;
  equipment?: Equipment | null;
}

export const EquipmentModal: React.FC<EquipmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  equipment,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      status: EquipmentStatus.AVAILABLE,
    },
  });

  useEffect(() => {
    if (equipment) {
      reset({
        inventarnummer: equipment.inventarnummer,
        bezeichnung: equipment.bezeichnung,
        category: equipment.category || '',
        status: equipment.status,
        condition: equipment.condition || '',
        location: equipment.location || '',
        serialNumber: equipment.serialNumber || '',
        specs: equipment.specs || '',
      });
    } else {
      reset({
        status: EquipmentStatus.AVAILABLE,
      });
    }
  }, [equipment, reset, isOpen]);

  const onSubmit = async (data: EquipmentFormData) => {
    await onSave(data);
    reset();
  };

  const statusOptions = Object.values(EquipmentStatus).map((status) => ({
    value: status,
    label: status,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={equipment ? 'Edit Equipment' : 'Add Equipment'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
        <Input
          label="Inventory Number"
          placeholder="INV-001"
          error={errors.inventarnummer?.message}
          {...register('inventarnummer')}
        />

        <Input
          label="Description"
          placeholder="Equipment description"
          error={errors.bezeichnung?.message}
          {...register('bezeichnung')}
        />

        <Input
          label="Category"
          placeholder="Laptop, Camera, etc."
          error={errors.category?.message}
          {...register('category')}
        />

        <Select
          label="Status"
          options={statusOptions}
          error={errors.status?.message}
          {...register('status')}
        />

        <Input
          label="Condition"
          placeholder="NEW, GOOD, FAIR, POOR"
          error={errors.condition?.message}
          {...register('condition')}
        />

        <Input
          label="Location"
          placeholder="Equipment location"
          error={errors.location?.message}
          {...register('location')}
        />

        <Input
          label="Serial Number"
          placeholder="Serial number"
          error={errors.serialNumber?.message}
          {...register('serialNumber')}
        />

        <Input
          label="Specifications"
          placeholder="Equipment specifications"
          error={errors.specs?.message}
          {...register('specs')}
        />

        <div className="flex gap-3 pt-4">
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : equipment ? 'Update Equipment' : 'Add Equipment'}
          </Button>
          <Button variant="secondary" onClick={onClose} className="flex-1" type="button">
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

