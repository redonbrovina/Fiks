<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/license-ISC-green.svg" alt="License">
  <img src="https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg" alt="Node Version">
  <img src="https://img.shields.io/badge/docker-required-blue.svg" alt="Docker">
</p>

# 🔧 Fiks

**Fiks** is an event-driven microservice platform designed for connecting customers with professional service providers in Kosovo. The platform enables seamless booking, service management, and feedback collection in a modern, scalable architecture.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Microservices](#-microservices)
- [Database Management](#-database-management)
- [Monitoring & Observability](#-monitoring--observability)
- [Development](#-development)
- [Kubernetes Deployment](#-kubernetes-deployment)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

Fiks is a comprehensive platform that bridges the gap between customers and professional service providers. Built with a microservices architecture, it supports:

- **User Authentication & Authorization** — Secure JWT-based authentication with refresh tokens
- **Service Catalog Management** — Professionals can list and manage their services
- **Booking System** — Customers can book services with real-time availability
- **Feedback & Reviews** — Rating and review system for quality assurance
- **Real-time Event Processing** — Event-driven communication via Apache Kafka

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **Authentication** | JWT + Refresh tokens, email verification, password reset |
| 👥 **User Management** | Role-based access (Customer, Professional, Admin) |
| 📚 **Service Catalog** | Browse, search, and filter professional services |
| 📅 **Smart Booking** | Real-time availability and booking management |
| ⭐ **Reviews & Ratings** | Customer feedback and professional ratings |
| 📊 **Admin Dashboard** | Analytics, user management, and system monitoring |
| 📈 **Monitoring** | Prometheus metrics and Grafana dashboards |
| 🔄 **Event-Driven** | Kafka-based async communication between services |

---

## 🏗 Architecture

Fiks follows a **microservices architecture** with each service having its own database (Database per Service pattern).

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (Browser/Mobile)                   │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Nginx API Gateway (:8080)                   │
└─────────────────────────────────────────────────────────────────┘
           │              │              │              │
           ▼              ▼              ▼              ▼
     ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
     │ Identity │  │ Catalog  │  │ Booking  │  │ Feedback │
     │  :3001   │  │  :3002   │  │  :3003   │  │  :3004   │
     └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘
          │             │             │             │
          ▼             ▼             ▼             ▼
     ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
     │PostgreSQL│  │PostgreSQL│  │PostgreSQL│  │PostgreSQL│
     │(identity)│  │(catalog) │  │(booking) │  │(feedback)│
     └──────────┘  └──────────┘  └──────────┘  └──────────┘
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
        ┌──────────┐          ┌──────────┐
        │  Kafka   │◄────────►│  Redis   │
        │  :9092   │          │  :6379   │
        └──────────┘          └──────────┘
```

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **Sequelize** | ORM for PostgreSQL |
| **KafkaJS** | Event streaming client |
| **JWT** | Authentication tokens |
| **Swagger** | API documentation |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React** | UI library |
| **Vite** | Build tool & dev server |
| **TailwindCSS** | Utility-first CSS |
| **React Router** | Client-side routing |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Local development |
| **Kubernetes** | Production orchestration |
| **Nginx** | API Gateway / Load Balancer |
| **Apache Kafka** | Event streaming |
| **Redis** | Caching & sessions |
| **PostgreSQL** | Primary database |
| **MongoDB** | ML/Analytics storage |

### Monitoring & Observability
| Technology | Purpose |
|------------|---------|
| **Prometheus** | Metrics collection |
| **Grafana** | Dashboards & visualization |
| **prom-client** | Node.js metrics |

### Data Engineering & ML
| Technology | Purpose |
|------------|---------|
| **Apache Spark** | Data processing |
| **Apache Airflow** | Workflow orchestration |
| **Python** | ML pipeline scripts |

---

## 📦 Prerequisites

Before running Fiks, ensure you have the following installed:

- **Docker Desktop** (v4.0+) — [Download](https://www.docker.com/products/docker-desktop/)
- **Node.js** (v18+) — [Download](https://nodejs.org/)
- **Git** — [Download](https://git-scm.com/)

> ⚠️ **Windows Users**: Make sure WSL2 (Windows Subsystem for Linux) is updated. Docker Desktop requires WSL2 for optimal performance.

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/fiks.git
cd fiks
```

### 2. Configure Environment Variables

Create a `.env` file in the project root (a template is provided):

```bash
cp .env.example .env
```

Configure the following variables:
```env
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key
```

### 3. Start the Application

Run all services with Docker Compose:

```bash
docker compose up --build
```

Or use the npm script:
```bash
npm run dev:build
```

### 4. Access the Application

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | Main application UI |
| **API Gateway** | http://localhost:8080 | Central API endpoint |
| **pgAdmin** | http://localhost:5050 | Database management GUI |
| **Kafka UI** | http://localhost:8081 | Kafka topic browser |
| **Grafana** | http://localhost:3000 | Monitoring dashboards |
| **Prometheus** | http://localhost:9090 | Metrics endpoint |

---

## 📁 Project Structure

```
fiks/
├── 📂 frontend/              # React + Vite frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API service modules
│   │   └── utils/            # Helper functions
│   └── Dockerfile.dev
│
├── 📂 services/              # Microservices
│   ├── identity/             # Auth & user management
│   ├── catalog/              # Service catalog
│   ├── booking/              # Booking management
│   └── feedback/             # Reviews & ratings
│
├── 📂 infra/                 # Infrastructure configs
│   ├── nginx/                # API Gateway configuration
│   └── monitoring/           # Prometheus & Grafana configs
│
├── 📂 k8s/                   # Kubernetes manifests
│   ├── *.yaml                # Service deployments
│   └── hpa.yaml              # Horizontal Pod Autoscaler
│
├── 📂 data_engineering/      # ML & Data pipelines
│   ├── airflow/              # Workflow DAGs
│   ├── spark/                # Spark jobs
│   └── ml_pipeline/          # ML training pipeline
│
├── 📂 schemas/               # Shared data schemas
├── 📂 docs/                  # Documentation & diagrams
├── 📂 scripts/               # Utility scripts
│
├── docker-compose.yml        # Development environment
├── package.json              # Root workspace config
└── README.md                 # This file
```

---

## 🔌 Microservices

### Identity Service (`:3001`)
Handles authentication, user management, and authorization.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | User registration |
| `/api/auth/login` | POST | User login |
| `/api/auth/refresh` | POST | Refresh access token |
| `/api/auth/verify-email` | GET | Email verification |
| `/api/users` | GET | List users (Admin) |

### Catalog Service (`:3002`)
Manages professional profiles and service listings.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/profiles` | GET/POST | Professional profiles |
| `/api/services` | GET/POST | Service listings |
| `/api/categories` | GET | Service categories |

### Booking Service (`:3003`)
Handles service bookings and scheduling.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/bookings` | GET/POST | Booking management |
| `/api/work-requests` | GET/POST | Work request handling |
| `/api/availability` | GET | Check availability |

### Feedback Service (`:3004`)
Manages reviews and ratings.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/reviews` | GET/POST | Customer reviews |
| `/api/ratings` | GET | Professional ratings |

---

## 🗄 Database Management

### Accessing pgAdmin

1. Navigate to **http://localhost:5050**
2. Login with:
   - **Email**: `admin@admin.com`
   - **Password**: `admin`

### Registering Database Servers

| Service | Host | Database | Username | Password |
|---------|------|----------|----------|----------|
| Identity | `identity-db` | `identity` | `postgres` | `postgres` |
| Catalog | `catalog-db` | `catalog` | `postgres` | `postgres` |
| Booking | `booking-db` | `booking` | `postgres` | `postgres` |
| Feedback | `feedback-db` | `feedback` | `postgres` | `postgres` |

### Running Migrations

```bash
# Identity service
npm run -w services/identity db:migrate

# Catalog service
npm run -w services/catalog db:migrate

# Booking service
npm run -w services/booking db:migrate

# Feedback service
npm run -w services/feedback db:migrate
```

---

## 📊 Monitoring & Observability

### Grafana Dashboards

Access Grafana at **http://localhost:3000**

- **Username**: `admin`
- **Password**: `admin`

Pre-configured dashboards include:
- Service Health Overview
- Request Latency & Throughput
- Database Performance
- Kafka Consumer Lag

### Prometheus Metrics

Access Prometheus at **http://localhost:9090**

Each service exposes metrics at `/metrics` endpoint.

---

## 💻 Development

### Available Scripts

```bash
# Start all services
npm run dev

# Start with rebuild
npm run dev:build

# Stop all services
npm run dev:down

# View logs
npm run dev:logs

# Run individual services
npm run identity
npm run catalog
npm run booking
npm run feedback

# Run tests
npm run test

# Run linting
npm run lint
```

### Development Workflow

1. Make changes to the service code
2. Hot-reload is enabled for all services
3. Test your changes via the API Gateway
4. Check logs for errors: `npm run dev:logs`

---

## ☸️ Kubernetes Deployment

Kubernetes manifests are available in the `/k8s` directory.

### Deploy to Kubernetes

```bash
# Apply all manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods

# View service logs
kubectl logs -f deployment/identity
```

### Horizontal Pod Autoscaler

HPA is configured for all services in `k8s/hpa.yaml`:
- **Min replicas**: 2
- **Max replicas**: 10
- **Target CPU**: 70%

---

## 📚 API Documentation

Each service provides Swagger documentation:

| Service | Swagger UI |
|---------|------------|
| Identity | http://localhost:3001/api-docs |
| Catalog | http://localhost:3002/api-docs |
| Booking | http://localhost:3003/api-docs |
| Feedback | http://localhost:3004/api-docs |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- Follow ESLint configuration
- Write tests for new features
- Update documentation as needed
- Use conventional commit messages

---

---

## 👥 Authors

- **Fiks Development Team**

- Redon Brovina
- Rron Morina
- Rron Elshani

---

<p align="center">
  Built with ❤️ in Kosovo
</p>
