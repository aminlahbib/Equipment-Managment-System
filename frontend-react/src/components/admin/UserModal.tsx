import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { User, Role, AccountStatus } from '../../types';

const userSchema = z.object({
  role: z.nativeEnum(Role),
  accountStatus: z.nativeEnum(AccountStatus),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UserFormData) => Promise<void>;
  user: User | null;
}

export const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, user }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  useEffect(() => {
    if (user) {
      reset({
        role: user.role,
        accountStatus: user.accountStatus || AccountStatus.ACTIVE,
      });
    }
  }, [user, reset, isOpen]);

  const onSubmit = async (data: UserFormData) => {
    await onSave(data);
  };

  const roleOptions = Object.values(Role).map((role) => ({
    value: role,
    label: role,
  }));

  const statusOptions = Object.values(AccountStatus).map((status) => ({
    value: status,
    label: status,
  }));

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit User">
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-text-primary">
            {user.vorname} {user.nachname}
          </h3>
          <p className="text-sm text-text-secondary">@{user.benutzername}</p>
        </div>

        <Select
          label="Role"
          options={roleOptions}
          error={errors.role?.message}
          {...register('role')}
        />

        <Select
          label="Account Status"
          options={statusOptions}
          error={errors.accountStatus?.message}
          {...register('accountStatus')}
        />

        <div className="flex gap-3 pt-4">
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update User'}
          </Button>
          <Button variant="secondary" onClick={onClose} className="flex-1" type="button">
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

