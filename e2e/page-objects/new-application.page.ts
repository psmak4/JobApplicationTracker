/**
 * New Application Page Object Model
 */

import { Page, expect } from "@playwright/test";

export interface ApplicationFormData {
  company: string;
  jobTitle: string;
  jobDescriptionUrl?: string;
  salary?: string;
  location?: string;
  workType?: "Remote" | "Hybrid" | "On-site";
  contactInfo?: string;
}

export class NewApplicationPage {
  constructor(private page: Page) {}

  // Navigation
  async goto() {
    await this.page.goto("/app/new");
    await this.page.waitForLoadState("networkidle");
  }

  // Actions
  async fillForm(data: ApplicationFormData) {
    await this.page.fill("#company", data.company);
    await this.page.fill("#jobTitle", data.jobTitle);

    if (data.jobDescriptionUrl) {
      await this.page.fill("#jobDescriptionUrl", data.jobDescriptionUrl);
    }
    if (data.salary) {
      await this.page.fill("#salary", data.salary);
    }
    if (data.location) {
      await this.page.fill("#location", data.location);
    }
    if (data.workType) {
      await this.selectWorkType(data.workType);
    }
    if (data.contactInfo) {
      await this.page.fill("#contactInfo", data.contactInfo);
    }
  }

  async selectWorkType(workType: "Remote" | "Hybrid" | "On-site") {
    const selectTrigger = this.page.locator('#workType, [name="workType"]').first();
    await selectTrigger.click();
    await this.page.locator(`[role="option"]:has-text("${workType}")`).click();
  }

  async cancel() {
    await this.page.getByRole("button", { name: /Cancel/i }).click();
  }

  async fillAndSubmit(data: ApplicationFormData) {
    await this.fillForm(data);
    await this.submit();
  }

  // Assertions
  async expectToBeVisible() {
    await expect(this.page.locator("form").first()).toBeVisible({ timeout: 20000 });
  }

  async expectCreateSuccess() {
    await expect(this.page).toHaveURL(
      /\/app\/?(\?.*)?$|\/app\/applications\//,
      { timeout: 15000 }
    );
  }

  async expectValidationError(field: string) {
    const fieldSelector = `#${field}`;
    await expect(
      this.page.locator(fieldSelector).locator(".text-destructive, [role='alert']").first()
    ).toBeVisible();
  }

  async expectFormError() {
    await expect(
      this.page.locator('[data-sonner-toast][data-type="error"], .text-destructive').first()
    ).toBeVisible();
  }

  async submit() {
    await this.page.getByRole("button", { name: /Create|Save/i }).first().click();
  }
}
