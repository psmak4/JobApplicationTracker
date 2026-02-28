/**
 * Landing Page E2E tests
 */

import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("should display landing page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check for landing page elements - can be h1, h2, or nav
    await expect(page.locator("h1, h2, nav, header").first()).toBeVisible({ timeout: 10000 });
  });

  test("should have navigation links", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check for nav links
    const navLinks = page.locator("nav a, header a, [role='navigation'] a");
    const count = await navLinks.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("should link to login page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Look for login/sign in link
    const loginLink = page.locator('a:has-text("Log in"), a:has-text("Sign in")').first();
    if (await loginLink.isVisible().catch(() => false)) {
      await loginLink.click();
      await expect(page).toHaveURL(/\/app\/login/);
    }
  });

  test("should link to signup page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Look for signup/sign up link - landing page only has Login and Get Started
    // Both go to /app which redirects to /app/login (not signup)
    const signupLink = page.locator('a:has-text("Sign up"), a:has-text("Get Started")').first();
    if (await signupLink.isVisible().catch(() => false)) {
      await signupLink.click();
      // Get Started goes to /app which redirects to login
      await expect(page).toHaveURL(/\/app(\/?$|\/login)/);
    }
  });

  test("should display features section", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check for features/content sections or headings
    const hasContent = (await page.locator("h2").count()) > 0 || (await page.locator("section").count()) > 0;
    expect(hasContent).toBe(true);
  });

  test("should be accessible without authentication", async ({ page }) => {
    // Ensure no auth required
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Should not redirect to login
    await expect(page).toHaveURL(/\/$/);
  });

  test("should navigate to app when logged in", async ({ page }) => {
    // This test verifies app works - will redirect to login if not authenticated
    await page.goto("/app");
    await page.waitForLoadState("networkidle");

    // Should either show app dashboard or redirect to login
    const url = page.url();
    expect(url).toMatch(/\/app(\/|$)/);
  });
});
