# Kubernetes Deployment - Quick Start

Get the Equipment Management System running on Kubernetes (Minikube) in minutes.

## TL;DR - Fastest Path

```bash
# 1. Start Minikube
minikube start

# 2. Deploy everything
chmod +x k8s/deploy.sh && ./k8s/deploy.sh

# 3. Access the app (run these commands after deployment completes)
kubectl port-forward service/frontend-service 8081:80 -n equipment-system &
kubectl port-forward service/equipment-service 8080:80 -n equipment-system &

# 4. Open in browser: http://localhost:8081
```

## Access URLs

After completing the deployment and starting port-forwards:

- **Frontend:** http://localhost:8081
- **Admin Dashboard:** http://localhost:8081/templates/Admin-Dashboard.html
- **Backend API (via frontend proxy):** http://localhost:8081/api/
- **Backend API (direct):** http://localhost:8080/api/

## Prerequisites

**Required Tools:**
- Docker Desktop ([Download](https://www.docker.com/products/docker-desktop))
- kubectl: `brew install kubectl` (macOS) or [official guide](https://kubernetes.io/docs/tasks/tools/)
- Minikube: `brew install minikube` (macOS) or [official guide](https://minikube.sigs.k8s.io/docs/start/)

**Verify installation:**
```bash
docker --version && kubectl version --client && minikube version
```

**System Requirements:**
- 4GB+ RAM available
- 10GB+ free disk space

## Quick Start Steps

### 1. Start Minikube

```bash
minikube start
```

Wait for cluster to be ready (1-2 minutes on first run). Verify with:
```bash
kubectl get nodes
# Should show: minikube   Ready
```

### 2. Deploy Application

```bash
chmod +x k8s/deploy.sh
./k8s/deploy.sh
```

This script automatically:
- Builds Docker images in Minikube
- Creates namespace and secrets
- Deploys MySQL, backend (2 replicas), and frontend
- Waits for all pods to be ready

**Expected time:** 3-5 minutes (includes image builds)

### 3. Verify Deployment

```bash
kubectl get all -n equipment-system
```

**Check:** All pods should show `STATUS: Running` and `READY: 1/1` (or `2/2` for backend).

### 4. Access the Application

**Important:** The deployment script shows instructions, but you must manually run these port-forward commands to access the application.

Start port-forwarding in separate terminal windows or run in background:

```bash
# Frontend (includes backend API via proxy)
kubectl port-forward service/frontend-service 8081:80 -n equipment-system &

# Backend (direct API access)
kubectl port-forward service/equipment-service 8080:80 -n equipment-system &
```

**Note:** The `&` runs commands in background. To stop port-forwards later:
```bash
lsof -ti:8081 | xargs kill  # Stop frontend port-forward
lsof -ti:8080 | xargs kill  # Stop backend port-forward
```

**Quick test:**
```bash
curl http://localhost:8081
# Should return HTML (200 OK)
```

## Testing

### Quick API Test

```bash
# Get equipment list (admin endpoint - no auth required)
curl http://localhost:8080/api/admin/equipment
# Should return JSON array with 9 equipment items
```

**For Postman testing:** See `postman-tests/KUBERNETES-TESTING.md` for complete testing guide

## Verification Checklist

- [ ] All pods running: `kubectl get pods -n equipment-system`
- [ ] Frontend accessible: http://localhost:8081
- [ ] Backend API accessible: http://localhost:8080/api/admin/equipment

## Common Issues

**Port already in use:**
```bash
lsof -ti:8080 | xargs kill  # Kill process on port 8080
lsof -ti:8081 | xargs kill  # Kill process on port 8081
```

**Pods not starting:**
```bash
kubectl describe pod <pod-name> -n equipment-system  # Check events
kubectl logs <pod-name> -n equipment-system          # Check logs
```

**Image not found:**
```bash
eval $(minikube docker-env)
docker images | grep equipment-app  # Verify images exist
# If missing, re-run: ./k8s/deploy.sh
```

**For detailed troubleshooting:** See [DEPLOYMENT-WORKFLOW.md](./DEPLOYMENT-WORKFLOW.md)

## Next Steps

- **Advanced Operations:** [DEPLOYMENT-WORKFLOW.md](./DEPLOYMENT-WORKFLOW.md) - Scaling, updating, debugging
- **API Testing:** `postman-tests/KUBERNETES-TESTING.md` - Comprehensive testing guide
- **Frontend Issues:** [FRONTEND-DEPLOYMENT.md](./FRONTEND-DEPLOYMENT.md) - Frontend troubleshooting

## Quick Commands

```bash
# Status check
kubectl get all -n equipment-system

# View logs
kubectl logs -l app=equipment-app -n equipment-system --tail=50

# Restart deployment
kubectl rollout restart deployment equipment-app -n equipment-system

# Cleanup (delete everything)
kubectl delete namespace equipment-system
```
