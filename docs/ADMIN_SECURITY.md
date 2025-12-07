# Admin Dashboard & Endpoint Security

## Overview

The admin dashboard and endpoints are secured using multiple layers of protection:

1. **Backend Security (Spring Security)**
2. **Frontend Access Control**
3. **JWT Token Validation**
4. **Role-Based Access Control (RBAC)**

## Backend Security

### Admin Controller Protection

All admin endpoints are protected at multiple levels:

```java
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")  // Class-level protection
public class AdminController {
    // All endpoints require ADMIN role
}
```

### Security Configuration

```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/admin/**").hasRole("ADMIN")  // URL-level protection
    .anyRequest().authenticated()
)
```

### Role Mapping

Roles are mapped to Spring Security authorities:

- `Role.ADMIN` → `"ROLE_ADMIN"` authority
- `Role.USER` → `"ROLE_USER"` authority

This is handled in `BenutzerDetails.getAuthorities()`:

```java
return List.of(new SimpleGrantedAuthority("ROLE_" + benutzer.getRole().name()));
```

### JWT Authentication Flow

1. User logs in → JWT token generated with role claim
2. Token sent in `Authorization: Bearer <token>` header
3. `JwtAuthenticationFilter` validates token
4. User loaded from database
5. Authorities set from user's role
6. Spring Security checks `hasRole("ADMIN")` for admin endpoints

## Frontend Security

### Admin Dashboard Access Control

```typescript
if (!user || user.role !== 'ADMIN') {
  return <AccessDenied />;
}
```

### Navigation Protection

Admin link only shown to admin users:

```typescript
{user?.role === 'ADMIN' && <NavItem id="admin" label="Admin" />}
```

### API Error Handling

The API client handles 403 (Forbidden) errors:

```typescript
if (response.status === 403) {
  throw new Error('Access denied. You do not have permission to perform this action.');
}
```

## Security Layers

### Layer 1: Frontend UI
- Admin dashboard checks user role before rendering
- Admin navigation link hidden from non-admin users
- **Note:** This is client-side only and can be bypassed

### Layer 2: API Authentication
- All API requests require valid JWT token
- Token validated on every request
- Expired/invalid tokens rejected

### Layer 3: Backend Authorization
- Spring Security checks role before allowing access
- `@PreAuthorize("hasRole('ADMIN')")` annotation
- URL pattern matching in SecurityConfig
- **This is the real security layer - cannot be bypassed**

## Testing Admin Security

### Test Cases

1. **Non-admin user accessing admin dashboard:**
   - Frontend: Shows "Access Denied" message
   - Backend: Returns 403 if API called directly

2. **Non-admin user calling admin API:**
   - Backend: Returns 403 Forbidden
   - Frontend: Shows error message

3. **Admin user accessing admin dashboard:**
   - Frontend: Shows admin dashboard
   - Backend: Allows access to all admin endpoints

4. **Expired token:**
   - Backend: Returns 401 Unauthorized
   - Frontend: Redirects to login

## Admin Endpoints

All endpoints under `/api/admin/**` require ADMIN role:

- `GET /api/admin/users` - List all users
- `DELETE /api/admin/users/{id}` - Delete user
- `POST /api/admin/equipment` - Add equipment
- `PUT /api/admin/equipment/{id}` - Update equipment
- `DELETE /api/admin/equipment/{id}` - Delete equipment
- `GET /api/admin/equipment/search` - Search equipment
- `GET /api/admin/loans/current` - Get current loans
- `GET /api/admin/loans/history` - Get loan history
- `GET /api/admin/loans/overdue` - Get overdue loans
- `POST /api/admin/maintenance` - Schedule maintenance
- `PUT /api/admin/maintenance/{id}/start` - Start maintenance
- `PUT /api/admin/maintenance/{id}/complete` - Complete maintenance
- `GET /api/admin/reservations` - Get all reservations
- `PUT /api/admin/reservations/{id}/confirm` - Confirm reservation

## Best Practices

1. **Never trust client-side checks alone** - Always verify on backend
2. **Use JWT tokens** - Stateless authentication
3. **Validate tokens on every request** - Check expiration and signature
4. **Load user from database** - Ensure role is current
5. **Use Spring Security annotations** - `@PreAuthorize` for method-level security
6. **Handle 403 errors gracefully** - Show user-friendly messages

## Troubleshooting

### Issue: Admin user getting 403 errors

**Check:**
1. JWT token includes role claim
2. User role is "ADMIN" in database
3. `BenutzerDetails.getAuthorities()` returns "ROLE_ADMIN"
4. Token is not expired

### Issue: Non-admin accessing admin dashboard

**Check:**
1. Frontend role check is working
2. Backend returns 403 for API calls
3. User cannot bypass by calling API directly

### Issue: Token validation failing

**Check:**
1. JWT secret matches between token generation and validation
2. Token format is correct
3. Token expiration time is valid

