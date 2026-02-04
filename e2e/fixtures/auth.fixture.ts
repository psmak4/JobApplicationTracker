/**
 * Authentication fixture.
 * Extends Playwright test with authenticated context for tests that require login.
 */

import { test as base, expect } from "@playwright/test";
import { loadTestUser, getAuthStatePath } from "../utils/test-user";

// Extend base test with authenticated page
export const test = base.extend<{ authenticatedPage: typeof base }>({
  // Provide a storageState that is pre-authenticated
  storageState: async ({}, use) => {
    const authStatePath = getAuthStatePath();
    await use(authStatePath);
  },
});

export { expect };

/**
 * Get the test user credentials (for tests that need them)
 */
export function getTestUser() {
  const user = loadTestUser();
  if (!user) {
    throw new Error(
      "Test user not found. Make sure global setup ran successfully.",
    );
  }
  return user;
}
