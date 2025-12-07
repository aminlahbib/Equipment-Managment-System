import React from 'react';
import { Equipment, EquipmentStatus } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface EquipmentDetailsModalProps {
  equipment: Equipment | null;
  isOpen: boolean;
  onClose: () => void;
  onBorrow?: () => void;
  onReturn?: () => void;
}

export const EquipmentDetailsModal: React.FC<EquipmentDetailsModalProps> = ({
  equipment,
  isOpen,
  onClose,
  onBorrow,
  onReturn,
}) => {
  if (!equipment) return null;

  const getStatusVariant = (status: EquipmentStatus) => {
    switch (status) {
      case EquipmentStatus.AVAILABLE:
        return 'success';
      case EquipmentStatus.BORROWED:
        return 'default';
      case EquipmentStatus.MAINTENANCE:
      case EquipmentStatus.OVERDUE:
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Equipment Details">
      <div className="p-6 space-y-6">
        <div className="aspect-video w-full rounded-xl overflow-hidden bg-surfaceHighlight">
          {equipment.image ? (
            <img
              src={equipment.image}
              className="w-full h-full object-cover"
              alt={equipment.bezeichnung}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-tertiary">
              No Image Available
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-text-primary">{equipment.bezeichnung}</h2>
              <p className="text-text-secondary text-sm mt-1">{equipment.specs || 'No specifications'}</p>
            </div>
            <div className="text-right">
              <Badge variant={getStatusVariant(equipment.status)}>{equipment.status}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 py-4 border-t border-border">
            <div>
              <label className="text-xs text-text-tertiary uppercase tracking-wider font-semibold block mb-1">
                Asset ID
              </label>
              <span className="font-mono text-sm text-text-primary">
                {equipment.inventarnummer.toUpperCase()}
              </span>
            </div>
            <div>
              <label className="text-xs text-text-tertiary uppercase tracking-wider font-semibold block mb-1">
                Category
              </label>
              <span className="text-sm text-text-primary">{equipment.category || 'N/A'}</span>
            </div>
            {equipment.location && (
              <div>
                <label className="text-xs text-text-tertiary uppercase tracking-wider font-semibold block mb-1">
                  Location
                </label>
                <span className="text-sm text-text-primary">{equipment.location}</span>
              </div>
            )}
            {equipment.condition && (
              <div>
                <label className="text-xs text-text-tertiary uppercase tracking-wider font-semibold block mb-1">
                  Condition
                </label>
                <span className="text-sm text-text-primary">{equipment.condition}</span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            {equipment.status === EquipmentStatus.AVAILABLE && onBorrow && (
              <Button className="flex-1" size="lg" onClick={onBorrow}>
                Book Equipment
              </Button>
            )}
            {equipment.status === EquipmentStatus.BORROWED && onReturn && (
              <Button className="flex-1" size="lg" onClick={onReturn}>
                Return Equipment
              </Button>
            )}
            <Button variant="secondary" onClick={onClose} className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

