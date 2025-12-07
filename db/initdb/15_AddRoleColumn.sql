-- Migration script to add role column to existing benutzer table
-- This script is safe to run on existing databases

-- Add role column if it doesn't exist
ALTER TABLE benutzer 
ADD COLUMN IF NOT EXISTS role varchar(20) not null default 'USER';

-- Update existing users to have USER role (if they don't have one)
UPDATE benutzer 
SET role = 'USER' 
WHERE role IS NULL OR role = '';

