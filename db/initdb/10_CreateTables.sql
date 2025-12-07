DROP TABLE IF EXISTS logItem;
DROP TABLE IF EXISTS ausleihe;
DROP TABLE IF EXISTS equipment;
DROP TABLE IF EXISTS benutzer;

-- =====================================================
-- BENUTZER (User) TABLE
-- =====================================================
CREATE TABLE benutzer (
    id INT AUTO_INCREMENT PRIMARY KEY,
    benutzername VARCHAR(20) NOT NULL,
    vorname VARCHAR(20) NOT NULL,
    nachname VARCHAR(20) NOT NULL,
    email VARCHAR(100) NULL,
    password_hash VARBINARY(1000) NOT NULL,
    password_salt VARBINARY(1000) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    account_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    two_factor_secret VARCHAR(128),
    recovery_codes VARCHAR(2048),
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT name_unique UNIQUE (benutzername),
    CONSTRAINT email_unique UNIQUE (email)
) CHARACTER SET utf8mb4;

CREATE INDEX idx_benutzer_email ON benutzer(email);
CREATE INDEX idx_benutzer_account_status ON benutzer(account_status);
CREATE INDEX idx_benutzer_role ON benutzer(role);

-- =====================================================
-- EQUIPMENT TABLE
-- =====================================================
CREATE TABLE equipment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inventarnummer VARCHAR(20) NOT NULL,
    bezeichnung VARCHAR(20) NOT NULL,
    description TEXT NULL,
    category VARCHAR(30) NOT NULL DEFAULT 'OTHER',
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    condition_status VARCHAR(20) NOT NULL DEFAULT 'GOOD',
    location VARCHAR(100) NULL,
    serial_number VARCHAR(50) NULL,
    purchase_date DATE NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT bezeichnung_unique UNIQUE (inventarnummer)
) CHARACTER SET utf8mb4;

CREATE INDEX idx_equipment_category ON equipment(category);
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_equipment_condition ON equipment(condition_status);
CREATE INDEX idx_equipment_location ON equipment(location);
CREATE INDEX idx_equipment_serial ON equipment(serial_number);

-- =====================================================
-- AUSLEIHE (Loan) TABLE
-- =====================================================
CREATE TABLE ausleihe (
    id INT AUTO_INCREMENT PRIMARY KEY,
    benutzer_id INT NOT NULL,
    equipment_id INT NOT NULL,
    ausleihe TIMESTAMP NOT NULL,
    expected_return_date DATE NULL,
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (benutzer_id) REFERENCES benutzer(id),
    FOREIGN KEY (equipment_id) REFERENCES equipment(id),
    CONSTRAINT equipment_unique UNIQUE (equipment_id),
    CONSTRAINT ausleihe_unique UNIQUE (benutzer_id, equipment_id)
) CHARACTER SET utf8mb4;

CREATE INDEX idx_ausleihe_expected_return ON ausleihe(expected_return_date);
CREATE INDEX idx_ausleihe_benutzer ON ausleihe(benutzer_id);

-- =====================================================
-- LOGITEM (Audit) TABLE
-- =====================================================
CREATE TABLE logitem (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action_type VARCHAR(20) NOT NULL DEFAULT 'BORROW',
    benutzername VARCHAR(20) NOT NULL,
    benutzer_id INT NULL,
    equipmentinventarnummer VARCHAR(20) NOT NULL,
    equipmentbezeichnung VARCHAR(20) NOT NULL,
    equipment_id INT NULL,
    ausleihdatum TIMESTAMP NOT NULL,
    rueckgabedatum TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4;

CREATE INDEX idx_logitem_action ON logitem(action_type);
CREATE INDEX idx_logitem_benutzer ON logitem(benutzer_id);
CREATE INDEX idx_logitem_equipment ON logitem(equipment_id);
CREATE INDEX idx_logitem_ausleihdatum ON logitem(ausleihdatum);
CREATE INDEX idx_logitem_rueckgabedatum ON logitem(rueckgabedatum);
