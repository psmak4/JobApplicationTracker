/**
 * Dashboard Page Object Model
 */

import { Page, expect, Locator } from "@playwright/test";

export class DashboardPage {
  public readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Locators
  get header(): Locator {
    return this.page.locator("h1").filter({ hasText: "Dashboard" });
  }

  get newApplicationButton(): Locator {
    return this.page.locator('a:has-text("New Application")').first();
  }

  get applicationList(): Locator {
    return this.page
      .locator(
        '[data-testid="application-list"], .application-list, [class*="application"]',
      )
      .first();
  }

  get emptyState(): Locator {
    return this.page.locator("text=No job applications yet, text=Get started");
  }

  get companyFilterButton(): Locator {
    return this.page.locator('button:has-text("All Companies")').first();
  }

  get statusFilterButton(): Locator {
    return this.page.locator('button:has-text("Status")');
  }

  // Navigation
  async goto() {
    await this.page.goto("/app");
    await this.page.waitForLoadState("networkidle");
  }

  // Actions
  async clickNewApplication() {
    await this.newApplicationButton.click();
    await expect(this.page).toHaveURL(/\/app\/new/);
  }

  async clickApplication(identifier: string) {
    // Click on an application by company name or job title
    await this.page.locator(`text=${identifier}`).first().click();
  }

  async filterByCompany(company: string) {
    await this.companyFilterButton.click();
    await this.page.locator(`[role="option"]:has-text("${company}")`).click();
  }

  async filterByStatus(status: string) {
    await this.statusFilterButton.click();
    // Toggle status checkbox
    await this.page
      .locator(
        `[role="checkbox"][value="${status}"], label:has-text("${status}")`,
      )
      .click();
    // Close popover by clicking outside or pressing escape
    await this.page.keyboard.press("Escape");
  }

  async clearFilters() {
    const resetButton = this.page.locator(
      'button:has-text("Reset"), button:has-text("Clear")',
    );
    if (await resetButton.isVisible()) {
      await resetButton.click();
    }
  }

  async sortBy(field: "company" | "status" | "lastStatusUpdate") {
    const sortButton = this.page.locator('button:has-text("Sort"), [role="combobox"]:has-text("Last Update")');
    if (await sortButton.count() > 0) {
      await sortButton.first().click();
      await this.page
        .locator(
          `[role="option"]:has-text("${field}"), button:has-text("${field}")`,
        )
        .click();
    }
  }

  // Getters
  async getApplicationCount(): Promise<number> {
    // Count application cards/rows
    const cards = this.page.locator(
      '[data-application-id], .application-card, [class*="ApplicationCard"], [class*="ApplicationRow"]',
    );
    return await cards.count();
  }

  async getApplicationCompanies(): Promise<string[]> {
    const companies: string[] = [];
    const cards = this.page.locator("[data-application-id], .application-card");
    const count = await cards.count();

    for (let i = 0; i < count; i++) {
      const companyText = await cards
        .nth(i)
        .locator('[class*="company"], h3, .font-semibold')
        .first()
        .textContent();
      if (companyText) {
        companies.push(companyText.trim());
      }
    }
    return companies;
  }

  // Assertions
  async expectToBeVisible() {
    await expect(this.header).toBeVisible({ timeout: 10000 });
  }

  async expectEmptyState() {
    await expect(this.emptyState).toBeVisible();
  }

  async expectApplicationCount(count: number) {
    const actualCount = await this.getApplicationCount();
    expect(actualCount).toBe(count);
  }

  async expectApplicationVisible(company: string) {
    await expect(this.page.locator(`text=${company}`).first()).toBeVisible();
  }

  async expectApplicationNotVisible(company: string) {
    await expect(this.page.locator(`text=${company}`)).not.toBeVisible();
  }
}
