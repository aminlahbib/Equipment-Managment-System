# Equipment Management System

A full-stack equipment loan management system built with Spring Boot, MySQL, and vanilla JavaScript, demonstrating modern DevOps practices from containerization to Kubernetes orchestration.

## 🎯 Project Overview

This system enables organizations to manage equipment inventory and track loans to users. Built as a learning journey through cloud-native technologies, it showcases the complete evolution from a basic web application to a production-ready, cloud-deployable system.

## ✨ Key Features

- **User Management**: Registration, authentication with JWT, and role-based access control
- **Equipment Tracking**: Add, view, and manage equipment inventory
- **Loan System**: Track equipment loans with timestamps and history
- **Admin Dashboard**: Comprehensive management interface for users, equipment, and loans
- **Audit Logging**: Complete history of all equipment transactions

## 🏗️ Architecture

### Tech Stack

**Backend**
- Java 17 with Spring Boot 3.2.3
- Spring Security with JWT authentication
- Spring Data JPA with Hibernate
- MySQL 8.0 database
- Maven for dependency management

**Frontend**
- Vanilla JavaScript (ES6+)
- Client-side routing
- RESTful API integration
- Responsive CSS design

**Infrastructure**
- Docker & Docker Compose
- Kubernetes (Minikube/EKS)
- NGINX for reverse proxy
- Multi-stage Docker builds

### System Architecture

```
┌─────────────┐      ┌──────────────┐      ┌──────────────┐
│   Frontend  │─────▶│   Backend    │─────▶│    MySQL     │
│  (Nginx)    │      │ (Spring Boot)│      │   Database   │
│   Port 8081 │      │   Port 8080  │      │   Port 3306  │
└─────────────┘      └──────────────┘      └──────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Java 17 (for local development)
- Maven 3.8+ (for local development)

### Running with Docker Compose

1. Clone the repository:
```bash
git clone <repository-url>
cd equipment-management-system
```

2. Create `.env` file from template:
```bash
cp env.example .env
```

3. Start the application:
```bash
docker compose up -d
```

4. Access the application:
- Frontend: http://localhost:8081
- Backend API: http://localhost:8080
- Admin Dashboard: http://localhost:8081/templates/Admin-Dashboard.html

### Running on Kubernetes

See the [Kubernetes Deployment Guide](k8s/docs/DEPLOYMENT-START.md) for detailed instructions.

```bash
# Quick deploy to Minikube
cd k8s
./deploy.sh
```

## 📚 Learning Journey

This project follows a structured learning path through modern DevOps practices:

### ✅ Phase 1: Foundation Upgrade
- Multi-stage Docker builds for optimized images
- Security best practices (non-root users, image scanning)
- Environment variable management
- Docker Compose orchestration

### ✅ Phase 2: Kubernetes Basics
- Core Kubernetes concepts (Pods, Deployments, Services)
- ConfigMaps and Secrets management
- PersistentVolumes for database storage
- Health checks (liveness & readiness probes)
- Resource limits and requests
- Complete Minikube deployment

### 🚧 Phase 3: Ingress & Networking (Planned)
- NGINX Ingress Controller
- TLS/SSL termination
- Path-based and host-based routing
- Network policies

### 📋 Future Phases
- Phase 4: Helm Charts for package management
- Phase 5: AWS EKS cloud deployment
- Phase 6: CI/CD pipeline automation
- Phase 7: Observability (Prometheus, Grafana, Loki)
- Phase 8: Security hardening & production readiness

## 📖 Documentation

- **[Learning Plan](docs/cloud_devops_learning_plan-3.md)**: Complete roadmap from Docker to Cloud
- **[Phase 1 Docs](docs/Phase-1/)**: Docker optimization and security
- **[Phase 2 Docs](docs/Phase-2/)**: Kubernetes fundamentals and deployment
- **[Kubernetes Guides](k8s/docs/)**: Deployment workflows and troubleshooting
- **[API Testing](postman-tests/)**: Postman collections for testing

## 🔧 Development

### Project Structure

```
.
├── backend/                 # Spring Boot application
│   ├── src/main/java/
│   │   └── com/equipment/
│   │       ├── controller/  # REST controllers
│   │       ├── service/     # Business logic
│   │       ├── model/       # JPA entities
│   │       ├── repository/  # Data access
│   │       └── security/    # JWT & authentication
│   └── pom.xml
├── frontend/                # Vanilla JS frontend
│   ├── js/                  # JavaScript modules
│   ├── css/                 # Stylesheets
│   └── templates/           # HTML pages
├── db/                      # Database configuration
│   └── initdb/              # SQL initialization scripts
├── k8s/                     # Kubernetes manifests
│   ├── docs/                # Deployment guides
│   └── *.yaml               # K8s resource definitions
└── docs/                    # Learning materials
```

### API Endpoints

**Authentication**
- `POST /api/benutzer/register` - User registration
- `POST /api/benutzer/login` - User login
- `POST /api/benutzer/reset-password` - Password reset

**Admin Operations**
- `GET /api/admin/users` - List all users
- `DELETE /api/admin/users/{id}` - Delete user
- `POST /api/admin/equipment` - Add equipment
- `DELETE /api/admin/equipment/{id}` - Delete equipment
- `GET /api/admin/equipment` - List available equipment
- `GET /api/admin/ausleihen/current` - Current loans
- `GET /api/admin/ausleihen/history` - Loan history

## 🧪 Testing

### Postman Collections
Import the collections from `postman-tests/` directory:
- Equipment Management System collection
- Environment configurations for Docker and Kubernetes

### Running Tests
```bash
# Backend unit tests
cd backend
mvn test

# Integration tests
mvn verify
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with salt
- CORS configuration
- SQL injection prevention via JPA
- Non-root container execution
- Kubernetes secrets for sensitive data
- Security scanning with Trivy

## 🤝 Contributing

This is a learning project, but suggestions and improvements are welcome! Please feel free to:
- Open issues for bugs or questions
- Submit pull requests for enhancements
- Share your own learning experiences

## 📝 License

This project is open source and available for educational purposes.

## 🙏 Acknowledgments

Built as part of a comprehensive Cloud DevOps learning journey, demonstrating practical application of:
- Containerization best practices
- Kubernetes orchestration
- Cloud-native architecture
- DevOps automation principles

---

**Status**: Active Development | **Current Phase**: Phase 2 Complete ✅ | **Next**: Ingress & Networking
