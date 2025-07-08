# Docker Setup for Diverse Quiz Hub

This document provides instructions for running the Diverse Quiz Hub application using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose installed on your system

## Quick Start

### Using Docker Compose (Recommended)

1. **Build and run the application:**
   ```bash
   docker-compose up --build
   ```

2. **Run in detached mode:**
   ```bash
   docker-compose up -d --build
   ```

3. **Stop the application:**
   ```bash
   docker-compose down
   ```

### Using Docker directly

1. **Build the Docker image:**
   ```bash
   docker build -t diverse-quiz-hub .
   ```

2. **Run the container:**
   ```bash
   docker run -p 3003:3003 -p 5173:5173 diverse-quiz-hub
   ```

## Access the Application

Once the container is running, you can access:

- **Main Application:** http://localhost:3003
- **Frontend Development Server:** http://localhost:5173 (if running in development mode)
- **Health Check:** http://localhost:3003/api/health

## Environment Variables

You can customize the application by setting environment variables in the `docker-compose.yml` file or by creating a `.env` file:

```env
NODE_ENV=production
DATABASE_URL=your_database_url
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Development Mode

For development with hot reloading, you can mount your source code as a volume:

```yaml
services:
  diverse-quiz-hub:
    build: .
    ports:
      - "3003:3003"
      - "5173:5173"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
```

## Troubleshooting

### Container won't start
- Check if ports 3003 and 5173 are already in use
- Verify that Docker has enough memory allocated
- Check the container logs: `docker-compose logs`

### Database connection issues
- Ensure your database is accessible from the Docker container
- Check your database connection string in environment variables
- Verify network connectivity between containers

### Build failures
- Clear Docker cache: `docker system prune -a`
- Ensure all dependencies are properly listed in package.json
- Check for any missing environment variables

## Useful Commands

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f

# Execute commands in running container
docker-compose exec diverse-quiz-hub sh

# Rebuild without cache
docker-compose build --no-cache

# Remove all containers and volumes
docker-compose down -v
```

## Production Deployment

For production deployment, consider:

1. Using a reverse proxy (nginx) in front of the application
2. Setting up proper SSL certificates
3. Configuring environment-specific variables
4. Setting up monitoring and logging
5. Using Docker secrets for sensitive data
