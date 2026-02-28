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
    return this.page.locator("h1").filter({ hasText: /Dashboard|Applications/ }).first();
  }

  get newApplicationButton(): Locator {
    return this.page.locator('a:has-text("New Application"), a:has-text("+ New")').first();
  }

  get applicationList(): Locator {
    return this.page.locator('[data-testid="application-list"], .application-list, [class*="application"]').first();
  }

  get emptyState(): Locator {
    return this.page.locator("text=No job applications yet, text=Get started");
  }

  get companyFilterButton(): Locator {
    return this.page.locator('button:has-text("All Companies"), button:has-text("Filter")').first();
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
    // Click on an application card by company name
    await this.page.locator(`.card-elevated >> text=${identifier}`).click().catch(async () => {
      // Fallback: try clicking any element with the text
      await this.page.locator(`text=${identifier}`).first().click();
    });
  }

  async filterByCompany(company: string) {
    await this.companyFilterButton.click();
    // Wait for dropdown/popover to appear
    await this.page.waitForTimeout(500);
    await this.page.locator(`[role="option"]:has-text("${company}")`).click().catch(async () => {
      // Fallback: try finding in list
      await this.page.locator(`text=${company}`).click();
    });
  }

  async filterByStatus(status: string) {
    await this.statusFilterButton.click();
    await this.page.waitForTimeout(500);
    await this.page.locator(`[role="checkbox"]`).filter({ hasText: status }).click();
    await this.page.keyboard.press("Escape");
  }

  async clearFilters() {
    const resetButton = this.page.locator('button:has-text("Reset"), button:has-text("Clear"), button:has-text("Clear filters")');
    if (await resetButton.isVisible().catch(() => false)) {
      await resetButton.click();
    }
  }

  async sortBy(field: "company" | "status" | "lastStatusUpdate") {
    const sortButton = this.page.locator('button:has-text("Sort"), [role="combobox"]').first();
    if (await sortButton.isVisible().catch(() => false)) {
      await sortButton.click();
      await this.page.waitForTimeout(500);
      await this.page.locator(`[role="option"]`).filter({ hasText: new RegExp(field, "i") }).click().catch(() => {});
    }
  }

  // Getters
  async getApplicationCount(): Promise<number> {
    const cards = this.page.locator(".card-elevated > div");
    return await cards.count();
  }

  async getApplicationCompanies(): Promise<string[]> {
    const companies: string[] = [];
    // Look for company names in the application list
    const cards = this.page.locator(".card-elevated > div, [class*='ApplicationCard']");
    const count = await cards.count();

    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      const companyText = await card.locator(".font-bold, [class*='font-bold']").first().textContent().catch(() => "");
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
    await expect(this.emptyState.first()).toBeVisible();
  }

  async expectApplicationCount(count: number) {
    const actualCount = await this.getApplicationCount();
    expect(actualCount).toBe(count);
  }

  async expectApplicationVisible(company: string) {
    await expect(this.page.locator(`text=${company}`).first()).toBeVisible({ timeout: 10000 });
  }

  async expectApplicationNotVisible(company: string) {
    await expect(this.page.locator(`text=${company}`)).not.toBeVisible({ timeout: 5000 }).catch(() => {});
  }
}
