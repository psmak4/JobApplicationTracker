# Job Application Tracker - Product Requirements Document

## 1. Project Overview

### 1.1 Purpose
A personal web application to track job applications, their current status, and application history throughout the job search process.

### 1.2 Target User
Individual job seeker managing multiple job applications simultaneously.

### 1.3 Tech Stack
- **Frontend Framework:** React 19
- **Build Tool:** Vite
- **Routing:** React Router
- **Styling:** Tailwind CSS + shadcn/ui components
- **Data Storage:** localStorage (with architecture to support future database migration)
- **Future Backend:** Designed for easy migration to Firebase/Neon/BetterAuth + Postgres

---

## 2. Core Features

### 2.1 Application Data Model

Each job application will track:

**Basic Information:**
- Company name (required)
- Job title (required)
- Job description URL (optional)
- Salary/compensation (optional)
- Contact information (optional)

**Status & Timeline:**
- Current status (derived from most recent history entry)
- Status history (timeline/log of status changes)
  - Each history entry contains:
    - Status (Applied, Phone Screen, Technical Interview, On-site Interview, Offer, Rejected, Withdrawn, etc.)
    - Date of status change
    - Automatically ordered chronologically

**Additional Data:**
- General notes field (markdown support optional)
- Created date (auto-generated)
- Last updated date (auto-generated)

### 2.2 Status Options
Predefined status values:
- Applied
- Phone Screen
- Technical Interview
- On-site Interview
- Offer
- Rejected
- Withdrawn
- Other (custom)

### 2.3 Application Management

**Create Application:**
- Dedicated page/form for adding new applications
- Initial status entry required (typically "Applied" with current date)
- All fields accessible in single form

**View Applications:**
- List/table view of all applications
- Display key information: company, job title, current status, last updated date
- Color coding for staleness:
  - Normal: Updated within last 7 days
  - Yellow: Updated 8-14 days ago
  - Red: Updated 15+ days ago (only for active statuses: not Rejected, Withdrawn, or Offer)

**Edit Application:**
- Dedicated page for editing existing application details
- Ability to add new status history entries
- Cannot delete or edit existing history entries (audit trail)
- Can edit all other fields

**Delete Application:**
- Ability to delete entire application
- Confirmation dialog required

### 2.4 Filtering & Sorting

**Filter by:**
- Status (current status)
- Company (dropdown/select)
- Date range (optional for v1)

**Sort by:**
- Company name (A-Z, Z-A)
- Job title (A-Z, Z-A)
- Last updated date (newest first, oldest first)
- Salary (high to low, low to high)
- Application date (newest first, oldest first)

### 2.5 Data Export
- Export all data to JSON format
- Download button in settings/header area
- Nice-to-have: CSV export option

---

## 3. User Interface

### 3.1 Navigation Structure
```
/                    - Dashboard/List view of all applications
/applications/new    - Create new application
/applications/:id    - View/edit specific application
```

### 3.2 Key Pages

**Dashboard/List Page (`/`)**
- Header with app title and "New Application" button
- Filter controls (status, company)
- Sort controls
- Table/card view of applications with:
  - Company
  - Job Title
  - Current Status (badge/pill)
  - Last Updated (with color coding)
  - Salary
  - Quick actions (view/edit, delete)

**Create Application Page (`/applications/new`)**
- Form with all application fields
- Initial status entry section (status + date)
- Save and Cancel buttons
- Redirect to list view on save

**Application Detail/Edit Page (`/applications/:id`)**
- Two sections:
  1. Application Details (editable fields)
  2. Status History Timeline (chronological view, add new entry)
- Save changes button
- Delete application button (with confirmation)
- Notes section (textarea)

### 3.3 UI Components (shadcn/ui)
- Button
- Input
- Textarea
- Select/Dropdown
- Dialog (for confirmations)
- Table
- Badge (for status pills)
- Card
- Form components
- Date Picker
- Label

---

## 4. Technical Architecture

### 4.1 Data Storage Strategy

**Phase 1: localStorage**
- Store all applications in localStorage as JSON
- Key: `job-applications`
- Value: Array of application objects

**Data Access Layer:**
- Create abstraction layer (service/repository pattern)
- All CRUD operations go through this layer
- Example: `ApplicationService.getAll()`, `ApplicationService.create()`, etc.

**Future Migration Path:**
- Service layer will be updated to call API endpoints
- No changes required to React components
- localStorage can serve as offline cache

### 4.2 State Management
- React Context or simple prop drilling for v1
- Application list state
- Filter/sort state
- Form state (React Hook Form or native state)

### 4.3 Routing
React Router v6+ with:
- Root layout with navigation
- Protected routes (future: authentication)
- 404 page

### 4.4 Data Validation
- Required fields: company, job title
- Date validation (no future dates for past events)
- URL validation for job description link

---

## 5. Non-Functional Requirements

### 5.1 Performance
- Fast load times (localStorage is synchronous but fast)
- Responsive UI (no blocking operations)

### 5.2 Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- localStorage support required

### 5.3 Responsive Design
- Mobile-friendly (responsive tables/cards)
- Desktop-optimized

### 5.4 Data Persistence
- Auto-save on form submission
- No data loss on page refresh
- Export capability for backup

---

## 6. Future Enhancements (Out of Scope for V1)

- Analytics dashboard (application metrics, response rates)
- Email notifications/reminders
- Bulk operations
- Document attachments
- Search functionality across all fields
- CSV import
- Multi-user support with authentication
- Calendar integration for interview scheduling
- Browser extension for quick adds
- Mobile app

---

## 7. Development Phases

### Phase 1: Core CRUD
- Set up Vite + React 19 + React Router
- Implement localStorage service layer
- Build application list page with basic display
- Create/edit/delete functionality

### Phase 2: Enhanced UX
- Add filtering and sorting
- Implement status history timeline
- Add color coding for staleness
- Polish UI with shadcn/ui components

### Phase 3: Additional Features
- Data export functionality
- Form validation and error handling
- Loading states and optimistic updates
- 404 and error pages

### Phase 4: Database Preparation
- Refactor service layer for API readiness
- Add TypeScript interfaces matching future database schema
- Document migration path

---

## 8. Success Metrics

For v1, success means:
- ✅ Can create, read, update, delete applications
- ✅ Status history is tracked accurately
- ✅ Filtering and sorting work correctly
- ✅ Data persists across browser sessions
- ✅ Color coding helps identify stale applications
- ✅ UI is intuitive and responsive
- ✅ Easy to export data for backup

---

## 9. Open Questions & Decisions

- **Q:** Should we use TypeScript?
  - **A:** Recommended for better type safety and easier database migration

- **Q:** What date format for display?
  - **A:** Will use locale-aware formatting (e.g., "Jan 5, 2025")

- **Q:** Max number of applications before performance concerns?
  - **A:** localStorage should handle 100s-1000s easily; monitor if needed

---

## Appendix A: Data Schema

```typescript
interface Application {
  id: string; // UUID
  company: string;
  jobTitle: string;
  jobDescriptionUrl?: string;
  salary?: string;
  contactInfo?: string;
  notes?: string;
  statusHistory: StatusHistoryEntry[];
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}

interface StatusHistoryEntry {
  id: string; // UUID
  status: ApplicationStatus;
  date: string; // ISO date
  createdAt: string; // ISO date (when this entry was added)
}

type ApplicationStatus = 
  | "Applied"
  | "Phone Screen"
  | "Technical Interview"
  | "On-site Interview"
  | "Offer"
  | "Rejected"
  | "Withdrawn"
  | "Other";
```

---

**Document Version:** 1.0  
**Last Updated:** January 19, 2025  
**Author:** Product Planning Session