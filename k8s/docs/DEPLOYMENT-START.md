# Kubernetes Deployment - Quick Start

Quick start guide for deploying the Equipment Management System to Kubernetes (Minikube).

## Prerequisites

### Verify Required Tools

Before starting, verify all required tools are installed:

```bash
# Check Docker
docker --version
# Expected: Docker version 20.x.x or higher

# Check kubectl
kubectl version --client
# Expected: Client Version: v1.x.x

# Check Minikube
minikube version
# Expected: minikube version: v1.x.x
```

**Installation (if needed):**
- **Docker Desktop:** [Download](https://www.docker.com/products/docker-desktop)
- **kubectl:** `brew install kubectl` (macOS) or [official guide](https://kubernetes.io/docs/tasks/tools/)
- **Minikube:** `brew install minikube` (macOS) or [official guide](https://minikube.sigs.k8s.io/docs/start/)

### System Requirements

- **macOS, Linux, or Windows** with WSL2
- **4GB+ RAM** available for Minikube
- **10GB+ free disk space**

### Optional Tools

- **Postman** - For API testing ([Download](https://www.postman.com/downloads/))
- **curl** - For quick API testing (usually pre-installed)

---

## Deployment Steps

### Step 1: Start Minikube Cluster

```bash
# Start Minikube (takes 1-2 minutes on first run)
minikube start

# Verify cluster is running
kubectl cluster-info
# Expected: Kubernetes control plane is running at https://127.0.0.1:xxxxx

# Check node status
kubectl get nodes
# Expected: minikube   Ready   control-plane   1m   v1.x.x
```

**Checkpoint:** If you see the node in "Ready" state, proceed to Step 2.

---

### Step 2: Build Docker Images

The deployment script will build images, but you can also build them manually:

```bash
# Point Docker CLI to Minikube's Docker daemon
eval $(minikube docker-env)

# Verify you're using Minikube's Docker
docker context ls
# You should see minikube context

# Build backend image
echo "Building backend image..."
docker build -t equipment-app:latest ./backend
# Expected: Successfully tagged equipment-app:latest

# Build frontend image (with Kubernetes nginx config)
echo "Building frontend image..."
cd frontend
cp ../k8s/frontend-nginx.conf nginx.conf
docker build -t frontend-app:latest .
cd ..
# Expected: Successfully tagged frontend-app:latest

# Verify images are built
docker images | grep -E "equipment-app|frontend-app"
# Expected: Both images listed with 'latest' tag

# Reset Docker environment (optional, script handles this)
eval $(minikube docker-env -u)
```

**Checkpoint:** Both images should be listed. If build fails, check Dockerfile syntax and dependencies.

---

### Step 3: Deploy to Kubernetes

**Option A: Automated Script (Recommended)**

```bash
# Make script executable
chmod +x k8s/deploy.sh

# Run deployment script
./k8s/deploy.sh
```

The script will:
1. Check prerequisites (kubectl, Minikube)
2. Build Docker images in Minikube's Docker daemon
3. Create namespace and secrets
4. Deploy MySQL with persistent storage
5. Deploy backend (2 replicas)
6. Deploy frontend
7. Wait for all pods to be ready
8. Show deployment status

**Option B: Manual Deployment**

If you prefer manual control or need to troubleshoot:

```bash
# Create namespace
kubectl apply -f k8s/01-namespace.yaml

# Create database secret
kubectl create secret generic db-secret \
  --from-literal=username=root \
  --from-literal=password=rootpassword \
  --namespace=equipment-system \
  --dry-run=client -o yaml | kubectl apply -f -

# Deploy MySQL
kubectl apply -f k8s/02-mysql-pvc.yaml
kubectl apply -f k8s/03-mysql-configmap.yaml
kubectl apply -f k8s/04-mysql-deployment.yaml
kubectl apply -f k8s/05-mysql-service.yaml

# Wait for MySQL to be ready (important!)
kubectl wait --for=condition=ready pod -l app=mysql -n equipment-system --timeout=120s

# Deploy backend
kubectl apply -f k8s/06-backend-deployment.yaml
kubectl apply -f k8s/07-backend-service.yaml

# Wait for backend to be ready
kubectl wait --for=condition=ready pod -l app=equipment-app -n equipment-system --timeout=120s

# Deploy frontend
kubectl apply -f k8s/08-frontend-deployment.yaml
kubectl apply -f k8s/09-frontend-service.yaml

# Wait for frontend to be ready
kubectl wait --for=condition=ready pod -l app=frontend -n equipment-system --timeout=60s
```

**Checkpoint:** Script should complete without errors. If it fails, check the error message and see Troubleshooting section.

---

### Step 4: Verify Deployment

```bash
# View all resources in namespace
kubectl get all -n equipment-system
```

**Expected Output:**
```
NAME                                  READY   STATUS    RESTARTS   AGE
pod/equipment-app-xxxxx-xxxxx         1/1     Running   0          2m
pod/equipment-app-xxxxx-xxxxx         1/1     Running   0          2m
pod/frontend-xxxxx-xxxxx              1/1     Running   0          1m
pod/mysql-xxxxx-xxxxx                 1/1     Running   0          3m

NAME                      TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
service/equipment-service ClusterIP   10.96.x.x       <none>        80/TCP     2m
service/frontend-service  ClusterIP   10.96.x.x       <none>        80/TCP     1m
service/mysql-service     ClusterIP   10.96.x.x       <none>        3306/TCP   3m

NAME                             READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/equipment-app    2/2     2            2           2m
deployment.apps/frontend         1/1     1            1           1m
deployment.apps/mysql            1/1     1            1           3m
```

**Verification Checklist:**
- [ ] All pods show `STATUS: Running`
- [ ] Backend shows `READY: 2/2` (2 replicas)
- [ ] Frontend shows `READY: 1/1`
- [ ] MySQL shows `READY: 1/1`
- [ ] All 3 services are listed

**If pods are not ready:**
```bash
# Check pod status in detail
kubectl get pods -n equipment-system -o wide

# View pod events
kubectl describe pod <pod-name> -n equipment-system

# Check logs
kubectl logs <pod-name> -n equipment-system
```

---

### Step 5: Access the Application

#### 5.1 Start Port-Forwarding

```bash
# Start frontend port-forward (includes backend API via proxy)
kubectl port-forward service/frontend-service 8081:80 -n equipment-system &
FRONTEND_PF_PID=$!

# Start backend port-forward (for direct API access)
kubectl port-forward service/equipment-service 8080:80 -n equipment-system &
BACKEND_PF_PID=$!

# Wait for port-forwards to establish
sleep 3

# Verify port-forwards are running
echo "Frontend port-forward PID: $FRONTEND_PF_PID"
echo "Backend port-forward PID: $BACKEND_PF_PID"
```

**Note:** Port-forwards run in background. To stop them later:
```bash
kill $FRONTEND_PF_PID $BACKEND_PF_PID
# Or find and kill: lsof -ti:8081 | xargs kill
```

#### 5.2 Test Connectivity

```bash
# Test 1: Frontend accessibility
echo "Testing frontend..."
curl -s -o /dev/null -w "Frontend Status: %{http_code}\n" http://localhost:8081
# Expected: Frontend Status: 200

# Test 2: Backend API via frontend proxy
echo "Testing backend via frontend proxy..."
curl -s -o /dev/null -w "Backend (via proxy) Status: %{http_code}\n" http://localhost:8081/api/admin/users
# Expected: Backend (via proxy) Status: 200

# Test 3: Direct backend API access
echo "Testing direct backend access..."
curl -s -o /dev/null -w "Backend (direct) Status: %{http_code}\n" http://localhost:8080/api/admin/users
# Expected: Backend (direct) Status: 200
```

**Checkpoint:** All three tests should return HTTP 200. If not, check port-forward status and pod logs.

#### 5.3 Access URLs

- **Frontend:** http://localhost:8081
- **Admin Dashboard:** http://localhost:8081/templates/Admin-Dashboard.html
- **Backend API (via frontend):** http://localhost:8081/api/
- **Backend API (direct):** http://localhost:8080/api/

---

## Testing

### Quick API Tests with curl

```bash
# Test 1: Get all users (admin endpoint - no auth required)
curl -X GET http://localhost:8080/api/admin/users
# Expected: JSON array of users (may be empty initially)

# Test 2: Get all equipment (admin endpoint)
curl -X GET http://localhost:8080/api/admin/equipment
# Expected: JSON array with 9 equipment items (from init script)

# Test 3: Register a new user
curl -X POST http://localhost:8080/api/benutzer/register \
  -H "Content-Type: application/json" \
  -d '{
    "benutzername": "testuser",
    "vorname": "Test",
    "nachname": "User",
    "password": "testpass123"
  }'
# Expected: JSON with "token" field

# Test 4: Login (alternative to register)
curl -X POST http://localhost:8080/api/benutzer/login \
  -H "Content-Type: application/json" \
  -d '{
    "benutzername": "testuser",
    "password": "testpass123"
  }'
# Expected: JSON with "token" field
```

### Testing with Postman

1. **Import Collection:**
   - Open Postman
   - Click **Import** button
   - Select: `postman-tests/Equipment-Management-System.postman_collection.json`
   - Select: `postman-tests/Equipment-Management-System-Kubernetes.postman_environment.json`

2. **Configure Environment:**
   - Select "Equipment Management - Kubernetes" from environment dropdown
   - Verify `base_url` = `http://localhost:8080`
   - Ensure port-forward is running: `kubectl port-forward service/equipment-service 8080:80 -n equipment-system &`

3. **Run Tests in Order:**
   - **Authentication:** Register or Login (saves token automatically)
   - **User Operations:** Get equipment, borrow, return
   - **Admin Operations:** Manage users and equipment

**See:** `postman-tests/KUBERNETES-TESTING.md` for detailed testing guide

---

## Complete Verification Checklist

### Deployment Status
- [ ] All pods show `STATUS: Running`
- [ ] Backend shows `READY: 2/2` (2 replicas)
- [ ] Frontend shows `READY: 1/1`
- [ ] MySQL shows `READY: 1/1`
- [ ] All 3 services are created

### Connectivity
- [ ] Frontend accessible at http://localhost:8081 (returns 200)
- [ ] Admin Dashboard accessible at http://localhost:8081/templates/Admin-Dashboard.html
- [ ] Backend API accessible via frontend proxy: http://localhost:8081/api/admin/users (returns 200)
- [ ] Direct backend API accessible: http://localhost:8080/api/admin/users (returns 200)

### Functionality
- [ ] Can register new user via API
- [ ] Can login and receive JWT token
- [ ] Can get equipment list (requires auth)
- [ ] Can borrow equipment (requires auth)
- [ ] Can return equipment (requires auth)
- [ ] Admin endpoints work (no auth required)

---

## Troubleshooting

### Issue: Port Already in Use

**Symptoms:** `Error: unable to forward ports because port 8080 is already in use`

**Solution:**
```bash
# Find process using the port
lsof -i :8080
lsof -i :8081

# Kill the process
kill -9 <PID>

# Or use different ports
kubectl port-forward service/frontend-service 8082:80 -n equipment-system
kubectl port-forward service/equipment-service 8081:80 -n equipment-system
# Update URLs accordingly
```

### Issue: Pods Not Starting

**Symptoms:** Pods stuck in `Pending`, `CrashLoopBackOff`, or `Error` state

**Diagnosis:**
```bash
# Check pod status
kubectl get pods -n equipment-system

# View pod events (most important!)
kubectl describe pod <pod-name> -n equipment-system

# Check logs
kubectl logs <pod-name> -n equipment-system

# Check all events in namespace
kubectl get events -n equipment-system --sort-by='.lastTimestamp'
```

**Common Causes:**
- **ImagePullBackOff:** Image not found in Minikube's Docker daemon
- **CrashLoopBackOff:** Application error (check logs)
- **Pending:** Resource constraints or PVC issues

### Issue: Image Not Found (ImagePullBackOff)

**Symptoms:** Pod shows `ImagePullBackOff` or `ErrImagePull`

**Solution:**
```bash
# Ensure you're using Minikube's Docker daemon
eval $(minikube docker-env)

# Verify images exist
docker images | grep -E "equipment-app|frontend-app"

# Rebuild images if missing
docker build -t equipment-app:latest ./backend
cd frontend && cp ../k8s/frontend-nginx.conf nginx.conf
docker build -t frontend-app:latest .
cd ..

# Restart deployments
kubectl rollout restart deployment equipment-app -n equipment-system
kubectl rollout restart deployment frontend -n equipment-system

# Reset Docker environment
eval $(minikube docker-env -u)
```

### Issue: Database Connection Failed

**Symptoms:** Backend pods crash or show database connection errors in logs

**Diagnosis:**
```bash
# Check MySQL pod is running
kubectl get pods -l app=mysql -n equipment-system

# Check MySQL logs
kubectl logs -l app=mysql -n equipment-system

# Test connection from backend pod
kubectl exec -it <backend-pod-name> -n equipment-system -- \
  sh -c "nc -zv mysql-service.equipment-system.svc.cluster.local 3306"
```

**Solution:**
- Ensure MySQL pod is `Running` and `Ready`
- Wait for MySQL to fully initialize (can take 30-60 seconds)
- Check database secret exists: `kubectl get secret db-secret -n equipment-system`

### Issue: Frontend Shows 502 Bad Gateway

**Symptoms:** Frontend loads but API calls return 502

**Diagnosis:**
```bash
# Check frontend logs
kubectl logs -l app=frontend -n equipment-system

# Check backend is accessible from frontend pod
kubectl exec -it <frontend-pod-name> -n equipment-system -- \
  sh -c "curl -v http://equipment-service.equipment-system.svc.cluster.local:80/api/admin/users"
```

**Solution:**
- Verify backend pods are running: `kubectl get pods -l app=equipment-app -n equipment-system`
- Check nginx config: `kubectl exec -it <frontend-pod-name> -n equipment-system -- cat /etc/nginx/conf.d/nginx.conf`
- See [FRONTEND-DNS-FIX.md](./FRONTEND-DNS-FIX.md) for DNS resolution issues

### Issue: Minikube Not Starting

**Symptoms:** `minikube start` fails or hangs

**Solution:**
```bash
# Check Minikube status
minikube status

# Delete and recreate cluster (last resort)
minikube delete
minikube start

# Check system resources
minikube ssh -- df -h
minikube ssh -- free -h
```

---

## Next Steps

- **Advanced Operations:** See [DEPLOYMENT-WORKFLOW.md](./DEPLOYMENT-WORKFLOW.md) for:
  - Scaling deployments
  - Updating application
  - Viewing logs and debugging
  - Resource management

- **API Testing:** See `../../postman-tests/KUBERNETES-TESTING.md` for comprehensive API testing guide

- **Frontend Issues:** See [FRONTEND-DEPLOYMENT.md](./FRONTEND-DEPLOYMENT.md) for frontend-specific troubleshooting

---

## Quick Reference

```bash
# View all resources
kubectl get all -n equipment-system

# View pods
kubectl get pods -n equipment-system

# View logs
kubectl logs -l app=equipment-app -n equipment-system --tail=50

# Port-forward
kubectl port-forward service/frontend-service 8081:80 -n equipment-system &
kubectl port-forward service/equipment-service 8080:80 -n equipment-system &

# Restart deployment
kubectl rollout restart deployment equipment-app -n equipment-system

# Scale deployment
kubectl scale deployment equipment-app --replicas=3 -n equipment-system

# Cleanup (delete everything)
kubectl delete namespace equipment-system
```
