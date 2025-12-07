# How to Login as Admin

## Login Endpoint

**Yes, it's the same endpoint for all users:**

```
POST /api/benutzer/login
```

The login endpoint doesn't differentiate between admin and regular users. The role is determined by the user's role in the database.

## Request Format

```json
{
  "benutzername": "admin",
  "password": "your-password"
}
```

If 2FA is enabled:
```json
{
  "benutzername": "admin",
  "password": "your-password",
  "totpCode": 123456
}
```

## Creating an Admin User

There are several ways to create an admin user:

### Option 1: Direct Database Update (Quickest)

1. Register a regular user through the UI or API
2. Connect to your MySQL database
3. Update the user's role:

```sql
UPDATE benutzer 
SET role = 'ADMIN' 
WHERE benutzername = 'your-username';
```

### Option 2: Using Admin API (If you already have an admin)

If you already have an admin user, you can promote other users:

```bash
# Login as existing admin first
curl -X POST http://localhost:8080/api/benutzer/login \
  -H "Content-Type: application/json" \
  -d '{"benutzername":"existing-admin","password":"password"}'

# Use the token to update a user's role
curl -X PUT http://localhost:8080/api/admin/users/{userId} \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"ADMIN"}'
```

### Option 3: Create Admin via SQL Script

Create a migration file or run this SQL directly:

```sql
-- Create admin user (password: admin123 - CHANGE THIS!)
INSERT INTO benutzer (
    benutzername, 
    vorname, 
    nachname, 
    password_hash, 
    password_salt, 
    role, 
    account_status,
    created_at,
    updated_at
) VALUES (
    'admin',
    'Admin',
    'User',
    -- You'll need to generate the password hash using BCrypt
    -- For now, register via API and then update role
    UNHEX('...'),  -- password_hash (BCrypt hash)
    UNHEX('...'),  -- password_salt
    'ADMIN',
    'ACTIVE',
    NOW(),
    NOW()
);
```

**Better approach:** Register via API, then update role:

```sql
-- After registering via /api/benutzer/register
UPDATE benutzer SET role = 'ADMIN' WHERE benutzername = 'admin';
```

### Option 4: Create Initial Admin Script

Create a Java/Kotlin script or add to application startup:

```java
@PostConstruct
public void createDefaultAdmin() {
    if (!benutzerRepository.existsByBenutzername("admin")) {
        // Create admin user
        Benutzer admin = new Benutzer();
        admin.setBenutzername("admin");
        admin.setVorname("Admin");
        admin.setNachname("User");
        admin.setRole(Role.ADMIN);
        // ... set password hash
        benutzerRepository.save(admin);
    }
}
```

## Quick Setup Steps

1. **Start your backend:**
   ```bash
   cd backend
   mvn spring-boot:run
   ```

2. **Register a user:**
   ```bash
   curl -X POST http://localhost:8080/api/benutzer/register \
     -H "Content-Type: application/json" \
     -d '{
       "benutzername": "admin",
       "vorname": "Admin",
       "nachname": "User",
       "password": "admin123"
     }'
   ```

3. **Make user admin (via database):**
   ```sql
   UPDATE benutzer SET role = 'ADMIN' WHERE benutzername = 'admin';
   ```

4. **Login as admin:**
   - Use the React frontend at `http://localhost:3000`
   - Navigate to login page
   - Enter username: `admin` and password: `admin123`
   - You'll now have admin access!

## Verifying Admin Access

After logging in, you should:
1. See "Admin" link in the navbar
2. Be able to access `/admin` route
3. See admin dashboard with all sections

## Testing Admin Login

```bash
# Login
curl -X POST http://localhost:8080/api/benutzer/login \
  -H "Content-Type: application/json" \
  -d '{"benutzername":"admin","password":"admin123"}'

# Response will include JWT token
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

# Use token to access admin endpoint
curl -X GET http://localhost:8080/api/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Important Notes

1. **Default Role:** All new registrations get `Role.USER` by default
2. **No Admin Registration:** There's no public endpoint to register as admin (security)
3. **Role in JWT:** The JWT token includes the role, so permissions are checked on every request
4. **Database is Source of Truth:** The role in the database determines access, not the registration method

## Troubleshooting

### Can't see Admin link after login
- Check user role in database: `SELECT benutzername, role FROM benutzer WHERE benutzername = 'your-username';`
- Verify JWT token includes role claim (decode at jwt.io)
- Check browser console for errors

### Getting 403 on admin endpoints
- Verify user role is `ADMIN` in database
- Check JWT token is valid and not expired
- Ensure token is sent in `Authorization: Bearer <token>` header

### Login works but no admin access
- User might have `Role.USER` instead of `Role.ADMIN`
- Update role in database: `UPDATE benutzer SET role = 'ADMIN' WHERE id = ?;`
- Logout and login again to get new JWT token with updated role

