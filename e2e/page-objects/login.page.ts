/**
 * Login Page Object Model
 */

import { Page, expect } from "@playwright/test";

export class LoginPage {
  constructor(private page: Page) {}

  // Navigation
  async goto() {
    await this.page.goto("/app/login");
    await this.page.waitForLoadState("networkidle");
  }

  // Actions
  async login(email: string, password: string) {
    await this.page.fill("#email", email);
    await this.page.fill("#password", password);
    await this.page.getByRole("button", { name: /Login/i }).click();
  }

  async clickSignUpLink() {
    await this.page.click('a:has-text("Sign up")');
  }

  async clickForgotPasswordLink() {
    await this.page.click('a:has-text("Forgot password")');
  }

  // Assertions
  async expectToBeVisible() {
    // Check for "Login" text in the card title
    await expect(
      this.page.locator('[data-slot="card-title"]').filter({ hasText: "Login" }),
    ).toBeVisible();
  }

  async expectLoginSuccess() {
    await expect(this.page).toHaveURL(/\/app\/?$/, { timeout: 10000 });
  }

  async expectLoginError(message?: string) {
    if (message) {
      await expect(this.page.locator(`text=${message}`)).toBeVisible();
    } else {
      // Check for toast error or form error
      await expect(
        this.page
          .locator('[data-sonner-toast][data-type="error"], .text-destructive')
          .first(),
      ).toBeVisible({ timeout: 5000 });
    }
  }

  async expectValidationError(field: "email" | "password") {
    const fieldSelector = field === "email" ? "#email" : "#password";
    await expect(
      this.page
        .locator(fieldSelector)
        .locator("~ .text-destructive, ~ p.text-destructive") // Sibling error
        .first(),
    ).toBeVisible();
  }
}
