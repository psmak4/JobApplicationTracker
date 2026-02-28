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
} from "../../utils/api-client";

async function getAuthCookie(context: any): Promise<string> {
  const cookies = await context.cookies();
  return cookies.map((c: any) => `${c.name}=${c.value}`).join("; ");
}

test.describe("Application CRUD", () => {
  const createdAppIds: string[] = [];

  test.afterEach(async ({ context }) => {
    const authCookie = await getAuthCookie(context);
    for (const id of createdAppIds) {
      try {
        await deleteApplication(id, authCookie);
      } catch {}
    }
    createdAppIds.length = 0;
  });

  test.describe("Create Application", () => {
    test("should create application with required fields only", async ({ page, context }) => {
      const newAppPage = new NewApplicationPage(page);
      const dashboardPage = new DashboardPage(page);

      await newAppPage.goto();
      await newAppPage.expectToBeVisible();

      await newAppPage.fillAndSubmit({
        company: "Create Test Corp",
        jobTitle: "Software Engineer",
      });

      await newAppPage.expectCreateSuccess();
      await dashboardPage.goto();
      await dashboardPage.expectApplicationVisible("Create Test Corp");

      const authCookie = await getAuthCookie(context);
      const apps = await getApplications(authCookie);
      const createdApp = apps.find((a: any) => a.company === "Create Test Corp");
      if (createdApp) createdAppIds.push(createdApp.id);
    });

    test("should create application with all fields", async ({ page, context }) => {
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
      });

      await newAppPage.expectCreateSuccess();
      await dashboardPage.goto();
      await dashboardPage.expectApplicationVisible("Full Fields Corp");

      const authCookie = await getAuthCookie(context);
      const apps = await getApplications(authCookie);
      const createdApp = apps.find((a: any) => a.company === "Full Fields Corp");
      if (createdApp) createdAppIds.push(createdApp.id);
    });

    test("should show validation error for empty required fields", async ({ page }) => {
      const newAppPage = new NewApplicationPage(page);
      await newAppPage.goto();
      await newAppPage.submit();
      await newAppPage.expectValidationError("company");
      await newAppPage.expectValidationError("jobTitle");
      await expect(page).toHaveURL(/\/app\/new/);
    });

    test("should cancel and return to dashboard", async ({ page }) => {
      const newAppPage = new NewApplicationPage(page);
      await newAppPage.goto();
      await newAppPage.fillForm({ company: "Cancel Test Corp", jobTitle: "Developer" });
      await newAppPage.cancel();
      await expect(page).toHaveURL(/\/app\/?$/);
    });
  });

  test.describe("View Application", () => {
    let testAppId: string;

    test.beforeEach(async ({ context }) => {
      const authCookie = await getAuthCookie(context);
      const app = await createApplication(
        { company: "View Test Corp", jobTitle: "QA Engineer", location: "New York, NY", workType: "Remote", salary: "$100,000" },
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
      await expect(page).toHaveURL(new RegExp(`/app/applications/${testAppId}/edit`));
    });

    test("should show archive confirmation dialog", async ({ page }) => {
      const viewPage = new ApplicationViewPage(page);
      await viewPage.goto(testAppId);
      await viewPage.clickArchive();
      await viewPage.expectArchiveDialogVisible();
    });

    test("should cancel archive and stay on page", async ({ page }) => {
      const viewPage = new ApplicationViewPage(page);
      await viewPage.goto(testAppId);
      await viewPage.clickArchive();
      await viewPage.cancelArchive();
      await expect(page).toHaveURL(new RegExp(`/app/applications/${testAppId}$`));
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
      const app = await createApplication(
        { company: "Edit Test Corp", jobTitle: "Original Title", location: "Original Location", workType: "Remote" },
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
      await editPage.updateAndSave({ company: "Updated Corp", jobTitle: "Updated Title", salary: "$120,000" });
      await editPage.expectSaveSuccess();
      await viewPage.expectCompanyName("Updated Corp");
      await viewPage.expectJobTitle("Updated Title");
    });

    test("should cancel edit and return to view", async ({ page }) => {
      const editPage = new ApplicationEditPage(page);
      await editPage.goto(testAppId);
      await editPage.updateForm({ company: "Changed But Not Saved" });
      await editPage.cancel();
      await expect(page).toHaveURL(new RegExp(`/app/applications/${testAppId}$`));
    });

    test("should disable save button when no changes made", async ({ page }) => {
      const editPage = new ApplicationEditPage(page);
      await editPage.goto(testAppId);
      await editPage.expectToBeVisible();
      await editPage.expectSaveDisabled();
    });
  });

  test.describe("Archive Application", () => {
    test("should archive application and redirect to pipeline", async ({ page, context }) => {
      const authCookie = await getAuthCookie(context);
      const app = await createApplication(
        { company: "Archive Test Corp", jobTitle: "To Be Archived", workType: "Remote" },
        authCookie,
      );
      // Don't add to cleanup - we're archiving it

      const viewPage = new ApplicationViewPage(page);
      await viewPage.goto(app.id);
      await viewPage.archiveApplication();
      await expect(page).toHaveURL(/\/app\/pipeline/);

      // Clean up
      try { await deleteApplication(app.id, authCookie); } catch {}
    });

    test("should not archive when cancelled", async ({ page, context }) => {
      const authCookie = await getAuthCookie(context);
      const app = await createApplication(
        { company: "Keep Test Corp", jobTitle: "Should Not Archive", workType: "Remote" },
        authCookie,
      );
      createdAppIds.push(app.id);

      const viewPage = new ApplicationViewPage(page);
      await viewPage.goto(app.id);
      await viewPage.clickArchive();
      await viewPage.cancelArchive();
      await expect(page).toHaveURL(new RegExp(`/app/applications/${app.id}$`));
      await viewPage.expectCompanyName("Keep Test Corp");
    });
  });

  test.describe("Delete Application", () => {
    test("should delete application and redirect to dashboard", async ({ page, context }) => {
      const authCookie = await getAuthCookie(context);
      const app = await createApplication(
        { company: "Delete Test Corp", jobTitle: "To Be Deleted", workType: "Remote" },
        authCookie,
      );

      const viewPage = new ApplicationViewPage(page);
      const dashboardPage = new DashboardPage(page);
      await viewPage.goto(app.id);
      await viewPage.deleteApplication();
      await expect(page).toHaveURL(/\/app\/?$/);
      await dashboardPage.expectApplicationNotVisible("Delete Test Corp");
    });

    test("should not delete when cancelled", async ({ page, context }) => {
      const authCookie = await getAuthCookie(context);
      const app = await createApplication(
        { company: "Keep Test Corp", jobTitle: "Should Not Delete", workType: "Remote" },
        authCookie,
      );
      createdAppIds.push(app.id);

      const viewPage = new ApplicationViewPage(page);
      await viewPage.goto(app.id);
      await viewPage.clickDelete();
      await viewPage.cancelDelete();
      await expect(page).toHaveURL(new RegExp(`/app/applications/${app.id}$`));
      await viewPage.expectCompanyName("Keep Test Corp");
    });
  });
});
