import {
    searchEquipmentAdmin,
    searchUsers,
    addEquipment,
    deleteEquipment,
    getCurrentLoans,
    getLoanHistory,
    deleteUser,
    scheduleMaintenance,
    startMaintenance,
    completeMaintenance,
    getScheduledMaintenance,
    getOverdueMaintenance,
    getAllReservations,
    getEquipmentReservations,
    confirmReservation
} from './api.js';
import notifications from './notifications.js';
import { exportToCSV, flattenEquipmentData, flattenLoanData, flattenUserData } from './export.js';

// Global state
let currentSection = 'overview';

// Equipment search params
let equipmentSearchParams = {
    searchTerm: '',
    category: '',
    status: '',
    page: 0,
    size: 20,
    sortBy: 'id',
    sortDirection: 'DESC'
};

// Users search params
let usersSearchParams = {
    searchTerm: '',
    role: '',
    accountStatus: '',
    page: 0,
    size: 20,
    sortBy: 'id',
    sortDirection: 'DESC'
};

// Equipment pagination
let equipmentPage = 0;
let equipmentTotalPages = 0;
let equipmentTotalElements = 0;
let allEquipment = [];

// Users pagination
let usersPage = 0;
let usersTotalPages = 0;
let usersTotalElements = 0;
let allUsers = [];

// Loans
let allLoans = [];

// Maintenance
let allMaintenance = [];

// Reservations
let allReservations = [];

document.addEventListener("DOMContentLoaded", () => {
    initAdminDashboard();
});

// Also expose init function for router to call
window.initAdminDashboard = async () => {
    setupEventListeners();
    await loadAllData();
    setupTabs();
};

function setupEventListeners() {
    // Equipment search/filter
    const equipmentSearch = document.getElementById('admin-equipment-search');
    if (equipmentSearch) {
        let searchTimeout;
        equipmentSearch.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                equipmentSearchParams.searchTerm = e.target.value;
                equipmentSearchParams.page = 0;
                loadEquipment();
            }, 300);
        });
    }

    const equipmentCategory = document.getElementById('admin-equipment-category');
    if (equipmentCategory) {
        equipmentCategory.addEventListener('change', (e) => {
            equipmentSearchParams.category = e.target.value;
            equipmentSearchParams.page = 0;
            loadEquipment();
        });
    }

    const equipmentStatus = document.getElementById('admin-equipment-status');
    if (equipmentStatus) {
        equipmentStatus.addEventListener('change', (e) => {
            equipmentSearchParams.status = e.target.value;
            equipmentSearchParams.page = 0;
            loadEquipment();
        });
    }

    // Users search/filter
    const usersSearch = document.getElementById('admin-users-search');
    if (usersSearch) {
        let searchTimeout;
        usersSearch.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                usersSearchParams.searchTerm = e.target.value;
                usersSearchParams.page = 0;
                loadUsers();
            }, 300);
        });
    }

    const usersRole = document.getElementById('admin-users-role');
    if (usersRole) {
        usersRole.addEventListener('change', (e) => {
            usersSearchParams.role = e.target.value;
            usersSearchParams.page = 0;
            loadUsers();
        });
    }

    const usersStatus = document.getElementById('admin-users-status');
    if (usersStatus) {
        usersStatus.addEventListener('change', (e) => {
            usersSearchParams.accountStatus = e.target.value;
            usersSearchParams.page = 0;
            loadUsers();
        });
    }

    // Export buttons
    const exportEquipmentBtn = document.getElementById('export-equipment-admin-csv');
    if (exportEquipmentBtn) {
        exportEquipmentBtn.addEventListener('click', () => {
            try {
                const flattened = flattenEquipmentData(allEquipment);
                exportToCSV(flattened, `equipment-admin-export-${new Date().toISOString().split('T')[0]}.csv`);
                notifications.success('Equipment data exported successfully!');
            } catch (error) {
                notifications.error('Failed to export equipment: ' + error.message);
            }
        });
    }

    const exportUsersBtn = document.getElementById('export-users-csv');
    if (exportUsersBtn) {
        exportUsersBtn.addEventListener('click', () => {
            try {
                const flattened = flattenUserData(allUsers);
                exportToCSV(flattened, `users-export-${new Date().toISOString().split('T')[0]}.csv`);
                notifications.success('Users data exported successfully!');
            } catch (error) {
                notifications.error('Failed to export users: ' + error.message);
            }
        });
    }

    const exportLoansBtn = document.getElementById('export-loans-admin-csv');
    if (exportLoansBtn) {
        exportLoansBtn.addEventListener('click', () => {
            try {
                const flattened = flattenLoanData(allLoans);
                exportToCSV(flattened, `loans-admin-export-${new Date().toISOString().split('T')[0]}.csv`);
                notifications.success('Loans data exported successfully!');
            } catch (error) {
                notifications.error('Failed to export loans: ' + error.message);
            }
        });
    }
}

async function loadAllData() {
    await Promise.all([
        loadEquipment(),
        loadUsers(),
        loadLoans(),
        updateStats()
    ]);
}

function setupTabs() {
    window.showSection = (sectionName) => {
        // Update active state in sidebar
        document.querySelectorAll('.nav-links .btn').forEach(btn => {
            if (btn.textContent.toLowerCase().includes(sectionName) || 
               (sectionName === 'overview' && btn.textContent.toLowerCase().includes('overview'))) {
                btn.style.backgroundColor = 'var(--bg-secondary)';
                btn.style.color = 'var(--text-primary)';
            } else {
                btn.style.backgroundColor = 'transparent';
                btn.style.color = 'var(--text-secondary)';
            }
        });

        // Hide all sections
        document.getElementById('equipment-section').classList.add('hidden');
        document.getElementById('users-section').classList.add('hidden');
        document.getElementById('loans-section').classList.add('hidden');
        const maintenanceSection = document.getElementById('maintenance-section');
        const reservationsSection = document.getElementById('reservations-section');
        if (maintenanceSection) maintenanceSection.classList.add('hidden');
        if (reservationsSection) reservationsSection.classList.add('hidden');
        
        // Show selected section
        switch(sectionName) {
            case 'overview':
                document.getElementById('equipment-section').classList.remove('hidden');
                document.getElementById('users-section').classList.remove('hidden');
                break;
            case 'equipment':
                document.getElementById('equipment-section').classList.remove('hidden');
                break;
            case 'users':
                document.getElementById('users-section').classList.remove('hidden');
                break;
            case 'loans':
                document.getElementById('loans-section').classList.remove('hidden');
                break;
            case 'maintenance':
                if (maintenanceSection) {
                    maintenanceSection.classList.remove('hidden');
                    loadMaintenance();
                }
                break;
            case 'reservations':
                if (reservationsSection) {
                    reservationsSection.classList.remove('hidden');
                    loadReservations();
                }
                break;
        }
        currentSection = sectionName;
    };
    
    // Default to overview
    window.showSection('overview');
}

// --- Equipment Functions ---

async function loadEquipment() {
    const loadingEl = document.getElementById('equipment-loading-admin');
    const tableBody = document.getElementById("availableEquipmentTable")?.querySelector("tbody");
    
    if (loadingEl) loadingEl.style.display = 'block';
    if (tableBody) tableBody.innerHTML = '';

    try {
        const response = await searchEquipmentAdmin(equipmentSearchParams);
        allEquipment = response.content || response || [];
        equipmentPage = response.number !== undefined ? response.number : 0;
        equipmentTotalPages = response.totalPages !== undefined ? response.totalPages : 1;
        equipmentTotalElements = response.totalElements !== undefined ? response.totalElements : allEquipment.length;

        if (tableBody) {
            tableBody.innerHTML = allEquipment.map(item => `
                <tr>
                    <td>${item.id}</td>
                    <td><span class="font-medium">${item.inventarnummer || 'N/A'}</span></td>
                    <td>${item.bezeichnung || 'N/A'}</td>
                    <td>${item.category || 'N/A'}</td>
                    <td><span class="badge ${getStatusBadgeClass(item.status)}">${item.status || 'N/A'}</span></td>
                    <td>
                        <button onclick="handleDeleteEquipment(${item.id})" class="btn btn-ghost btn-small text-error">Delete</button>
                    </td>
                </tr>
            `).join("");
        }

        document.getElementById("total-equipment-count").textContent = equipmentTotalElements;
        renderEquipmentPagination();
    } catch (error) {
        console.error("Failed to load equipment", error);
        notifications.error("Failed to load equipment: " + error.message);
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-secondary">Failed to load equipment. Please try again.</td></tr>`;
        }
    } finally {
        if (loadingEl) loadingEl.style.display = 'none';
    }
}

function renderEquipmentPagination() {
    const paginationEl = document.getElementById('equipment-pagination-admin');
    if (!paginationEl || equipmentTotalPages <= 1) {
        if (paginationEl) paginationEl.style.display = 'none';
        return;
    }

    paginationEl.style.display = 'flex';
    paginationEl.innerHTML = `
        <div class="pagination">
            <button class="btn btn-ghost btn-small" ${equipmentPage === 0 ? 'disabled' : ''} onclick="goToEquipmentPage(${equipmentPage - 1})">Previous</button>
            <span class="pagination-info">Page ${equipmentPage + 1} of ${equipmentTotalPages} (${equipmentTotalElements} items)</span>
            <button class="btn btn-ghost btn-small" ${equipmentPage >= equipmentTotalPages - 1 ? 'disabled' : ''} onclick="goToEquipmentPage(${equipmentPage + 1})">Next</button>
        </div>
    `;
}

window.goToEquipmentPage = (page) => {
    if (page >= 0 && page < equipmentTotalPages) {
        equipmentSearchParams.page = page;
        loadEquipment();
    }
};

window.handleAddEquipment = async () => {
    const form = document.getElementById("addEquipmentForm");
    const inventarnummer = document.getElementById("inventarnummer").value;
    const bezeichnung = document.getElementById("bezeichnung").value;

    try {
        await addEquipment({ inventarnummer, bezeichnung });
        window.closeAddEquipmentModal();
        form.reset();
        notifications.success("Equipment added successfully!");
        await loadEquipment();
        await updateStats();
    } catch (error) {
        notifications.error("Failed to add equipment: " + error.message);
    }
};

window.handleDeleteEquipment = async (id) => {
    if (!confirm("Are you sure you want to delete this equipment?")) return;
    
    try {
        await deleteEquipment(id);
        notifications.success("Equipment deleted successfully!");
        await loadEquipment();
        await updateStats();
    } catch (error) {
        notifications.error("Failed to delete equipment: " + error.message);
    }
};

// --- User Functions ---

async function loadUsers() {
    const loadingEl = document.getElementById('users-loading-admin');
    const tableBody = document.getElementById("usersTable")?.querySelector("tbody");
    
    if (loadingEl) loadingEl.style.display = 'block';
    if (tableBody) tableBody.innerHTML = '';

    try {
        const response = await searchUsers(usersSearchParams);
        allUsers = response.content || response || [];
        usersPage = response.number !== undefined ? response.number : 0;
        usersTotalPages = response.totalPages !== undefined ? response.totalPages : 1;
        usersTotalElements = response.totalElements !== undefined ? response.totalElements : allUsers.length;

        if (tableBody) {
            tableBody.innerHTML = allUsers.map(user => `
                <tr>
                    <td>${user.id}</td>
                    <td>
                        <div class="flex-center" style="justify-content: flex-start; gap: 8px;">
                            <div class="avatar-placeholder" style="width: 24px; height: 24px; background: var(--accent-color); border-radius: 50%; color: white; font-size: 12px; display: flex; align-items: center; justify-content: center;">
                                ${user.benutzername?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            ${user.benutzername || 'N/A'}
                        </div>
                    </td>
                    <td>${(user.vorname || '') + ' ' + (user.nachname || '')}</td>
                    <td><span class="badge ${user.role === 'ADMIN' ? 'badge-warning' : 'badge-success'}">${user.role || 'USER'}</span></td>
                    <td><span class="badge ${getAccountStatusBadgeClass(user.accountStatus)}">${user.accountStatus || 'ACTIVE'}</span></td>
                    <td>
                        <button onclick="handleDeleteUser(${user.id})" class="btn btn-ghost btn-small text-error">Delete</button>
                    </td>
                </tr>
            `).join("");
        }

        document.getElementById("total-users-count").textContent = usersTotalElements;
        renderUsersPagination();
    } catch (error) {
        console.error("Failed to load users", error);
        notifications.error("Failed to load users: " + error.message);
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-secondary">Failed to load users. Please try again.</td></tr>`;
        }
    } finally {
        if (loadingEl) loadingEl.style.display = 'none';
    }
}

function renderUsersPagination() {
    const paginationEl = document.getElementById('users-pagination-admin');
    if (!paginationEl || usersTotalPages <= 1) {
        if (paginationEl) paginationEl.style.display = 'none';
        return;
    }

    paginationEl.style.display = 'flex';
    paginationEl.innerHTML = `
        <div class="pagination">
            <button class="btn btn-ghost btn-small" ${usersPage === 0 ? 'disabled' : ''} onclick="goToUsersPage(${usersPage - 1})">Previous</button>
            <span class="pagination-info">Page ${usersPage + 1} of ${usersTotalPages} (${usersTotalElements} items)</span>
            <button class="btn btn-ghost btn-small" ${usersPage >= usersTotalPages - 1 ? 'disabled' : ''} onclick="goToUsersPage(${usersPage + 1})">Next</button>
        </div>
    `;
}

window.goToUsersPage = (page) => {
    if (page >= 0 && page < usersTotalPages) {
        usersSearchParams.page = page;
        loadUsers();
    }
};

window.handleDeleteUser = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    
    try {
        await deleteUser(id);
        notifications.success("User deleted successfully!");
        await loadUsers();
        await updateStats();
    } catch (error) {
        notifications.error("Failed to delete user: " + error.message);
    }
};

// --- Loan Functions ---

async function loadLoans() {
    const loadingEl = document.getElementById('loans-loading-admin');
    const tableBody = document.getElementById("currentLoansTable")?.querySelector("tbody");
    
    if (loadingEl) loadingEl.style.display = 'block';
    if (tableBody) tableBody.innerHTML = '';

    try {
        allLoans = await getCurrentLoans();
        
        if (tableBody) {
            tableBody.innerHTML = allLoans.map(loan => `
                <tr>
                    <td>${loan.id}</td>
                    <td>${loan.benutzer?.benutzername || 'Unknown'}</td>
                    <td>${loan.equipment?.bezeichnung || 'Unknown'}</td>
                    <td>${loan.ausleihe ? new Date(loan.ausleihe).toLocaleDateString() : 'N/A'}</td>
                    <td><span class="badge ${loan.rueckgabe ? 'badge-success' : 'badge-warning'}">${loan.rueckgabe ? 'Returned' : 'Active'}</span></td>
                </tr>
            `).join("");
        }

        document.getElementById("active-loans-count").textContent = allLoans.length;
    } catch (error) {
        console.error("Failed to load loans", error);
        notifications.error("Failed to load loans: " + error.message);
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-secondary">Failed to load loans. Please try again.</td></tr>`;
        }
    } finally {
        if (loadingEl) loadingEl.style.display = 'none';
    }
}

// --- Stats Functions ---

async function updateStats() {
    // Stats are updated in individual load functions
}

// Helper functions
function getStatusBadgeClass(status) {
    switch(status?.toUpperCase()) {
        case 'AVAILABLE': return 'badge-success';
        case 'BORROWED': return 'badge-warning';
        case 'MAINTENANCE': return 'badge-error';
        default: return 'badge-secondary';
    }
}

function getAccountStatusBadgeClass(status) {
    switch(status?.toUpperCase()) {
        case 'ACTIVE': return 'badge-success';
        case 'INACTIVE': return 'badge-secondary';
        case 'SUSPENDED': return 'badge-error';
        default: return 'badge-success';
    }
}

// --- Maintenance Functions ---

async function loadMaintenance() {
    const loadingEl = document.getElementById('maintenance-loading-admin');
    const tableBody = document.getElementById("maintenanceTable")?.querySelector("tbody");
    
    if (loadingEl) loadingEl.style.display = 'block';
    if (tableBody) tableBody.innerHTML = '';

    try {
        allMaintenance = await getScheduledMaintenance();
        
        if (tableBody) {
            if (allMaintenance.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-secondary">No scheduled maintenance found.</td></tr>`;
            } else {
                tableBody.innerHTML = allMaintenance.map(maintenance => `
                    <tr>
                        <td>${maintenance.id}</td>
                        <td>${maintenance.equipment?.bezeichnung || 'N/A'} (${maintenance.equipment?.inventarnummer || 'N/A'})</td>
                        <td>${maintenance.type || 'N/A'}</td>
                        <td>${maintenance.scheduledDate ? new Date(maintenance.scheduledDate).toLocaleDateString() : 'N/A'}</td>
                        <td><span class="badge ${getMaintenanceStatusBadgeClass(maintenance.status)}">${maintenance.status || 'N/A'}</span></td>
                        <td>
                            ${maintenance.status === 'SCHEDULED' ? `
                                <button onclick="handleStartMaintenance(${maintenance.id})" class="btn btn-ghost btn-small">Start</button>
                            ` : ''}
                            ${maintenance.status === 'IN_PROGRESS' ? `
                                <button onclick="handleCompleteMaintenance(${maintenance.id})" class="btn btn-ghost btn-small">Complete</button>
                            ` : ''}
                        </td>
                    </tr>
                `).join("");
            }
        }
    } catch (error) {
        console.error("Failed to load maintenance", error);
        notifications.error("Failed to load maintenance: " + error.message);
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-secondary">Failed to load maintenance. Please try again.</td></tr>`;
        }
    } finally {
        if (loadingEl) loadingEl.style.display = 'none';
    }
}

function getMaintenanceStatusBadgeClass(status) {
    switch(status?.toUpperCase()) {
        case 'SCHEDULED': return 'badge-secondary';
        case 'IN_PROGRESS': return 'badge-warning';
        case 'COMPLETED': return 'badge-success';
        case 'CANCELLED': return 'badge-error';
        case 'OVERDUE': return 'badge-error';
        default: return 'badge-secondary';
    }
}

window.handleStartMaintenance = async (id) => {
    try {
        await startMaintenance(id);
        notifications.success("Maintenance started successfully!");
        await loadMaintenance();
        await loadEquipment();
    } catch (error) {
        notifications.error("Failed to start maintenance: " + error.message);
    }
};

window.handleCompleteMaintenance = async (id) => {
    try {
        await completeMaintenance(id);
        notifications.success("Maintenance completed successfully!");
        await loadMaintenance();
        await loadEquipment();
    } catch (error) {
        notifications.error("Failed to complete maintenance: " + error.message);
    }
};

window.openScheduleMaintenanceModal = () => {
    document.getElementById('schedule-maintenance-modal').classList.add('show');
};

window.closeScheduleMaintenanceModal = () => {
    document.getElementById('schedule-maintenance-modal').classList.remove('show');
};

window.handleScheduleMaintenance = async () => {
    const form = document.getElementById("scheduleMaintenanceForm");
    const equipmentId = parseInt(document.getElementById("maintenance-equipment-id").value);
    const type = document.getElementById("maintenance-type").value;
    const description = document.getElementById("maintenance-description").value;
    const scheduledDate = document.getElementById("maintenance-scheduled-date").value;
    const cost = document.getElementById("maintenance-cost").value;

    try {
        await scheduleMaintenance({
            equipmentId,
            type,
            description,
            scheduledDate,
            cost: cost ? parseFloat(cost) : null
        });
        window.closeScheduleMaintenanceModal();
        form.reset();
        notifications.success("Maintenance scheduled successfully!");
        await loadMaintenance();
        await loadEquipment();
    } catch (error) {
        notifications.error("Failed to schedule maintenance: " + error.message);
    }
};

// --- Reservation Functions ---

async function loadReservations() {
    const loadingEl = document.getElementById('reservations-loading-admin');
    const tableBody = document.getElementById("reservationsTable")?.querySelector("tbody");
    
    if (loadingEl) loadingEl.style.display = 'block';
    if (tableBody) tableBody.innerHTML = '';

    try {
        allReservations = await getAllReservations();
        
        if (tableBody) {
            if (allReservations.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-secondary">No reservations found.</td></tr>`;
            } else {
                tableBody.innerHTML = allReservations.map(reservation => `
                    <tr>
                        <td>${reservation.id}</td>
                        <td>${reservation.benutzer?.benutzername || 'N/A'}</td>
                        <td>${reservation.equipment?.bezeichnung || 'N/A'} (${reservation.equipment?.inventarnummer || 'N/A'})</td>
                        <td>${reservation.startDate ? new Date(reservation.startDate).toLocaleDateString() : 'N/A'}</td>
                        <td>${reservation.endDate ? new Date(reservation.endDate).toLocaleDateString() : 'N/A'}</td>
                        <td><span class="badge ${getReservationStatusBadgeClass(reservation.status)}">${reservation.status || 'N/A'}</span></td>
                        <td>
                            ${reservation.status === 'PENDING' ? `
                                <button onclick="handleConfirmReservation(${reservation.id})" class="btn btn-ghost btn-small">Confirm</button>
                            ` : ''}
                        </td>
                    </tr>
                `).join("");
            }
        }
    } catch (error) {
        console.error("Failed to load reservations", error);
        notifications.error("Failed to load reservations: " + error.message);
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-secondary">Failed to load reservations. Please try again.</td></tr>`;
        }
    } finally {
        if (loadingEl) loadingEl.style.display = 'none';
    }
}

function getReservationStatusBadgeClass(status) {
    switch(status?.toUpperCase()) {
        case 'PENDING': return 'badge-secondary';
        case 'CONFIRMED': return 'badge-success';
        case 'ACTIVE': return 'badge-warning';
        case 'COMPLETED': return 'badge-success';
        case 'CANCELLED': return 'badge-error';
        case 'EXPIRED': return 'badge-error';
        default: return 'badge-secondary';
    }
}

window.handleConfirmReservation = async (id) => {
    try {
        await confirmReservation(id);
        notifications.success("Reservation confirmed successfully!");
        await loadReservations();
    } catch (error) {
        notifications.error("Failed to confirm reservation: " + error.message);
    }
};
