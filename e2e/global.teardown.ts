/**
 * Global teardown - runs once after all tests.
 * Cleans up the test user and all associated data.
 */

import { test as teardown } from "@playwright/test";
import {
  loadTestUser,
  clearTestUser,
  getAuthStatePath,
} from "./utils/test-user";
import { getApplications, deleteApplication } from "./utils/api-client";
import * as fs from "fs";

teardown("Clean up test user and data", async ({ page, context }) => {
  console.log("\n🧹 Global Teardown: Cleaning up test data...");

  const testUser = loadTestUser();

  if (!testUser) {
    console.log("⚠️ No test user found to clean up");
    return;
  }

  try {
    // Get cookies for API calls
    const cookies = await context.cookies();
    const cookieString = cookies.map((c) => `${c.name}=${c.value}`).join("; ");

    // Delete all applications
    try {
      const applications = await getApplications(cookieString);
      console.log(`📦 Found ${applications.length} applications to delete`);

      for (const app of applications) {
        await deleteApplication(app.id, cookieString);
      }
      console.log("✅ All applications deleted");
    } catch (error) {
      console.warn("⚠️ Could not clean up applications:", error);
    }

    // Navigate to logout
    try {
      await page.goto("http://localhost:5173/app");
      await page.waitForLoadState("networkidle");

      // Try to find and click sign out (in the sidebar)
      const signOutButton = page.locator('button:has-text("Sign out")');
      if (await signOutButton.isVisible({ timeout: 2000 })) {
        await signOutButton.click();
        await page.waitForURL(/\/app\/login/);
      }
    } catch {
      // Logout is optional for cleanup
    }
  } catch (error) {
    console.warn("⚠️ Cleanup encountered issues:", error);
  }

  // Clear local test user data
  clearTestUser();

  // Clean up auth state file
  try {
    const authStatePath = getAuthStatePath();
    if (fs.existsSync(authStatePath)) {
      fs.unlinkSync(authStatePath);
    }
  } catch {
    // Ignore
  }

  console.log(`✅ Cleanup complete for: ${testUser.email}`);
});
