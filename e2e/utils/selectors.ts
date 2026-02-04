/**
 * Shared selectors for common UI elements.
 * Using data-testid, roles, and text content for reliable selection.
 */

export const selectors = {
  // Navigation
  nav: {
    dashboard: 'a[href="/app"]',
    newApplication: 'a[href="/app/new"]',
    logout: 'button:has-text("Sign out")',
  },

  // Auth forms
  auth: {
    emailInput: "#email",
    passwordInput: "#password",
    nameInput: "#name",
    loginButton: 'button[type="submit"]:has-text("Login")',
    signupButton: 'button[type="submit"]:has-text("Sign up")',
  },

  // Dashboard
  dashboard: {
    header: 'h1:has-text("Dashboard")',
    applicationCard: "[data-application-id]",
    emptyState: "text=No job applications yet",
    newApplicationButton: 'a:has-text("New Application")',
    // Filters
    companyFilter: 'button:has-text("Company")',
    statusFilter: 'button:has-text("Status")',
    sortButton: 'button:has-text("Sort")',
  },

  // Application form
  applicationForm: {
    companyInput: "#company",
    jobTitleInput: "#jobTitle",
    jobDescriptionUrlInput: "#jobDescriptionUrl",
    salaryInput: "#salary",
    locationInput: "#location",
    workTypeSelect: "#workType",
    contactInfoInput: "#contactInfo",
    notesInput: "#notes",
    submitButton: 'button[type="submit"]',
    cancelButton: 'button:has-text("Cancel")',
  },

  // Application view
  applicationView: {
    editButton: 'a:has-text("Edit")',
    deleteButton: 'button:has-text("Delete")',
    confirmDeleteButton: 'button:has-text("Delete"):not(:has-text("Cancel"))',
    cancelDeleteButton: 'button:has-text("Cancel")',
  },

  // Common
  common: {
    loadingSpinner: '.loading-spinner, [aria-busy="true"]',
    toast: "[data-sonner-toast]",
    errorMessage: ".text-destructive",
  },
} as const;
