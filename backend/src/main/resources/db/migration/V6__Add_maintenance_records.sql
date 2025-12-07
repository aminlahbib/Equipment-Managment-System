-- V6: Add maintenance records table for equipment maintenance scheduling

CREATE TABLE IF NOT EXISTS maintenance_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipment_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    cost DECIMAL(10,2),
    performed_by INT NULL,
    scheduled_date DATE,
    completed_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE,
    FOREIGN KEY (performed_by) REFERENCES benutzer(id) ON DELETE SET NULL,
    INDEX idx_maintenance_equipment (equipment_id),
    INDEX idx_maintenance_status (status),
    INDEX idx_maintenance_scheduled_date (scheduled_date),
    INDEX idx_maintenance_performed_by (performed_by)
);

