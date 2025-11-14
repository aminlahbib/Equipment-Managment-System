# Deployment Workflow - Advanced Operations

Advanced operations and management guide for the Equipment Management System on Kubernetes.

> **For initial deployment, see [DEPLOYMENT-START.md](./DEPLOYMENT-START.md)**

**Important:** Always verify your current Kubernetes context before running commands:
```bash
kubectl config current-context
```

## Understanding Docker Compose vs Kubernetes

### Why Different Image Building Approaches?

**Docker Compose:**
- Uses your host machine's Docker daemon
- Simple: `docker-compose build` or `docker build`
- Images are immediately available to containers
- Best for: Quick local development and testing

**Kubernetes (Minikube):**
- Uses Minikube's isolated Docker daemon (separate from host)
- Requires: `eval $(minikube docker-env)` before building
- Images built on host are **not visible** to Minikube
- Best for: Learning K8s, production-like environments

### Comparison Table

| Aspect | Docker Compose | Kubernetes (Minikube) |
|--------|----------------|----------------------|
| **Docker Daemon** | Uses host Docker daemon | Uses Minikube's Docker daemon (isolated) |
| **Image Building** | `docker-compose build` or `docker build` | Must use `eval $(minikube docker-env)` first |
| **Use Case** | Local development, quick testing | Learning K8s, production-like environment |
| **Networking** | Simple Docker networks | Kubernetes Services, DNS, ClusterIP |
| **Scaling** | Manual (scale services) | Declarative (replicas in YAML) |
| **Orchestration** | Basic service dependencies | Full orchestration (health checks, restarts, etc.) |
| **Configuration** | Environment variables, `.env` files | ConfigMaps, Secrets, environment variables |
| **Storage** | Docker volumes | PersistentVolumeClaims (PVCs) |
| **Service Discovery** | Service names in same network | Kubernetes DNS (service.namespace.svc.cluster.local) |

### When to Use Each

**Use Docker Compose when:**
- Developing locally and need quick iteration
- Testing application changes rapidly
- Simple multi-container setup is sufficient
- Don't need advanced orchestration features

**Use Kubernetes when:**
- Learning Kubernetes concepts
- Need production-like environment locally
- Want to practice scaling, health checks, rolling updates
- Preparing for cloud deployments
- Need advanced networking and service discovery

### Image Building Workflow

**Docker Compose:**
```bash
# Build images (uses host Docker)
docker-compose build

# Or build individually
docker build -t myapp:latest ./app
```

**Kubernetes (Minikube):**
```bash
# Switch to Minikube's Docker daemon
eval $(minikube docker-env)

# Build images (now builds in Minikube)
docker build -t myapp:latest ./app

# Verify images are in Minikube
docker images

# Switch back to host Docker (optional)
eval $(minikube docker-env -u)
```

**Important:** The `deploy.sh` script handles this automatically, but understanding the difference helps with troubleshooting.

## Management Commands

### View Logs

```bash
# Backend logs
kubectl logs -l app=equipment-app -n equipment-system --tail=50

# Frontend logs
kubectl logs -l app=frontend -n equipment-system --tail=50

# MySQL logs
kubectl logs -l app=mysql -n equipment-system --tail=50

# Follow logs in real-time
kubectl logs -f -l app=equipment-app -n equipment-system
kubectl logs -f -l app=frontend -n equipment-system
```

### Scaling

```bash
# Scale backend to 3 replicas
kubectl scale deployment equipment-app --replicas=3 -n equipment-system

# Scale frontend (usually 1 replica is sufficient)
kubectl scale deployment frontend --replicas=2 -n equipment-system

# Check replica status
kubectl get deployment equipment-app -n equipment-system
kubectl get deployment frontend -n equipment-system
```

### Updating Application

```bash
# Rebuild backend image
eval $(minikube docker-env)
docker build -t equipment-app:latest ./backend

# Restart backend deployment to use new image
kubectl rollout restart deployment equipment-app -n equipment-system

# Rebuild frontend image
cd frontend
cp ../k8s/frontend-nginx.conf nginx.conf
docker build -t frontend-app:latest .
cd ..

# Restart frontend deployment to use new image
kubectl rollout restart deployment frontend -n equipment-system

# Check rollout status
kubectl rollout status deployment equipment-app -n equipment-system
kubectl rollout status deployment frontend -n equipment-system
```

### Debugging

```bash
# Describe a pod (shows events and errors)
kubectl describe pod <pod-name> -n equipment-system

# Get recent events
kubectl get events -n equipment-system --sort-by='.lastTimestamp'

# Execute command in pod
kubectl exec -it <pod-name> -n equipment-system -- /bin/bash

# Check resource usage
kubectl top pods -n equipment-system
kubectl top nodes
```

### Cleanup

```bash
# Delete all resources in namespace
kubectl delete namespace equipment-system

# Or delete individual resources
kubectl delete -f k8s/

# Delete secret separately
kubectl delete secret db-secret -n equipment-system
```

## Troubleshooting

### Pod Not Starting

```bash
# Check pod status
kubectl get pods -n equipment-system

# View pod logs
kubectl logs <pod-name> -n equipment-system

# Describe pod for events
kubectl describe pod <pod-name> -n equipment-system
```

### Image Pull Errors

```bash
# Verify image exists in Minikube
eval $(minikube docker-env)
docker images | grep equipment-app

# Check imagePullPolicy in deployment
kubectl get deployment equipment-app -n equipment-system -o yaml | grep imagePullPolicy
```

### Database Connection Issues

```bash
# Verify MySQL is running
kubectl get pods -l app=mysql -n equipment-system

# Check MySQL service
kubectl get svc mysql-service -n equipment-system

# Test connection from backend pod
kubectl exec -it <backend-pod-name> -n equipment-system -- \
  sh -c "nc -zv mysql-service 3306"
```

### Service Not Accessible

```bash
# Check service endpoints
kubectl get endpoints equipment-service -n equipment-system

# Verify service selector matches pod labels
kubectl get svc equipment-service -n equipment-system -o yaml | grep selector
kubectl get pods -n equipment-system --show-labels

# Verify port-forward is running
lsof -i :8080

# Test connectivity with public endpoint
curl -v http://localhost:8080/api/admin/users
# Expected: 200 (confirms service is accessible)
```

### Postman Connection Issues

```bash
# Verify port-forward is running
kubectl port-forward service/equipment-service 8080:80 -n equipment-system &

# Test with curl first (use public endpoint)
curl http://localhost:8080/api/admin/users
# Should return 200 (confirms service is accessible, not connection refused)

# Check Postman environment base_url is: http://localhost:8080
# See postman-tests/KUBERNETES-TESTING.md for detailed troubleshooting
```

## Quick Reference

```bash
# View all resources
kubectl get all -n equipment-system

# View pods
kubectl get pods -n equipment-system

# View services
kubectl get svc -n equipment-system

# View deployments
kubectl get deployments -n equipment-system

# Restart port-forwards
kubectl port-forward service/frontend-service 8081:80 -n equipment-system &
kubectl port-forward service/equipment-service 8080:80 -n equipment-system &

# Scale deployment
kubectl scale deployment equipment-app --replicas=3 -n equipment-system

# Cleanup everything
kubectl delete namespace equipment-system
```
