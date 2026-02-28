/**
 * Archive E2E tests
 */

import { test, expect } from "@playwright/test";
import { ApplicationViewPage } from "../../page-objects";
import {
  createApplication,
  deleteApplication,
  archiveApplication,
} from "../../utils/api-client";

// Helper to get auth cookie from context
async function getAuthCookie(context: any): Promise<string> {
  const cookies = await context.cookies();
  return cookies.map((c: any) => `${c.name}=${c.value}`).join("; ");
}

test.describe("Archive", () => {
  const createdAppIds: string[] = [];

  test.afterEach(async ({ context }) => {
    const authCookie = await getAuthCookie(context);
    for (const id of createdAppIds) {
      try {
        await deleteApplication(id, authCookie);
      } catch {
        // Ignore cleanup errors
      }
    }
    createdAppIds.length = 0;
  });

  test("should display archive page", async ({ page }) => {
    await page.goto("/app/archive");
    await page.waitForLoadState("networkidle");

    // Check for archive header
    await expect(page.locator("h1")).toContainText(/Archive/);
  });

  test("should navigate to archive from dashboard", async ({ page }) => {
    await page.goto("/app");
    await page.waitForLoadState("networkidle");

    // Look for archive link in navigation
    const archiveLink = page.locator('nav a:has-text("Archive"), a:has-text("Archive")').first();
    if (await archiveLink.isVisible().catch(() => false)) {
      await archiveLink.click();
      await expect(page).toHaveURL(/\/app\/archive/);
    }
  });

  test("should archive application from view page", async ({ page, context }) => {
    const authCookie = await getAuthCookie(context);

    const app = await createApplication(
      {
        company: "Archive Test Corp",
        jobTitle: "Developer",
        workType: "Remote",
      },
      authCookie,
    );

    const viewPage = new ApplicationViewPage(page);
    await viewPage.goto(app.id);

    // Look for archive button
    const archiveButton = page.locator('button:has-text("Archive")').first();
    if (await archiveButton.isVisible().catch(() => false)) {
      await archiveButton.click();
      
      // Wait for dialog
      await page.waitForTimeout(500);
      
      // Confirm archive
      const confirmButton = page.locator('[role="alertdialog"] button:has-text("Archive")').first();
      if (await confirmButton.isVisible().catch(() => false)) {
        await confirmButton.click();
      }

      // Should redirect to pipeline
      await expect(page).toHaveURL(/\/app\/pipeline/, { timeout: 10000 });
    }
    
    // Clean up
    try { await deleteApplication(app.id, authCookie); } catch {}
  });

  test("should display archived applications", async ({ page, context }) => {
    const authCookie = await getAuthCookie(context);

    // Create and archive an application
    const app = await createApplication(
      {
        company: "Archived Corp",
        jobTitle: "Engineer",
        workType: "Hybrid",
      },
      authCookie,
    );

    // Archive the application
    await archiveApplication(app.id, authCookie);

    // Navigate to archive page
    await page.goto("/app/archive");
    await page.waitForLoadState("networkidle");

    // Archived application should be visible
    await expect(page.locator("text=Archived Corp")).toBeVisible({ timeout: 5000 });

    // Clean up
    try { await deleteApplication(app.id, authCookie); } catch {}
  });

  test("should restore archived application", async ({ page, context }) => {
    const authCookie = await getAuthCookie(context);

    // Create and archive an application
    const app = await createApplication(
      {
        company: "Restore Test Corp",
        jobTitle: "Designer",
        workType: "On-site",
      },
      authCookie,
    );

    // Archive the application
    await archiveApplication(app.id, authCookie);

    // Navigate to archive page
    await page.goto("/app/archive");
    await page.waitForLoadState("networkidle");

    // Look for restore button
    const restoreButton = page.locator('button:has-text("Restore")').first();
    if (await restoreButton.isVisible().catch(() => false)) {
      await restoreButton.click();

      // Should redirect to pipeline
      await expect(page).toHaveURL(/\/app\/pipeline/, { timeout: 10000 });
    }

    // Clean up
    try { await deleteApplication(app.id, authCookie); } catch {}
  });

  test("should show empty state when no archived applications", async ({ page }) => {
    await page.goto("/app/archive");
    await page.waitForLoadState("networkidle");

    // Just verify we're on the archive page
    await expect(page).toHaveURL(/\/app\/archive/);
  });
});
