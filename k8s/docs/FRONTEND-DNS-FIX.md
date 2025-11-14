# Frontend DNS Resolution Issue - Diagnosis & Fix

## Problem

Frontend was returning **502 Bad Gateway** errors when trying to access the backend API through the nginx proxy. The frontend page loaded, but API requests failed.

### Symptoms

- Frontend static files loaded successfully (Status: 200)
- API requests via `/api/*` returned 502 Bad Gateway
- Frontend nginx logs showed: `equipment-service could not be resolved (110: Operation timed out)`
- Error: `send() failed (111: Connection refused) while resolving, resolver: 127.0.0.11:53`

## Root Cause

The frontend nginx configuration was using **Docker's DNS resolver** (`127.0.0.11`) instead of **Kubernetes DNS** (`10.96.0.10`). This caused nginx to fail when resolving the `equipment-service` hostname within the Kubernetes cluster.

### Why This Happened

The nginx config was originally designed for Docker Compose, where `127.0.0.11` is Docker's internal DNS resolver. In Kubernetes, pods use the cluster DNS service for service discovery.

## Solution

Updated `k8s/frontend-nginx.conf` to use Kubernetes DNS:

```nginx
location /api/ {
    # Use Kubernetes DNS resolver (kube-dns service IP)
    resolver 10.96.0.10 valid=30s;
    set $backend_upstream http://equipment-service.equipment-system.svc.cluster.local:80;
    proxy_pass $backend_upstream;
    # ... rest of config
}
```

### Changes Made

1. **Resolver**: Changed from `127.0.0.11` (Docker DNS) to `10.96.0.10` (Kubernetes DNS)
2. **Service Name**: Updated to full FQDN `equipment-service.equipment-system.svc.cluster.local` for explicit resolution

## Verification

After rebuilding and redeploying the frontend:

```bash
# Rebuild frontend image
eval $(minikube docker-env)
cd frontend
cp ../k8s/frontend-nginx.conf nginx.conf
docker build -t frontend-app:latest .
cd ..

# Restart deployment
kubectl rollout restart deployment frontend -n equipment-system
kubectl wait --for=condition=ready pod -l app=frontend -n equipment-system --timeout=60s

# Test connectivity
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:8081/api/admin/users
# Expected: 200
```

## Key Learnings

- **Docker DNS** (`127.0.0.11`) is specific to Docker Compose networks
- **Kubernetes DNS** (`10.96.0.10` in Minikube) is required for service discovery in K8s
- Service names in Kubernetes can be resolved using short names (`equipment-service`) or FQDN (`equipment-service.equipment-system.svc.cluster.local`)
- When using nginx `proxy_pass` with variables, DNS resolution happens at request time, requiring a valid resolver

## Prevention

When deploying to Kubernetes:
- Always use Kubernetes DNS resolver (`10.96.0.10` for Minikube, or discover via `kubectl get svc -n kube-system | grep kube-dns`)
- Use service FQDN format for explicit resolution: `<service-name>.<namespace>.svc.cluster.local`
- Test DNS resolution from within pods: `kubectl exec -it <pod> -- nslookup <service-name>`

