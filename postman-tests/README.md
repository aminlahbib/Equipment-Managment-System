# Postman Tests - Equipment Management System

Complete Postman collection for testing the Equipment Management System API with all features including authentication, 2FA, equipment management, loans, reservations, and maintenance.

## Files

- `Equipment-Management-System.postman_collection.json` - Main Postman collection with all endpoints
- `Equipment-Management-System.postman_environment.json` - Environment variables
- `mock-data.sql` - SQL script for database mock data
- `database-schema.md` - Complete database schema reference
- `README.md` - This file

## Setup

### 1. Import Collection and Environment

1. Open Postman
2. Click **Import** button
3. Select both JSON files:
   - `Equipment-Management-System.postman_collection.json`
   - `Equipment-Management-System.postman_environment.json`
4. Select the environment "Equipment Management - Local" from the dropdown

### 2. Configure Environment Variables

The environment file includes:
- `base_url`: `http://localhost:8080` (default)
- `auth_token`: Auto-populated after login/register (for regular users)
- `user_token`: Auto-populated after login/register (alias for auth_token)
- `admin_token`: **Must be set manually** after logging in as admin (see Admin Setup below)
- `test_username`: Test user username (default: "testuser")
- `test_password`: Test user password (default: "testpass123")
- `admin_username`: Admin username (default: "admin")
- `admin_password`: Admin password (default: "admin123")
- `equipment_id`: Auto-populated from responses
- `user_id`: Auto-populated from responses
- `reservation_id`: Auto-populated from create reservation
- `maintenance_id`: Auto-populated from schedule maintenance
- `two_factor_secret`: Auto-populated from enable 2FA
- `recovery_code`: Auto-populated from verify 2FA

### 3. Database Setup

The database is automatically initialized with mock data when using Docker Compose. The mock data includes:

**Equipment Items:**
- C12 - Cannon Kamera (Camera)
- C34X - Cannon Micro (Audio)
- SoK4 - Sony Kamera (Camera)
- MacB1, MacB2, MacB3 - MacBook (Laptop)
- MacI1 - iPad (Tablet)
- MS1 - Microsoft Surface (Tablet)
- LMx3 - Logitech Maus (Peripheral)

**Note:** Users must be created via the API (register endpoint) as passwords are hashed with BCrypt and salt.

### 4. Admin Setup

To test admin endpoints, you need an admin user:

**Option 1: Create Admin via Database**
1. Register a user via API: `POST /api/benutzer/register`
2. Update role in database:
   ```sql
   UPDATE benutzer SET role = 'ADMIN', account_status = 'ACTIVE' WHERE benutzername = 'admin';
   ```
3. Login as admin: `POST /api/benutzer/login`
4. Copy the token to `admin_token` environment variable

**Option 2: Use Existing Admin**
1. If you have an existing admin user, login: `POST /api/benutzer/login`
2. Copy the token to `admin_token` environment variable

## API Endpoints

### Authentication
- `POST /api/benutzer/register` - Register new user
- `POST /api/benutzer/login` - Login user (supports 2FA)
- `POST /api/benutzer/login` - Login with 2FA code
- `POST /api/benutzer/login` - Login with recovery code
- `PUT /api/benutzer/reset-password` - Reset password

### Two-Factor Authentication
- `POST /api/benutzer/2fa/enable` - Initiate 2FA setup (returns QR code URL)
- `POST /api/benutzer/2fa/verify` - Verify and enable 2FA (returns recovery codes)
- `POST /api/benutzer/2fa/disable` - Disable 2FA

### User Profile
- `GET /api/benutzer/profile` - Get current user profile
- `PUT /api/benutzer/profile` - Update user profile (name, email)

### User Equipment Operations
- `GET /api/benutzer/equipment` - Get available equipment
- `GET /api/benutzer/equipment/search` - Search and filter equipment (with pagination)
- `GET /api/benutzer/ausleihen` - Get my borrowed equipment
- `POST /api/benutzer/ausleihen/{equipmentId}` - Borrow equipment (optional expectedReturnDate)
- `POST /api/benutzer/rueckgabe/{equipmentId}` - Return equipment
- `GET /api/benutzer/loan-rules` - Get loan rules (max loans, duration limits)

### Reservations (User)
- `POST /api/benutzer/reservations` - Create equipment reservation
- `GET /api/benutzer/reservations` - Get my reservations
- `DELETE /api/benutzer/reservations/{reservationId}` - Cancel reservation

### Admin - Users
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/search` - Search and filter users (with pagination)
- `PUT /api/admin/users/{userId}` - Update user (role, account status)
- `DELETE /api/admin/users/{userId}` - Delete user

### Admin - Equipment
- `GET /api/admin/equipment` - Get all equipment (all statuses)
- `GET /api/admin/equipment/search` - Search and filter equipment (with pagination)
- `POST /api/admin/equipment` - Add new equipment
- `PUT /api/admin/equipment/{equipmentId}` - Update equipment
- `DELETE /api/admin/equipment/{equipmentId}` - Delete equipment

### Admin - Loans
- `GET /api/admin/ausleihen/current` - Get current active loans
- `GET /api/admin/ausleihen/history` - Get loan history
- `GET /api/admin/ausleihen/overdue` - Get overdue loans

### Admin - Maintenance
- `POST /api/admin/maintenance` - Schedule maintenance
- `PUT /api/admin/maintenance/{maintenanceId}/start` - Start maintenance
- `PUT /api/admin/maintenance/{maintenanceId}/complete` - Complete maintenance
- `GET /api/admin/maintenance/equipment/{equipmentId}` - Get maintenance history for equipment
- `GET /api/admin/maintenance/scheduled` - Get scheduled maintenance
- `GET /api/admin/maintenance/overdue` - Get overdue maintenance
- `GET /api/admin/maintenance/status/{status}` - Get maintenance by status

### Admin - Reservations
- `GET /api/admin/reservations` - Get all pending reservations
- `GET /api/admin/reservations/equipment/{equipmentId}` - Get reservations for equipment
- `PUT /api/admin/reservations/{reservationId}/confirm` - Confirm reservation

## Testing Workflow

### 1. Authentication Flow
1. **Register User** - Creates a new user and receives JWT token
2. **Login** - Authenticates existing user and receives JWT token
3. Token is automatically saved to `auth_token` and `user_token` environment variables

### 2. Two-Factor Authentication Flow
1. **Enable 2FA** - Returns secret and QR code URL
2. Scan QR code with Google Authenticator or similar app
3. **Verify 2FA** - Enter 6-digit code from app, receives recovery codes
4. **Login with 2FA** - Use TOTP code or recovery code when logging in

### 3. User Operations Flow
1. **Get Available Equipment** - Lists equipment available for borrowing
2. **Search Equipment** - Filter by category, status, location, etc.
3. **Borrow Equipment** - Borrows an equipment item (with optional return date)
4. **Get My Borrowed Equipment** - Lists equipment currently borrowed
5. **Return Equipment** - Returns borrowed equipment
6. **Get Loan Rules** - View loan limits and duration rules

### 4. Reservation Flow
1. **Create Reservation** - Reserve equipment for future use
2. **Get My Reservations** - View all your reservations
3. **Cancel Reservation** - Cancel a pending/confirmed reservation

### 5. Admin Operations Flow
1. **Login as Admin** - Login with admin credentials
2. **Set admin_token** - Copy token to `admin_token` environment variable
3. **Get All Users** - View all registered users
4. **Search Users** - Filter users by role, status, search term
5. **Update User** - Change user role or account status
6. **Manage Equipment** - Add, update, delete equipment
7. **View Loans** - Monitor current, history, and overdue loans
8. **Schedule Maintenance** - Create and manage maintenance records
9. **Manage Reservations** - View and confirm reservations

## Request/Response Examples

### Register User
```json
POST /api/benutzer/register
{
  "benutzername": "testuser",
  "vorname": "Test",
  "nachname": "User",
  "password": "testpass123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

### Login with 2FA
```json
POST /api/benutzer/login
{
  "benutzername": "testuser",
  "password": "testpass123",
  "totpCode": "123456"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

### Search Equipment
```json
GET /api/benutzer/equipment/search?searchTerm=camera&category=CAMERA&status=AVAILABLE&page=0&size=20

Response:
{
  "content": [...],
  "totalElements": 10,
  "totalPages": 1,
  "size": 20,
  "number": 0
}
```

### Borrow Equipment with Return Date
```json
POST /api/benutzer/ausleihen/1
Authorization: Bearer {token}
{
  "expectedReturnDate": "2024-12-31"
}

Response: 200 OK
```

### Create Reservation
```json
POST /api/benutzer/reservations
Authorization: Bearer {token}
{
  "equipmentId": 1,
  "startDate": "2024-12-15",
  "endDate": "2024-12-20",
  "notes": "For project presentation"
}

Response:
{
  "id": 1,
  "equipmentId": 1,
  "startDate": "2024-12-15",
  "endDate": "2024-12-20",
  "status": "PENDING",
  ...
}
```

### Schedule Maintenance (Admin)
```json
POST /api/admin/maintenance
Authorization: Bearer {admin_token}
{
  "equipmentId": 1,
  "type": "ROUTINE",
  "description": "Regular maintenance check",
  "cost": 50.00,
  "scheduledDate": "2024-12-20"
}

Response:
{
  "id": 1,
  "equipmentId": 1,
  "type": "ROUTINE",
  "status": "SCHEDULED",
  ...
}
```

### Update Equipment (Admin)
```json
PUT /api/admin/equipment/1
Authorization: Bearer {admin_token}
{
  "bezeichnung": "Updated Equipment Name",
  "description": "Updated description",
  "category": "CAMERA",
  "status": "MAINTENANCE",
  "conditionStatus": "GOOD",
  "location": "Lab B"
}

Response:
{
  "id": 1,
  "inventarnummer": "C12",
  "bezeichnung": "Updated Equipment Name",
  ...
}
```

## Database Schema

See `database-schema.md` for complete schema documentation. Key tables:

### benutzer (Users)
- Enhanced with: `email`, `role`, `account_status`, `two_factor_enabled`, `two_factor_secret`, `recovery_codes`, `last_login`, timestamps

### equipment (Equipment)
- Enhanced with: `description`, `category`, `status`, `condition_status`, `location`, `serial_number`, `purchase_date`, timestamps

### ausleihe (Active Loans)
- Enhanced with: `expected_return_date`, `notes`, `created_at`

### maintenance_records (Maintenance)
- Fields: `equipment_id`, `type`, `description`, `cost`, `performed_by`, `scheduled_date`, `completed_date`, `status`

### reservations (Reservations)
- Fields: `benutzer_id`, `equipment_id`, `reservation_date`, `start_date`, `end_date`, `status`, `notes`

## Test Assertions

Each request includes automated tests:
- Status code validation
- Response structure validation
- Required field validation
- Auto-population of environment variables (tokens, IDs)

## Authentication & Authorization

### User Endpoints
- Require JWT token in `Authorization: Bearer {token}` header
- Token obtained from login/register endpoints
- Token stored in `auth_token` environment variable

### Admin Endpoints
- **All admin endpoints require ADMIN role**
- Require JWT token from admin user in `Authorization: Bearer {admin_token}` header
- Token must be from a user with `role = 'ADMIN'`
- Set `admin_token` environment variable after logging in as admin

### Two-Factor Authentication
- Optional security feature for users
- Enabled via `/api/benutzer/2fa/enable`
- Requires authenticator app (Google Authenticator, Authy, etc.)
- Login requires TOTP code or recovery code if 2FA is enabled

## Troubleshooting

### Authentication Errors
- Ensure you've registered/logged in first
- Check that `auth_token` is set in environment
- Verify token hasn't expired (24 hours default)
- For admin endpoints, ensure `admin_token` is set and user has ADMIN role

### 401 Unauthorized
- Token may be expired or invalid
- Re-run login/register to get new token
- Verify Authorization header format: `Bearer {token}`
- For admin endpoints, ensure you're using `admin_token` not `auth_token`

### 403 Forbidden (Admin Endpoints)
- User does not have ADMIN role
- Verify user role in database: `SELECT role FROM benutzer WHERE benutzername = 'your_username';`
- Update role if needed: `UPDATE benutzer SET role = 'ADMIN' WHERE benutzername = 'your_username';`

### Connection Errors
- Verify backend is running: `docker-compose ps`
- Check `base_url` is correct: `http://localhost:8080`
- Ensure database is healthy: `docker-compose logs db`

### 404 Errors
- Verify endpoint paths match controller routes
- Check that service is running on correct port
- Ensure you're using the correct HTTP method (GET, POST, PUT, DELETE)

### 2FA Issues
- Ensure you've enabled 2FA first via `/api/benutzer/2fa/enable`
- Verify TOTP code is current (6-digit code from authenticator app)
- Use recovery code if authenticator app is unavailable
- Recovery codes are returned when 2FA is verified

## Kubernetes Deployment Testing

For testing the application deployed on Kubernetes, see:
- **[KUBERNETES-TESTING.md](./KUBERNETES-TESTING.md)** - Complete Kubernetes testing guide
- **Kubernetes Environment:** `Equipment-Management-System-Kubernetes.postman_environment.json`

**Key differences for Kubernetes:**
- Requires port-forward: `kubectl port-forward service/equipment-service 8080:80 -n equipment-system`
- Same `base_url`: `http://localhost:8080` (accessed through port-forward)
- All other testing workflows remain the same

## Valid Enum Values

### Equipment Categories
`LAPTOP`, `CAMERA`, `AUDIO`, `TABLET`, `PERIPHERAL`, `PROJECTOR`, `MONITOR`, `NETWORK`, `STORAGE`, `OTHER`

### Equipment Status
`AVAILABLE`, `BORROWED`, `MAINTENANCE`, `RETIRED`

### Condition Status
`EXCELLENT`, `GOOD`, `FAIR`, `POOR`, `DAMAGED`

### Maintenance Types
`ROUTINE`, `REPAIR`, `INSPECTION`, `CLEANING`, `CALIBRATION`, `UPGRADE`, `OTHER`

### Maintenance Status
`SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `OVERDUE`

### Reservation Status
`PENDING`, `CONFIRMED`, `ACTIVE`, `COMPLETED`, `CANCELLED`, `EXPIRED`

### User Roles
`USER`, `ADMIN`

### Account Status
`ACTIVE`, `INACTIVE`, `SUSPENDED`, `PENDING`

## Notes

- **All admin endpoints require ADMIN role** - Set `admin_token` environment variable after logging in as admin
- User endpoints require JWT token in Authorization header
- Equipment IDs, user IDs, reservation IDs, and maintenance IDs are auto-populated from responses for chained requests
- Mock data includes enhanced equipment with categories, statuses, and locations
- For Kubernetes: Port-forward must be running for all API requests
- 2FA is optional but recommended for enhanced security
- Recovery codes should be saved securely when enabling 2FA
