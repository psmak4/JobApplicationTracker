/**
 * Test data fixture.
 * Provides helpers for creating and cleaning up test application data.
 */

import { test as base, expect, BrowserContext, Page } from "@playwright/test";
import {
  createApplication,
  deleteApplication,
  getApplications,
  TestApplication,
} from "../utils/api-client";

interface TestDataFixtures {
  /**
   * Create test applications via API (faster than UI).
   * Returns a cleanup function to delete created applications.
   */
  createTestApplication: (
    data: TestApplication,
  ) => Promise<TestApplication & { id: string }>;

  /**
   * Clean up all applications for the test user.
   */
  cleanupAllApplications: () => Promise<void>;
}

/**
 * Get auth cookie from browser context
 */
async function getAuthCookie(context: BrowserContext): Promise<string> {
  const cookies = await context.cookies();
  return cookies.map((c) => `${c.name}=${c.value}`).join("; ");
}

// Extend base test with test data helpers
export const test = base.extend<TestDataFixtures>({
  createTestApplication: async ({ context }, use) => {
    const createdIds: string[] = [];

    const createFn = async (data: TestApplication) => {
      const authCookie = await getAuthCookie(context);
      const application = await createApplication(data, authCookie);
      createdIds.push(application.id);
      return application;
    };

    await use(createFn);

    // Cleanup: delete all created applications after the test
    const authCookie = await getAuthCookie(context);
    for (const id of createdIds) {
      try {
        await deleteApplication(id, authCookie);
      } catch {
        // Ignore cleanup errors
      }
    }
  },

  cleanupAllApplications: async ({ context }, use) => {
    const cleanupFn = async () => {
      try {
        const authCookie = await getAuthCookie(context);
        const applications = await getApplications(authCookie);
        for (const app of applications) {
          await deleteApplication(app.id, authCookie);
        }
      } catch {
        // Ignore cleanup errors
      }
    };

    await use(cleanupFn);
  },
});

export { expect };
