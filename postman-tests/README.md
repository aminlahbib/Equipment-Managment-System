# Postman Tests - Equipment Management System

Complete Postman collection for testing the Equipment Management System API.

## Files

- `Equipment-Management-System.postman_collection.json` - Main Postman collection
- `Equipment-Management-System.postman_environment.json` - Environment variables
- `mock-data.sql` - SQL script for database mock data (matches Docker init)
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
- `auth_token`: Auto-populated after login/register
- `test_username`: Test user username
- `test_password`: Test user password
- `equipment_id`: Auto-populated from responses
- `user_id`: Auto-populated from responses

### 3. Database Setup

The database is automatically initialized with mock data when using Docker Compose. The mock data matches `db/initdb/20_PopulateTable.sql`:

**Equipment Items:**
- C12 - Cannon Kamera
- C34X - Cannon Micro
- SoK4 - Sony Kamera
- MacB1, MacB2, MacB3 - MacBook
- MacI1 - iPad
- MS1 - Microsoft Surface
- LMx3 - Logitech Maus

**Note:** Users must be created via the API (register endpoint) as passwords are hashed with salt.

## API Endpoints

### Authentication
- `POST /api/benutzer/register` - Register new user
- `POST /api/benutzer/login` - Login user
- `PUT /api/benutzer/reset-password` - Reset password

### User Equipment Operations
- `GET /api/benutzer/equipment` - Get available equipment (requires auth)
- `GET /api/benutzer/ausleihen` - Get my borrowed equipment (requires auth)
- `POST /api/benutzer/ausleihen/{equipmentId}` - Borrow equipment (requires auth)
- `POST /api/benutzer/rueckgabe/{equipmentId}` - Return equipment (requires auth)

### Admin Operations
- `GET /api/admin/users` - Get all users
- `DELETE /api/admin/users/{benutzerId}` - Delete user
- `GET /api/admin/equipment` - Get all equipment
- `POST /api/admin/equipment` - Add new equipment
- `DELETE /api/admin/equipment/{equipmentId}` - Delete equipment
- `GET /api/admin/ausleihen/current` - Get current active loans
- `GET /api/admin/ausleihen/history` - Get loan history

## Testing Workflow

### 1. Authentication Flow
1. **Register User** - Creates a new user and receives JWT token
2. **Login** - Authenticates existing user and receives JWT token
3. Token is automatically saved to `auth_token` environment variable

### 2. User Operations Flow
1. **Get Available Equipment** - Lists equipment available for borrowing
2. **Borrow Equipment** - Borrows an equipment item (requires auth token)
3. **Get My Borrowed Equipment** - Lists equipment currently borrowed by user
4. **Return Equipment** - Returns borrowed equipment

### 3. Admin Operations Flow
1. **Get All Users** - View all registered users
2. **Get All Equipment** - View all equipment items
3. **Add Equipment** - Create new equipment item
4. **Get Current Loans** - View active loans
5. **Get Loan History** - View completed loans

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

### Login
```json
POST /api/benutzer/login
{
  "benutzername": "testuser",
  "password": "testpass123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

### Get Available Equipment
```json
GET /api/benutzer/equipment
Authorization: Bearer {token}

Response:
[
  {
    "id": 1,
    "inventarnummer": "C12",
    "bezeichnung": "Cannon Kamera"
  },
  ...
]
```

### Borrow Equipment
```json
POST /api/benutzer/ausleihen/1
Authorization: Bearer {token}

Response: 200 OK (empty body)
```

### Add Equipment (Admin)
```json
POST /api/admin/equipment
{
  "inventarnummer": "TEST001",
  "bezeichnung": "Test Equipment"
}

Response:
{
  "id": 10,
  "inventarnummer": "TEST001",
  "bezeichnung": "Test Equipment"
}
```

## Database Schema

### benutzer
- `id` (int, primary key, auto_increment)
- `benutzername` (varchar(20), unique, not null)
- `vorname` (varchar(20), not null)
- `nachname` (varchar(20), not null)
- `password_hash` (varbinary(1000), not null)
- `password_salt` (varbinary(1000), not null)

### equipment
- `id` (int, primary key, auto_increment)
- `inventarnummer` (varchar(20), unique, not null)
- `bezeichnung` (varchar(20), not null)

### ausleihe (active loans)
- `id` (int, primary key, auto_increment)
- `benutzer_id` (int, foreign key to benutzer.id)
- `equipment_id` (int, foreign key to equipment.id, unique)
- `ausleihe` (timestamp, not null)

### logitem (loan history)
- `id` (int, primary key, auto_increment)
- `benutzername` (varchar(20), not null)
- `equipmentinventarnummer` (varchar(20), not null)
- `equipmentbezeichnung` (varchar(20), not null)
- `ausleihdatum` (timestamp, not null)
- `rueckgabedatum` (timestamp, nullable)

## Test Assertions

Each request includes automated tests:
- Status code validation
- Response structure validation
- Required field validation
- Auto-population of environment variables (tokens, IDs)

## Troubleshooting

### Authentication Errors
- Ensure you've registered/logged in first
- Check that `auth_token` is set in environment
- Verify token hasn't expired (24 hours default)

### Connection Errors
- Verify backend is running: `docker-compose ps`
- Check `base_url` is correct: `http://localhost:8080`
- Ensure database is healthy: `docker-compose logs db`

### 404 Errors
- Verify endpoint paths match controller routes
- Check that service is running on correct port

### 401 Unauthorized
- Token may be expired or invalid
- Re-run login/register to get new token
- Verify Authorization header format: `Bearer {token}`

## Notes

- Admin endpoints (`/api/admin/**`) are currently public (no authentication required)
- User endpoints require JWT token in Authorization header
- Equipment IDs are auto-populated from responses for chained requests
- Mock data matches Docker initialization scripts exactly

