import type { Application, ApplicationStatus, StatusHistoryEntry } from "../types";

const STORAGE_KEY = "job-applications";

export const ApplicationService = {
  getAll: (): Application[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Failed to load applications from localStorage", error);
      return [];
    }
  },

  getById: (id: string): Application | undefined => {
    const apps = ApplicationService.getAll();
    return apps.find((app) => app.id === id);
  },

  create: (
    data: Omit<Application, "id" | "createdAt" | "updatedAt" | "statusHistory"> & {
      initialStatus: ApplicationStatus;
      initialStatusDate: string;
    }
  ): Application => {
    const apps = ApplicationService.getAll();
    
    const initialHistory: StatusHistoryEntry = {
      id: crypto.randomUUID(),
      status: data.initialStatus,
      date: data.initialStatusDate,
      createdAt: new Date().toISOString(),
    };

    const newApp: Application = {
      id: crypto.randomUUID(),
      company: data.company,
      jobTitle: data.jobTitle,
      jobDescriptionUrl: data.jobDescriptionUrl,
      salary: data.salary,
      location: data.location,
      workType: data.workType,
      contactInfo: data.contactInfo,
      notes: data.notes,
      statusHistory: [initialHistory],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    apps.push(newApp);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
    return newApp;
  },

  update: (id: string, updates: Partial<Omit<Application, "id" | "createdAt" | "updatedAt" | "statusHistory">>): Application => {
    const apps = ApplicationService.getAll();
    const index = apps.findIndex((app) => app.id === id);

    if (index === -1) {
      throw new Error("Application not found");
    }

    const updatedApp = {
      ...apps[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    apps[index] = updatedApp;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
    return updatedApp;
  },

  addStatus: (id: string, status: ApplicationStatus, date: string): Application => {
    const apps = ApplicationService.getAll();
    const index = apps.findIndex((app) => app.id === id);

    if (index === -1) {
        throw new Error("Application not found");
    }

    const newHistory: StatusHistoryEntry = {
        id: crypto.randomUUID(),
        status,
        date,
        createdAt: new Date().toISOString(),
    };

    // Add to history and sort chronologically just in case, though usually appending is fine if date is new.
    // The PRD says "Automatically ordered chronologically".
    const updatedHistory = [...apps[index].statusHistory, newHistory].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const updatedApp = {
        ...apps[index],
        statusHistory: updatedHistory,
        updatedAt: new Date().toISOString(),
    };

    apps[index] = updatedApp;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
    return updatedApp;
  },

  deleteStatus: (id: string, historyId: string): Application => {
    const apps = ApplicationService.getAll();
    const index = apps.findIndex((app) => app.id === id);

    if (index === -1) {
        throw new Error("Application not found");
    }

    const app = apps[index];
    if (app.statusHistory.length <= 1) {
         throw new Error("Cannot delete the only status entry.");
    }

    const updatedHistory = app.statusHistory.filter(entry => entry.id !== historyId);

    const updatedApp = {
        ...app,
        statusHistory: updatedHistory,
        updatedAt: new Date().toISOString(),
    };

    apps[index] = updatedApp;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
    return updatedApp;
  },

  delete: (id: string): void => {
    const apps = ApplicationService.getAll();
    const filteredApps = apps.filter((app) => app.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredApps));
  },
};
