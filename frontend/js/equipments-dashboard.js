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
        if (userInfoEl) {
            userInfoEl.textContent = `Logged in as ${decoded.sub}`;
        }
    }
}

async function refreshData() {
    try {
        const [available, borrowed] = await Promise.all([
            getAvailableEquipment(),
            getMyBorrowedEquipment()
        ]);
        
        availableEquipment = available;
        borrowedEquipment = borrowed;
        
        renderAvailableGrid();
        renderBorrowedGrid();
    } catch (error) {
        console.error("Failed to load data", error);
    }
}

function renderAvailableGrid() {
    const grid = document.getElementById("available-equipment-grid");
    if (!grid) return;
    
    if (availableEquipment.length === 0) {
        grid.innerHTML = `
            <div class="text-center py-xl" style="grid-column: 1/-1;">
                <p>No equipment currently available.</p>
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
            <div class="text-center py-xl" style="grid-column: 1/-1;">
                <p class="text-secondary">You haven't borrowed any equipment yet.</p>
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
