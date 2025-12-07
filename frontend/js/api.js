import { loadPage } from './router.js';
import { decodeToken } from './utilities.js';
import { API_BASE_URL } from './config.js';

const baseUrl = `${API_BASE_URL}/benutzer`;
const adminBaseUrl = `${API_BASE_URL}/admin`;

function getAuthorizationToken() {
    const token = sessionStorage.getItem("authentication_token");
    if (token) {
        const decodedToken = decodeToken(token);
        if (decodedToken && decodedToken.exp * 1000 < Date.now()) {
            // Token is expired
            sessionStorage.removeItem("authentication_token");
            loadPage("login");
            throw new Error("Session expired. Please log in again.");
        }
        return "Bearer " + token;
    }
    return null;
}

function handleAuthError(response) {
    if (response.status === 401) {
        sessionStorage.removeItem("authentication_token");
        loadPage("login");
        throw new Error("Session expired. Please log in again.");
    }
    return response;
}

// ============================================
// Authentication
// ============================================

export async function loginUser(username, password, totpCode = null, recoveryCode = null) {
    const body = {
        benutzername: username,
        password: password
    };
    
    if (totpCode) {
        body.totpCode = parseInt(totpCode);
    }
    if (recoveryCode) {
        body.recoveryCode = recoveryCode;
    }

    return await fetch(baseUrl + "/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
}

export async function registerUser(username, password, firstName, lastName) {
    const body = {
        benutzername: username,
        password: password,
        vorname: firstName,
        nachname: lastName
    };

    return await fetch(baseUrl + "/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
}

export async function resetPassword(username, newPassword) {
    return fetch(baseUrl + "/reset-password", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ benutzername: username, newPassword })
    });
}

// ============================================
// Two-Factor Authentication
// ============================================

export async function enableTwoFactor() {
    const response = await fetch(baseUrl + "/2fa/enable", {
        method: "POST",
        headers: {
            "Authorization": getAuthorizationToken(),
            "Content-Type": "application/json"
        }
    });
    handleAuthError(response);
    if (!response.ok) {
        throw new Error("Failed to enable 2FA");
    }
    return await response.json();
}

export async function verifyTwoFactor(code) {
    const response = await fetch(baseUrl + "/2fa/verify", {
        method: "POST",
        headers: {
            "Authorization": getAuthorizationToken(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ code })
    });
    handleAuthError(response);
    if (!response.ok) {
        throw new Error("Failed to verify 2FA code");
    }
    return await response.json();
}

export async function disableTwoFactor() {
    const response = await fetch(baseUrl + "/2fa/disable", {
        method: "POST",
        headers: {
            "Authorization": getAuthorizationToken(),
            "Content-Type": "application/json"
        }
    });
    handleAuthError(response);
    if (!response.ok) {
        throw new Error("Failed to disable 2FA");
    }
    return response;
}

// ============================================
// Profile Management
// ============================================

export async function getProfile() {
    const response = await fetch(baseUrl + "/profile", {
        method: "GET",
        headers: {
            "Authorization": getAuthorizationToken(),
            "Content-Type": "application/json"
        }
    });
    handleAuthError(response);
    if (!response.ok) {
        throw new Error("Failed to fetch profile");
    }
    return await response.json();
}

export async function updateProfile(profileData) {
    const response = await fetch(baseUrl + "/profile", {
        method: "PUT",
        headers: {
            "Authorization": getAuthorizationToken(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(profileData)
    });
    handleAuthError(response);
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update profile");
    }
    return await response.json();
}

// ============================================
// Equipment Operations
// ============================================

export async function getAvailableEquipment() {
    const response = await fetch(baseUrl + "/equipment", {
        method: "GET",
        headers: {
            "Authorization": getAuthorizationToken(),
            "Content-Type": "application/json"
        }
    });
    handleAuthError(response);
    if (!response.ok) {
        throw new Error("Failed to fetch available equipment");
    }
    return await response.json();
}

export async function searchEquipment(searchParams = {}) {
    const queryParams = new URLSearchParams();
    
    if (searchParams.searchTerm) queryParams.append("searchTerm", searchParams.searchTerm);
    if (searchParams.category) queryParams.append("category", searchParams.category);
    if (searchParams.status) queryParams.append("status", searchParams.status);
    if (searchParams.conditionStatus) queryParams.append("conditionStatus", searchParams.conditionStatus);
    if (searchParams.location) queryParams.append("location", searchParams.location);
    if (searchParams.page !== undefined) queryParams.append("page", searchParams.page);
    if (searchParams.size !== undefined) queryParams.append("size", searchParams.size);
    if (searchParams.sortBy) queryParams.append("sortBy", searchParams.sortBy);
    if (searchParams.sortDirection) queryParams.append("sortDirection", searchParams.sortDirection);

    const response = await fetch(baseUrl + "/equipment/search?" + queryParams.toString(), {
        method: "GET",
        headers: {
            "Authorization": getAuthorizationToken(),
            "Content-Type": "application/json"
        }
    });
    handleAuthError(response);
    if (!response.ok) {
        throw new Error("Failed to search equipment");
    }
    return await response.json();
}

export async function getMyBorrowedEquipment() {
    const response = await fetch(baseUrl + "/ausleihen", {
        method: "GET",
        headers: {
            "Authorization": getAuthorizationToken(),
            "Content-Type": "application/json"
        }
    });
    handleAuthError(response);
    if (!response.ok) {
        throw new Error("Failed to fetch borrowed equipment");
    }
    return await response.json();
}

export async function borrowEquipment(equipmentId, expectedReturnDate = null) {
    const body = expectedReturnDate ? { expectedReturnDate } : {};
    
    const response = await fetch(baseUrl + "/ausleihen/" + equipmentId, {
        method: "POST",
        headers: {
            "Authorization": getAuthorizationToken(),
            "Content-Type": "application/json"
        },
        body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined
    });
    handleAuthError(response);
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Failed to borrow equipment" }));
        throw new Error(error.message || "Failed to borrow equipment");
    }
    return response;
}

export async function returnEquipment(equipmentId) {
    const response = await fetch(baseUrl + "/rueckgabe/" + equipmentId, {
        method: "POST",
        headers: {
            "Authorization": getAuthorizationToken(),
            "Content-Type": "application/json"
        }
    });
    handleAuthError(response);
    if (!response.ok) {
        throw new Error("Failed to return equipment");
    }
    return response;
}

// ============================================
// Admin Operations
// ============================================

// User Management
export async function getAllUsers() {
    const response = await fetch(adminBaseUrl + "/users", {
        method: "GET",
        headers: {
            "Authorization": getAuthorizationToken(),
            "Content-Type": "application/json"
        }
    });
    handleAuthError(response);
    if (!response.ok) {
        throw new Error("Failed to fetch users");
    }
    return await response.json();
}

export async function searchUsers(searchParams = {}) {
    const queryParams = new URLSearchParams();
    
    if (searchParams.searchTerm) queryParams.append("searchTerm", searchParams.searchTerm);
    if (searchParams.role) queryParams.append("role", searchParams.role);
    if (searchParams.accountStatus) queryParams.append("accountStatus", searchParams.accountStatus);
    if (searchParams.page !== undefined) queryParams.append("page", searchParams.page);
    if (searchParams.size !== undefined) queryParams.append("size", searchParams.size);
    if (searchParams.sortBy) queryParams.append("sortBy", searchParams.sortBy);
    if (searchParams.sortDirection) queryParams.append("sortDirection", searchParams.sortDirection);

    const response = await fetch(adminBaseUrl + "/users/search?" + queryParams.toString(), {
        method: "GET",
        headers: {
            "Authorization": getAuthorizationToken(),
            "Content-Type": "application/json"
        }
    });
    handleAuthError(response);
    if (!response.ok) {
        throw new Error("Failed to search users");
    }
    return await response.json();
}

export async function updateUser(userId, updateData) {
    const response = await fetch(adminBaseUrl + "/users/" + userId, {
        method: "PUT",
        headers: {
            "Authorization": getAuthorizationToken(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(updateData)
    });
    handleAuthError(response);
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Failed to update user" }));
        throw new Error(error.message || "Failed to update user");
    }
    return await response.json();
}

export async function deleteUser(userId) {
    const response = await fetch(adminBaseUrl + "/users/" + userId, {
        method: "DELETE",
        headers: {
            "Authorization": getAuthorizationToken(),
            "Content-Type": "application/json"
        }
    });
    handleAuthError(response);
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Failed to delete user" }));
        throw new Error(error.message || "Failed to delete user");
    }
    return response;
}

// Equipment Management
export async function getAllEquipment() {
    const response = await fetch(adminBaseUrl + "/equipment", {
        method: "GET",
        headers: {
            "Authorization": getAuthorizationToken(),
            "Content-Type": "application/json"
        }
    });
    handleAuthError(response);
    if (!response.ok) {
        throw new Error("Failed to fetch equipment");
    }
    return await response.json();
}

export async function searchEquipmentAdmin(searchParams = {}) {
    const queryParams = new URLSearchParams();
    
    if (searchParams.searchTerm) queryParams.append("searchTerm", searchParams.searchTerm);
    if (searchParams.category) queryParams.append("category", searchParams.category);
    if (searchParams.status) queryParams.append("status", searchParams.status);
    if (searchParams.conditionStatus) queryParams.append("conditionStatus", searchParams.conditionStatus);
    if (searchParams.location) queryParams.append("location", searchParams.location);
    if (searchParams.page !== undefined) queryParams.append("page", searchParams.page);
    if (searchParams.size !== undefined) queryParams.append("size", searchParams.size);
    if (searchParams.sortBy) queryParams.append("sortBy", searchParams.sortBy);
    if (searchParams.sortDirection) queryParams.append("sortDirection", searchParams.sortDirection);

    const response = await fetch(adminBaseUrl + "/equipment/search?" + queryParams.toString(), {
        method: "GET",
        headers: {
            "Authorization": getAuthorizationToken(),
            "Content-Type": "application/json"
        }
    });
    handleAuthError(response);
    if (!response.ok) {
        throw new Error("Failed to search equipment");
    }
    return await response.json();
}

export async function addEquipment(equipmentData) {
    const response = await fetch(adminBaseUrl + "/equipment", {
        method: "POST",
        headers: {
            "Authorization": getAuthorizationToken(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(equipmentData)
    });
    handleAuthError(response);
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Failed to add equipment" }));
        throw new Error(error.message || "Failed to add equipment");
    }
    return await response.json();
}

export async function updateEquipment(equipmentId, updateData) {
    const response = await fetch(adminBaseUrl + "/equipment/" + equipmentId, {
        method: "PUT",
        headers: {
            "Authorization": getAuthorizationToken(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(updateData)
    });
    handleAuthError(response);
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Failed to update equipment" }));
        throw new Error(error.message || "Failed to update equipment");
    }
    return await response.json();
}

export async function deleteEquipment(equipmentId) {
    const response = await fetch(adminBaseUrl + "/equipment/" + equipmentId, {
        method: "DELETE",
        headers: {
            "Authorization": getAuthorizationToken(),
            "Content-Type": "application/json"
        }
    });
    handleAuthError(response);
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Failed to delete equipment" }));
        throw new Error(error.message || "Failed to delete equipment");
    }
    return response;
}

// Loan Management
export async function getCurrentLoans() {
    const response = await fetch(adminBaseUrl + "/ausleihen/current", {
        method: "GET",
        headers: {
            "Authorization": getAuthorizationToken(),
            "Content-Type": "application/json"
        }
    });
    handleAuthError(response);
    if (!response.ok) {
        throw new Error("Failed to fetch current loans");
    }
    return await response.json();
}

export async function getLoanHistory() {
    const response = await fetch(adminBaseUrl + "/ausleihen/history", {
        method: "GET",
        headers: {
            "Authorization": getAuthorizationToken(),
            "Content-Type": "application/json"
        }
    });
    handleAuthError(response);
    if (!response.ok) {
        throw new Error("Failed to fetch loan history");
    }
    return await response.json();
}

export async function getOverdueLoans() {
    const response = await fetch(adminBaseUrl + "/ausleihen/overdue", {
        method: "GET",
        headers: {
            "Authorization": getAuthorizationToken(),
            "Content-Type": "application/json"
        }
    });
    handleAuthError(response);
    if (!response.ok) {
        throw new Error("Failed to fetch overdue loans");
    }
    return await response.json();
}

// ============================================
// Maintenance Management
// ============================================

export async function scheduleMaintenance(maintenanceData) {
    const response = await fetch(adminBaseUrl + "/maintenance", {
        method: "POST",
        headers: {
            "Authorization": getAuthorizationToken(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(maintenanceData)
    });
    handleAuthError(response);
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Failed to schedule maintenance" }));
        throw new Error(error.message || "Failed to schedule maintenance");
    }
    return await response.json();
}

export async function startMaintenance(maintenanceId) {
    const response = await fetch(adminBaseUrl + "/maintenance/" + maintenanceId + "/start", {
        method: "PUT",
        headers: {
            "Authorization": getAuthorizationToken(),
            "Content-Type": "application/json"
        }
    });
    handleAuthError(response);
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Failed to start maintenance" }));
        throw new Error(error.message || "Failed to start maintenance");
    }
    return await response.json();
}

export async function completeMaintenance(maintenanceId) {
    const response = await fetch(adminBaseUrl + "/maintenance/" + maintenanceId + "/complete", {
        method: "PUT",
        headers: {
            "Authorization": getAuthorizationToken(),
            "Content-Type": "application/json"
        }
    });
    handleAuthError(response);
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Failed to complete maintenance" }));
        throw new Error(error.message || "Failed to complete maintenance");
    }
    return await response.json();
}

export async function getMaintenanceHistory(equipmentId) {
    const response = await fetch(adminBaseUrl + "/maintenance/equipment/" + equipmentId, {
        method: "GET",
        headers: {
            "Authorization": getAuthorizationToken(),
            "Content-Type": "application/json"
        }
    });
    handleAuthError(response);
    if (!response.ok) {
        throw new Error("Failed to fetch maintenance history");
    }
    return await response.json();
}

export async function getScheduledMaintenance() {
    const response = await fetch(adminBaseUrl + "/maintenance/scheduled", {
        method: "GET",
        headers: {
            "Authorization": getAuthorizationToken(),
            "Content-Type": "application/json"
        }
    });
    handleAuthError(response);
    if (!response.ok) {
        throw new Error("Failed to fetch scheduled maintenance");
    }
    return await response.json();
}

export async function getOverdueMaintenance() {
    const response = await fetch(adminBaseUrl + "/maintenance/overdue", {
        method: "GET",
        headers: {
            "Authorization": getAuthorizationToken(),
            "Content-Type": "application/json"
        }
    });
    handleAuthError(response);
    if (!response.ok) {
        throw new Error("Failed to fetch overdue maintenance");
    }
    return await response.json();
}

// ============================================
// Reservation Management
// ============================================

export async function createReservation(reservationData) {
    const response = await fetch(baseUrl + "/reservations", {
        method: "POST",
        headers: {
            "Authorization": getAuthorizationToken(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(reservationData)
    });
    handleAuthError(response);
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Failed to create reservation" }));
        throw new Error(error.message || "Failed to create reservation");
    }
    return await response.json();
}

export async function getMyReservations() {
    const response = await fetch(baseUrl + "/reservations", {
        method: "GET",
        headers: {
            "Authorization": getAuthorizationToken(),
            "Content-Type": "application/json"
        }
    });
    handleAuthError(response);
    if (!response.ok) {
        throw new Error("Failed to fetch reservations");
    }
    return await response.json();
}

export async function cancelReservation(reservationId) {
    const response = await fetch(baseUrl + "/reservations/" + reservationId, {
        method: "DELETE",
        headers: {
            "Authorization": getAuthorizationToken(),
            "Content-Type": "application/json"
        }
    });
    handleAuthError(response);
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Failed to cancel reservation" }));
        throw new Error(error.message || "Failed to cancel reservation");
    }
    return response;
}

export async function getAllReservations() {
    const response = await fetch(adminBaseUrl + "/reservations", {
        method: "GET",
        headers: {
            "Authorization": getAuthorizationToken(),
            "Content-Type": "application/json"
        }
    });
    handleAuthError(response);
    if (!response.ok) {
        throw new Error("Failed to fetch reservations");
    }
    return await response.json();
}

export async function getEquipmentReservations(equipmentId) {
    const response = await fetch(adminBaseUrl + "/reservations/equipment/" + equipmentId, {
        method: "GET",
        headers: {
            "Authorization": getAuthorizationToken(),
            "Content-Type": "application/json"
        }
    });
    handleAuthError(response);
    if (!response.ok) {
        throw new Error("Failed to fetch equipment reservations");
    }
    return await response.json();
}

export async function confirmReservation(reservationId) {
    const response = await fetch(adminBaseUrl + "/reservations/" + reservationId + "/confirm", {
        method: "PUT",
        headers: {
            "Authorization": getAuthorizationToken(),
            "Content-Type": "application/json"
        }
    });
    handleAuthError(response);
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Failed to confirm reservation" }));
        throw new Error(error.message || "Failed to confirm reservation");
    }
    return await response.json();
}

// ============================================
// Loan Rules
// ============================================

export async function getLoanRules() {
    const response = await fetch(baseUrl + "/loan-rules", {
        method: "GET",
        headers: {
            "Authorization": getAuthorizationToken(),
            "Content-Type": "application/json"
        }
    });
    handleAuthError(response);
    if (!response.ok) {
        throw new Error("Failed to fetch loan rules");
    }
    return await response.json();
}
