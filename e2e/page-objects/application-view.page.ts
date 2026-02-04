/**
 * Application View Page Object Model
 */

import { Page, expect, Locator } from "@playwright/test";

export class ApplicationViewPage {
  constructor(private page: Page) {}

  // Locators
  get editButton(): Locator {
    return this.page.locator('a:has-text("Edit"), button:has-text("Edit")');
  }

  get deleteButton(): Locator {
    return this.page.locator('button:has-text("Delete")').first();
  }

  get confirmDeleteButton(): Locator {
    return this.page.locator('[role="alertdialog"] button:has-text("Delete")');
  }

  get cancelDeleteButton(): Locator {
    return this.page.locator('[role="alertdialog"] button:has-text("Cancel")');
  }

  get backButton(): Locator {
    return this.page.locator('button[aria-label*="back" i], button[aria-label*="Back" i]');
  }

  // Navigation
  async goto(id: string) {
    await this.page.goto(`/app/applications/${id}`);
    await this.page.waitForLoadState("networkidle");
  }

  // Actions
  async clickEdit() {
    await this.editButton.first().click();
    await expect(this.page).toHaveURL(/\/edit$/);
  }

  async clickDelete() {
    await this.deleteButton.click();
  }

  async confirmDelete() {
    await this.confirmDeleteButton.click();
  }

  async cancelDelete() {
    await this.cancelDeleteButton.click();
  }

  async deleteApplication() {
    await this.clickDelete();
    await this.confirmDelete();
    // Wait for redirect to dashboard
    // Check for either dashboard or landing page after delete
    await this.page.waitForURL(/\/app\/?$|^http:\/\/localhost:5173\/$/, { timeout: 15000 });
  }

  async goBack() {
    await this.backButton.click();
  }

  // Getters
  async getCompanyName(): Promise<string> {
    const header = this.page.locator("h1, .text-2xl").first();
    return (await header.textContent()) || "";
  }

  async getJobTitle(): Promise<string> {
    const subtitle = this.page
      .locator("h1 + p, .text-muted-foreground")
      .first();
    return (await subtitle.textContent()) || "";
  }

  // Assertions
  async expectToBeVisible() {
    await expect(this.page.locator("h1").first()).toBeVisible({ timeout: 15000 });
  }

  async expectCompanyName(company: string) {
    await expect(this.page.locator(`text=${company}`).first()).toBeVisible();
  }

  async expectJobTitle(jobTitle: string) {
    await expect(this.page.locator(`text=${jobTitle}`).first()).toBeVisible();
  }

  async expectDeleteDialogVisible() {
    await expect(this.page.locator('[role="alertdialog"]')).toBeVisible();
    await expect(this.confirmDeleteButton).toBeVisible();
  }

  async expectNotFound() {
    await expect(this.page.locator("text=Application not found")).toBeVisible();
  }
}
