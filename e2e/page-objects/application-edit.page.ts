/**
 * Application Edit Page Object Model
 */

import { Page, expect } from "@playwright/test";
import { ApplicationFormData } from "./new-application.page";

export class ApplicationEditPage {
  constructor(private page: Page) {}

  // Navigation
  async goto(id: string) {
    await this.page.goto(`/app/applications/${id}/edit`);
    await this.page.waitForLoadState("networkidle");
  }

  // Actions
  async updateForm(data: Partial<ApplicationFormData>) {
    if (data.company !== undefined) {
      await this.page.fill("#company", data.company);
    }
    if (data.jobTitle !== undefined) {
      await this.page.fill("#jobTitle", data.jobTitle);
    }
    if (data.jobDescriptionUrl !== undefined) {
      await this.page.fill("#jobDescriptionUrl", data.jobDescriptionUrl);
    }
    if (data.salary !== undefined) {
      await this.page.fill("#salary", data.salary);
    }
    if (data.location !== undefined) {
      await this.page.fill("#location", data.location);
    }
    if (data.workType) {
      await this.selectWorkType(data.workType);
    }
    if (data.contactInfo !== undefined) {
      await this.page.fill("#contactInfo", data.contactInfo);
    }
    if (data.notes !== undefined) {
      await this.page.fill("#notes", data.notes);
    }
  }

  async selectWorkType(workType: "Remote" | "Hybrid" | "On-site") {
    const selectTrigger = this.page
      .locator('#workType, [name="workType"]')
      .first();
    await selectTrigger.click();
    await this.page.locator(`[role="option"]:has-text("${workType}")`).click();
  }

  async save() {
    await this.page.click('button[type="submit"]:has-text("Save Changes"), button[type="submit"]:has-text("Save")');
  }

  async cancel() {
    await this.page.click('button:has-text("Cancel")');
  }

  async updateAndSave(data: Partial<ApplicationFormData>) {
    await this.updateForm(data);
    await this.save();
  }

  // Getters
  async getFieldValue(field: string): Promise<string> {
    return await this.page.locator(`#${field}`).inputValue();
  }

  // Assertions
  async expectToBeVisible() {
    await expect(
      this.page.locator("h1, h2").filter({ hasText: /Edit Application/i }),
    ).toBeVisible();
  }

  async expectSaveSuccess() {
    // Should redirect back to application view
    await expect(this.page).toHaveURL(/\/app\/applications\/[^/]+$/, {
      timeout: 10000,
    });
  }

  async expectFieldValue(field: string, value: string) {
    await expect(this.page.locator(`#${field}`)).toHaveValue(value);
  }

  async expectSaveDisabled() {
    await expect(
      this.page.locator('button[type="submit"]:has-text("Save Changes"), button[type="submit"]:has-text("Save")'),
    ).toBeDisabled();
  }
}
