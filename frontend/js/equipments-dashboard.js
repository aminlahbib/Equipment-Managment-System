import { getAvailableEquipment, getMyBorrowedEquipment, borrowEquipment, returnEquipment } from './api.js';
import { decodeToken } from './utilities.js';

// Global state
let availableEquipment = [];
let borrowedEquipment = [];

// Initialize immediately since DOM is already loaded by router
initDashboard();

// Also expose init function for router to call
window.initDashboard = async () => {
    displayUserInfo();
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

function updateStats() {
    const availableCountEl = document.getElementById("available-count");
    const borrowedCountEl = document.getElementById("borrowed-count");

    if (availableCountEl) {
        availableCountEl.textContent = availableEquipment.length;
    }
    if (borrowedCountEl) {
        borrowedCountEl.textContent = borrowedEquipment.length;
    }
}

async function refreshData() {
    console.log("refreshData: Starting to fetch data...");
    try {
        console.log("refreshData: Calling getAvailableEquipment...");
        const available = await getAvailableEquipment();
        console.log("refreshData: Available equipment received:", available);

        console.log("refreshData: Calling getMyBorrowedEquipment...");
        const borrowed = await getMyBorrowedEquipment();
        console.log("refreshData: Borrowed equipment received:", borrowed);

        availableEquipment = available;
        borrowedEquipment = borrowed;

        console.log("refreshData: Updating stats and rendering...");
        updateStats();
        renderAvailableGrid();
        renderBorrowedGrid();
        console.log("refreshData: Data loading complete");
    } catch (error) {
        console.error("Failed to load data", error);
        // Show error in UI
        document.getElementById("available-equipment-grid").innerHTML = `
            <div class="text-center py-xl" style="grid-column: 1/-1;">
                <p>Failed to load equipment data. Please try again.</p>
                <p class="text-secondary">${error.message}</p>
            </div>
        `;
        document.getElementById("borrowed-equipment-grid").innerHTML = `
            <div class="text-center py-xl" style="grid-column: 1/-1;">
                <p>Failed to load loan data. Please try again.</p>
                <p class="text-secondary">${error.message}</p>
            </div>
        `;
    }
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
                <h3>No Equipment Available</h3>
                <p>All equipment is currently borrowed. Check back later or contact your administrator.</p>
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
                <h3 style="font-size: 18px; margin-bottom: 4px;">${item.bezeichnung}</h3>
                <p class="text-secondary" style="font-size: 14px; margin-bottom: 8px;">ID: ${item.inventarnummer}</p>
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
                <h3 style="font-size: 18px; margin-bottom: 4px;">${item.equipment.bezeichnung}</h3>
                <p class="text-secondary" style="font-size: 14px; margin-bottom: 8px;">ID: ${item.equipment.inventarnummer}</p>
                <span class="badge badge-warning">Borrowed</span>
                <p class="text-secondary mt-sm" style="font-size: 12px;">Borrowed on: ${new Date(item.ausleihe).toLocaleDateString()}</p>
            </div>
            <div class="equipment-actions">
                <button onclick="handleReturn('${item.equipment.id}')" class="btn btn-secondary btn-small" style="width: 100%;">Return</button>
            </div>
        </div>
    `).join("");
}

// Expose handlers to window
window.handleBorrow = async (id) => {
    try {
        await borrowEquipment(id);
        await refreshData();
    } catch (error) {
        alert("Failed to borrow equipment: " + error.message);
    }
};

window.handleReturn = async (id) => {
    try {
        await returnEquipment(id);
        await refreshData();
    } catch (error) {
        alert("Failed to return equipment: " + error.message);
    }
};
