# Fiks - Event-Driven Microservice Architecture Implementation Plan

A professional services marketplace platform connecting clients with service professionals (handymen, IT support, etc.) in Kosovo. The system allows users to register once and operate as both clients and professionals.

## Confirmed Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Backend** | Node.js + Express |
| **Frontend** | React + TailwindCSS (Vite) |
| **Database** | PostgreSQL (per microservice) |
| **ORM** | Sequelize with migrations |
| **Auth** | JWT with refresh tokens |
| **Message Broker** | Apache Kafka |
| **Dev Environment** | Docker Compose |
| **Production** | Kubernetes + Helm Charts |


---

## Microservice Database Schemas (Albanian Naming)

### 1. Identity Service (Active)
| Table | Fields |
| :--- | :--- |
| **perdoruesi** | `perdoruesi_id` (PK), `emri`, `adresa`, `nr_telefonit`, `email`, `fjalekalimi`, `qyteti_id` |
| **profesionisti** | `profesionisti_id` (PK), `bio`, `perdoruesi_id` (FK) |
| **qyteti** | `qyteti_id` (PK), `emri` |
| **roli** | `roli_id` (PK), `lloji` |
| **roli_perdoruesit** | `roli_perdoruesit_id` (PK), `roli_id` (FK), `perdoruesi_id` (FK) |
| **refresh_token** | `id` (PK), `token`, `perdoruesi_id` (FK), `expires_at`, `is_revoked` |

### 2. Catalog Service (Models Only)
| Table | Fields |
| :--- | :--- |
| **profili** | `profili_id` (PK), `emri`, `email`, `nr_telefonit`, `imazh`, `profesionisti_id` (UUID), `rating` |
| **sherbimi** | `sherbimi_id` (PK), `titulli`, `pershkrimi`, `kategoria_id` (FK), `cmimi`, `koha_punes` |
| **kategoria** | `kategoria_id` (PK), `lloji_kategorise`, `kategoria_parent_id` (FK) |

### 3. Booking Service (Models Only)
| Table | Fields |
| :--- | :--- |
| **kerkesa_punes** | `kerkesa_punes_id` (PK), `pershkrimi`, `mesazhi`, `kerkesa_punes_status_id` (FK), `perdoruesi_id` (UUID) |
| **termini** | `termini_id` (PK), `koha`, `kerkesa_punes_id` (FK), `cmimi`, `koha_fillimit`, `koha_mbarimit` |
| **liria_ores** | `liria_ores_id` (PK), `profesionisti_id` (UUID), `dita_javes`, `koha_fillimit`, `koha_mbarimit` |

### 4. Feedback Service Database
| Table | Fields |
| :--- | :--- |
| **Review** | `ReviewID` (PK), `Score`, `Mesazhi`, `ReviewResponseID` (FK), `TerminiID` (UUID), `ProfesionistiID` (UUID), `PerdoruesiID` (UUID), `Koha_krijimit` |
| **ReviewResponse** | `ReviewResponseID` (PK), `Mesazhi` |

---

## Implementation Order

| Step | Component | Priority | Est. Effort |
| :--- | :--- | :--- | :--- |
| 1 | Docker Compose Infrastructure | High | 4h |
| 2 | Identity Service (Auth) | High | 8h |
| 3 | Catalog Service | High | 6h |
| 4 | Kafka Integration | Medium | 4h |
| 5 | Booking Service | High | 8h |
| 6 | Feedback Service | Medium | 4h |
| 7 | API Gateway (Nginx) | Medium | 2h |
| 8 | Frontend Auth Integration | High | 4h |
| 9 | Frontend Features | Medium | 8h |
| 10 | Testing & Documentation | High | 6h |

**Total Estimated Effort: ~54 hours**

---

## Verification Plan

### 1. Automated Tests
```bash
# Unit Tests (per service)
cd services/identity && npm test
cd services/catalog && npm test
cd services/booking && npm test
cd services/feedback && npm test

# Integration Tests
docker-compose -f docker-compose.test.yml up --abort-on-container-exit

# API Contract Tests (Newman/Postman)
newman run tests/api-collection.json
```

### 2. Manual Verification
- **User Registration**: Register on `localhost:5173/register` -> Verify JWT -> Check DB for User & Profile.
- **Booking Flow**: Log in -> Browse Catalog -> Request Job -> Verify Kafka message published.
- **Review Flow**: Complete Appointment -> Submit Review -> Verify professional rating update.

---

## Notes
- Frontend static pages (Home, About, Contact, Sherbimet) should be polished with modern UI.
- Helm Charts will be added in `infra/helm/` for production deployment.