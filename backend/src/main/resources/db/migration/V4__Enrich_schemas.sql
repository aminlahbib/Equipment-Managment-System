-- V4: Enrich schemas with additional fields, constraints, and indexes

-- =====================================================
-- BENUTZER (User) TABLE ENHANCEMENTS
-- =====================================================
ALTER TABLE benutzer
    ADD COLUMN email VARCHAR(100) NULL UNIQUE AFTER nachname,
    ADD COLUMN account_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' AFTER role,
    ADD COLUMN last_login TIMESTAMP NULL,
    ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Index for faster lookups
CREATE INDEX idx_benutzer_email ON benutzer(email);
CREATE INDEX idx_benutzer_account_status ON benutzer(account_status);
CREATE INDEX idx_benutzer_role ON benutzer(role);

-- =====================================================
-- EQUIPMENT TABLE ENHANCEMENTS
-- =====================================================
ALTER TABLE equipment
    ADD COLUMN description TEXT NULL AFTER bezeichnung,
    ADD COLUMN category VARCHAR(30) NOT NULL DEFAULT 'OTHER' AFTER description,
    ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE' AFTER category,
    ADD COLUMN condition_status VARCHAR(20) NOT NULL DEFAULT 'GOOD' AFTER status,
    ADD COLUMN location VARCHAR(100) NULL AFTER condition_status,
    ADD COLUMN serial_number VARCHAR(50) NULL AFTER location,
    ADD COLUMN purchase_date DATE NULL AFTER serial_number,
    ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Indexes for equipment filtering/searching
CREATE INDEX idx_equipment_category ON equipment(category);
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_equipment_condition ON equipment(condition_status);
CREATE INDEX idx_equipment_location ON equipment(location);
CREATE INDEX idx_equipment_serial ON equipment(serial_number);

-- =====================================================
-- AUSLEIHE (Loan) TABLE ENHANCEMENTS
-- =====================================================
ALTER TABLE ausleihe
    ADD COLUMN expected_return_date DATE NULL AFTER ausleihe,
    ADD COLUMN notes TEXT NULL AFTER expected_return_date,
    ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Index for due date queries
CREATE INDEX idx_ausleihe_expected_return ON ausleihe(expected_return_date);
CREATE INDEX idx_ausleihe_benutzer ON ausleihe(benutzer_id);

-- =====================================================
-- LOGITEM (Audit) TABLE ENHANCEMENTS
-- =====================================================
ALTER TABLE logitem
    ADD COLUMN action_type VARCHAR(20) NOT NULL DEFAULT 'BORROW' AFTER id,
    ADD COLUMN benutzer_id INT NULL AFTER benutzername,
    ADD COLUMN equipment_id INT NULL AFTER equipmentbezeichnung,
    ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Indexes for audit log queries
CREATE INDEX idx_logitem_action ON logitem(action_type);
CREATE INDEX idx_logitem_benutzer ON logitem(benutzer_id);
CREATE INDEX idx_logitem_equipment ON logitem(equipment_id);
CREATE INDEX idx_logitem_ausleihdatum ON logitem(ausleihdatum);
CREATE INDEX idx_logitem_rueckgabedatum ON logitem(rueckgabedatum);

