# Kubernetes Manifests

This directory contains all Kubernetes YAML manifests and deployment guides for the Equipment Management System.

## Quick Start

**New to this project?** Start here: **[docs/DEPLOYMENT-START.md](./docs/DEPLOYMENT-START.md)**

## Files

### Manifests
- `01-namespace.yaml` - Namespace for the application
- `02-mysql-pvc.yaml` - PersistentVolumeClaim for MySQL storage
- `03-mysql-configmap.yaml` - ConfigMap with database initialization scripts
- `04-mysql-deployment.yaml` - MySQL Deployment
- `05-mysql-service.yaml` - MySQL Service
- `06-backend-deployment.yaml` - Spring Boot backend Deployment
- `07-backend-service.yaml` - Backend Service
- `08-frontend-deployment.yaml` - Frontend Deployment (optional)
- `09-frontend-service.yaml` - Frontend Service (optional)

### Scripts
- `deploy.sh` - Automated deployment script

### Documentation
All documentation is in the [`docs/`](./docs/) directory:
- `docs/DEPLOYMENT-START.md` - Quick start guide (prerequisites, deployment, testing)
- `docs/DEPLOYMENT-WORKFLOW.md` - Advanced operations (management, scaling, troubleshooting)
- `docs/FRONTEND-DEPLOYMENT.md` - Frontend-specific troubleshooting and advanced operations
- `docs/FRONTEND-DNS-FIX.md` - Frontend DNS resolution issue diagnosis and fix

## Namespace

All resources are deployed to the `equipment-system` namespace.

## Documentation

- **Learning Materials:** See `docs/Phase-2/` for detailed explanations
- **API Testing:** See `postman-tests/KUBERNETES-TESTING.md`
