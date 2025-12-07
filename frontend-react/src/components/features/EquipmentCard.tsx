import React from 'react';
import { Equipment, EquipmentStatus } from '../../types';
import { Badge } from '../ui/Badge';

interface EquipmentCardProps {
  equipment: Equipment;
  onClick?: () => void;
  viewMode?: 'grid' | 'list';
}

export const EquipmentCard: React.FC<EquipmentCardProps> = ({
  equipment,
  onClick,
  viewMode = 'grid',
}) => {
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

  if (viewMode === 'list') {
    return (
      <div
        className="group cursor-pointer bg-surface border border-border rounded-xl p-3 flex items-center gap-4 hover:border-text-secondary/20 transition-all duration-200"
        onClick={onClick}
      >
        <div className="w-16 h-12 bg-surfaceHighlight rounded-lg overflow-hidden shrink-0">
          {equipment.image ? (
            <img
              src={equipment.image}
              alt={equipment.bezeichnung}
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-tertiary text-xs">
              No Image
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-text-primary font-medium text-sm truncate">{equipment.bezeichnung}</h3>
          <p className="text-text-secondary text-xs mt-0.5 truncate">{equipment.specs || equipment.inventarnummer}</p>
        </div>
        <div className="hidden sm:block text-xs text-text-tertiary px-4 border-l border-border">
          {equipment.category || 'N/A'}
        </div>
        <div className="shrink-0 pl-2">
          <Badge variant={getStatusVariant(equipment.status)}>
            {equipment.status}
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group cursor-pointer bg-surface border border-border rounded-xl overflow-hidden hover:border-text-secondary/20 transition-all duration-300"
      onClick={onClick}
    >
      <div className="aspect-[3/2] w-full bg-surfaceHighlight relative overflow-hidden">
        {equipment.image ? (
          <img
            src={equipment.image}
            alt={equipment.bezeichnung}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-tertiary">
            No Image
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge variant={getStatusVariant(equipment.status)}>
            {equipment.status}
          </Badge>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-text-primary font-medium text-sm truncate">{equipment.bezeichnung}</h3>
        <p className="text-text-secondary text-xs mt-1 truncate">
          {equipment.specs || equipment.inventarnummer}
        </p>
      </div>
    </div>
  );
};

