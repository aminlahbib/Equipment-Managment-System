# Equipment Management System

A full-stack equipment loan management system built with Spring Boot, MySQL, and vanilla JavaScript, demonstrating modern DevOps practices from containerization to Kubernetes orchestration.

## 🎯 Project Overview

This system enables organizations to manage equipment inventory and track loans to users. Built as a learning journey through cloud-native technologies, it showcases the complete evolution from a basic web application to a production-ready, cloud-deployable system with advanced security, comprehensive tracking, and modern UX.

## ✨ Key Features

### 🔐 Security & Authentication
- **JWT-based Authentication**: Secure token-based authentication with configurable expiration
- **Role-Based Access Control (RBAC)**: Admin and user roles with granular permissions
- **Two-Factor Authentication (2FA)**: TOTP-based 2FA using Google Authenticator with recovery codes
- **Password Security**: Secure password hashing with salt and password reset functionality
- **Input Validation**: Comprehensive validation on all API endpoints

### 👤 User Management
- **User Registration & Login**: Secure user registration and authentication
- **Profile Management**: View and update user profile (name, email)
- **Account Status**: Track account status (ACTIVE, INACTIVE, SUSPENDED, PENDING)
- **Last Login Tracking**: Monitor user activity with last login timestamps

### 📦 Equipment Management
- **Equipment Tracking**: Comprehensive equipment inventory with detailed metadata
- **Equipment Categories**: Organize equipment by category (Laptop, Camera, Audio, etc.)
- **Status Tracking**: Track equipment status (AVAILABLE, BORROWED, MAINTENANCE, RETIRED)
- **Condition Monitoring**: Monitor equipment condition (NEW, GOOD, FAIR, POOR)
- **Location Tracking**: Track equipment location
- **Serial Number Management**: Store and track serial numbers
- **Search & Filter**: Advanced search and filtering capabilities with pagination

### 📋 Loan System
- **Equipment Borrowing**: Borrow equipment with optional expected return dates
- **Loan Tracking**: Track active loans with detailed information
- **Loan History**: Complete audit trail of all equipment transactions
- **Overdue Tracking**: Identify and track overdue loans
- **Expected Return Dates**: Set and monitor expected return dates
- **Loan Rules**: Configurable loan limits (max loans per user, duration limits, grace periods)
- **Reservation System**: Reserve equipment for future use with date ranges
- **Reservation Management**: View, confirm, and cancel reservations (admin and user)

### 👨‍💼 Admin Features
- **User Management**: Full CRUD operations for users with search and filter
- **Equipment Management**: Complete equipment lifecycle management
- **Loan Management**: View current loans, history, and overdue items
- **Account Control**: Manage user account status and roles
- **Maintenance Management**: Schedule, track, and manage equipment maintenance
- **Reservation Management**: View and confirm equipment reservations
- **Comprehensive Dashboard**: Admin dashboard with overview and statistics

### 🔧 Maintenance System
- **Maintenance Scheduling**: Schedule maintenance for equipment with types (routine, repair, inspection, etc.)
- **Maintenance Tracking**: Track maintenance status (scheduled, in progress, completed, cancelled, overdue)
- **Maintenance History**: View complete maintenance history for each equipment
- **Cost Tracking**: Track maintenance costs
- **Automatic Status Updates**: Equipment status automatically updated during maintenance

### 📊 Audit & Logging
- **Complete Audit Trail**: Track all equipment actions (BORROW, RETURN, CREATE, UPDATE, DELETE)
- **Action Types**: Detailed action logging with timestamps
- **User Activity**: Track user interactions with equipment

## 🏗️ Architecture

### Tech Stack

**Backend**
- Java 17 with Spring Boot 3.2.3
- Spring Security with JWT authentication
- Spring Data JPA with Hibernate and Specifications
- MySQL 8.0 database
- Flyway for database migrations
- Spring Boot Actuator for health checks
- Maven for dependency management
- Google Authenticator library for 2FA

**Frontend**
- Vanilla JavaScript (ES6+ modules)
- Modern CSS with custom properties and design tokens
- Dark/Light mode support
- Client-side routing
- RESTful API integration
- Responsive design with mobile support

**Infrastructure**
- Docker & Docker Compose
- Kubernetes (Minikube/EKS)
- NGINX for reverse proxy
- Multi-stage Docker builds
- Health checks and probes
- Secrets management

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

### ✅ Phase 3: Modernization & Enhancement
- Enhanced security (JWT, RBAC, 2FA)
- Database schema enrichment with Flyway migrations
- Advanced search and filtering
- Profile management
- Comprehensive API extensions
- Testing and validation

### 🚧 Phase 4: Ingress & Networking (Planned)
- NGINX Ingress Controller
- TLS/SSL termination
- Path-based and host-based routing
- Network policies

### 📋 Future Phases
- Phase 5: Helm Charts for package management
- Phase 6: AWS EKS cloud deployment
- Phase 7: CI/CD pipeline automation
- Phase 8: Observability (Prometheus, Grafana, Loki)
- Phase 9: Advanced features (email notifications, reservations, reporting)

## 📖 Documentation

- **[Modernization Summary](MODERNIZATION_SUMMARY.md)**: Complete overview of all enhancements
- **[API Contract](docs/API_CONTRACT.md)**: Comprehensive API documentation
- **[Testing Guide](docs/TESTING_GUIDE.md)**: Complete testing procedures
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
│   │       ├── dto/         # Data Transfer Objects
│   │       └── security/    # JWT & authentication
│   ├── src/main/resources/
│   │   └── db/migration/    # Flyway migrations
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

#### Authentication (Public)
- `POST /api/benutzer/register` - User registration
- `POST /api/benutzer/login` - User login (supports 2FA)
- `PUT /api/benutzer/reset-password` - Password reset

#### Two-Factor Authentication (Authenticated)
- `POST /api/benutzer/2fa/enable` - Enable 2FA
- `POST /api/benutzer/2fa/verify` - Verify and enable 2FA
- `POST /api/benutzer/2fa/disable` - Disable 2FA

#### User Operations (Authenticated)
- `GET /api/benutzer/profile` - Get user profile
- `PUT /api/benutzer/profile` - Update user profile
- `GET /api/benutzer/equipment` - Get available equipment
- `GET /api/benutzer/equipment/search` - Search equipment (with filters, pagination)
- `GET /api/benutzer/ausleihen` - Get my borrowed equipment
- `POST /api/benutzer/ausleihen/{id}` - Borrow equipment
- `POST /api/benutzer/rueckgabe/{id}` - Return equipment
- `GET /api/benutzer/loan-rules` - Get loan rules configuration
- `POST /api/benutzer/reservations` - Create equipment reservation
- `GET /api/benutzer/reservations` - Get my reservations
- `DELETE /api/benutzer/reservations/{id}` - Cancel reservation

#### Admin Operations (Admin Only)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/search` - Search users (with filters, pagination)
- `PUT /api/admin/users/{id}` - Update user (role, status)
- `DELETE /api/admin/users/{id}` - Delete user
- `GET /api/admin/equipment` - Get all equipment
- `GET /api/admin/equipment/search` - Search equipment (with filters, pagination)
- `POST /api/admin/equipment` - Add equipment
- `PUT /api/admin/equipment/{id}` - Update equipment
- `DELETE /api/admin/equipment/{id}` - Delete equipment
- `GET /api/admin/ausleihen/current` - Get current loans
- `GET /api/admin/ausleihen/history` - Get loan history
- `GET /api/admin/ausleihen/overdue` - Get overdue loans
- `POST /api/admin/maintenance` - Schedule maintenance
- `PUT /api/admin/maintenance/{id}/start` - Start maintenance
- `PUT /api/admin/maintenance/{id}/complete` - Complete maintenance
- `GET /api/admin/maintenance/equipment/{id}` - Get maintenance history for equipment
- `GET /api/admin/maintenance/scheduled` - Get scheduled maintenance
- `GET /api/admin/maintenance/overdue` - Get overdue maintenance
- `GET /api/admin/maintenance/status/{status}` - Get maintenance by status
- `GET /api/admin/reservations` - Get all reservations
- `GET /api/admin/reservations/equipment/{id}` - Get reservations for equipment
- `PUT /api/admin/reservations/{id}/confirm` - Confirm reservation
- `PUT /api/admin/reservations/{id}/cancel` - Cancel reservation (admin)

For complete API documentation, see [API Contract](docs/API_CONTRACT.md).

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

### Testing Guide
See [Testing Guide](docs/TESTING_GUIDE.md) for comprehensive testing procedures covering:
- Authentication flows
- 2FA flows
- User operations
- Admin operations
- Error handling
- Edge cases
- Security testing

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication with configurable expiration
- Role-Based Access Control (RBAC) with USER and ADMIN roles
- Two-Factor Authentication (TOTP) with Google Authenticator
- Recovery codes for account recovery
- Secure password hashing with salt
- Password reset functionality

### Input Validation & Security
- Comprehensive input validation on all endpoints
- SQL injection prevention via JPA
- XSS prevention
- CORS configuration
- CSRF protection

### Infrastructure Security
- Non-root container execution
- Kubernetes secrets for sensitive data
- Security scanning with Trivy
- Environment variable management
- Secure secret handling

## 📊 Database Schema

### Entities
- **benutzer**: User accounts with 2FA support, roles, and account status
- **equipment**: Equipment inventory with categories, status, condition, and location
- **ausleihe**: Active loans with expected return dates and notes
- **logitem**: Complete audit log with action types

### Enums
- **Role**: USER, ADMIN
- **AccountStatus**: ACTIVE, INACTIVE, SUSPENDED, PENDING
- **EquipmentCategory**: LAPTOP, DESKTOP, CAMERA, AUDIO, VIDEO, PROJECTOR, NETWORKING, STORAGE, ACCESSORIES, OTHER
- **EquipmentStatus**: AVAILABLE, BORROWED, MAINTENANCE, RETIRED
- **ConditionStatus**: NEW, GOOD, FAIR, POOR
- **AuditAction**: BORROW, RETURN, CREATE, UPDATE, DELETE

### Migrations
Database schema is managed with Flyway migrations:
- V1: Initial schema
- V2: Initial data
- V3: Two-factor authentication columns
- V4: Schema enrichment (categories, status, timestamps, indexes)

## 🎨 Frontend Features

- **Modern UI**: Apple-inspired design with clean aesthetics
- **Dark/Light Mode**: System preference detection with manual toggle
- **Responsive Design**: Mobile-first approach with full mobile support
- **Smooth Animations**: Fade-in, slide, and hover animations
- **User Dashboard**: Card-based equipment display with stats
- **Admin Dashboard**: Sidebar navigation with comprehensive management tools
- **Empty States**: Helpful empty state messages with icons
- **Error Handling**: User-friendly error messages and validation feedback

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
- Modern security practices
- Full-stack development

---

**Status**: Active Development | **Current Phase**: Phase 3 Complete ✅ | **Next**: Ingress & Networking

**Latest Updates**: Enhanced security (2FA, RBAC), schema enrichment, advanced search/filter, profile management, comprehensive testing
