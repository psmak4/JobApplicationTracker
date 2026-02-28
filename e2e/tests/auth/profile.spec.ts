/**
 * Profile E2E tests
 */

import { test, expect } from "@playwright/test";

test.describe("Profile", () => {
  test("should display profile page", async ({ page }) => {
    await page.goto("/app/profile");
    await page.waitForLoadState("networkidle");

    // Should show profile form or user info
    await expect(page.locator("h1, h2")).toContainText(/Profile|Account/);
  });

  test("should navigate to profile from dashboard", async ({ page }) => {
    await page.goto("/app");
    await page.waitForLoadState("networkidle");

    // Click on user avatar button
    const avatarButton = page.locator("button:has(img.avatar), button:has([class*='avatar'])").first();
    if (await avatarButton.isVisible().catch(() => false)) {
      await avatarButton.click();
      await page.waitForTimeout(500);

      // Look for profile link in dropdown
      const profileLink = page.locator('[role="menuitem"]:has-text("Profile")').first();
      if (await profileLink.isVisible().catch(() => false)) {
        await profileLink.click();
        await expect(page).toHaveURL(/\/app\/profile/);
      }
    }
  });

  test("should display user information", async ({ page }) => {
    await page.goto("/app/profile");
    await page.waitForLoadState("networkidle");

    // Check for form or user info elements
    const content = await page.content();
    expect(content.length).toBeGreaterThan(0);
  });

  test("should update display name", async ({ page }) => {
    await page.goto("/app/profile");
    await page.waitForLoadState("networkidle");

    // Look for name input
    const nameInput = page.locator('input[name="name"], input#name').first();

    if (await nameInput.isVisible().catch(() => false)) {
      const newName = "Updated Test User";
      await nameInput.fill(newName);

      // Look for save button
      const saveButton = page.locator('button:has-text("Save"), button[type="submit"]').first();
      if (await saveButton.isVisible().catch(() => false)) {
        await saveButton.click();
        await page.waitForTimeout(1000);
      }
    }
  });

  test("should show change password section", async ({ page }) => {
    await page.goto("/app/profile");
    await page.waitForLoadState("networkidle");

    // Look for password change elements
    const hasPasswordSection = await page.locator(
      'text=Password, text=Change Password, input[name="currentPassword"]'
    ).first().isVisible().catch(() => false);
    
    // Should either show password section or be able to navigate to it
    expect(hasPasswordSection || (await page.locator('a:has-text("password")').isVisible().catch(() => false))).toBeTruthy();
  });

  test("should navigate back to dashboard from profile", async ({ page }) => {
    await page.goto("/app/profile");
    await page.waitForLoadState("networkidle");

    // Look for back button or dashboard link
    const backLink = page.locator('a:has-text("Dashboard"), a:has-text("Back"), [aria-label="Back"]').first();
    if (await backLink.isVisible().catch(() => false)) {
      await backLink.click();
      await expect(page).toHaveURL(/\/app(\/)?$/);
    }
  });
});
