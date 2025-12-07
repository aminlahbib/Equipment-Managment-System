import { searchEquipment, getMyBorrowedEquipment, borrowEquipment, returnEquipment, createReservation, getMyReservations, cancelReservation, getLoanRules } from './api.js';
import { decodeToken } from './utilities.js';
import notifications from './notifications.js';
import { exportToCSV, flattenEquipmentData, flattenLoanData } from './export.js';

// Global state
let availableEquipment = [];
let borrowedEquipment = [];
let reservations = [];
let loanRules = null;
let currentPage = 0;
let totalPages = 0;
let totalElements = 0;
let searchParams = {
    searchTerm: '',
    category: '',
    status: 'AVAILABLE', // Only show available equipment to users
    page: 0,
    size: 12,
    sortBy: 'bezeichnung',
    sortDirection: 'ASC'
};

// Initialize immediately since DOM is already loaded by router
initDashboard();

// Also expose init function for router to call
window.initDashboard = async () => {
    displayUserInfo();
    setupEventListeners();
    await loadLoanRules();
    await refreshData();
    await loadReservations();
};

function displayUserInfo() {
    const token = sessionStorage.getItem("authentication_token");
    if (token) {
        const decoded = decodeToken(token);
        const userInfoEl = document.getElementById("user-info");
        const userNameEl = document.getElementById("user-full-name");

        if (userInfoEl) {
            userInfoEl.textContent = `Welcome back, ${decoded.benutzername || decoded.sub}!`;
        }
        if (userNameEl) {
            userNameEl.textContent = decoded.benutzername || decoded.sub;
        }
    }
}

function setupEventListeners() {
    // Search input with debounce
    const searchInput = document.getElementById('equipment-search');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchParams.searchTerm = e.target.value;
                searchParams.page = 0; // Reset to first page
                loadAvailableEquipment();
            }, 300);
        });
    }

    // Category filter
    const categoryFilter = document.getElementById('equipment-category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            searchParams.category = e.target.value;
            searchParams.page = 0;
            loadAvailableEquipment();
        });
    }

    // Status filter (should always be AVAILABLE for users, but keeping for consistency)
    const statusFilter = document.getElementById('equipment-status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', (e) => {
            searchParams.status = e.target.value || 'AVAILABLE';
            searchParams.page = 0;
            loadAvailableEquipment();
        });
    }

    // Sort control
    const sortControl = document.getElementById('equipment-sort');
    if (sortControl) {
        sortControl.addEventListener('change', (e) => {
            const [sortBy, sortDirection] = e.target.value.split(':');
            searchParams.sortBy = sortBy;
            searchParams.sortDirection = sortDirection;
            searchParams.page = 0;
            loadAvailableEquipment();
        });
    }

    // Clear filters button
    const clearFilters = document.getElementById('clear-filters');
    if (clearFilters) {
        clearFilters.addEventListener('click', () => {
            searchParams.searchTerm = '';
            searchParams.category = '';
            searchParams.status = 'AVAILABLE';
            searchParams.page = 0;
            
            if (searchInput) searchInput.value = '';
            if (categoryFilter) categoryFilter.value = '';
            if (statusFilter) statusFilter.value = '';
            
            loadAvailableEquipment();
        });
    }

    // Export buttons
    const exportEquipmentBtn = document.getElementById('export-equipment-csv');
    if (exportEquipmentBtn) {
        exportEquipmentBtn.addEventListener('click', () => {
            try {
                const flattened = flattenEquipmentData(availableEquipment);
                exportToCSV(flattened, `equipment-export-${new Date().toISOString().split('T')[0]}.csv`);
                notifications.success('Equipment data exported successfully!');
            } catch (error) {
                notifications.error('Failed to export equipment: ' + error.message);
            }
        });
    }

    const exportLoansBtn = document.getElementById('export-loans-csv');
    if (exportLoansBtn) {
        exportLoansBtn.addEventListener('click', () => {
            try {
                const flattened = flattenLoanData(borrowedEquipment);
                exportToCSV(flattened, `loans-export-${new Date().toISOString().split('T')[0]}.csv`);
                notifications.success('Loan data exported successfully!');
            } catch (error) {
                notifications.error('Failed to export loans: ' + error.message);
            }
        });
    }
}

function updateStats() {
    const availableCountEl = document.getElementById("available-count");
    const borrowedCountEl = document.getElementById("borrowed-count");

    if (availableCountEl) {
        availableCountEl.textContent = totalElements || availableEquipment.length;
    }
    if (borrowedCountEl) {
        borrowedCountEl.textContent = borrowedEquipment.length;
    }
}

async function loadAvailableEquipment() {
    const loadingEl = document.getElementById('equipment-loading');
    const grid = document.getElementById("available-equipment-grid");
    
    if (loadingEl) loadingEl.style.display = 'block';
    if (grid) grid.style.display = 'none';

    try {
        const response = await searchEquipment(searchParams);
        availableEquipment = response.content || response || [];
        currentPage = response.number !== undefined ? response.number : 0;
        totalPages = response.totalPages !== undefined ? response.totalPages : 1;
        totalElements = response.totalElements !== undefined ? response.totalElements : availableEquipment.length;

        updateStats();
        renderAvailableGrid();
        renderPagination();
    } catch (error) {
        console.error("Failed to load equipment", error);
        notifications.error("Failed to load equipment: " + error.message);
        if (grid) {
            grid.innerHTML = `
                <div class="text-center py-xl" style="grid-column: 1/-1;">
                    <p>Failed to load equipment data. Please try again.</p>
                    <p class="text-secondary">${error.message}</p>
                </div>
            `;
        }
    } finally {
        if (loadingEl) loadingEl.style.display = 'none';
        if (grid) grid.style.display = 'grid';
    }
}

async function loadBorrowedEquipment() {
    try {
        borrowedEquipment = await getMyBorrowedEquipment();
        renderBorrowedGrid();
        updateStats();
    } catch (error) {
        console.error("Failed to load borrowed equipment", error);
        notifications.error("Failed to load loan data: " + error.message);
        const grid = document.getElementById("borrowed-equipment-grid");
        if (grid) {
            grid.innerHTML = `
                <div class="text-center py-xl" style="grid-column: 1/-1;">
                    <p>Failed to load loan data. Please try again.</p>
                    <p class="text-secondary">${error.message}</p>
                </div>
            `;
        }
    }
}

async function refreshData() {
    await Promise.all([
        loadAvailableEquipment(),
        loadBorrowedEquipment()
    ]);
}

async function loadLoanRules() {
    try {
        loanRules = await getLoanRules();
    } catch (error) {
        console.error("Failed to load loan rules", error);
    }
}

async function loadReservations() {
    const loadingEl = document.getElementById('reservations-loading');
    const grid = document.getElementById("reservations-grid");
    
    if (loadingEl) loadingEl.style.display = 'block';
    if (grid) grid.style.display = 'none';

    try {
        reservations = await getMyReservations();
        renderReservationsGrid();
    } catch (error) {
        console.error("Failed to load reservations", error);
        notifications.error("Failed to load reservations: " + error.message);
        if (grid) {
            grid.innerHTML = `
                <div class="text-center py-xl" style="grid-column: 1/-1;">
                    <p>Failed to load reservations. Please try again.</p>
                    <p class="text-secondary">${error.message}</p>
                </div>
            `;
        }
    } finally {
        if (loadingEl) loadingEl.style.display = 'none';
        if (grid) grid.style.display = 'grid';
    }
}

function renderReservationsGrid() {
    const grid = document.getElementById("reservations-grid");
    if (!grid) return;

    if (reservations.length === 0) {
        grid.innerHTML = `
            <div class="card empty-state-card" style="grid-column: 1/-1;">
                <div class="empty-state-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                </div>
                <h3>No Reservations</h3>
                <p>You haven't made any reservations yet. Reserve equipment for future use.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = reservations.map(reservation => `
        <div class="card card-hover equipment-card slide-up">
            <div class="equipment-image-placeholder" style="background-color: rgba(0, 113, 227, 0.1); color: var(--accent-color);">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
            </div>
            <div class="equipment-details">
                <h3 style="font-size: 18px; margin-bottom: 4px;">${reservation.equipment?.bezeichnung || 'Unknown Equipment'}</h3>
                <p class="text-secondary" style="font-size: 14px; margin-bottom: 8px;">ID: ${reservation.equipment?.inventarnummer || 'N/A'}</p>
                <span class="badge ${getReservationStatusBadgeClass(reservation.status)}">${reservation.status || 'PENDING'}</span>
                <p class="text-secondary mt-sm" style="font-size: 12px;">
                    ${reservation.startDate ? `Start: ${new Date(reservation.startDate).toLocaleDateString()}` : ''}
                    ${reservation.endDate ? `<br>End: ${new Date(reservation.endDate).toLocaleDateString()}` : ''}
                </p>
            </div>
            <div class="equipment-actions">
                ${reservation.status === 'PENDING' || reservation.status === 'CONFIRMED' ? `
                    <button onclick="handleCancelReservation(${reservation.id})" class="btn btn-secondary btn-small" style="width: 100%;">Cancel</button>
                ` : ''}
            </div>
        </div>
    `).join("");
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

window.openReservationModal = () => {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    const startDateInput = document.getElementById('reservation-start-date');
    if (startDateInput) {
        startDateInput.min = today;
    }
    const endDateInput = document.getElementById('reservation-end-date');
    if (endDateInput) {
        endDateInput.min = today;
    }
    document.getElementById('reservation-modal').classList.add('show');
};

window.closeReservationModal = () => {
    document.getElementById('reservation-modal').classList.remove('show');
    document.getElementById('reservationForm').reset();
};

window.handleCreateReservation = async () => {
    const form = document.getElementById("reservationForm");
    const equipmentId = parseInt(document.getElementById("reservation-equipment-id").value);
    const startDate = document.getElementById("reservation-start-date").value;
    const endDate = document.getElementById("reservation-end-date").value;
    const notes = document.getElementById("reservation-notes").value;

    try {
        await createReservation({
            equipmentId,
            startDate,
            endDate: endDate || null,
            notes: notes || null
        });
        window.closeReservationModal();
        notifications.success("Reservation created successfully!");
        await loadReservations();
    } catch (error) {
        notifications.error("Failed to create reservation: " + error.message);
    }
};

window.handleCancelReservation = async (id) => {
    if (!confirm("Are you sure you want to cancel this reservation?")) return;
    
    try {
        await cancelReservation(id);
        notifications.success("Reservation cancelled successfully!");
        await loadReservations();
    } catch (error) {
        notifications.error("Failed to cancel reservation: " + error.message);
    }
};

function renderAvailableGrid() {
    const grid = document.getElementById("available-equipment-grid");
    if (!grid) return;

    if (availableEquipment.length === 0) {
        grid.innerHTML = `
            <div class="card empty-state-card" style="grid-column: 1/-1;">
                <div class="empty-state-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                        <rect x="2" y="4" width="20" height="16" rx="3"/>
                        <circle cx="12" cy="14" r="2"/>
                        <path d="M7 8h10"/>
                    </svg>
                </div>
                <h3>No Equipment Found</h3>
                <p>${searchParams.searchTerm || searchParams.category ? 'Try adjusting your search or filters.' : 'All equipment is currently borrowed. Check back later or contact your administrator.'}</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = availableEquipment.map(item => `
        <div class="card card-hover equipment-card slide-up">
            <div class="equipment-image-placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                    <rect x="2" y="4" width="20" height="16" rx="3"/>
                    <circle cx="12" cy="14" r="2"/>
                    <path d="M7 8h10"/>
                </svg>
            </div>
            <div class="equipment-details">
                <h3 style="font-size: 18px; margin-bottom: 4px;">${item.bezeichnung || 'Unnamed Equipment'}</h3>
                <p class="text-secondary" style="font-size: 14px; margin-bottom: 8px;">ID: ${item.inventarnummer || 'N/A'}</p>
                ${item.category ? `<p class="text-secondary" style="font-size: 12px; margin-bottom: 4px;">${item.category}</p>` : ''}
                <span class="badge badge-success">Available</span>
            </div>
            <div class="equipment-actions">
                <button onclick="handleBorrow('${item.id}')" class="btn btn-primary btn-small" style="width: 100%;">Borrow</button>
            </div>
        </div>
    `).join("");
}

function renderBorrowedGrid() {
    const grid = document.getElementById("borrowed-equipment-grid");
    if (!grid) return;

    if (borrowedEquipment.length === 0) {
        grid.innerHTML = `
            <div class="card empty-state-card" style="grid-column: 1/-1;">
                <div class="empty-state-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                    </svg>
                </div>
                <h3>No Active Loans</h3>
                <p>You haven't borrowed any equipment yet. Browse available equipment above and borrow what you need.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = borrowedEquipment.map(item => `
        <div class="card card-hover equipment-card slide-up">
            <div class="equipment-image-placeholder" style="background-color: rgba(255, 159, 10, 0.1); color: var(--warning-color);">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                    <rect x="2" y="4" width="20" height="16" rx="3"/>
                    <path d="M12 8v4l3 3"/>
                </svg>
            </div>
            <div class="equipment-details">
                <h3 style="font-size: 18px; margin-bottom: 4px;">${item.equipment?.bezeichnung || 'Unknown Equipment'}</h3>
                <p class="text-secondary" style="font-size: 14px; margin-bottom: 8px;">ID: ${item.equipment?.inventarnummer || 'N/A'}</p>
                <span class="badge badge-warning">Borrowed</span>
                <p class="text-secondary mt-sm" style="font-size: 12px;">Borrowed on: ${new Date(item.ausleihe).toLocaleDateString()}</p>
            </div>
            <div class="equipment-actions">
                <button onclick="handleReturn('${item.equipment.id}')" class="btn btn-secondary btn-small" style="width: 100%;">Return</button>
            </div>
        </div>
    `).join("");
}

function renderPagination() {
    const paginationEl = document.getElementById('equipment-pagination');
    if (!paginationEl || totalPages <= 1) {
        if (paginationEl) paginationEl.style.display = 'none';
        return;
    }

    paginationEl.style.display = 'flex';
    paginationEl.innerHTML = `
        <div class="pagination">
            <button 
                class="btn btn-ghost btn-small" 
                ${currentPage === 0 ? 'disabled' : ''} 
                onclick="goToPage(${currentPage - 1})"
            >
                Previous
            </button>
            <span class="pagination-info">
                Page ${currentPage + 1} of ${totalPages} (${totalElements} items)
            </span>
            <button 
                class="btn btn-ghost btn-small" 
                ${currentPage >= totalPages - 1 ? 'disabled' : ''} 
                onclick="goToPage(${currentPage + 1})"
            >
                Next
            </button>
        </div>
    `;
}

window.goToPage = (page) => {
    if (page >= 0 && page < totalPages) {
        searchParams.page = page;
        loadAvailableEquipment();
        // Scroll to top of equipment section
        document.getElementById('available-equipment-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

// Expose handlers to window
window.handleBorrow = async (id) => {
    try {
        await borrowEquipment(id);
        notifications.success("Equipment borrowed successfully!");
        await refreshData();
    } catch (error) {
        notifications.error("Failed to borrow equipment: " + error.message);
    }
};

window.handleReturn = async (id) => {
    try {
        await returnEquipment(id);
        notifications.success("Equipment returned successfully!");
        await refreshData();
    } catch (error) {
        notifications.error("Failed to return equipment: " + error.message);
    }
};
