import { getApiBaseUrl } from '../utils/constants';
import { getToken, removeToken, isTokenExpired } from '../utils/token';
import type {
  Equipment,
  User,
  Loan,
  Reservation,
  MaintenanceRecord,
  SearchFilters,
  PaginatedResponse,
  ApiResponse,
} from '../types';
import type { Role, AccountStatus, MaintenanceType } from '../types';

class ApiClient {
  private baseUrl: string;
  private userBaseUrl: string;
  private adminBaseUrl: string;

  constructor() {
    this.baseUrl = getApiBaseUrl();
    this.userBaseUrl = `${this.baseUrl}/benutzer`;
    this.adminBaseUrl = `${this.baseUrl}/admin`;
  }

  private getAuthToken(): string | null {
    const token = getToken();
    if (!token) return null;
    
    if (isTokenExpired(token)) {
      removeToken();
      // Redirect to login will be handled by router
      throw new Error('Session expired. Please log in again.');
    }
    
    return `Bearer ${token}`;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getAuthToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = token;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        removeToken();
        // Redirect will be handled by router/auth context
        throw new Error('Session expired. Please log in again.');
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return {} as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  // ============================================
  // Authentication
  // ============================================

  async login(username: string, password: string, totpCode?: number, recoveryCode?: string): Promise<{ token: string }> {
    const body: any = { benutzername: username, password };
    if (totpCode) body.totpCode = totpCode;
    if (recoveryCode) body.recoveryCode = recoveryCode;

    const response = await this.request<{ token: string }>(`${this.userBaseUrl}/login`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return response;
  }

  async register(username: string, password: string, firstName: string, lastName: string): Promise<void> {
    await this.request(`${this.userBaseUrl}/register`, {
      method: 'POST',
      body: JSON.stringify({
        benutzername: username,
        password,
        vorname: firstName,
        nachname: lastName,
      }),
    });
  }

  async resetPassword(username: string, newPassword: string): Promise<void> {
    await this.request(`${this.userBaseUrl}/reset-password`, {
      method: 'PUT',
      body: JSON.stringify({ benutzername: username, newPassword }),
    });
  }

  // ============================================
  // Two-Factor Authentication
  // ============================================

  async enable2FA(): Promise<{ qrCode: string; secret: string; recoveryCodes: string[] }> {
    return this.request(`${this.userBaseUrl}/2fa/enable`, { method: 'POST' });
  }

  async verify2FA(code: number): Promise<{ recoveryCodes: string[] }> {
    return this.request(`${this.userBaseUrl}/2fa/verify`, {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  async disable2FA(): Promise<void> {
    await this.request(`${this.userBaseUrl}/2fa/disable`, { method: 'POST' });
  }

  // ============================================
  // Profile Management
  // ============================================

  async getProfile(): Promise<User> {
    return this.request(`${this.userBaseUrl}/profile`);
  }

  async updateProfile(profileData: Partial<User>): Promise<User> {
    return this.request(`${this.userBaseUrl}/profile`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // ============================================
  // Equipment Operations (User)
  // ============================================

  async getAvailableEquipment(): Promise<Equipment[]> {
    return this.request(`${this.userBaseUrl}/equipment`);
  }

  async searchEquipment(filters: SearchFilters): Promise<PaginatedResponse<Equipment>> {
    const params = new URLSearchParams();
    if (filters.query) params.append('searchTerm', filters.query);
    if (filters.category) params.append('category', filters.category);
    if (filters.status) params.append('status', filters.status);
    if (filters.page !== undefined) params.append('page', filters.page.toString());
    if (filters.size !== undefined) params.append('size', filters.size.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortDir) params.append('sortDirection', filters.sortDir);

    return this.request(`${this.userBaseUrl}/equipment/search?${params.toString()}`);
  }

  async getMyBorrowedEquipment(): Promise<Loan[]> {
    return this.request(`${this.userBaseUrl}/ausleihen`);
  }

  async borrowEquipment(equipmentId: number, expectedReturnDate?: string): Promise<void> {
    const body = expectedReturnDate ? { expectedReturnDate } : {};
    await this.request(`${this.userBaseUrl}/ausleihen/${equipmentId}`, {
      method: 'POST',
      body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
    });
  }

  async returnEquipment(equipmentId: number): Promise<void> {
    await this.request(`${this.userBaseUrl}/rueckgabe/${equipmentId}`, {
      method: 'POST',
    });
  }

  async getLoanRules(): Promise<{
    maxLoansPerUser: number;
    minLoanDurationDays: number;
    maxLoanDurationDays: number;
    defaultLoanDurationDays: number;
    gracePeriodDays: number;
  }> {
    return this.request(`${this.userBaseUrl}/loan-rules`);
  }

  // ============================================
  // Reservations (User)
  // ============================================

  async createReservation(reservationData: {
    equipmentId: number;
    startDate: string;
    endDate: string;
  }): Promise<Reservation> {
    return this.request(`${this.userBaseUrl}/reservations`, {
      method: 'POST',
      body: JSON.stringify(reservationData),
    });
  }

  async getMyReservations(): Promise<Reservation[]> {
    return this.request(`${this.userBaseUrl}/reservations`);
  }

  async cancelReservation(reservationId: number): Promise<void> {
    await this.request(`${this.userBaseUrl}/reservations/${reservationId}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // Admin - User Management
  // ============================================

  async getAllUsers(): Promise<User[]> {
    return this.request(`${this.adminBaseUrl}/users`);
  }

  async searchUsers(filters: SearchFilters): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams();
    if (filters.query) params.append('searchTerm', filters.query);
    if (filters.status) params.append('role', filters.status);
    if (filters.page !== undefined) params.append('page', filters.page.toString());
    if (filters.size !== undefined) params.append('size', filters.size.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortDir) params.append('sortDirection', filters.sortDir);

    return this.request(`${this.adminBaseUrl}/users/search?${params.toString()}`);
  }

  async updateUser(userId: number, updateData: { role?: Role; accountStatus?: AccountStatus }): Promise<User> {
    return this.request(`${this.adminBaseUrl}/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async deleteUser(userId: number): Promise<void> {
    await this.request(`${this.adminBaseUrl}/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // Admin - Equipment Management
  // ============================================

  async getAllEquipment(): Promise<Equipment[]> {
    return this.request(`${this.adminBaseUrl}/equipment`);
  }

  async searchEquipmentAdmin(filters: SearchFilters): Promise<PaginatedResponse<Equipment>> {
    const params = new URLSearchParams();
    if (filters.query) params.append('searchTerm', filters.query);
    if (filters.category) params.append('category', filters.category);
    if (filters.status) params.append('status', filters.status);
    if (filters.page !== undefined) params.append('page', filters.page.toString());
    if (filters.size !== undefined) params.append('size', filters.size.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortDir) params.append('sortDirection', filters.sortDir);

    return this.request(`${this.adminBaseUrl}/equipment/search?${params.toString()}`);
  }

  async addEquipment(equipmentData: Partial<Equipment>): Promise<Equipment> {
    return this.request(`${this.adminBaseUrl}/equipment`, {
      method: 'POST',
      body: JSON.stringify(equipmentData),
    });
  }

  async updateEquipment(equipmentId: number, updateData: Partial<Equipment>): Promise<Equipment> {
    return this.request(`${this.adminBaseUrl}/equipment/${equipmentId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async deleteEquipment(equipmentId: number): Promise<void> {
    await this.request(`${this.adminBaseUrl}/equipment/${equipmentId}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // Admin - Loan Management
  // ============================================

  async getCurrentLoans(): Promise<Loan[]> {
    return this.request(`${this.adminBaseUrl}/ausleihen/current`);
  }

  async getLoanHistory(): Promise<Loan[]> {
    return this.request(`${this.adminBaseUrl}/ausleihen/history`);
  }

  async getOverdueLoans(): Promise<Loan[]> {
    return this.request(`${this.adminBaseUrl}/ausleihen/overdue`);
  }

  // ============================================
  // Admin - Maintenance Management
  // ============================================

  async scheduleMaintenance(maintenanceData: {
    equipmentId: number;
    type: MaintenanceType;
    description?: string;
    cost?: number;
    scheduledDate: string;
  }): Promise<MaintenanceRecord> {
    return this.request(`${this.adminBaseUrl}/maintenance`, {
      method: 'POST',
      body: JSON.stringify(maintenanceData),
    });
  }

  async startMaintenance(maintenanceId: number): Promise<MaintenanceRecord> {
    return this.request(`${this.adminBaseUrl}/maintenance/${maintenanceId}/start`, {
      method: 'PUT',
    });
  }

  async completeMaintenance(maintenanceId: number): Promise<MaintenanceRecord> {
    return this.request(`${this.adminBaseUrl}/maintenance/${maintenanceId}/complete`, {
      method: 'PUT',
    });
  }

  async getMaintenanceHistory(equipmentId: number): Promise<MaintenanceRecord[]> {
    return this.request(`${this.adminBaseUrl}/maintenance/equipment/${equipmentId}`);
  }

  async getScheduledMaintenance(): Promise<MaintenanceRecord[]> {
    return this.request(`${this.adminBaseUrl}/maintenance/scheduled`);
  }

  async getOverdueMaintenance(): Promise<MaintenanceRecord[]> {
    return this.request(`${this.adminBaseUrl}/maintenance/overdue`);
  }

  // ============================================
  // Admin - Reservation Management
  // ============================================

  async getAllReservations(): Promise<Reservation[]> {
    return this.request(`${this.adminBaseUrl}/reservations`);
  }

  async getEquipmentReservations(equipmentId: number): Promise<Reservation[]> {
    return this.request(`${this.adminBaseUrl}/reservations/equipment/${equipmentId}`);
  }

  async confirmReservation(reservationId: number): Promise<Reservation> {
    return this.request(`${this.adminBaseUrl}/reservations/${reservationId}/confirm`, {
      method: 'PUT',
    });
  }
}

export const apiClient = new ApiClient();

