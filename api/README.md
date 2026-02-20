# Job Application Tracker - Backend API

The backend API for the Job Application Tracker, built with Node.js, Express, and PostgreSQL.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express 5
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Authentication:** Better Auth
- **Validation:** Zod
- **Type Safety:** TypeScript

## Key Features

- **Authentication System**: Secure user management with Better Auth (email/password, session management).
- **Application Management**: CRUD operations for job applications, including status tracking (with unified application statuses directly on the application model) and archiving.
- **Job Parsing**: Custom parser to extract job details from URLs (supports Glassdoor and generic pages).
- **Calendar Integration**: Google Calendar sync for interview tracking via the `calendar_events` table and OAuth2.
- **Admin Tools**: User management and email template testing.
- **Security**:
    - Rate limiting (strict for auth, flexible for general API)
    - SSRF protection for the job parser
    - Input validation with Zod

## API Structure

- `src/routes/`
    - `applications.ts`: Core application CRUD operations
    - `admin.ts`: Admin-only user management and email testing
    - `calendar.ts`: Google Calendar OAuth2 and event sync integration
    - `events.ts`: Internal event tracking
    - `parser.ts`: Job description parsing endpoint
    - `statuses.ts`: Status history management (Deprecated in favor of direct status columns on the application model)

## Setup & Development

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

1. Install dependencies:

    ```bash
    npm install
    ```

2. Configure environment variables:
   Copy `.env.example` to `.env` and fill in your details:

    ```env
    DATABASE_URL=postgres://...
    BETTER_AUTH_SECRET=...
    # ... other variables
    ```

3. Database Migration:

    ```bash
    # Push schema to database
    npm run db:push

    # Or generate and apply migrations
    npm run db:generate
    npm run db:migrate
    ```

4. Start Development Server:
    ```bash
    npm run dev
    ```
    Server runs on port 4000 by default.

## Scripts

- `npm run dev`: Start dev server with hot reload
- `npm run build`: Compile TypeScript to JavaScript
- `npm run start`: Run the built application
- `npm run db:push`: Push Drizzle schema to database
- `npm run db:studio`: Open Drizzle Studio to view database content
