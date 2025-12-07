export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

export interface Reservation {
  id: number;
  equipmentId: number;
  equipmentName?: string;
  benutzerId: number;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  status: ReservationStatus;
  createdAt?: string;
}

