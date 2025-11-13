-- Mock Data for Equipment Management System
-- This matches the data from db/initdb/20_PopulateTable.sql

-- Clear existing data (optional - use with caution)
-- DELETE FROM logitem;
-- DELETE FROM ausleihe;
-- DELETE FROM equipment;
-- DELETE FROM benutzer;

-- Insert Equipment (matches Docker init script)
INSERT INTO equipment (inventarnummer, bezeichnung) VALUES ('C12','Cannon Kamera');
INSERT INTO equipment (inventarnummer, bezeichnung) VALUES ('C34X','Cannon Micro');
INSERT INTO equipment (inventarnummer, bezeichnung) VALUES ('SoK4','Sony Kamera');
INSERT INTO equipment (inventarnummer, bezeichnung) VALUES ('MacB1','MacBook');
INSERT INTO equipment (inventarnummer, bezeichnung) VALUES ('MacB2','MacBook');
INSERT INTO equipment (inventarnummer, bezeichnung) VALUES ('MacB3','MacBook');
INSERT INTO equipment (inventarnummer, bezeichnung) VALUES ('MacI1','iPad');
INSERT INTO equipment (inventarnummer, bezeichnung) VALUES ('MS1','Microsoft Surface');
INSERT INTO equipment (inventarnummer, bezeichnung) VALUES ('LMx3','Logitech Maus');

-- Note: Users are created via the API (register endpoint)
-- Passwords are hashed with salt, so cannot be inserted directly via SQL

-- Example: To create a test user via API:
-- POST /api/benutzer/register
-- {
--   "benutzername": "testuser",
--   "vorname": "Test",
--   "nachname": "User",
--   "password": "testpass123"
-- }

