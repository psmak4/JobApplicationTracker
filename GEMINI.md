# GEMINI.md

## Project Overview

**Job Application Tracker** is a comprehensive full-stack application designed to help job seekers manage their applications, interview stages, and history. It consists of a decoupled architecture with a Node.js backend and a React frontend.

### Architecture & Tech Stack

- **Frontend (`/ui`):**
  - **Framework:** React 19 with Vite.
  - **Structure:** Multi-Page Application (MPA) with a static landing page (`index.html`) and a React SPA (`app.html` mounted at `/app`).
  - **Routing:** `react-router-dom` with a `/app` basename.
  - **State & Data:** `@tanstack/react-query` for server state, `axios` for API calls.
  - **Authentication:** `better-auth` React client.
  - **Styling:** Tailwind CSS, `shadcn/ui` components, and `next-themes` for dark mode support.
- **Backend (`/api`):**
  - **Server:** Express 5.
  - **Database:** PostgreSQL managed via **Drizzle ORM**.
  - **Authentication:** `better-auth` Node.js handler with rate limiting.
  - **Validation:** `zod`.
  - **Security:** Rate limiting via `express-rate-limit` and `express-slow-down`.

---

## Building and Running

### Prerequisites

- Node.js (v18+)
- PostgreSQL instance

### Backend (`/api`)

1.  **Install dependencies:** `npm install`
2.  **Environment Variables:** Copy `.env.example` to `.env` and configure:
    - `DATABASE_URL` - PostgreSQL connection string
    - `PORT` - Server port (default: 4000)
    - `CORS_ORIGINS` - Comma-separated list of allowed frontend origins
    - `BETTER_AUTH_SECRET` - Secret key for Better Auth
    - `BETTER_AUTH_URL` - API URL for Better Auth
    - `ADMIN_USER_IDS` - Comma-separated list of user IDs with admin privileges
3.  **Database Setup:**
    - `npm run db:generate` - Generate migrations.
    - `npm run db:push` - Push schema to DB (or `db:migrate`).
    - `npm run db:studio` - Open Drizzle Studio to view data.
4.  **Run Development Server:** `npm run dev` (starts on http://localhost:4000)

### Frontend (`/ui`)

1.  **Install dependencies:** `npm install`
2.  **Environment Variables:** Copy `.env.example` to `.env` and configure:
    - `VITE_API_URL` - API base URL (e.g., `http://localhost:4000/api`)
    - `VITE_AUTH_URL` - Auth base URL (e.g., `http://localhost:4000`)
3.  **Run Development Server:** `npm run dev` (starts on http://localhost:5173)
    - Landing page: http://localhost:5173/
    - App Dashboard: http://localhost:5173/app.html (Handled via dev middleware to support `/app` refreshes)
4.  **Build for Production:** `npm run build`
    - Outputs to `dist/` with `index.html` and `app.html`.

---

## Development Conventions

### Type Safety

- **Express Request Extension:** The `Request` type is extended in `api/src/types/express.d.ts` to include `user` and `session` properties. Avoid using `(req as any)`.
- **Error Handling:** Use the `getErrorMessage()` utility from `ui/src/lib/error-utils.ts` for consistent error handling in catch blocks.
- **Safe Storage:** Use `safeLocalStorage` from `ui/src/lib/utils.ts` for localStorage operations to handle cases where storage is unavailable.

### Centralized Constants & Schemas

- **Status Options:** Use `APPLICATION_STATUS_OPTIONS` from `ui/src/constants/index.ts` instead of hardcoding status arrays.
- **Work Type Options:** Use `WORK_TYPE_OPTIONS` from `ui/src/constants/index.ts` for work type dropdowns.
- **Form Schemas:** Use shared Zod schemas from `ui/src/lib/schemas.ts` (`applicationSchema`, `newApplicationSchema`) instead of duplicating validation logic.
- **Query Keys:** Use centralized query key factories from `ui/src/lib/queryKeys.ts` for React Query cache keys:
  - `applicationQueryKeys.all` - List of all applications
  - `applicationQueryKeys.detail(id)` - Single application by ID
  - `adminQueryKeys.users` / `adminQueryKeys.usersList(params)` - Admin user management
  - `emailQueryKeys.templates` - Email templates

### Component Organization

- **Dashboard Components:** Extracted into `ui/src/components/dashboard/`:
  - `DashboardToolbar.tsx` - Desktop filter/sort controls
  - `DashboardMobileFilters.tsx` - Mobile sheet with filters
  - `ApplicationTable.tsx` - Table view with memoized rows
  - `ApplicationGrid.tsx` - Card grid view with memoized cards
- **Shared Components:**
  - `AuthPageLayout.tsx` - Wrapper for auth pages (Login, Signup, etc.)
  - `ApplicationFormFields.tsx` - Shared form fields for New/Edit application
- **Custom Hooks:**
  - `useDashboardFilters.ts` - Manages filter/sort state with URL sync and localStorage persistence

### Routing & Navigation

- The app uses a hybrid MPA/SPA approach with a **sidebar navigation** using ShadCN's Sidebar component.
- Static content belongs in `ui/index.html`.
- Dynamic application logic belongs in `ui/app.html` and the `ui/src` directory.
- **Sidebar Navigation:** The main app uses `AppSidebar.tsx` which includes:
  - Dashboard (`/app`)
  - New Application (`/app/new`)
  - Admin section (collapsible, admin-only): Users (`/app/admin`), Email Testing (`/app/admin/email`)
  - User footer with profile link and sign out
- **Redirection Logic:** Always ensure redirects after login/logout point to either `/app` (dashboard) or `/` (static landing).
- **404 Handling:** Unknown routes redirect to a Not Found page.
- **URL State:** Dashboard filters are persisted to URL query params (for bookmarkability) AND localStorage (for preference memory).
- **Auth Routes:**
  - `/app/login` - User login page
  - `/app/signup` - User registration page
  - `/app/forgot-password` - Request password reset email
  - `/app/reset-password` - Set new password (accessed via email link with token)
  - `/app/verify-email` - Email verification callback (accessed via email link with token)

### Error Handling & Boundaries

- **ErrorBoundary:** The app is wrapped in `ErrorBoundary` component (`ui/src/components/ErrorBoundary.tsx`) to catch React errors gracefully.
- **LoadingSpinner:** Use `LoadingSpinner` or `LoadingFallback` from `ui/src/components/LoadingSpinner.tsx` for consistent loading states.

### Rules of Hooks

- **Important:** All React hooks must be called before any conditional returns in components. If you need to redirect based on missing params, call hooks first with fallback values (e.g., `useApplication(id ?? '')`), then do the conditional check.

### UI & Styling

- **Colors:** Uses `oklch` color variables defined in `ui/src/index.css` to match the brand identity.
- **Dark Mode:** Full dark mode support via `.dark` class. Variables are defined for both light and dark themes in `index.css`.
- **Components:** Prefer using existing `shadcn/ui` components located in `ui/src/components/ui`.
- **Accessibility:** Always add `aria-label` to icon-only buttons.

### Performance

- **React.memo:** Use `React.memo` for list item components that receive stable props (e.g., `ApplicationRow`, `ApplicationCard` in Dashboard).
- **useCallback:** Wrap event handlers passed to memoized children with `useCallback` to maintain referential equality.

### Database & API

- **Schema:** Managed in `api/src/db/schema.ts`. Always run `npm run db:generate` after changing the schema.
- **Better Auth:** Authentication tables are integrated into the Drizzle schema.
- **API Client:** Use the pre-configured `apiClient` in `ui/src/lib/api-client.ts` which handles `withCredentials` for session cookies.
- **Rate Limiting:**
  - Auth routes: 5 requests/15 min (strict)
  - Create/Update: 20 requests/min
  - Delete: 10 requests/min
  - General API: 100 requests/15 min

### Admin Plugin

The application uses Better Auth's Admin plugin for user management:

- **Admin Route:** `/app/admin` - Protected route accessible only to users with `admin` role.
- **Admin Layout:** The admin section uses a sidebar navigation (`ui/src/components/AdminLayout.tsx`) that is always visible on desktop and collapsible on mobile. To add new admin pages, update the `adminNavItems` array in `AdminLayout.tsx`.
- **Admin Features:**
  - **User Management (`/app/admin`):** View, search, ban/unban, and manage roles for all registered users.
  - **Email Testing (`/app/admin/email`):** Send test emails to your admin email address to preview email templates.
- **Admin API Endpoints (`api/src/routes/admin.ts`):**
  - `GET /api/admin/email/templates` - List available email templates.
  - `POST /api/admin/email/test` - Send a test email (requires `templateType` in body).
  - All admin endpoints are protected by `requireAdmin` middleware.
- **Setting Up Admins:**
  1. Sign up and get your user ID from the database (via Drizzle Studio: `npm run db:studio`).
  2. Add your user ID to `ADMIN_USER_IDS` in the `.env` file.
  3. Restart the API server.
  4. Alternatively, use `authClient.admin.setRole()` to promote users programmatically.
- **Admin Hooks:**
  - Use hooks from `ui/src/hooks/useAdmin.ts` for user management operations.
  - Use hooks from `ui/src/hooks/useAdminEmail.ts` for email testing operations.

### User Profile

Users can manage their account settings at `/app/profile`:

- **Profile Settings:** Update display name and view account information.
- **Profile Hooks:** Use hooks from `ui/src/hooks/useProfile.ts`:
  - `useUpdateProfile()` - Update user's name (and other fields in the future).
  - `useChangePassword()` - Change the user's password.
- **Access:** Via user dropdown menu in the header or directly at `/app/profile`.

---

## Deployment (Netlify)

- The frontend is optimized for Netlify deployment.
- A `_redirects` file in `ui/public` handles the `/app/*` rewrites to `app.html` for clean URLs and SPA routing.
- **Environment Variables:** Set `VITE_API_URL` and `VITE_AUTH_URL` in Netlify build settings for production API endpoints.
