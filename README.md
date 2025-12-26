# Fiks

## Install Docker (Important)

In order to run the application at all docker desktop must be installed. Alongside it windows subsystem for linux should be updated as well (if needed).

## How to run the application?

Each service will be defined and ran separately as per the project requirements.
Running docker compose up from the project root will start up the project. Go 
to terminal and run:

```
docker compose up
```

This will run all available docker packages/containers.
Right now only the frontend package is configured.


## Frontend

Frontend has been built with vite, so to access the pages on the frontend go to: 
`localhost:5173`

## Database Design - Microservice Architecture

Each microservice has its own database. In the `/docs` folder in the project root you will find a database diagram and a `.txt` file with more information. 