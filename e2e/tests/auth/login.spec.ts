/**
 * Login flow E2E tests
 */

import { test, expect } from "@playwright/test";
import { LoginPage } from "../../page-objects";
import { getTestUser } from "../../fixtures";

// Override storage state for login tests - we need to be unauthenticated
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Login", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
  });

  test("should display login form", async ({ page }) => {
    await loginPage.goto();
    await loginPage.expectToBeVisible();

    // Verify form elements are present
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("should login with valid credentials", async ({ page }) => {
    const testUser = getTestUser();

    await loginPage.goto();
    await loginPage.login(testUser.email, testUser.password);

    // Explicit wait for url change
    await expect(page).toHaveURL(/\/(app)?$/, { timeout: 15000 });
  });

  test("should show error with invalid credentials", async ({ page }) => {
    await loginPage.goto();
    await loginPage.login("nonexistent@example.com", "WrongPassword123!");

    // Should show error toast or message
    // Use .first() to avoid strict mode if multiple toasts appear
    await expect(
      page
        .locator("[data-sonner-toast]")
        .filter({ hasText: /Invalid|found/i })
        .first(),
    ).toBeVisible({ timeout: 10000 });
  });

  test("should show validation error for empty fields", async ({ page }) => {
    await loginPage.goto();

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Should show validation errors for required fields
    await expect(page.getByText(/Invalid email/i).first()).toBeVisible();
  });

  test("should navigate to signup page", async ({ page }) => {
    await loginPage.goto();
    await loginPage.clickSignUpLink();

    await expect(page).toHaveURL(/\/app\/signup/);
  });

  test("should navigate to forgot password page", async ({ page }) => {
    await loginPage.goto();
    await loginPage.clickForgotPasswordLink();

    await expect(page).toHaveURL(/\/app\/forgot-password/);
  });

  test("should redirect to login when accessing protected route unauthenticated", async ({
    page,
  }) => {
    // Try to access dashboard directly (we're already unauthenticated)
    await page.goto("/app");

    // Should redirect to login
    await expect(page).toHaveURL(/\/app\/login/, { timeout: 10000 });
  });
});
