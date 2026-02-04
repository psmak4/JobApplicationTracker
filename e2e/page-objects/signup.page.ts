/**
 * Signup Page Object Model
 */

import { Page, expect } from "@playwright/test";

export class SignupPage {
  constructor(private page: Page) {}

  // Navigation
  async goto() {
    await this.page.goto("/app/signup");
    await this.page.waitForLoadState("networkidle");
  }

  // Actions
  async signup(name: string, email: string, password: string) {
    await this.page.fill("#name", name);
    await this.page.fill("#email", email);
    await this.page.fill("#password", password);
    await this.page.getByRole("button", { name: /Sign up/i }).click();
  }

  async clickLoginLink() {
    await this.page.click('a:has-text("Login")');
  }

  // Assertions
  async expectToBeVisible() {
    // Check for CardTitle or H1, robust against strict mode
    await expect(
      this.page
        .locator('[data-slot="card-title"], h1')
        .filter({ hasText: /Create an account|Sign up/i })
        .first(),
    ).toBeVisible();
  }

  async expectSignupSuccess() {
    await expect(this.page).toHaveURL(/\/app\/?$/, { timeout: 10000 });
  }

  async expectSignupError(message?: string) {
    if (message) {
      await expect(this.page.locator(`text=${message}`)).toBeVisible();
    } else {
      await expect(
        this.page
          .locator('[data-sonner-toast][data-type="error"], .text-destructive')
          .first(),
      ).toBeVisible({ timeout: 5000 });
    }
  }
}
