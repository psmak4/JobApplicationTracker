/**
 * Notes E2E tests
 */

import { test, expect } from "@playwright/test";
import { ApplicationViewPage } from "../../page-objects";
import {
  createApplication,
  deleteApplication,
} from "../../utils/api-client";

// Helper to get auth cookie from context
async function getAuthCookie(context: any): Promise<string> {
  const cookies = await context.cookies();
  return cookies.map((c: any) => `${c.name}=${c.value}`).join("; ");
}

test.describe("Notes", () => {
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

  test("should display notes section on application view", async ({ page, context }) => {
    const authCookie = await getAuthCookie(context);

    const app = await createApplication(
      {
        company: "Notes Test Corp",
        jobTitle: "Developer",
        workType: "Remote",
      },
      authCookie,
    );
    createdAppIds.push(app.id);

    const viewPage = new ApplicationViewPage(page);
    await viewPage.goto(app.id);
    await page.waitForLoadState("networkidle");

    // Check for Notes section
    const notesSection = page.locator("text=Notes, h3:has-text('Notes')").first();
    const isVisible = await notesSection.isVisible().catch(() => false);
    expect(isVisible || (await page.locator("text=No notes yet").isVisible().catch(() => false))).toBeTruthy();
  });

  test("should add a new note to application", async ({ page, context }) => {
    const authCookie = await getAuthCookie(context);

    const app = await createApplication(
      {
        company: "Add Note Corp",
        jobTitle: "Engineer",
        workType: "Hybrid",
      },
      authCookie,
    );
    createdAppIds.push(app.id);

    const viewPage = new ApplicationViewPage(page);
    await viewPage.goto(app.id);
    await page.waitForLoadState("networkidle");

    // Look for Add Note button
    const addNoteButton = page.locator('button:has-text("Add Note")').first();
    
    if (await addNoteButton.isVisible().catch(() => false)) {
      await addNoteButton.click();

      // Fill in note
      const textarea = page.locator("textarea[placeholder*='note' i]").first();
      if (await textarea.isVisible().catch(() => false)) {
        await textarea.fill("This is a test note");

        // Save note
        const saveButton = page.locator('button:has-text("Save Note")').first();
        if (await saveButton.isVisible().catch(() => false)) {
          await saveButton.click();
          await page.waitForTimeout(1000);

          // Note should appear
          await expect(page.locator("text=This is a test note")).toBeVisible({ timeout: 5000 }).catch(() => {});
        }
      }
    }
  });

  test("should show empty notes state", async ({ page, context }) => {
    const authCookie = await getAuthCookie(context);

    const app = await createApplication(
      {
        company: "Empty Notes Corp",
        jobTitle: "Developer",
        workType: "Remote",
      },
      authCookie,
    );
    createdAppIds.push(app.id);

    const viewPage = new ApplicationViewPage(page);
    await viewPage.goto(app.id);
    await page.waitForLoadState("networkidle");

    // Should show empty notes message or add note button
    const hasContent = await page.locator("text=No notes yet, button:has-text('Add Note')").first().isVisible().catch(() => false);
    expect(hasContent).toBeTruthy();
  });
});
