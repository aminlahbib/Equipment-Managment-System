export interface Loan {
  id: number;
  equipmentId: number;
  equipmentName: string;
  benutzerId: number;
  ausleihe: string; // ISO date string
  rueckgabe?: string;
  expectedReturnDate?: string;
  status: 'Active' | 'Returned' | 'Overdue';
}

