/**
 * Data Export Utility
 * Provides CSV and JSON export functionality
 */

export function exportToCSV(data, filename = 'export.csv', headers = null) {
    if (!data || data.length === 0) {
        throw new Error('No data to export');
    }

    // Use provided headers or extract from first object
    const csvHeaders = headers || Object.keys(data[0]);
    
    // Create CSV content
    const csvRows = [];
    
    // Add header row
    csvRows.push(csvHeaders.map(header => escapeCSV(header)).join(','));
    
    // Add data rows
    data.forEach(row => {
        const values = csvHeaders.map(header => {
            const value = getNestedValue(row, header);
            return escapeCSV(value);
        });
        csvRows.push(values.join(','));
    });
    
    // Create blob and download
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, filename);
}

export function exportToJSON(data, filename = 'export.json') {
    if (!data) {
        throw new Error('No data to export');
    }

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    downloadBlob(blob, filename);
}

function escapeCSV(value) {
    if (value === null || value === undefined) {
        return '';
    }
    
    const stringValue = String(value);
    
    // If value contains comma, quote, or newline, wrap in quotes and escape quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    
    return stringValue;
}

function getNestedValue(obj, path) {
    const keys = path.split('.');
    let value = obj;
    
    for (const key of keys) {
        if (value === null || value === undefined) {
            return '';
        }
        value = value[key];
    }
    
    return value === null || value === undefined ? '' : value;
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Helper to flatten equipment data for export
export function flattenEquipmentData(equipment) {
    return equipment.map(item => ({
        'ID': item.id,
        'Inventory Number': item.inventarnummer,
        'Description': item.bezeichnung,
        'Category': item.category || 'N/A',
        'Status': item.status || 'N/A',
        'Condition': item.conditionStatus || 'N/A',
        'Location': item.location || 'N/A',
        'Created': item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'
    }));
}

// Helper to flatten loan data for export
export function flattenLoanData(loans) {
    return loans.map(loan => ({
        'Loan ID': loan.id,
        'Equipment ID': loan.equipment?.id || 'N/A',
        'Equipment Name': loan.equipment?.bezeichnung || 'N/A',
        'Inventory Number': loan.equipment?.inventarnummer || 'N/A',
        'Borrower': loan.benutzer?.benutzername || 'N/A',
        'Borrowed Date': loan.ausleihe ? new Date(loan.ausleihe).toLocaleDateString() : 'N/A',
        'Return Date': loan.rueckgabe ? new Date(loan.rueckgabe).toLocaleDateString() : 'Pending',
        'Status': loan.rueckgabe ? 'Returned' : 'Active'
    }));
}

// Helper to flatten user data for export
export function flattenUserData(users) {
    return users.map(user => ({
        'User ID': user.id,
        'Username': user.benutzername,
        'First Name': user.vorname || 'N/A',
        'Last Name': user.nachname || 'N/A',
        'Email': user.email || 'N/A',
        'Role': user.role || 'USER',
        'Account Status': user.accountStatus || 'ACTIVE',
        '2FA Enabled': user.twoFactorEnabled ? 'Yes' : 'No',
        'Created': user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'
    }));
}

