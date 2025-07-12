# ATELIER ISSEI - Artist Portfolio and Gallery Management System

## Overview

This is a full-stack web application for Japanese artist ISSEI's portfolio and gallery management system. The application features a public-facing website showcasing artworks, exhibitions, and artist information, along with a secure admin dashboard for content management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **Styling**: Tailwind CSS with custom theme configuration
- **UI Components**: Radix UI primitives with custom shadcn/ui components
- **State Management**: TanStack React Query for server state management
- **Build Tool**: Vite for fast development and optimized builds
- **Internationalization**: Japanese (ja) as primary language with HTML lang attribute

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Session Management**: Express-session with MemoryStore
- **File Uploads**: Multer for handling artwork image uploads
- **Authentication**: Bcrypt for password hashing with session-based admin auth
- **API Design**: RESTful endpoints for CRUD operations

### Database Architecture
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Connection**: Neon serverless driver with WebSocket support
- **Migrations**: Drizzle Kit for schema management

## Key Components

### Data Models
- **Artworks**: Core entity with image URLs, pricing, location tracking, and interior display images
- **Collections**: Grouping mechanism for related artworks by theme or series
- **Exhibitions**: Event management with location, date, and image galleries
- **Admin Users**: Secure authentication for content management
- **News**: Blog-style content for updates and announcements
- **Testimonials/Voices**: Customer feedback and reviews
- **Contacts**: Contact form submissions with email integration

### Authentication System
- **Admin Authentication**: Session-based with bcrypt password hashing
- **Secure Admin URL**: Generated random URL path for admin access
- **Session Configuration**: 24-hour expiration with secure HTTP-only cookies

### File Management
- **Static Assets**: Organized in `/public/artworks/` directory
- **Upload Handling**: Multer with file size limits (30MB) and type validation
- **Image Processing**: JPEG and PNG support with error handling and fallbacks

### AI Integration
- **OpenAI Integration**: GPT-4 for generating artwork descriptions and collection summaries
- **Vision API**: Automated artwork analysis and description generation
- **Content Generation**: Smart content creation for exhibitions and collections

## Data Flow

### Public Website Flow
1. User visits public pages (artworks, exhibitions, profile, etc.)
2. React Query fetches data from REST API endpoints
3. Server queries PostgreSQL database using Drizzle ORM
4. Data is returned and cached on client-side
5. Images are served from static file directories

### Admin Management Flow
1. Admin authenticates via secure URL with credentials
2. Session-based authentication validates admin access
3. Admin performs CRUD operations through protected endpoints
4. File uploads are processed and stored in organized directories
5. Database updates are immediately reflected on public site

### Content Generation Flow
1. Admin uploads artwork images
2. OpenAI Vision API analyzes images
3. GPT-4 generates descriptions and metadata
4. Content is stored in database with generated descriptions
5. Public site displays enhanced content automatically

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Client-side data fetching and caching
- **@radix-ui/react-***: Accessible UI component primitives
- **bcryptjs**: Password hashing for security
- **multer**: File upload handling
- **nodemailer**: Email functionality for contact forms
- **openai**: AI-powered content generation

### Development Dependencies
- **tsx**: TypeScript execution for development
- **vite**: Fast build tool and development server
- **tailwindcss**: Utility-first CSS framework
- **@replit/vite-plugin-shadcn-theme-json**: Theme configuration plugin

### Production Dependencies
- **express**: Web application framework
- **express-session**: Session management
- **memorystore**: Session storage backend

## Deployment Strategy

### Environment Configuration
- **Development**: Uses DATABASE_URL environment variable
- **Production**: Requires PRODUCTION_DATABASE_URL and ALLOW_PRODUCTION_MIGRATION flag
- **Smart Start Script**: Automatically detects environment and runs appropriate commands

### Build Process
1. Frontend builds to `/dist/public/` directory
2. Backend builds to `/dist/` directory using esbuild
3. Static assets are organized for production serving
4. Production start scripts handle environment detection

### Database Management
- **Migration Safety**: Production migrations require explicit environment variable
- **Connection Switching**: Automatic database URL selection based on NODE_ENV
- **Schema Management**: Drizzle Kit handles migrations and schema updates

### Security Considerations
- **Admin URL Obfuscation**: Random path generation for admin access
- **Session Security**: HTTP-only cookies with secure configuration
- **File Upload Validation**: Type and size restrictions on uploads
- **Production Safeguards**: Migration locks and environment validation

The application is designed to be deployed on Replit with automatic environment detection and optimized for both development and production workflows.