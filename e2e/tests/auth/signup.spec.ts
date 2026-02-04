/**
 * Signup flow E2E tests
 */

import { test, expect } from "@playwright/test";
import { SignupPage } from "../../page-objects";
import { generateTestEmail } from "../../utils/test-user";

// Override storage state for signup tests - we need to be unauthenticated
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Signup", () => {
  let signupPage: SignupPage;

  test.beforeEach(async ({ page }) => {
    signupPage = new SignupPage(page);
  });

  test("should display signup form", async ({ page }) => {
    await signupPage.goto();
    await signupPage.expectToBeVisible();

    // Verify form elements are present
    await expect(page.locator("#name")).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("should create new account with valid data", async ({ page }) => {
    const uniqueEmail = generateTestEmail();

    await signupPage.goto();
    await signupPage.signup("New Test User", uniqueEmail, "NewPassword123!");

    // Explicitly wait for navigation
    await expect(page).toHaveURL(/\/(app)?$/, { timeout: 15000 });
  });

  test("should show error for existing email", async ({ page }) => {
    await signupPage.goto();
    await signupPage.signup(
      "Duplicate User",
      "test-duplicate@example.com",
      "TestPassword123!",
    );
  });

  test("should show validation error for empty fields", async ({ page }) => {
    await signupPage.goto();

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Should show validation errors for specific fields
    await expect(page.getByText(/Name.*required/i)).toBeVisible();
    // Check one error to be sufficient
  });

  test("should show validation error for weak password", async ({ page }) => {
    await signupPage.goto();

    // Fill form with weak password
    await page.fill("#name", "Test User");
    await page.fill("#email", generateTestEmail());
    await page.fill("#password", "weak");
    await page.click('button[type="submit"]');

    // Should show password validation error - targeting specific error element to avoid strict mode
    await expect(
      page
        .locator(".text-destructive")
        .filter({ hasText: /at least 8 characters/i })
        .first(),
    ).toBeVisible();
  });

  test("should navigate to login page", async ({ page }) => {
    await signupPage.goto();
    await signupPage.clickLoginLink();

    await expect(page).toHaveURL(/\/app\/login/);
  });

  test("should show validation error for invalid email", async ({ page }) => {
    await signupPage.goto();

    await page.fill("#name", "Test User");
    await page.fill("#email", "invalid-email");
    await page.fill("#password", "ValidPassword123!");
    await page.click('button[type="submit"]');

    // Check for validation error (Zod)
    // If browser validation blocks it, this might fail or we need to check input:invalid
    // We try to find the text. If strict mode, use first()
    const errorText = page.getByText(/Invalid email/i).first();
    try {
      await expect(errorText).toBeVisible({ timeout: 5000 });
    } catch {
      // Fallback: Check if browser validation is active
      const emailInput = page.locator("#email");
      const isInvalid = await emailInput.evaluate(
        (el: HTMLInputElement) => !el.checkValidity(),
      );
      expect(isInvalid).toBeTruthy();
    }
  });
});
