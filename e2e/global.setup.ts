/**
 * Global setup - runs once before all tests.
 * Creates a test user and saves auth state for reuse.
 */

import { test as setup, expect } from "@playwright/test";
import {
  generateTestUser,
  saveTestUser,
  getAuthStatePath,
} from "./utils/test-user";

setup("Create test user and authenticate", async ({ page, context }) => {
  console.log("\n🔧 Global Setup: Creating test user...");

  const testUser = generateTestUser();

  try {
    // Navigate to signup page
    await page.goto("http://localhost:5173/app/signup");
    await page.waitForLoadState("networkidle");

    // Fill signup form
    await page.fill("#name", testUser.name);
    await page.fill("#email", testUser.email);
    await page.fill("#password", testUser.password);

    // Submit form and wait for response
    await page.click('button[type="submit"]');

    // Wait for either:
    // 1. Success toast and redirect to landing page ("/")
    // 2. Redirect to login (means user created, need to log in)
    // 3. Error toast (signup failed)

    // Wait for navigation or error toast
    // We expect the URL to change from /app/signup
    // Using try-catch to allow checking for error toasts if navigation timeout occurs
    try {
      await expect(page).not.toHaveURL(/\/app\/signup$/, { timeout: 10000 });
    } catch {
      console.log("Signup navigation timed out, checking for errors...");
    }

    const currentUrl = page.url();
    console.log(`After signup attempt, URL is: ${currentUrl}`);

    // Check for error toast
    const errorToast = page.locator(
      '[data-sonner-toast][data-type="error"], li[data-type="error"]',
    );
    if (await errorToast.isVisible({ timeout: 1000 }).catch(() => false)) {
      const errorText = await errorToast.textContent();
      console.error(`Signup error toast: ${errorText}`);

      // If rate limited, throw with clear message
      if (
        errorText?.includes("too many") ||
        errorText?.includes("rate") ||
        errorText?.includes("locked")
      ) {
        throw new Error(
          `Signup blocked by rate limiting: ${errorText}. Please wait 15 minutes or restart the API server.`,
        );
      }
      throw new Error(`Signup failed: ${errorText}`);
    }

    // Handle different post-signup states
    if (currentUrl.includes("/app/login")) {
      // Signup didn't complete as expected, try logging in
      console.log("On login page, attempting login...");

      // Wait a bit more to ensure page is fully loaded
      await page.waitForLoadState("domcontentloaded");

      // Try to fill form with better error handling
      try {
        await page.fill("#email", testUser.email, { timeout: 5000 });
        await page.fill("#password", testUser.password);
        // Use the updated login button selector
        await page.getByRole("button", { name: /Login/i }).click();

        // Wait for navigation
        await page.waitForURL(/\/app\/?$/, { timeout: 10000 });
      } catch (error) {
        // If form filling failed, check if we're already on dashboard
        const finalUrl = page.url();
        if (finalUrl.includes("/app") && !finalUrl.includes("/login")) {
          console.log("Already on dashboard, skipping login form.");
        } else {
          throw error;
        }
      }
    } else if (
      currentUrl.includes("/app") ||
      currentUrl === "http://localhost:5173/" ||
      currentUrl.endsWith("/")
    ) {
      // Already on dashboard or landing page - success!
      console.log("Redirected to dashboard/landing page after signup");
      // If on landing page, navigate to dashboard
      if (currentUrl.includes("/app")) {
        // Already on dashboard or app routes, verify
        await page.waitForLoadState("networkidle");
      } else {
        // On landing page, navigate to app
        await page.goto("http://localhost:5173/app");
        await page.waitForLoadState("networkidle");
      }
    } else if (currentUrl.includes("/app/signup")) {
      // Still on signup page - check for error
      const signupError = page.locator(
        '[data-sonner-toast][data-type="error"], li[data-type="error"], .text-destructive',
      );
      if (await signupError.isVisible({ timeout: 1000 }).catch(() => false)) {
        const errorText = await signupError.textContent();
        throw new Error(`Signup failed (still on page): ${errorText}`);
      }
      throw new Error(
        "Signup form did not submit. Check if the form has validation errors.",
      );
    }

    // Verify we're on the dashboard
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible({
      timeout: 15000,
    });
    console.log("Successfully on dashboard!");

    // Save test user data
    saveTestUser({
      id: testUser.email,
      ...testUser,
    });

    // Save auth state for reuse in tests
    await context.storageState({ path: getAuthStatePath() });

    console.log(`✅ Test user created: ${testUser.email}`);
  } catch (error) {
    console.error("❌ Failed to create test user:", error);
    throw error;
  }
});
