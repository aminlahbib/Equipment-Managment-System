-- V5: Add performance indexes for frequently queried fields
-- This migration adds indexes to improve query performance

-- Indexes for ausleihe table (loans)
-- Index on equipment_id for faster lookups when checking if equipment is borrowed
CREATE INDEX IF NOT EXISTS idx_ausleihe_equipment ON ausleihe(equipment_id);

-- Index on ausleihe date for sorting and filtering by loan date
CREATE INDEX IF NOT EXISTS idx_ausleihe_date ON ausleihe(ausleihe);

-- Composite index for finding active loans (no return date)
CREATE INDEX IF NOT EXISTS idx_ausleihe_active ON ausleihe(benutzer_id, equipment_id) WHERE rueckgabe IS NULL;

-- Index for overdue loans query
CREATE INDEX IF NOT EXISTS idx_ausleihe_overdue ON ausleihe(expected_return_date) WHERE expected_return_date IS NOT NULL AND rueckgabe IS NULL;

-- Indexes for equipment table
-- Composite index for status and category (common filter combination)
CREATE INDEX IF NOT EXISTS idx_equipment_status_category ON equipment(status, category);

-- Index on created_at for sorting by newest/oldest
CREATE INDEX IF NOT EXISTS idx_equipment_created_at ON equipment(created_at);

-- Index on bezeichnung for text search (if using LIKE queries)
CREATE INDEX IF NOT EXISTS idx_equipment_bezeichnung ON equipment(bezeichnung);

-- Indexes for benutzer table
-- Index on created_at for sorting users
CREATE INDEX IF NOT EXISTS idx_benutzer_created_at ON benutzer(created_at);

-- Composite index for active users with role (common admin query)
CREATE INDEX IF NOT EXISTS idx_benutzer_status_role ON benutzer(account_status, role);

-- Index on last_login for finding recently active users
CREATE INDEX IF NOT EXISTS idx_benutzer_last_login ON benutzer(last_login);

-- Indexes for log_item table (if exists and frequently queried)
-- Index on action_type for filtering audit logs
CREATE INDEX IF NOT EXISTS idx_log_item_action ON log_item(action_type);

-- Index on timestamp for time-based queries
CREATE INDEX IF NOT EXISTS idx_log_item_timestamp ON log_item(timestamp);

-- Composite index for user activity logs
CREATE INDEX IF NOT EXISTS idx_log_item_user_action ON log_item(user_id, action_type, timestamp);

