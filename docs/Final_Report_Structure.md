# Raporti i Projektit: FIKS Platform

**Ky dokument shërben si skelet për raportin përfundimtar në Word (.docx).**
**Ju lutem kopjoni përmbajtjen në Microsoft Word dhe formatoni atë sipas standardeve akademike.**

---

## 1. Përmbledhje Ekzekutive (Abstract)

Platforma "Fiks" është një sistem i avancuar i bazuar në mikrosherbime që lidh klientët me profesionistë të shërbimeve të ndryshme (si hidraulikë, elektricistë, etj.). Projekti synon të ofrojë një zgjidhje të shkallëzueshme, të sigurt dhe performante për menaxhimin e kërkesave të punës dhe takimeve.

Sistemi është ndërtuar duke përdorur arkitekturë të drejtuar nga ngjarjet (Event-Driven Architecture) me Apache Kafka, dhe përdor teknologji moderne si Node.js, PostgreSQL, Redis, dhe Docker/Kubernetes për orkestrim. Ky raport detajon arkitekturën, vendimet teknike, dhe implementimin e një sistemi të plotë të procesimit të të dhënave.

---

## 2. Qëllimi dhe Objektivat e Projektit

**Qëllimi:**
Të zhvillohet një platformë e besueshme dhe e shpejtë për ndërmjetësimin e shërbimeve.

**Objektivat Kryesore:**
1.  **Arkitekturë e Shkallëzueshme:** Implementimi i mikrosherbimeve të pavarura (Identity, Catalog, Booking, Feedback).
2.  **Siguria:** Autentikim i sigurt me JWT dhe mbrojtje e të dhënave personale.
3.  **Performanca:** Përdorimi i caching (Redis) dhe komunikimit asinkron (Kafka) për të përballuar ngarkesën.
4.  **Infrastruktura:** Përgatitja për prodhim me Docker dhe Kubernetes.
5.  **Monitorimi:** Implementimi i metrikave me Prometheus dhe Grafana.

---

## 3. Analiza e Kërkesave

### 3.1 Kërkesat Funksionale
*   **Menaxhimi i Përdoruesve:** Regjistrim, kyçje, menaxhim profili, reset fjalëkalimi me kod OTP.
*   **Katalogu i Shërbimeve:** Krijimi dhe shfaqja e shërbimeve nga profesionistët.
*   **Menaxhimi i Rezervimeve:** Krijimi i kërkesave për punë, aprovimi/refuzimi, dhe caktimi i takimeve.
*   **Vlerësimet:** Lënia e komenteve dhe vlerësimeve (yjeve) për shërbimet e kryera.

### 3.2 Kërkesat Jofunksionale
*   **Shkallëzueshmëria:** Aftësia për të shtuar instanca të reja të shërbimeve.
*   **Disponueshmëria:** Arkitekturë pa pika të vetme dështimi (Single Points of Failure) në prodhim.
*   **Siguria:** Enkriptimi i fjalëkalimeve, validimi i inputeve, autorizimi me role (Admin/User/Professional).

---

## 4. Projektimi i Sistemit

### 4.1 Arkitektura
Sistemi ndjek një arkitekturë **Microservices**.
*   **Frontend:** React (Single Page Application).
*   **API Gateway:** Nginx (Reverse Proxy).
*   **Services:** Identity, Catalog, Booking, Feedback.
*   **Message Broker:** Apache Kafka.
*   **Databases:** 4 instanca të ndara të PostgreSQL.
*   **Cache:** Redis.

*(Këtu mund të vendosni diagramin e arkitekturës nga `docs/architecture_uml.md`)*

### 4.2 Modelet e të Dhënave (ERD)
Çdo shërbim ka bazën e tij të të dhënave të izoluar.
*   **Identity DB:** Tabelat `perdoruesit`, `qytetet`.
*   **Catalog DB:** Tabelat `profili_profesionistit`, `sherbimet`, `kategorite`.
*   **Booking DB:** Tabelat `kerkesa_punes`, `terminet`, `liria_ores`.
*   **Feedback DB:** Tabelat `reviews`, `review_responses`.

*(Referencë për ERD diagramin në `docs/database_diagram.drawio`)*

---

## 5. Përshkrimi i Implementimit

### 5.1 Teknologjitë e Përdorura
*   **Backend:** Node.js, Express.js.
*   **Frontend:** React, TailwindCSS.
*   **Database:** PostgreSQL (Sequelize ORM).
*   **DevOps:** Docker, Docker Compose, Kubernetes (Configs).
*   **Tools:** Swagger (API Docs), Git (Version Control).

### 5.2 Sfidat e Implementimit
*   **Sinkronizimi i të dhënave:** Përdorimi i Kafka për të sinkronizuar krijimin e profileve midis Identity dhe Catalog.
*   **Menaxhimi i Transaksioneve:** Sigurimi që rezervimet të jenë konsistente.
*   **Deployments:** Konfigurimi i Kubernetes manifests për të gjitha shërbimet.

---

## 6. Testimi dhe Rezultatet

### 6.1 Testimi i API (Swagger)
Të gjitha API-të janë dokumentuar dhe testuar përmes OpenAPI/Swagger.
*   Endpointet u verifikuan për validim të saktë të të dhënave (p.sh. email, data).
*   Status kodet (200, 400, 401, 404, 500) kthehen saktë.

### 6.2 Testimi i Performancës
*   Koha mesatare e përgjigjes për API është optizimuar (<200ms).
*   Cache hit ratio në Redis tregon efikasitet në marrjen e sesioneve.

---

## 7. Përfundime dhe Rekomandime

Projekti ka arritur me sukses implementimin e një arkitekture moderne dhe të shkallëzueshme.
**Rekomandime:**
*   Implementimi i plotë i CI/CD pipeline për prodhim automatik.
*   Shtimi i Elasticsearch për kërkim më të avancuar të shërbimeve.
*   Migrimi në një infrastrukturë Cloud (AWS/Azure) për testim real të shkallëzueshmërisë.

---

## 8. Referencat

1.  Node.js Documentation.
2.  PostgreSQL Documentation.
3.  Apache Kafka Documentation.
4.  Kubernetes Official Docs.
5.  React.js Documentation.

---

## 9. Shtojcat

*(Vendosni këtu screenshot-et e aplikacionit, Swagger UI, dhe diagramet)*

---
**Deklaratë Origjinaliteti**
Unë konfirmoj se kjo punë është origjinale dhe është zhvilluar nga unë/grupi im, duke respektuar standardet e integritetit akademik.
