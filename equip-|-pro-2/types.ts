export enum EquipmentStatus {
  AVAILABLE = 'Available',
  BORROWED = 'Borrowed',
  MAINTENANCE = 'Maintenance',
  OVERDUE = 'Overdue'
}

export interface Equipment {
  id: string;
  name: string;
  category: string;
  status: EquipmentStatus;
  image: string;
  borrower?: string;
  dueDate?: string;
  specs: string;
}

export interface Loan {
  id: string;
  equipmentId: string;
  equipmentName: string;
  borrowDate: string;
  dueDate: string;
  status: 'Active' | 'Returned' | 'Overdue';
  image: string;
}

export interface User {
  id: string;
  name: string;
  role: 'Admin' | 'Member';
  avatar: string;
}
