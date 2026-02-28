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

  get archiveButton(): Locator {
    return this.page.locator('button:has-text("Archive")').first();
  }

  get backButton(): Locator {
    return this.page.locator('a:has-text("Back"), button[aria-label*="back" i]');
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

  async clickArchive() {
    await this.archiveButton.click();
  }

  async clickDelete() {
    await this.page.locator('button:has-text("Delete")').first().click();
  }

  async confirmDelete() {
    await this.page.locator('[role="alertdialog"] button:has-text("Delete")').click();
  }

  async cancelDelete() {
    await this.page.locator('[role="alertdialog"] button:has-text("Cancel")').click();
  }

  async confirmArchive() {
    await this.page.locator('[role="alertdialog"] button:has-text("Archive")').click();
  }

  async cancelArchive() {
    await this.page.locator('[role="alertdialog"] button:has-text("Cancel")').click();
  }

  async deleteApplication() {
    await this.clickDelete();
    await this.confirmDelete();
    await this.page.waitForURL(/\/app\/?$/, { timeout: 15000 });
  }

  async archiveApplication() {
    await this.clickArchive();
    await this.confirmArchive();
    await this.page.waitForURL(/\/app\/pipeline/, { timeout: 15000 });
  }

  async goBack() {
    await this.backButton.first().click();
  }

  // Getters
  async getCompanyName(): Promise<string> {
    const header = this.page.locator("h1, .text-2xl").first();
    return (await header.textContent()) || "";
  }

  async getJobTitle(): Promise<string> {
    const subtitle = this.page.locator("h1 + p, .text-muted-foreground").first();
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

  async expectArchiveDialogVisible() {
    await expect(this.page.locator('[role="alertdialog"]')).toBeVisible();
    await expect(this.page.locator("text=Archive Application?")).toBeVisible();
  }

  async expectDeleteDialogVisible() {
    await expect(this.page.locator('[role="alertdialog"]')).toBeVisible();
  }

  async expectNotFound() {
    await expect(this.page.locator("text=Application not found")).toBeVisible();
  }
}
