#!/bin/bash

# Script to fix Flyway failed migration state
# This script removes the failed migration record from flyway_schema_history

echo "Connecting to MySQL database to fix Flyway migration state..."

# Get database credentials from environment or use defaults
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-3306}
DB_NAME=${DB_NAME:-swtp}
DB_USER=${DB_USER:-root}
DB_PASSWORD=${DB_PASSWORD:-rootpassword}

# Connect to MySQL and fix the failed migration
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" <<EOF
-- Check current Flyway state
SELECT * FROM flyway_schema_history ORDER BY installed_rank DESC LIMIT 5;

-- Delete the failed migration record for version 3
DELETE FROM flyway_schema_history WHERE version = '3' AND success = 0;

-- Verify the columns exist (they might have been partially added)
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = '$DB_NAME' 
  AND TABLE_NAME = 'benutzer' 
  AND COLUMN_NAME IN ('two_factor_enabled', 'two_factor_secret', 'recovery_codes');

-- If columns don't exist, we'll let the migration add them
-- If they do exist, the migration will skip them (with our fix)

-- Show final state
SELECT * FROM flyway_schema_history ORDER BY installed_rank DESC LIMIT 5;
EOF

echo "Flyway migration state fixed. You can now restart the backend container."

