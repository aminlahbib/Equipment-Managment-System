# Postman Testing for Kubernetes Deployment

Complete guide for testing the Equipment Management System deployed on Kubernetes using Postman.

## Prerequisites

1. **Kubernetes deployment running** - Follow `k8s/docs/DEPLOYMENT-WORKFLOW.md`
2. **Postman installed** - Download from [postman.com](https://www.postman.com/downloads/)
3. **Port-forward active** - Required to access the service

## Setup

### 1. Start Port-Forward

**Option A: Background Process**
```bash
# Start port-forward in background
kubectl port-forward service/equipment-service 8080:80 -n equipment-system &

# Verify it's running
curl http://localhost:8080/api/benutzer/equipment
```

**Option B: Separate Terminal**
```bash
# Terminal 1: Keep this running
kubectl port-forward service/equipment-service 8080:80 -n equipment-system
```

**Important:** Port-forward must be running for all API requests to work.

### 2. Import Postman Collection

1. Open Postman
2. Click **Import** button
3. Select:
   - `Equipment-Management-System.postman_collection.json`
   - `Equipment-Management-System.postman_environment.json` (or create Kubernetes environment)

### 3. Configure Environment

#### Option A: Use Existing Environment (Update base_url)
1. Select "Equipment Management - Local" environment
2. Update `base_url` to: `http://localhost:8080`
3. Verify port-forward is running on port 8080

#### Option B: Create Kubernetes-Specific Environment

Create a new environment in Postman with these variables:

| Variable | Initial Value | Current Value |
|----------|--------------|---------------|
| `base_url` | `http://localhost:8080` | `http://localhost:8080` |
| `auth_token` | (empty) | (auto-populated) |
| `test_username` | `testuser` | `testuser` |
| `test_password` | `testpass123` | `testpass123` |
| `equipment_id` | `1` | (auto-populated) |
| `user_id` | (empty) | (auto-populated) |
| `new_equipment_id` | (empty) | (auto-populated) |

**Save as:** "Equipment Management - Kubernetes"

## Testing Workflow

### Step 1: Verify Service is Accessible

**Test:** Health Check (Optional - if you have a health endpoint)
```
GET {{base_url}}/actuator/health
```

**Or test with available endpoint:**
```
GET {{base_url}}/api/benutzer/equipment
```
**Expected:** 401 Unauthorized or 403 Forbidden (this confirms service is accessible)

### Step 2: Authentication Flow

1. **Register User**
   - Request: `POST /api/benutzer/register`
   - Body: 
     ```json
     {
       "benutzername": "{{test_username}}",
       "vorname": "Test",
       "nachname": "User",
       "password": "{{test_password}}"
     }
     ```
   - **Expected:** 200 OK with JWT token
   - **Auto-saves:** `auth_token` to environment

2. **Login** (Alternative to register)
   - Request: `POST /api/benutzer/login`
   - Body:
     ```json
     {
       "benutzername": "{{test_username}}",
       "password": "{{test_password}}"
     }
     ```
   - **Expected:** 200 OK with JWT token
   - **Auto-saves:** `auth_token` to environment

### Step 3: User Operations

1. **Get Available Equipment**
   - Request: `GET /api/benutzer/equipment`
   - Headers: `Authorization: Bearer {{auth_token}}`
   - **Expected:** 200 OK with array of equipment
   - **Auto-saves:** First equipment `id` to `equipment_id`

2. **Borrow Equipment**
   - Request: `POST /api/benutzer/ausleihen/{{equipment_id}}`
   - Headers: `Authorization: Bearer {{auth_token}}`
   - **Expected:** 200 OK

3. **Get My Borrowed Equipment**
   - Request: `GET /api/benutzer/ausleihen`
   - Headers: `Authorization: Bearer {{auth_token}}`
   - **Expected:** 200 OK with array containing borrowed equipment

4. **Return Equipment**
   - Request: `POST /api/benutzer/rueckgabe/{{equipment_id}}`
   - Headers: `Authorization: Bearer {{auth_token}}`
   - **Expected:** 200 OK

### Step 4: Admin Operations

1. **Get All Users**
   - Request: `GET /api/admin/users`
   - **Expected:** 200 OK with array of users
   - **Note:** Admin endpoints are currently public (no auth required)

2. **Get All Equipment**
   - Request: `GET /api/admin/equipment`
   - **Expected:** 200 OK with array of all equipment

3. **Add Equipment**
   - Request: `POST /api/admin/equipment`
   - Body:
     ```json
     {
       "inventarnummer": "K8S-TEST-001",
       "bezeichnung": "Kubernetes Test Equipment"
     }
     ```
   - **Expected:** 200 OK with created equipment object
   - **Auto-saves:** Equipment `id` to `new_equipment_id`

4. **Get Current Loans**
   - Request: `GET /api/admin/ausleihen/current`
   - **Expected:** 200 OK with array of active loans

5. **Get Loan History**
   - Request: `GET /api/admin/ausleihen/history`
   - **Expected:** 200 OK with array of loan history

6. **Delete Equipment** (Cleanup)
   - Request: `DELETE /api/admin/equipment/{{new_equipment_id}}`
   - **Expected:** 200 OK

## Running Collection Tests

### Run Entire Collection

1. In Postman, open the collection
2. Click **Run** button (top right)
3. Select environment: "Equipment Management - Local" or "Equipment Management - Kubernetes"
4. Click **Run Equipment Management System**
5. Review test results

### Run Individual Folder

1. Right-click on folder (e.g., "Authentication", "User Operations")
2. Select **Run folder**
3. Review test results

### Run with Newman (CLI)

```bash
# Install Newman
npm install -g newman

# Run collection
newman run postman-tests/Equipment-Management-System.postman_collection.json \
  -e postman-tests/Equipment-Management-System.postman_environment.json \
  --env-var "base_url=http://localhost:8080"
```

## Automated Test Assertions

Each request includes automated tests that verify:

- ✅ **Status Code** - Correct HTTP status (200, 201, 401, etc.)
- ✅ **Response Time** - Response received within acceptable time
- ✅ **Response Structure** - JSON structure matches expected format
- ✅ **Required Fields** - All required fields present in response
- ✅ **Token Extraction** - JWT token automatically saved to `auth_token`
- ✅ **ID Extraction** - Equipment/user IDs automatically saved for chained requests

## Troubleshooting

### Connection Refused / Cannot Connect

**Problem:** Port-forward not running or stopped
```bash
# Check if port-forward is running
lsof -i :8080

# Restart port-forward
kubectl port-forward service/equipment-service 8080:80 -n equipment-system &
```

### 401 Unauthorized

**Problem:** Token expired or missing
- Re-run Register or Login request
- Verify `auth_token` is set in environment
- Check Authorization header format: `Bearer {{auth_token}}`

### 404 Not Found

**Problem:** Service not accessible or wrong URL
```bash
# Verify service is running
kubectl get svc equipment-service -n equipment-system

# Check pods are ready
kubectl get pods -n equipment-system

# Verify port-forward
curl http://localhost:8080/api/benutzer/equipment
```

### 500 Internal Server Error

**Problem:** Backend or database issue
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

**Problem:** Another process using port 8080
```bash
# Find process using port 8080
lsof -i :8080

# Kill the process or use different port
kubectl port-forward service/equipment-service 8081:80 -n equipment-system
# Then update base_url in Postman to: http://localhost:8081
```

## Verification Checklist

After deployment, verify:

- [ ] Port-forward is running: `kubectl port-forward service/equipment-service 8080:80 -n equipment-system`
- [ ] Service is accessible: `curl http://localhost:8080/api/benutzer/equipment` (should return 401, not connection error)
- [ ] Postman environment `base_url` is set to `http://localhost:8080`
- [ ] All pods are running: `kubectl get pods -n equipment-system`
- [ ] Can register/login and receive JWT token
- [ ] Can access protected endpoints with token
- [ ] Can perform CRUD operations on equipment
- [ ] Can borrow and return equipment

## Quick Test Script

```bash
#!/bin/bash
# Quick verification script

echo "🔍 Checking Kubernetes deployment..."

# Check pods
echo "📦 Pods:"
kubectl get pods -n equipment-system

# Check services
echo ""
echo "🌐 Services:"
kubectl get svc -n equipment-system

# Start port-forward in background
echo ""
echo "🔗 Starting port-forward..."
kubectl port-forward service/equipment-service 8080:80 -n equipment-system &
PF_PID=$!

# Wait for port-forward to be ready
sleep 2

# Test connectivity
echo ""
echo "🧪 Testing API connectivity..."
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:8080/api/benutzer/equipment

echo ""
echo "✅ Port-forward running (PID: $PF_PID)"
echo "📝 Now you can test with Postman using: http://localhost:8080"
echo "🛑 To stop port-forward: kill $PF_PID"
```

## Notes

- **Port-forward is required** - Kubernetes services are only accessible within the cluster
- **Token expiration** - JWT tokens expire after 24 hours (default)
- **Database persistence** - Data persists across pod restarts (using PVC)
- **Multiple replicas** - Backend has 2 replicas, requests are load-balanced
- **Admin endpoints** - Currently public (no authentication required)

