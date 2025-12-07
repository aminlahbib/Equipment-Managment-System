import { Equipment, EquipmentStatus, Loan } from './types';

export const CURRENT_USER = {
  id: 'u1',
  name: 'Alex Morgan',
  role: 'Member',
  avatar: 'https://picsum.photos/id/64/200/200',
};

export const MOCK_EQUIPMENT: Equipment[] = [
  {
    id: 'e1',
    name: 'MacBook Pro 16"',
    category: 'Laptop',
    status: EquipmentStatus.AVAILABLE,
    image: 'https://picsum.photos/id/0/800/600',
    specs: 'M3 Max, 32GB RAM'
  },
  {
    id: 'e2',
    name: 'Sony Alpha a7 IV',
    category: 'Camera',
    status: EquipmentStatus.BORROWED,
    image: 'https://picsum.photos/id/250/800/600',
    borrower: 'Sarah Jenkins',
    dueDate: '2024-06-15',
    specs: '33MP, 4K 60p'
  },
  {
    id: 'e3',
    name: 'iPad Pro 12.9"',
    category: 'Tablet',
    status: EquipmentStatus.AVAILABLE,
    image: 'https://picsum.photos/id/119/800/600',
    specs: 'M2, 1TB Storage'
  },
  {
    id: 'e4',
    name: 'Shure SM7B',
    category: 'Audio',
    status: EquipmentStatus.AVAILABLE,
    image: 'https://picsum.photos/id/145/800/600',
    specs: 'Dynamic Microphone'
  },
  {
    id: 'e5',
    name: 'Dell UltraSharp 27"',
    category: 'Monitor',
    status: EquipmentStatus.MAINTENANCE,
    image: 'https://picsum.photos/id/2/800/600',
    specs: '4K USB-C Hub'
  },
  {
    id: 'e6',
    name: 'GoPro Hero 12',
    category: 'Action Cam',
    status: EquipmentStatus.AVAILABLE,
    image: 'https://picsum.photos/id/96/800/600',
    specs: '5.3K Video, Waterproof'
  }
];

export const MOCK_LOANS: Loan[] = [
  {
    id: 'l1',
    equipmentId: 'e2',
    equipmentName: 'Sony Alpha a7 IV',
    borrowDate: '2024-06-01',
    dueDate: '2024-06-15',
    status: 'Active',
    image: 'https://picsum.photos/id/250/800/600'
  },
  {
    id: 'l2',
    equipmentId: 'e7',
    equipmentName: 'Wacom Intuos Pro',
    borrowDate: '2024-05-20',
    dueDate: '2024-06-05',
    status: 'Overdue',
    image: 'https://picsum.photos/id/180/800/600'
  }
];
