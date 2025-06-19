# Project Overview

This is an educational learning management system that has been successfully migrated from Replit Agent to the standard Replit environment. The application provides content management, quiz functionality, topic organization, and student progress tracking.

## Architecture

- **Frontend**: React with Vite, TypeScript, Tailwind CSS, and Radix UI components
- **Backend**: Express.js server with TypeScript
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Authentication**: Session-based (OAuth disabled per user request)

## Recent Changes

- **December 19, 2024**: Successfully migrated from Replit Agent to Replit environment
  - Migrated from Supabase to Neon PostgreSQL database
  - Imported data: 118 users, 116 content records, 111 topics
  - Disabled Google OAuth authentication
  - Fixed session management and database connections
  - Application running successfully on port 5000

## Database

- **Connection**: Neon PostgreSQL with connection pooling
- **ORM**: Drizzle with schema-first approach
- **Tables**: users, topics, content, questions, images, videos, assignments, and more
- **Data**: Fully populated with imported production data

## User Preferences

- OAuth authentication disabled
- Focus on core functionality over authentication complexity
- Prefer direct database operations over external service dependencies

## Current Status

✅ Migration completed successfully
✅ Database populated with production data
✅ Application running without errors
✅ All core features operational