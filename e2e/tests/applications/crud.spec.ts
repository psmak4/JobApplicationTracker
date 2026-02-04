/**
 * Application CRUD E2E tests
 */

import { test, expect } from "@playwright/test";
import {
  DashboardPage,
  NewApplicationPage,
  ApplicationViewPage,
  ApplicationEditPage,
} from "../../page-objects";
import {
  createApplication,
  deleteApplication,
  getApplications,
  TestApplication,
} from "../../utils/api-client";

// Helper to get auth cookie from context
async function getAuthCookie(context: any): Promise<string> {
  const cookies = await context.cookies();
  return cookies.map((c: any) => `${c.name}=${c.value}`).join("; ");
}

test.describe("Application CRUD", () => {
  const createdAppIds: string[] = [];

  test.afterEach(async ({ context }) => {
    // Clean up any applications created during tests
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

  test.describe("Create Application", () => {
    test("should create application with required fields only", async ({
      page,
      context,
    }) => {
      const newAppPage = new NewApplicationPage(page);
      const dashboardPage = new DashboardPage(page);

      await newAppPage.goto();
      await newAppPage.expectToBeVisible();

      await newAppPage.fillAndSubmit({
        company: "Create Test Corp",
        jobTitle: "Software Engineer",
      });

      // Should redirect to dashboard or application view
      await newAppPage.expectCreateSuccess();

      // Verify application appears on dashboard
      await dashboardPage.goto();
      await dashboardPage.expectApplicationVisible("Create Test Corp");

      // Clean up: find and store the app ID for cleanup
      const authCookie = await getAuthCookie(context);
      const apps = await getApplications(authCookie);
      const createdApp = apps.find(
        (a: TestApplication & { id: string }) =>
          a.company === "Create Test Corp",
      );
      if (createdApp) {
        createdAppIds.push(createdApp.id);
      }
    });

    test("should create application with all fields", async ({
      page,
      context,
    }) => {
      const newAppPage = new NewApplicationPage(page);
      const dashboardPage = new DashboardPage(page);

      await newAppPage.goto();

      await newAppPage.fillAndSubmit({
        company: "Full Fields Corp",
        jobTitle: "Senior Developer",
        jobDescriptionUrl: "https://example.com/job/123",
        salary: "$150,000 - $180,000",
        location: "San Francisco, CA",
        workType: "Hybrid",
        contactInfo: "recruiter@example.com",
        notes: "Great opportunity with excellent benefits",
      });

      await newAppPage.expectCreateSuccess();

      // Verify on dashboard
      await dashboardPage.goto();
      await dashboardPage.expectApplicationVisible("Full Fields Corp");

      // Clean up
      const authCookie = await getAuthCookie(context);
      const apps = await getApplications(authCookie);
      const createdApp = apps.find(
        (a: TestApplication & { id: string }) =>
          a.company === "Full Fields Corp",
      );
      if (createdApp) {
        createdAppIds.push(createdApp.id);
      }
    });

    test("should show validation error for empty required fields", async ({
      page,
    }) => {
      const newAppPage = new NewApplicationPage(page);

      await newAppPage.goto();
      await newAppPage.submit();

      // Should show validation errors
      await newAppPage.expectValidationError("company");
      await newAppPage.expectValidationError("jobTitle");

      // Should still be on the new application page
      await expect(page).toHaveURL(/\/app\/new/);
    });

    test("should cancel and return to dashboard", async ({ page }) => {
      const newAppPage = new NewApplicationPage(page);

      await newAppPage.goto();
      await newAppPage.fillForm({
        company: "Cancel Test Corp",
        jobTitle: "Developer",
      });

      await newAppPage.cancel();

      // Should redirect back to dashboard
      await expect(page).toHaveURL(/\/app\/?$/);
    });
  });

  test.describe("View Application", () => {
    let testAppId: string;

    test.beforeEach(async ({ context }) => {
      const authCookie = await getAuthCookie(context);

      // Create a test application via API
      const app = await createApplication(
        {
          company: "View Test Corp",
          jobTitle: "QA Engineer",
          location: "New York, NY",
          workType: "Remote",
          salary: "$100,000",
          notes: "Test notes for viewing",
        },
        authCookie,
      );

      testAppId = app.id;
      createdAppIds.push(app.id);
    });

    test("should display application details", async ({ page }) => {
      const viewPage = new ApplicationViewPage(page);

      await viewPage.goto(testAppId);
      await viewPage.expectToBeVisible();
      await viewPage.expectCompanyName("View Test Corp");
      await viewPage.expectJobTitle("QA Engineer");
    });

    test("should navigate to edit page", async ({ page }) => {
      const viewPage = new ApplicationViewPage(page);

      await viewPage.goto(testAppId);
      await viewPage.clickEdit();

      await expect(page).toHaveURL(
        new RegExp(`/app/applications/${testAppId}/edit`),
      );
    });

    test("should show delete confirmation dialog", async ({ page }) => {
      const viewPage = new ApplicationViewPage(page);

      await viewPage.goto(testAppId);
      await viewPage.clickDelete();

      await viewPage.expectDeleteDialogVisible();
    });

    test("should cancel delete and stay on page", async ({ page }) => {
      const viewPage = new ApplicationViewPage(page);

      await viewPage.goto(testAppId);
      await viewPage.clickDelete();
      await viewPage.cancelDelete();

      // Should still be on the view page
      await expect(page).toHaveURL(
        new RegExp(`/app/applications/${testAppId}$`),
      );
    });

    test("should show 404 for non-existent application", async ({ page }) => {
      const viewPage = new ApplicationViewPage(page);

      await viewPage.goto("non-existent-id-12345");

      await viewPage.expectNotFound();
    });
  });

  test.describe("Edit Application", () => {
    let testAppId: string;

    test.beforeEach(async ({ context }) => {
      const authCookie = await getAuthCookie(context);

      // Create a test application via API
      const app = await createApplication(
        {
          company: "Edit Test Corp",
          jobTitle: "Original Title",
          location: "Original Location",
          workType: "Remote",
        },
        authCookie,
      );

      testAppId = app.id;
      createdAppIds.push(app.id);
    });

    test("should display edit form with existing values", async ({ page }) => {
      const editPage = new ApplicationEditPage(page);

      await editPage.goto(testAppId);
      await editPage.expectToBeVisible();
      await editPage.expectFieldValue("company", "Edit Test Corp");
      await editPage.expectFieldValue("jobTitle", "Original Title");
    });

    test("should update application details", async ({ page }) => {
      const editPage = new ApplicationEditPage(page);
      const viewPage = new ApplicationViewPage(page);

      await editPage.goto(testAppId);

      await editPage.updateAndSave({
        company: "Updated Corp",
        jobTitle: "Updated Title",
        salary: "$120,000",
      });

      await editPage.expectSaveSuccess();

      // Verify changes are persisted
      await viewPage.expectCompanyName("Updated Corp");
      await viewPage.expectJobTitle("Updated Title");
    });

    test("should cancel edit and return to view", async ({ page }) => {
      const editPage = new ApplicationEditPage(page);

      await editPage.goto(testAppId);
      await editPage.updateForm({
        company: "Changed But Not Saved",
      });
      await editPage.cancel();

      // Should redirect back to view page
      await expect(page).toHaveURL(
        new RegExp(`/app/applications/${testAppId}$`),
      );
    });

    test("should disable save button when no changes made", async ({
      page,
    }) => {
      const editPage = new ApplicationEditPage(page);

      await editPage.goto(testAppId);

      // Wait for form to load
      await editPage.expectToBeVisible();

      // Save button should be disabled if no changes
      await editPage.expectSaveDisabled();
    });
  });

  test.describe("Delete Application", () => {
    test("should delete application and redirect to dashboard", async ({
      page,
      context,
    }) => {
      const authCookie = await getAuthCookie(context);

      // Create a test application via API (won't be added to cleanup since we're deleting it)
      const app = await createApplication(
        {
          company: "Delete Test Corp",
          jobTitle: "To Be Deleted",
          workType: "Remote",
        },
        authCookie,
      );

      const viewPage = new ApplicationViewPage(page);
      const dashboardPage = new DashboardPage(page);

      await viewPage.goto(app.id);
      await viewPage.deleteApplication();

      // Should redirect to dashboard or landing page
      await expect(page).toHaveURL(/\/app\/?$/);

      // Application should no longer be visible
      await dashboardPage.expectApplicationNotVisible("Delete Test Corp");
    });

    test("should not delete when cancelled", async ({ page, context }) => {
      const authCookie = await getAuthCookie(context);

      const app = await createApplication(
        {
          company: "Keep Test Corp",
          jobTitle: "Should Not Delete",
          workType: "Remote",
        },
        authCookie,
      );
      createdAppIds.push(app.id);

      const viewPage = new ApplicationViewPage(page);

      await viewPage.goto(app.id);
      await viewPage.clickDelete();
      await viewPage.cancelDelete();

      // Should still be on the view page
      await expect(page).toHaveURL(new RegExp(`/app/applications/${app.id}$`));

      // Application should still exist
      await viewPage.expectCompanyName("Keep Test Corp");
    });
  });
});
