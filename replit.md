# Educational Platform Application

## Overview

This is a full-stack educational platform built with React, Express.js, and PostgreSQL. The application provides a comprehensive learning management system with features for content delivery, quiz management, live classes, student progress tracking, and interactive learning activities including matching exercises and writing assignments.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Framework**: Radix UI components with Tailwind CSS
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **ORM**: Drizzle ORM for type-safe database operations
- **Session Management**: Express session with PostgreSQL store
- **Authentication**: Multi-provider system (Google OAuth, custom student login)
- **API Design**: RESTful endpoints with JSON responses

### Data Storage Solutions
- **Primary Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM with schema-first approach
- **Session Storage**: PostgreSQL-backed session store
- **File Storage**: Static file serving for uploaded content

## Key Components

### Authentication System
- **Google OAuth**: Passport.js integration for staff/teacher authentication
- **Student Authentication**: Custom system using student ID and Meraki email
- **Session Management**: Secure session handling with PostgreSQL storage
- **Role-based Access**: Different access levels for students and teachers

### Content Management
- **Topics**: Hierarchical topic organization with parent-child relationships
- **Content**: Rich content items with images, videos, and text
- **Questions**: Multiple-choice questions with explanations and difficulty levels
- **Matching Activities**: Interactive matching exercises with scoring
- **Writing Prompts**: Creative writing assignments with submission tracking

### Assessment System
- **Assignments**: Configurable quizzes with question pools
- **Student Attempts**: Detailed tracking of student quiz attempts
- **Progress Tracking**: Real-time monitoring of student learning progress
- **Scoring**: Automated scoring with detailed feedback

### Live Learning Features
- **Live Classes**: Real-time class monitoring and activity tracking
- **Student Monitoring**: Teacher dashboard for observing student activities
- **Activity Feeds**: Live updates of student interactions and progress

## Data Flow

1. **Authentication Flow**: Users authenticate via Google OAuth or student credentials
2. **Content Delivery**: Topics → Content → Questions/Activities workflow
3. **Assessment Flow**: Assignment creation → Student attempts → Results tracking
4. **Live Monitoring**: Real-time activity capture → Dashboard updates → Teacher insights

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless database connection
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management and caching
- **passport**: Authentication middleware
- **passport-google-oauth20**: Google OAuth strategy

### UI/UX Dependencies
- **@radix-ui/***: Headless UI components for accessibility
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **react-hook-form**: Form management
- **@hookform/resolvers**: Form validation

### Development Dependencies
- **vite**: Build tool and development server
- **tsx**: TypeScript execution for development
- **esbuild**: JavaScript bundler for production

## Deployment Strategy

### Environment Configuration
- **Development**: Replit environment with hot reload
- **Production**: Autoscale deployment on Replit
- **Database**: Neon serverless PostgreSQL with connection pooling

### Build Process
1. **Frontend Build**: Vite builds React application to `dist/public`
2. **Backend Build**: esbuild bundles server code to `dist/index.js`
3. **Static Assets**: Served from build output directory

### Performance Optimizations
- **Database Connection Pooling**: Configured for serverless environment
- **Query Caching**: TanStack Query with 5-minute stale time
- **Session Management**: PostgreSQL-backed sessions for scalability

## Changelog

```
Changelog:
- June 19, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```