export enum MaintenanceType {
  ROUTINE = 'ROUTINE',
  REPAIR = 'REPAIR',
  INSPECTION = 'INSPECTION',
  CLEANING = 'CLEANING',
  CALIBRATION = 'CALIBRATION',
  UPGRADE = 'UPGRADE',
  OTHER = 'OTHER'
}

export enum MaintenanceStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  OVERDUE = 'OVERDUE'
}

export interface MaintenanceRecord {
  id: number;
  equipmentId: number;
  equipmentName?: string;
  type: MaintenanceType;
  description?: string;
  cost?: number;
  performedBy?: string;
  scheduledDate: string; // ISO date string
  completedDate?: string;
  status: MaintenanceStatus;
  createdAt?: string;
}

