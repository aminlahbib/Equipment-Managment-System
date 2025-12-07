#!/bin/bash
set -e

echo "Starting deployment..."

# Check prerequisites
echo "Checking prerequisites..."
kubectl version --client > /dev/null || { echo "ERROR: kubectl not found"; exit 1; }
minikube status > /dev/null || { echo "ERROR: Minikube not running. Start with: minikube start"; exit 1; }

# Build images
echo "Building Docker images..."
eval $(minikube docker-env)

echo "Building backend image..."
docker build -t equipment-app:latest ./backend || { echo "ERROR: Backend build failed"; exit 1; }

echo "Building frontend image..."
cd frontend
cp ../k8s/frontend-nginx.conf nginx.conf
docker build -t frontend-app:latest . || { echo "ERROR: Frontend build failed"; exit 1; }
cd ..

# Create namespace
echo "Creating namespace..."
kubectl apply -f k8s/01-namespace.yaml

# Create secrets (idempotent)
echo "Creating secrets..."
kubectl create secret generic db-secret \
  --from-literal=username=root \
  --from-literal=password=rootpassword \
  --namespace=equipment-system \
  --dry-run=client -o yaml | kubectl apply -f -

# Create JWT secret (idempotent)
# Generate a secure random secret if not provided via JWT_SECRET env var
JWT_SECRET_VALUE=${JWT_SECRET:-$(openssl rand -base64 32)}
kubectl create secret generic jwt-secret \
  --from-literal=secret="$JWT_SECRET_VALUE" \
  --namespace=equipment-system \
  --dry-run=client -o yaml | kubectl apply -f -

# Deploy MySQL
echo "Deploying MySQL..."
kubectl apply -f k8s/02-mysql-pvc.yaml
kubectl apply -f k8s/03-mysql-configmap.yaml
kubectl apply -f k8s/04-mysql-deployment.yaml
kubectl apply -f k8s/05-mysql-service.yaml

# Wait for MySQL
echo "Waiting for MySQL to be ready..."
kubectl wait --for=condition=ready pod -l app=mysql -n equipment-system --timeout=120s

# Deploy backend
echo "Deploying backend..."
kubectl apply -f k8s/06-backend-deployment.yaml
kubectl apply -f k8s/07-backend-service.yaml

# Wait for backend
echo "Waiting for backend to be ready..."
kubectl wait --for=condition=ready pod -l app=equipment-app -n equipment-system --timeout=120s

# Deploy frontend
echo "Deploying frontend..."
kubectl apply -f k8s/08-frontend-deployment.yaml
kubectl apply -f k8s/09-frontend-service.yaml

# Wait for frontend
echo "Waiting for frontend to be ready..."
kubectl wait --for=condition=ready pod -l app=frontend -n equipment-system --timeout=60s

# Show status
echo "Deployment complete!"
echo ""
echo "Current status:"
kubectl get all -n equipment-system

echo ""
echo "To access the application:"
echo "   1. Start port-forward for frontend: kubectl port-forward service/frontend-service 8081:80 -n equipment-system &"
echo "   2. Access frontend: http://localhost:8081"
echo "   3. Backend API accessible via: http://localhost:8081/api/"
echo ""
echo "For direct backend access (Postman testing):"
echo "   kubectl port-forward service/equipment-service 8080:80 -n equipment-system &"
echo "   See postman-tests/KUBERNETES-TESTING.md for detailed testing guide"

