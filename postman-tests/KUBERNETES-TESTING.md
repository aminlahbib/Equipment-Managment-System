# Postman Testing for Kubernetes Deployment

Complete guide for testing the Equipment Management System deployed on Kubernetes using Postman.

## Prerequisites

1. **Kubernetes deployment running** - Follow [k8s/docs/DEPLOYMENT-START.md](../k8s/docs/DEPLOYMENT-START.md)
2. **Postman installed** - Download from [postman.com](https://www.postman.com/downloads/)
3. **Port-forward active** - Required to access the service (see Setup section below)

## Quick Start

```bash
# 1. Start port-forward (required for API access)
kubectl port-forward service/equipment-service 8080:80 -n equipment-system &

# 2. Verify connectivity
curl http://localhost:8080/api/admin/equipment
# Should return JSON array (not connection error)
```

Then proceed to Setup section below.

## Setup

### Step 1: Start Port-Forward

**Required:** Port-forward must be running for all API requests to work.

```bash
# Start port-forward in background
kubectl port-forward service/equipment-service 8080:80 -n equipment-system &

# Verify it's running
curl http://localhost:8080/api/admin/equipment
# Expected: JSON array (200 OK) or 401/403 (service is accessible)
```

**Alternative:** Run in separate terminal (keeps output visible):
```bash
kubectl port-forward service/equipment-service 8080:80 -n equipment-system
```

**To stop port-forward:**
```bash
lsof -ti:8080 | xargs kill
```

### Step 2: Import Postman Collection

1. Open Postman
2. Click **Import** button
3. Select both files:
   - `Equipment-Management-System.postman_collection.json`
   - `Equipment-Management-System-Kubernetes.postman_environment.json`

### Step 3: Configure Environment

1. Select **"Equipment Management - Kubernetes"** from environment dropdown (top right)
2. Verify `base_url` = `http://localhost:8080`
3. Ensure port-forward is running (Step 1)

**Environment Variables:**
- `base_url`: `http://localhost:8080` (API endpoint)
- `auth_token`: Auto-populated after login/register
- `test_username`: `testuser` (default test user)
- `test_password`: `testpass123` (default password)
- `equipment_id`: Auto-populated from responses
- `user_id`: Auto-populated from responses
- `new_equipment_id`: Auto-populated from responses

## Testing Workflow

### Step 1: Verify Service is Accessible

**Quick Test:**
```
GET {{base_url}}/api/admin/equipment
```
**Expected:** 200 OK with JSON array (confirms service is accessible)

**Note:** Admin endpoints don't require authentication. If you get 401/403 on user endpoints, that's expected and confirms the service is working.

### Step 2: Authentication

**Option A: Register New User**
```
POST {{base_url}}/api/benutzer/register
Body:
{
  "benutzername": "{{test_username}}",
  "vorname": "Test",
  "nachname": "User",
  "password": "{{test_password}}"
}
```
**Expected:** 200 OK with JWT token in response
**Auto-saves:** Token to `auth_token` environment variable

**Option B: Login (if user already exists)**
```
POST {{base_url}}/api/benutzer/login
Body:
{
  "benutzername": "{{test_username}}",
  "password": "{{test_password}}"
}
```
**Expected:** 200 OK with JWT token
**Auto-saves:** Token to `auth_token` environment variable

### Step 3: User Operations

**1. Get Available Equipment**
```
GET {{base_url}}/api/benutzer/equipment
Headers: Authorization: Bearer {{auth_token}}
```
**Expected:** 200 OK with array of available equipment
**Auto-saves:** First equipment `id` to `equipment_id`

**2. Borrow Equipment**
```
POST {{base_url}}/api/benutzer/ausleihen/{{equipment_id}}
Headers: Authorization: Bearer {{auth_token}}
```
**Expected:** 200 OK

**3. Get My Borrowed Equipment**
```
GET {{base_url}}/api/benutzer/ausleihen
Headers: Authorization: Bearer {{auth_token}}
```
**Expected:** 200 OK with array containing borrowed equipment

**4. Return Equipment**
```
POST {{base_url}}/api/benutzer/rueckgabe/{{equipment_id}}
Headers: Authorization: Bearer {{auth_token}}
```
**Expected:** 200 OK

### Step 4: Admin Operations

**Note:** Admin endpoints are currently public (no authentication required).

**1. Get All Users**
```
GET {{base_url}}/api/admin/users
```
**Expected:** 200 OK with array of all users

**2. Get All Equipment**
```
GET {{base_url}}/api/admin/equipment
```
**Expected:** 200 OK with array of all equipment (9 items from init script)

**3. Add Equipment**
```
POST {{base_url}}/api/admin/equipment
Body:
{
  "inventarnummer": "K8S-TEST-001",
  "bezeichnung": "Kubernetes Test Equipment"
}
```
**Expected:** 200 OK with created equipment object
**Auto-saves:** Equipment `id` to `new_equipment_id`

**4. Get Current Loans**
```
GET {{base_url}}/api/admin/ausleihen/current
```
**Expected:** 200 OK with array of active loans

**5. Get Loan History**
```
GET {{base_url}}/api/admin/ausleihen/history
```
**Expected:** 200 OK with array of loan history

**6. Delete Equipment (Cleanup)**
```
DELETE {{base_url}}/api/admin/equipment/{{new_equipment_id}}
```
**Expected:** 200 OK

## Running Tests

### Run Entire Collection

1. In Postman, open the collection
2. Click **Run** button (top right)
3. Select environment: **"Equipment Management - Kubernetes"**
4. Click **Run Equipment Management System**
5. Review test results in the test runner

### Run Individual Folder

1. Right-click on folder (e.g., "Authentication", "User Operations", "Admin Operations")
2. Select **Run folder**
3. Review test results

**Recommended order:**
1. Authentication (Register/Login)
2. User Operations
3. Admin Operations

### Run with Newman (CLI)

```bash
# Install Newman
npm install -g newman

# Run collection with Kubernetes environment
newman run Equipment-Management-System.postman_collection.json \
  -e Equipment-Management-System-Kubernetes.postman_environment.json

# Or override base_url
newman run Equipment-Management-System.postman_collection.json \
  -e Equipment-Management-System-Kubernetes.postman_environment.json \
  --env-var "base_url=http://localhost:8080"
```

## Automated Test Assertions

Each request in the collection includes automated tests that verify:

- **Status Code** - Correct HTTP status (200, 201, 401, etc.)
- **Response Time** - Response received within acceptable time
- **Response Structure** - JSON structure matches expected format
- **Required Fields** - All required fields present in response
- **Token Extraction** - JWT token automatically saved to `auth_token` variable
- **ID Extraction** - Equipment/user IDs automatically saved for chained requests

These tests run automatically when you execute requests. Check the **Test Results** tab in Postman to see pass/fail status.

## Troubleshooting

### Connection Refused / Cannot Connect

**Symptoms:** "Error: connect ECONNREFUSED" or "Could not get response"

**Solution:**
```bash
# Check if port-forward is running
lsof -i :8080

# If not running, start it
kubectl port-forward service/equipment-service 8080:80 -n equipment-system &

# Verify connectivity
curl http://localhost:8080/api/admin/equipment
# Should return JSON (not connection error)
```

### 401 Unauthorized

**Symptoms:** "401 Unauthorized" on protected endpoints

**Solution:**
1. Re-run **Register** or **Login** request
2. Verify `auth_token` is set in environment variables
3. Check Authorization header format: `Bearer {{auth_token}}`
4. Token may have expired (tokens expire after 24 hours)

### 404 Not Found

**Symptoms:** "404 Not Found" on all requests

**Solution:**
```bash
# Verify service is running
kubectl get svc equipment-service -n equipment-system

# Check pods are ready
kubectl get pods -n equipment-system

# Verify port-forward is active
curl http://localhost:8080/api/admin/equipment

# Check base_url in Postman environment is: http://localhost:8080
```

### 500 Internal Server Error

**Symptoms:** "500 Internal Server Error" on requests

**Solution:**
```bash
# Check backend logs
kubectl logs -l app=equipment-app -n equipment-system --tail=50

# Check MySQL logs
kubectl logs -l app=mysql -n equipment-system --tail=50

# Check pod status
kubectl get pods -n equipment-system
kubectl describe pod <pod-name> -n equipment-system
```

### Port Already in Use

**Symptoms:** "Error: unable to forward ports because port 8080 is already in use"

**Solution:**
```bash
# Find and kill process using port 8080
lsof -ti:8080 | xargs kill

# Or use different port
kubectl port-forward service/equipment-service 8081:80 -n equipment-system
# Then update base_url in Postman to: http://localhost:8081
```

## Verification Checklist

Before testing, verify:

- [ ] Kubernetes deployment is running: `kubectl get pods -n equipment-system` (all pods Running)
- [ ] Port-forward is active: `lsof -i :8080` (shows process)
- [ ] Service is accessible: `curl http://localhost:8080/api/admin/equipment` (returns JSON, not connection error)
- [ ] Postman environment selected: "Equipment Management - Kubernetes"
- [ ] `base_url` is set to: `http://localhost:8080`

After testing, verify:

- [ ] Can register/login and receive JWT token
- [ ] Token is saved to `auth_token` variable
- [ ] Can access protected endpoints with token
- [ ] Can get equipment list
- [ ] Can borrow equipment
- [ ] Can return equipment
- [ ] Admin endpoints work (no auth required)

## Quick Verification Script

```bash
#!/bin/bash
# Quick verification script for Postman testing setup

echo "Checking Kubernetes deployment..."

# Check pods
echo "Pods:"
kubectl get pods -n equipment-system

# Check services
echo ""
echo "Services:"
kubectl get svc -n equipment-system

# Check if port-forward is running
echo ""
if lsof -i :8080 > /dev/null 2>&1; then
    echo "Port-forward is running on port 8080"
else
    echo "Starting port-forward..."
    kubectl port-forward service/equipment-service 8080:80 -n equipment-system &
    sleep 2
fi

# Test connectivity
echo ""
echo "Testing API connectivity..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/admin/equipment)
if [ "$HTTP_CODE" = "200" ]; then
    echo "API is accessible (HTTP $HTTP_CODE)"
    echo "Ready for Postman testing: http://localhost:8080"
else
    echo "API returned HTTP $HTTP_CODE - check deployment status"
fi
```

## Important Notes

- **Port-forward is required** - Kubernetes services are only accessible within the cluster. Port-forward creates a tunnel from your local machine to the service.
- **Token expiration** - JWT tokens expire after 24 hours. Re-run Login/Register to get a new token.
- **Database persistence** - Data persists across pod restarts (using PersistentVolumeClaim).
- **Multiple replicas** - Backend runs with 2 replicas. Requests are automatically load-balanced.
- **Admin endpoints** - Currently public (no authentication required). User endpoints require JWT token.
- **Environment variables** - The collection automatically saves tokens and IDs to environment variables for chained requests.

## Related Documentation

- **Deployment Guide:** [k8s/docs/DEPLOYMENT-START.md](../k8s/docs/DEPLOYMENT-START.md)
- **Advanced Operations:** [k8s/docs/DEPLOYMENT-WORKFLOW.md](../k8s/docs/DEPLOYMENT-WORKFLOW.md)

