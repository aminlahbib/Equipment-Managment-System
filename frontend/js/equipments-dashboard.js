import { searchEquipment, getMyBorrowedEquipment, borrowEquipment, returnEquipment } from './api.js';
import { decodeToken } from './utilities.js';
import notifications from './notifications.js';
import { exportToCSV, flattenEquipmentData, flattenLoanData } from './export.js';

// Global state
let availableEquipment = [];
let borrowedEquipment = [];
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
    await refreshData();
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
