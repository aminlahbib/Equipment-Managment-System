-- V5: Add performance indexes for frequently queried fields
-- This migration adds indexes to improve query performance
-- Note: MySQL doesn't support IF NOT EXISTS for indexes, so we check first

-- Helper procedure to create index if it doesn't exist
SET @dbname = DATABASE();

-- Indexes for ausleihe table (loans)
-- Index on equipment_id for faster lookups when checking if equipment is borrowed
SET @preparedStatement = (SELECT IF(
    (
        SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_SCHEMA = @dbname
        AND TABLE_NAME = 'ausleihe'
        AND INDEX_NAME = 'idx_ausleihe_equipment'
    ) > 0,
    'SELECT 1',
    'CREATE INDEX idx_ausleihe_equipment ON ausleihe(equipment_id)'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Index on ausleihe date for sorting and filtering by loan date
SET @preparedStatement = (SELECT IF(
    (
        SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_SCHEMA = @dbname
        AND TABLE_NAME = 'ausleihe'
        AND INDEX_NAME = 'idx_ausleihe_date'
    ) > 0,
    'SELECT 1',
    'CREATE INDEX idx_ausleihe_date ON ausleihe(ausleihe)'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Composite index for finding active loans
SET @preparedStatement = (SELECT IF(
    (
        SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_SCHEMA = @dbname
        AND TABLE_NAME = 'ausleihe'
        AND INDEX_NAME = 'idx_ausleihe_active'
    ) > 0,
    'SELECT 1',
    'CREATE INDEX idx_ausleihe_active ON ausleihe(benutzer_id, equipment_id)'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Index for overdue loans query
SET @preparedStatement = (SELECT IF(
    (
        SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_SCHEMA = @dbname
        AND TABLE_NAME = 'ausleihe'
        AND INDEX_NAME = 'idx_ausleihe_overdue'
    ) > 0,
    'SELECT 1',
    'CREATE INDEX idx_ausleihe_overdue ON ausleihe(expected_return_date)'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Indexes for equipment table
-- Composite index for status and category (common filter combination)
SET @preparedStatement = (SELECT IF(
    (
        SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_SCHEMA = @dbname
        AND TABLE_NAME = 'equipment'
        AND INDEX_NAME = 'idx_equipment_status_category'
    ) > 0,
    'SELECT 1',
    'CREATE INDEX idx_equipment_status_category ON equipment(status, category)'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Index on created_at for sorting by newest/oldest
SET @preparedStatement = (SELECT IF(
    (
        SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_SCHEMA = @dbname
        AND TABLE_NAME = 'equipment'
        AND INDEX_NAME = 'idx_equipment_created_at'
    ) > 0,
    'SELECT 1',
    'CREATE INDEX idx_equipment_created_at ON equipment(created_at)'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Index on bezeichnung for text search
SET @preparedStatement = (SELECT IF(
    (
        SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_SCHEMA = @dbname
        AND TABLE_NAME = 'equipment'
        AND INDEX_NAME = 'idx_equipment_bezeichnung'
    ) > 0,
    'SELECT 1',
    'CREATE INDEX idx_equipment_bezeichnung ON equipment(bezeichnung)'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Indexes for benutzer table
-- Index on created_at for sorting users
SET @preparedStatement = (SELECT IF(
    (
        SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_SCHEMA = @dbname
        AND TABLE_NAME = 'benutzer'
        AND INDEX_NAME = 'idx_benutzer_created_at'
    ) > 0,
    'SELECT 1',
    'CREATE INDEX idx_benutzer_created_at ON benutzer(created_at)'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Composite index for active users with role (common admin query)
SET @preparedStatement = (SELECT IF(
    (
        SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_SCHEMA = @dbname
        AND TABLE_NAME = 'benutzer'
        AND INDEX_NAME = 'idx_benutzer_status_role'
    ) > 0,
    'SELECT 1',
    'CREATE INDEX idx_benutzer_status_role ON benutzer(account_status, role)'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Index on last_login for finding recently active users
SET @preparedStatement = (SELECT IF(
    (
        SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_SCHEMA = @dbname
        AND TABLE_NAME = 'benutzer'
        AND INDEX_NAME = 'idx_benutzer_last_login'
    ) > 0,
    'SELECT 1',
    'CREATE INDEX idx_benutzer_last_login ON benutzer(last_login)'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Indexes for log_item table (if exists)
-- Check if log_item table exists before creating indexes
SET @tableExists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'log_item');

-- Index on action_type for filtering audit logs
SET @preparedStatement = (SELECT IF(
    @tableExists = 0 OR (
        SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_SCHEMA = @dbname
        AND TABLE_NAME = 'log_item'
        AND INDEX_NAME = 'idx_log_item_action'
    ) > 0,
    'SELECT 1',
    'CREATE INDEX idx_log_item_action ON log_item(action_type)'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Index on timestamp for time-based queries
SET @preparedStatement = (SELECT IF(
    @tableExists = 0 OR (
        SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_SCHEMA = @dbname
        AND TABLE_NAME = 'log_item'
        AND INDEX_NAME = 'idx_log_item_timestamp'
    ) > 0,
    'SELECT 1',
    'CREATE INDEX idx_log_item_timestamp ON log_item(timestamp)'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Composite index for user activity logs
SET @preparedStatement = (SELECT IF(
    @tableExists = 0 OR (
        SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_SCHEMA = @dbname
        AND TABLE_NAME = 'log_item'
        AND INDEX_NAME = 'idx_log_item_user_action'
    ) > 0,
    'SELECT 1',
    'CREATE INDEX idx_log_item_user_action ON log_item(user_id, action_type, timestamp)'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
