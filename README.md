# Fiks

## Install Docker (Important)

In order to run the application at all docker desktop must be installed. Alongside it windows subsystem for linux should be updated as well (if needed).

## How to run the application?

Each service will be defined and ran separately as per the project requirements.
Running docker compose up from the project root will start up the project. Go 
to terminal and run:

```
docker compose up --build
```

This will run all available docker packages/containers.
Right now only the frontend package is configured.


## Frontend

Frontend has been built with vite, so to access the pages on the frontend go to: 
`localhost:5173`

## Database Design - Microservice Architecture

Each microservice has its own database. In the `/docs` folder in the project root you will find a database diagram and a `.txt` file with more information. 

---

## Viewing Database Tables (pgAdmin)

The project includes **pgAdmin 4**, a web-based GUI for managing PostgreSQL databases. This allows you to easily inspect and query the data stored in our microservices.

### Access pgAdmin

1. Make sure the Docker containers are running (`docker compose up`)
2. Open your browser and go to: **http://localhost:5050**
3. Login with:
   - **Email**: `admin@admin.com`
   - **Password**: `admin`

### Register a Database Server

Once logged in, you need to connect to a database:

1. Right-click on **Servers** in the left panel → **Register** → **Server...**
2. In the **General** tab:
   - **Name**: Give it a friendly name (e.g., `Identity DB`)
3. In the **Connection** tab:
   - **Host name/address**: Use the Docker service name (e.g., `identity-db`, `catalog-db`, `booking-db`, or `feedback-db`)
   - **Port**: `5432`
   - **Maintenance database**: The database name (e.g., `identity`, `catalog`, `booking`, `feedback`)
   - **Username**: `postgres`
   - **Password**: `postgres`
   - Check **Save password** for convenience
4. Click **Save**

### Browse Tables

After connecting:

1. Expand the server → **Databases** → (your database) → **Schemas** → **public** → **Tables**
2. Right-click on any table and select **View/Edit Data** → **All Rows** to see the data

### Available Databases

| Service   | Host Name      | Database Name |
|-----------|----------------|---------------|
| Identity  | `identity-db`  | `identity`    |
| Catalog   | `catalog-db`   | `catalog`     |
| Booking   | `booking-db`   | `booking`     |
| Feedback  | `feedback-db`  | `feedback`    |
