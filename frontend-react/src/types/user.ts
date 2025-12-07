export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING'
}

export interface User {
  id: number;
  benutzername: string;
  vorname: string;
  nachname: string;
  email?: string;
  role: Role;
  accountStatus?: AccountStatus;
  avatar?: string;
  twoFactorEnabled?: boolean;
}

