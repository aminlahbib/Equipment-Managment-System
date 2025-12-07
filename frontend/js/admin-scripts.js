import {
    getAvailableEquipment,
    addEquipment,
    deleteEquipment,
    getCurrentLoans,
    getLoanHistory,
    getAllUsers,
    deleteUser
} from './api.js';

// Global state
let currentSection = 'overview';

document.addEventListener("DOMContentLoaded", () => {
    initAdminDashboard();
});

// Also expose init function for router to call
window.initAdminDashboard = async () => {
    await loadAllData();
    setupTabs();
};

async function loadAllData() {
    // Show loading state on initial load if needed
    // For now just load everything in parallel
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
            btn.classList.remove('active');
            if (btn.textContent.toLowerCase().includes(sectionName) || 
               (sectionName === 'overview' && btn.textContent.toLowerCase().includes('overview'))) {
                // Add active style manually since btn class doesn't have it by default in components.css
                // Or better, add .active class to components.css
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
        
        // Show selected section
        switch(sectionName) {
            case 'overview':
                document.getElementById('equipment-section').classList.remove('hidden');
                document.getElementById('users-section').classList.remove('hidden');
                // Show summary view (first 5 items)
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
        }
        currentSection = sectionName;
    };
    
    // Default to overview
    window.showSection('overview');
}

// --- Equipment Functions ---

async function loadEquipment() {
    try {
        const equipment = await getAvailableEquipment();
        const tableBody = document.getElementById("availableEquipmentTable").querySelector("tbody");
        if (!tableBody) return;
        
        tableBody.innerHTML = equipment.map(item => `
            <tr>
                <td>${item.id}</td>
                <td><span class="font-medium">${item.inventarnummer}</span></td>
                <td>${item.bezeichnung}</td>
                <td><span class="badge badge-success">Available</span></td>
                <td>
                    <button onclick="handleDeleteEquipment(${item.id})" class="btn btn-ghost btn-small text-error">Delete</button>
                </td>
            </tr>
        `).join("");
        
        // Update count
        document.getElementById("total-equipment-count").textContent = equipment.length;
    } catch (error) {
        console.error("Failed to load equipment", error);
    }
}

window.handleAddEquipment = async () => {
    const form = document.getElementById("addEquipmentForm");
    const inventarnummer = document.getElementById("inventarnummer").value;
    const bezeichnung = document.getElementById("bezeichnung").value;

    try {
        await addEquipment(inventarnummer, bezeichnung);
        window.closeAddEquipmentModal();
        form.reset();
        await loadEquipment(); // Refresh list
        await updateStats();
    } catch (error) {
        alert("Failed to add equipment: " + error.message);
    }
};

window.handleDeleteEquipment = async (id) => {
    if (!confirm("Are you sure you want to delete this equipment?")) return;
    
    try {
        await deleteEquipment(id);
        await loadEquipment();
        await updateStats();
    } catch (error) {
        alert("Failed to delete equipment: " + error.message);
    }
};

// --- User Functions ---

async function loadUsers() {
    try {
        const users = await getAllUsers();
        const tableBody = document.getElementById("usersTable").querySelector("tbody");
        if (!tableBody) return;
        
        tableBody.innerHTML = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td><div class="flex-center" style="justify-content: flex-start; gap: 8px;">
                    <div class="avatar-placeholder" style="width: 24px; height: 24px; background: var(--accent-color); border-radius: 50%; color: white; font-size: 12px; display: flex; align-items: center; justify-content: center;">${user.benutzername.charAt(0).toUpperCase()}</div>
                    ${user.benutzername}
                </div></td>
                <td>${user.vorname} ${user.nachname}</td>
                <td>
                    <button onclick="handleDeleteUser(${user.id})" class="btn btn-ghost btn-small text-error">Delete</button>
                </td>
            </tr>
        `).join("");
        
        // Update count
        document.getElementById("total-users-count").textContent = users.length;
    } catch (error) {
        console.error("Failed to load users", error);
    }
}

window.handleDeleteUser = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    
    try {
        await deleteUser(id);
        await loadUsers();
        await updateStats();
    } catch (error) {
        alert("Failed to delete user: " + error.message);
    }
};

// --- Loan Functions ---

async function loadLoans() {
    try {
        const loans = await getCurrentLoans();
        const tableBody = document.getElementById("currentLoansTable").querySelector("tbody");
        if (!tableBody) return;
        
        tableBody.innerHTML = loans.map(loan => `
            <tr>
                <td>${loan.id}</td>
                <td>${loan.benutzer ? loan.benutzer.benutzername : 'Unknown'}</td>
                <td>${loan.equipment ? loan.equipment.bezeichnung : 'Unknown'}</td>
                <td>${new Date(loan.ausleihe).toLocaleDateString()}</td>
            </tr>
        `).join("");
        
        // Update count
        document.getElementById("active-loans-count").textContent = loans.length;
    } catch (error) {
        console.error("Failed to load loans", error);
    }
}

// --- Stats Functions ---

async function updateStats() {
    // Stats are updated in individual load functions for simplicity
    // Could be aggregated here if needed
}
