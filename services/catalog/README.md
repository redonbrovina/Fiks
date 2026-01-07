# Catalog Service

The Catalog service manages professional profiles and services in the Fiks platform.

## Features

- **Profile Management**: CRUD operations for professional profiles
- **Image Upload**: Profile picture upload functionality
- **Authentication**: JWT-based authentication and authorization
- **Database**: PostgreSQL with Sequelize ORM
- **Validation**: Input validation using express-validator

## API Endpoints

### Profile Management

#### Get Profile (Public)
```
GET /api/v1/catalog/profile/:profesionistiId
```

#### Create Profile (Protected)
```
POST /api/v1/catalog/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "emri": "John Doe",
  "email": "john@example.com",
  "profesionisti_id": "uuid-here",
  "nr_telefonit": "+1234567890",
  "imazh": "http://example.com/image.jpg"
}
```

#### Update Profile (Protected)
```
PUT /api/v1/catalog/profile/:profesionistiId
Authorization: Bearer <token>
Content-Type: application/json

{
  "emri": "Updated Name",
  "email": "updated@example.com",
  "nr_telefonit": "+1234567890"
}
```

#### Delete Profile (Protected)
```
DELETE /api/v1/catalog/profile/:profesionistiId
Authorization: Bearer <token>
```

#### Upload Profile Image (Protected)
```
POST /api/v1/catalog/profile/:profesionistiId/upload-image
Authorization: Bearer <token>
Content-Type: multipart/form-data

image: <file>
```

#### View Uploaded Images
```
GET /uploads/profiles/<filename>
```

## Database Schema

### Profili Table
- `profili_id`: INTEGER (Primary Key, Auto Increment)
- `emri`: STRING(100) - Professional's name
- `email`: STRING(255) - Professional's email
- `nr_telefonit`: STRING(20) - Phone number
- `imazh`: STRING(500) - Profile image URL/path
- `profesionisti_id`: UUID - Unique identifier for the professional
- `rating`: DECIMAL(3,2) - Average rating (default: 0)

## Setup & Development

### Prerequisites
- Docker & Docker Compose
- Node.js (for local development)

### Running with Docker

1. Start the services:
```bash
docker-compose up catalog catalog-db
```

2. The service will be available at `http://localhost:3002`

### Local Development

1. Install dependencies:
```bash
cd services/catalog
npm install
```

2. Set environment variables:
```bash
cp .env.example .env
# Edit .env with your database configuration
```

3. Run the service:
```bash
npm run dev
```

## Authentication

The service uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## File Upload

- Supported formats: JPEG, JPG, PNG, GIF, WebP
- Maximum file size: 5MB
- Files are stored in `/uploads/profiles/` directory
- Accessible via `/uploads/profiles/<filename>`

## Error Handling

All API responses follow a consistent error format:

```json
{
  "error": {
    "message": "Error description",
    "details": [...]
  }
}
```

## Health Check

```
GET /health
```

Returns service status and health information.
