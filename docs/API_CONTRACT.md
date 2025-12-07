# Equipment Management System - API Contract

## Base URL
- Development: `http://localhost:8080/api`
- Production: `{BACKEND_URL}/api`

## Authentication
All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer {token}
```

---

## User Endpoints (`/api/benutzer`)

### Authentication

#### Register User
**POST** `/api/benutzer/register`

**Request Body:**
```json
{
  "benutzername": "string (3-20 chars, required)",
  "password": "string (min 6 chars, required)",
  "vorname": "string (required)",
  "nachname": "string (required)"
}
```

**Response:** `200 OK`
```json
{
  "token": "jwt_token_string"
}
```

**Error:** `409 Conflict` - Username already taken

---

#### Login
**POST** `/api/benutzer/login`

**Request Body:**
```json
{
  "benutzername": "string (required)",
  "password": "string (required)",
  "totpCode": "integer (optional, required if 2FA enabled)",
  "recoveryCode": "string (optional, alternative to totpCode)"
}
```

**Response:** `200 OK`
```json
{
  "token": "jwt_token_string"
}
```

**Error:** `401 Unauthorized` - Invalid credentials

---

#### Reset Password
**PUT** `/api/benutzer/reset-password`

**Request Body:**
```json
{
  "benutzername": "string (required)",
  "newPassword": "string (min 6 chars, required)"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password reset successfully."
}
```

---

### Two-Factor Authentication

#### Enable 2FA
**POST** `/api/benutzer/2fa/enable`  
**Auth:** Required

**Response:** `200 OK`
```json
{
  "secret": "base32_secret",
  "otpAuthUrl": "otpauth://totp/EquipmentSystem:username?secret=...&issuer=EquipmentSystem"
}
```

---

#### Verify and Enable 2FA
**POST** `/api/benutzer/2fa/verify`  
**Auth:** Required

**Request Body:**
```json
{
  "code": "string (6-digit TOTP code, required)"
}
```

**Response:** `200 OK`
```json
[
  "RECOVERY_CODE_1",
  "RECOVERY_CODE_2",
  ...
]
```

---

#### Disable 2FA
**POST** `/api/benutzer/2fa/disable`  
**Auth:** Required

**Response:** `200 OK`

---

### Profile Management

#### Get Profile
**GET** `/api/benutzer/profile`  
**Auth:** Required

**Response:** `200 OK`
```json
{
  "id": 1,
  "benutzername": "string",
  "vorname": "string",
  "nachname": "string",
  "email": "string (nullable)",
  "role": "USER | ADMIN",
  "accountStatus": "ACTIVE | INACTIVE | SUSPENDED | PENDING",
  "twoFactorEnabled": false,
  "lastLogin": "2024-01-01T12:00:00",
  "createdAt": "2024-01-01T12:00:00",
  "updatedAt": "2024-01-01T12:00:00"
}
```

---

#### Update Profile
**PUT** `/api/benutzer/profile`  
**Auth:** Required

**Request Body:**
```json
{
  "vorname": "string (2-20 chars, optional)",
  "nachname": "string (2-20 chars, optional)",
  "email": "string (valid email, max 100 chars, optional)"
}
```

**Response:** `200 OK` - Updated user object

**Error:** `409 Conflict` - Email already taken

---

### Equipment Operations

#### Get Available Equipment
**GET** `/api/benutzer/equipment`  
**Auth:** Required

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "inventarnummer": "C12",
    "bezeichnung": "Cannon Kamera",
    "description": "string (nullable)",
    "category": "LAPTOP | DESKTOP | CAMERA | AUDIO | VIDEO | PROJECTOR | NETWORKING | STORAGE | ACCESSORIES | OTHER",
    "status": "AVAILABLE | BORROWED | MAINTENANCE | RETIRED",
    "conditionStatus": "NEW | GOOD | FAIR | POOR",
    "location": "string (nullable)",
    "serialNumber": "string (nullable)",
    "purchaseDate": "2024-01-01",
    "createdAt": "2024-01-01T12:00:00",
    "updatedAt": "2024-01-01T12:00:00"
  }
]
```

---

#### Search Equipment
**GET** `/api/benutzer/equipment/search`  
**Auth:** Required

**Query Parameters:**
- `searchTerm` (string, optional) - Search in inventarnummer, bezeichnung, description
- `category` (enum, optional) - Filter by category
- `status` (enum, optional) - Filter by status
- `conditionStatus` (enum, optional) - Filter by condition
- `location` (string, optional) - Filter by location
- `page` (integer, default: 0) - Page number
- `size` (integer, default: 20, max: 100) - Page size
- `sortBy` (string, default: "id") - Sort field
- `sortDirection` (string, default: "ASC") - "ASC" or "DESC"

**Response:** `200 OK` - Paginated response
```json
{
  "content": [...],
  "totalElements": 100,
  "totalPages": 5,
  "size": 20,
  "number": 0
}
```

---

#### Get My Borrowed Equipment
**GET** `/api/benutzer/ausleihen`  
**Auth:** Required

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "benutzer": {...},
    "equipment": {...},
    "ausleihe": "2024-01-01T12:00:00",
    "expectedReturnDate": "2024-01-15",
    "notes": "string (nullable)",
    "createdAt": "2024-01-01T12:00:00"
  }
]
```

---

#### Borrow Equipment
**POST** `/api/benutzer/ausleihen/{equipmentId}`  
**Auth:** Required

**Request Body (optional):**
```json
{
  "expectedReturnDate": "2024-01-15"
}
```

**Response:** `200 OK`

**Error:** `400 Bad Request` - Equipment not available or already borrowed

---

#### Return Equipment
**POST** `/api/benutzer/rueckgabe/{equipmentId}`  
**Auth:** Required

**Response:** `200 OK`

**Error:** `404 Not Found` - No active rental found

---

## Admin Endpoints (`/api/admin`)

**All admin endpoints require ADMIN role**

### User Management

#### Get All Users
**GET** `/api/admin/users`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "benutzername": "string",
    "vorname": "string",
    "nachname": "string",
    "email": "string",
    "role": "USER | ADMIN",
    "accountStatus": "ACTIVE | INACTIVE | SUSPENDED | PENDING",
    "lastLogin": "2024-01-01T12:00:00",
    "createdAt": "2024-01-01T12:00:00",
    "updatedAt": "2024-01-01T12:00:00"
  }
]
```

---

#### Search Users
**GET** `/api/admin/users/search`

**Query Parameters:**
- `searchTerm` (string, optional) - Search in benutzername, vorname, nachname, email
- `role` (enum, optional) - Filter by role
- `accountStatus` (enum, optional) - Filter by account status
- `page` (integer, default: 0)
- `size` (integer, default: 20, max: 100)
- `sortBy` (string, default: "id")
- `sortDirection` (string, default: "ASC")

**Response:** `200 OK` - Paginated response

---

#### Update User
**PUT** `/api/admin/users/{userId}`

**Request Body:**
```json
{
  "role": "USER | ADMIN (optional)",
  "accountStatus": "ACTIVE | INACTIVE | SUSPENDED | PENDING (optional)"
}
```

**Response:** `200 OK` - Updated user object

---

#### Delete User
**DELETE** `/api/admin/users/{benutzerId}`

**Response:** `200 OK`

**Error:** `400 Bad Request` - User has active loans

---

### Equipment Management

#### Get All Equipment
**GET** `/api/admin/equipment`

**Response:** `200 OK` - List of all equipment

---

#### Search Equipment
**GET** `/api/admin/equipment/search`

**Query Parameters:** Same as user equipment search

**Response:** `200 OK` - Paginated response

---

#### Add Equipment
**POST** `/api/admin/equipment`

**Request Body:**
```json
{
  "inventarnummer": "string (required, unique, max 20 chars)",
  "bezeichnung": "string (required, max 20 chars)",
  "description": "string (optional)",
  "category": "enum (optional, default: OTHER)",
  "status": "enum (optional, default: AVAILABLE)",
  "conditionStatus": "enum (optional, default: GOOD)",
  "location": "string (optional, max 100 chars)",
  "serialNumber": "string (optional, max 50 chars)",
  "purchaseDate": "date (optional)"
}
```

**Response:** `200 OK` - Created equipment object

---

#### Update Equipment
**PUT** `/api/admin/equipment/{equipmentId}`

**Request Body:**
```json
{
  "bezeichnung": "string (optional)",
  "description": "string (optional)",
  "category": "enum (optional)",
  "status": "enum (optional)",
  "conditionStatus": "enum (optional)",
  "location": "string (optional)",
  "serialNumber": "string (optional)",
  "purchaseDate": "date (optional)"
}
```

**Response:** `200 OK` - Updated equipment object

---

#### Delete Equipment
**DELETE** `/api/admin/equipment/{equipmentId}`

**Response:** `200 OK`

---

### Loan Management

#### Get Current Loans
**GET** `/api/admin/ausleihen/current`

**Response:** `200 OK` - List of active loans

---

#### Get Loan History
**GET** `/api/admin/ausleihen/history`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "actionType": "BORROW | RETURN | CREATE | UPDATE | DELETE",
    "benutzername": "string",
    "benutzerId": 1,
    "equipmentinventarnummer": "string",
    "equipmentbezeichnung": "string",
    "equipmentId": 1,
    "ausleihdatum": "2024-01-01T12:00:00",
    "rueckgabedatum": "2024-01-15T12:00:00",
    "createdAt": "2024-01-01T12:00:00"
  }
]
```

---

#### Get Overdue Loans
**GET** `/api/admin/ausleihen/overdue`

**Response:** `200 OK` - List of loans with expected return date in the past

---

## Enums

### Role
- `USER`
- `ADMIN`

### AccountStatus
- `ACTIVE`
- `INACTIVE`
- `SUSPENDED`
- `PENDING`

### EquipmentCategory
- `LAPTOP`
- `DESKTOP`
- `CAMERA`
- `AUDIO`
- `VIDEO`
- `PROJECTOR`
- `NETWORKING`
- `STORAGE`
- `ACCESSORIES`
- `OTHER`

### EquipmentStatus
- `AVAILABLE`
- `BORROWED`
- `MAINTENANCE`
- `RETIRED`

### ConditionStatus
- `NEW`
- `GOOD`
- `FAIR`
- `POOR`

### AuditAction
- `BORROW`
- `RETURN`
- `CREATE`
- `UPDATE`
- `DELETE`

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Error message"
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 409 Conflict
```json
{
  "message": "Conflict message (e.g., username already taken)"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

---

## Notes

1. All dates are in ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)
2. JWT tokens expire after 24 hours (configurable)
3. Pagination defaults: page=0, size=20, max size=100
4. Search is case-insensitive and uses LIKE matching
5. All enum values are case-sensitive

