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
    - **Authentication:** `better-auth` Node.js handler.
    - **Validation:** `zod`.

---

## Building and Running

### Prerequisites
- Node.js (v18+)
- PostgreSQL instance (configured via `.env` in `/api`)

### Backend (`/api`)
1.  **Install dependencies:** `npm install`
2.  **Environment Variables:** Create a `.env` file with `DATABASE_URL` and Better Auth secrets.
3.  **Database Setup:**
    - `npm run db:generate` - Generate migrations.
    - `npm run db:push` - Push schema to DB (or `db:migrate`).
    - `npm run db:studio` - Open Drizzle Studio to view data.
4.  **Run Development Server:** `npm run dev` (starts on http://localhost:4000)

### Frontend (`/ui`)
1.  **Install dependencies:** `npm install`
2.  **Run Development Server:** `npm run dev` (starts on http://localhost:5173)
    - Landing page: http://localhost:5173/
    - App Dashboard: http://localhost:5173/app.html (Handled via dev middleware to support `/app` refreshes)
3.  **Build for Production:** `npm run build`
    - Outputs to `dist/` with `index.html` and `app.html`.

---

## Development Conventions

### Routing & Navigation
- The app uses a hybrid MPA/SPA approach.
- Static content belongs in `ui/index.html`.
- Dynamic application logic belongs in `ui/app.html` and the `ui/src` directory.
- **Redirection Logic:** Always ensure redirects after login/logout point to either `/app` (dashboard) or `/` (static landing).

### UI & Styling
- **Colors:** Uses `oklch` color variables defined in `ui/src/index.css` to match the brand identity.
- **Dark Mode:** Supports automatic dark mode via `prefers-color-scheme`. Ensure any new components respect the CSS variables.
- **Components:** Prefer using existing `shadcn/ui` components located in `ui/src/components/ui`.

### Database & API
- **Schema:** Managed in `api/src/db/schema.ts`. Always run `npm run db:generate` after changing the schema.
- **Better Auth:** Authentication tables are integrated into the Drizzle schema.
- **API Client:** Use the pre-configured `apiClient` in `ui/src/lib/api-client.ts` which handles `withCredentials` for session cookies.

---

## Deployment (Netlify)
- The frontend is optimized for Netlify deployment.
- A `_redirects` file in `ui/public` handles the `/app/*` rewrites to `app.html` for clean URLs and SPA routing.
