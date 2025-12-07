export enum EquipmentStatus {
  AVAILABLE = 'AVAILABLE',
  BORROWED = 'BORROWED',
  MAINTENANCE = 'MAINTENANCE',
  RETIRED = 'RETIRED',
  OVERDUE = 'OVERDUE'
}

export interface Equipment {
  id: number;
  inventarnummer: string;
  bezeichnung: string;
  category?: string;
  status: EquipmentStatus;
  condition?: string;
  location?: string;
  serialNumber?: string;
  image?: string;
  specs?: string;
}

