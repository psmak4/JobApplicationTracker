/**
 * Test user management utilities.
 * Creates unique test users for each test run and handles cleanup.
 */

import * as fs from "fs";
import * as path from "path";

export interface TestUser {
  id: string;
  name: string;
  email: string;
  password: string;
}

// Storage file for test user data (used across setup/teardown)
const TEST_USER_FILE = path.join(__dirname, "..", ".auth", "test-user.json");
const AUTH_DIR = path.join(__dirname, "..", ".auth");

/**
 * Generate a unique test email
 */
export function generateTestEmail(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `test-${timestamp}-${random}@e2e-test.local`;
}

/**
 * Generate test user credentials
 */
export function generateTestUser(): Omit<TestUser, "id"> {
  return {
    name: "E2E Test User",
    email: generateTestEmail(),
    password: "TestPassword123!",
  };
}

/**
 * Save test user data to file for use across setup/teardown
 */
export function saveTestUser(user: TestUser): void {
  // Ensure .auth directory exists
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  }
  fs.writeFileSync(TEST_USER_FILE, JSON.stringify(user, null, 2));
}

/**
 * Load test user data from file
 */
export function loadTestUser(): TestUser | null {
  try {
    if (fs.existsSync(TEST_USER_FILE)) {
      const data = fs.readFileSync(TEST_USER_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch {
    // File doesn't exist or is corrupted
  }
  return null;
}

/**
 * Clear test user data file
 */
export function clearTestUser(): void {
  try {
    if (fs.existsSync(TEST_USER_FILE)) {
      fs.unlinkSync(TEST_USER_FILE);
    }
  } catch {
    // Ignore errors during cleanup
  }
}

/**
 * Save auth state (cookies/storage) to file for reuse
 */
export function getAuthStatePath(): string {
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  }
  return path.join(AUTH_DIR, "auth-state.json");
}
