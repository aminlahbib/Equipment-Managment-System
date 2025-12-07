-- Mock Data for Equipment Management System
-- Updated to match current database schema with all enhancements
-- This matches the data from backend/src/main/resources/db/migration/V2__Populate_initial_data.sql

-- =====================================================
-- CLEAR EXISTING DATA (Optional - use with caution)
-- =====================================================
-- DELETE FROM reservations;
-- DELETE FROM maintenance_records;
-- DELETE FROM logitem;
-- DELETE FROM ausleihe;
-- DELETE FROM equipment;
-- DELETE FROM benutzer;

-- =====================================================
-- EQUIPMENT DATA
-- =====================================================
-- Insert Equipment with enhanced fields
-- Note: Using INSERT IGNORE to prevent errors if data already exists

INSERT IGNORE INTO equipment (inventarnummer, bezeichnung, description, category, status, condition_status, location, serial_number) 
VALUES 
    ('C12', 'Cannon Kamera', 'Canon DSLR Camera for photography', 'CAMERA', 'AVAILABLE', 'GOOD', 'Lab A', 'CAN-001234'),
    ('C34X', 'Cannon Micro', 'Canon Microphone for audio recording', 'AUDIO', 'AVAILABLE', 'EXCELLENT', 'Lab A', 'CAN-MIC-567'),
    ('SoK4', 'Sony Kamera', 'Sony Professional Camera', 'CAMERA', 'AVAILABLE', 'GOOD', 'Lab B', 'SNY-K4-890'),
    ('MacB1', 'MacBook', 'MacBook Pro 13-inch', 'LAPTOP', 'AVAILABLE', 'EXCELLENT', 'Lab A', 'MBP-2023-001'),
    ('MacB2', 'MacBook', 'MacBook Pro 15-inch', 'LAPTOP', 'AVAILABLE', 'GOOD', 'Lab A', 'MBP-2023-002'),
    ('MacB3', 'MacBook', 'MacBook Air M2', 'LAPTOP', 'AVAILABLE', 'EXCELLENT', 'Lab B', 'MBA-M2-003'),
    ('MacI1', 'iPad', 'iPad Pro 12.9-inch', 'TABLET', 'AVAILABLE', 'GOOD', 'Lab A', 'IPD-PRO-456'),
    ('MS1', 'Microsoft Surface', 'Surface Pro 9', 'TABLET', 'AVAILABLE', 'GOOD', 'Lab B', 'SURF-PRO-789'),
    ('LMx3', 'Logitech Maus', 'Logitech MX Master 3 Mouse', 'PERIPHERAL', 'AVAILABLE', 'EXCELLENT', 'Lab A', 'LOG-MX3-012');

-- =====================================================
-- SAMPLE MAINTENANCE RECORDS (Optional)
-- =====================================================
-- Uncomment to add sample maintenance records
-- Note: Requires equipment_id to exist (adjust IDs based on your data)

-- INSERT INTO maintenance_records (equipment_id, type, description, cost, scheduled_date, status)
-- VALUES 
--     (1, 'ROUTINE', 'Regular cleaning and inspection', 25.00, DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'SCHEDULED'),
--     (2, 'CALIBRATION', 'Audio calibration check', 50.00, DATE_ADD(CURDATE(), INTERVAL 60 DAY), 'SCHEDULED'),
--     (4, 'INSPECTION', 'Battery health check', 0.00, DATE_ADD(CURDATE(), INTERVAL 90 DAY), 'SCHEDULED');

-- =====================================================
-- SAMPLE RESERVATIONS (Optional)
-- =====================================================
-- Uncomment to add sample reservations
-- Note: Requires benutzer_id and equipment_id to exist (adjust IDs based on your data)

-- INSERT INTO reservations (benutzer_id, equipment_id, reservation_date, start_date, end_date, status, notes)
-- VALUES 
--     (1, 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY), DATE_ADD(CURDATE(), INTERVAL 14 DAY), 'PENDING', 'For photography project'),
--     (1, 4, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 10 DAY), DATE_ADD(CURDATE(), INTERVAL 20 DAY), 'CONFIRMED', 'For presentation');

-- =====================================================
-- USER CREATION NOTES
-- =====================================================
-- Users MUST be created via the API (register endpoint) because:
-- 1. Passwords are hashed with BCrypt and salt
-- 2. Password hashing cannot be replicated in SQL
-- 3. The application handles password security

-- To create a test user via API:
-- POST /api/benutzer/register
-- {
--   "benutzername": "testuser",
--   "vorname": "Test",
--   "nachname": "User",
--   "password": "testpass123"
-- }

-- To create an admin user:
-- 1. First create a regular user via register endpoint
-- 2. Then update the user's role to ADMIN via database:
--    UPDATE benutzer SET role = 'ADMIN' WHERE benutzername = 'testuser';
-- 
-- OR use the admin update endpoint (requires admin token):
-- PUT /api/admin/users/{userId}
-- {
--   "role": "ADMIN",
--   "accountStatus": "ACTIVE"
-- }

-- =====================================================
-- ADMIN USER SETUP
-- =====================================================
-- To create an admin user for testing:
-- 
-- Option 1: Via Database (after creating user via API)
-- UPDATE benutzer SET role = 'ADMIN', account_status = 'ACTIVE' WHERE benutzername = 'admin';
--
-- Option 2: Via Admin API (requires existing admin)
-- PUT /api/admin/users/{userId}
-- Authorization: Bearer {admin_token}
-- {
--   "role": "ADMIN",
--   "accountStatus": "ACTIVE"
-- }

-- =====================================================
-- EQUIPMENT CATEGORIES
-- =====================================================
-- Valid categories: LAPTOP, CAMERA, AUDIO, TABLET, PERIPHERAL, PROJECTOR, 
--                   MONITOR, NETWORK, STORAGE, OTHER

-- =====================================================
-- EQUIPMENT STATUS VALUES
-- =====================================================
-- Valid statuses: AVAILABLE, BORROWED, MAINTENANCE, RETIRED

-- =====================================================
-- CONDITION STATUS VALUES
-- =====================================================
-- Valid conditions: EXCELLENT, GOOD, FAIR, POOR, DAMAGED

-- =====================================================
-- MAINTENANCE TYPES
-- =====================================================
-- Valid types: ROUTINE, REPAIR, INSPECTION, CLEANING, CALIBRATION, UPGRADE, OTHER

-- =====================================================
-- MAINTENANCE STATUS VALUES
-- =====================================================
-- Valid statuses: SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, OVERDUE

-- =====================================================
-- RESERVATION STATUS VALUES
-- =====================================================
-- Valid statuses: PENDING, CONFIRMED, ACTIVE, COMPLETED, CANCELLED, EXPIRED

-- =====================================================
-- USER ROLES
-- =====================================================
-- Valid roles: USER, ADMIN

-- =====================================================
-- ACCOUNT STATUS VALUES
-- =====================================================
-- Valid statuses: ACTIVE, INACTIVE, SUSPENDED, PENDING
