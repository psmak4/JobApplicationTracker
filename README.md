# Job Application Tracker

A full-stack application designed to help job seekers organize their career journey, track applications, and manage interview stages in a beautiful, modern interface.

## Features

- **Static Landing Page**: A high-performance, SEO-friendly marketing page.
- **Dynamic Dashboard**: A React-powered SPA to manage your job hunt.
- **Pipeline Management**: Track applications through various stages (Applied, Interview, Offer, etc.).
- **Authentication**: Secure login and signup powered by Better Auth.
- **Dark Mode**: Automatic theme switching based on system preferences.
- **Mobile Responsive**: Fully optimized for all screen sizes.

## Tech Stack

### Frontend (`/ui`)

- **React 19** & **Vite**
- **Tailwind CSS 4** & **shadcn/ui**
- **React Router 7**
- **TanStack Query** (React Query)
- **Better Auth** Client

### Backend (`/api`)

- **Node.js** & **Express 5**
- **PostgreSQL** with **Drizzle ORM**
- **Better Auth** Server
- **Zod** for validation

## Project Structure

```text
├── api/                  # Express Backend
│   ├── src/
│   │   ├── db/           # Drizzle schema and connection
│   │   ├── routes/       # API endpoints
│   │   └── auth.ts       # Better Auth configuration
├── ui/                   # Vite Frontend
│   ├── index.html        # Static landing page (MPA entry)
│   ├── app.html          # React SPA entry
│   ├── src/
│   │   ├── pages/        # Dashboard, Login, Signup, etc.
│   │   ├── components/   # UI components (shadcn)
│   │   └── lib/          # API and Auth clients
└── GEMINI.md             # Technical context for AI agents
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### 1. Backend Setup

1. Navigate to the `api` directory: `cd api`
2. Install dependencies: `npm install`
3. Create a `.env` file based on the required environment variables:
   ```env
   DATABASE_URL=postgres://user:password@localhost:5432/jobtracker
   BETTER_AUTH_SECRET=your_secret
   BETTER_AUTH_URL=http://localhost:4000
   ```
4. Push the database schema: `npm run db:push`
5. Start the dev server: `npm run dev`

### 2. Frontend Setup

1. Navigate to the `ui` directory: `cd ui`
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`

The landing page will be available at `http://localhost:5173/` and the application dashboard at `http://localhost:5173/app`.

## License

Built for developers, by developers.
