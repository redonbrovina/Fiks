# System Architecture & UML Diagrams

## 1. High-Level Component Diagram (Microservices Architecture)
This diagram illustrates the interaction between the Frontend, API Gateway (Ingress), Microservices, and Data Infrastructure (Databases, Kafka, Redis).

```mermaid
graph TD
    Client[Client Browser / Mobile] -->|HTTPS| LoadBalancer[Nginx Gateway / Ingress]
    
    subgraph "Service Layer"
        LoadBalancer -->|/auth| Identity[Identity Service]
        LoadBalancer -->|/catalog| Catalog[Catalog Service]
        LoadBalancer -->|/bookings| Booking[Booking Service]
        LoadBalancer -->|/feedback| Feedback[Feedback Service]
    end

    subgraph "Data Persistence Layer"
        Identity -->|Reads/Writes| DB_Identity[(PostgreSQL - Identity)]
        Catalog -->|Reads/Writes| DB_Catalog[(PostgreSQL - Catalog)]
        Booking -->|Reads/Writes| DB_Booking[(PostgreSQL - Booking)]
        Feedback -->|Reads/Writes| DB_Feedback[(PostgreSQL - Feedback)]
    end

    subgraph "Event Bus & Caching"
        Identity -->|Publishes Events| Kafka{Apache Kafka}
        Catalog -->|Subscribes| Kafka
        Booking -->|Subscribes/Publishes| Kafka
        Feedback -->|Subscribes| Kafka
        
        Identity -->|Cache Session| Redis[(Redis Cache)]
    end

    classDef service fill:#f9f,stroke:#333,stroke-width:2px;
    classDef db fill:#ff9,stroke:#333,stroke-width:2px;
    classDef infra fill:#9cf,stroke:#333,stroke-width:2px;

    class Identity,Catalog,Booking,Feedback service;
    class DB_Identity,DB_Catalog,DB_Booking,DB_Feedback,Redis db;
    class Kafka,LoadBalancer infra;
```

## 2. Core Class Diagram (Domain Model)
This diagram represents the key entities and their relationships across the system.

```mermaid
classDiagram
    class User {
        +int id
        +string email
        +string password_hash
        +string role
        +register()
        +login()
    }

    class ProfessionalProfile {
        +int id
        +int user_id
        +string business_name
        +string expertise
        +verify()
    }

    class Service {
        +int id
        +int professional_id
        +string name
        +float price
        +int duration_minutes
    }

    class Booking {
        +int id
        +int user_id
        +int service_id
        +datetime start_time
        +status status
        +create()
        +cancel()
    }

    class Review {
        +int id
        +int booking_id
        +int rating
        +string comment
    }

    User "1" -- "0..1" ProfessionalProfile : owns
    ProfessionalProfile "1" -- "*" Service : offers
    User "1" -- "*" Booking : makes
    Service "1" -- "*" Booking : includes
    Booking "1" -- "0..1" Review : has
```
