/**
 * API client for direct test data manipulation.
 * Used for fast test setup/cleanup instead of UI interactions.
 * Includes retry logic for rate limiting.
 */

const API_URL = process.env.API_URL || "http://localhost:4000";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

/**
 * Fetch with retry for rate limiting (429 errors)
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = MAX_RETRIES
): Promise<Response> {
  const response = await fetch(url, options);

  // If rate limited (429), retry with delay
  if (response.status === 429 && retries > 0) {
    console.log(`Rate limited, retrying in ${RETRY_DELAY_MS}ms... (${retries} retries left)`);
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    return fetchWithRetry(url, options, retries - 1);
  }

  return response;
}

export interface TestApplication {
  id?: string;
  company: string;
  jobTitle: string;
  jobDescriptionUrl?: string;
  salary?: string;
  location?: string;
  workType?: "Remote" | "Hybrid" | "On-site";
  contactInfo?: string;
  notes?: string;
}

export interface AuthCookies {
  cookies: { name: string; value: string; domain: string; path: string }[];
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

/**
 * Sign up a new user via API
 */
export async function signUpUser(
  name: string,
  email: string,
  password: string,
): Promise<{ user: { id: string; email: string; name: string } }> {
  const response = await fetchWithRetry(`${API_URL}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `Failed to sign up user: ${error.message || error.error?.message || response.statusText}`,
    );
  }

  return response.json();
}

/**
 * Sign in a user via API and return session cookies
 */
export async function signInUser(
  email: string,
  password: string,
): Promise<AuthCookies> {
  const response = await fetchWithRetry(`${API_URL}/api/auth/sign-in/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `Failed to sign in: ${error.message || response.statusText}`,
    );
  }

  // Extract cookies from response
  const setCookieHeader = response.headers.get("set-cookie");
  const cookies: AuthCookies["cookies"] = [];

  if (setCookieHeader) {
    // Parse multiple cookies from the header
    const cookieStrings = setCookieHeader.split(/,(?=\s*\w+=)/);
    for (const cookieStr of cookieStrings) {
      const match = cookieStr.match(/^([^=]+)=([^;]*)/);
      if (match) {
        cookies.push({
          name: match[1].trim(),
          value: match[2],
          domain: "localhost",
          path: "/",
        });
      }
    }
  }

  return { cookies };
}

/**
 * Create an application via API (requires auth cookies)
 */
export async function createApplication(
  application: TestApplication,
  authCookie: string,
): Promise<TestApplication & { id: string }> {
  const response = await fetchWithRetry(`${API_URL}/api/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: authCookie,
    },
    body: JSON.stringify(application),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `Failed to create application: ${error.error?.message || error.message || response.statusText}`,
    );
  }

  const result = await response.json();
  // Handle wrapped response format
  if (result.success && result.data) {
    return result.data;
  }
  return result;
}

/**
 * Delete an application via API (requires auth cookies)
 */
export async function deleteApplication(
  id: string,
  authCookie: string,
): Promise<void> {
  const response = await fetchWithRetry(`${API_URL}/api/applications/${id}`, {
    method: "DELETE",
    headers: {
      Cookie: authCookie,
    },
  });

  if (!response.ok && response.status !== 404) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `Failed to delete application: ${error.error?.message || error.message || response.statusText}`,
    );
  }
}

/**
 * Get all applications via API (requires auth cookies)
 * Uses the /list endpoint for active (non-archived) applications
 */
export async function getApplications(
  authCookie: string,
): Promise<(TestApplication & { id: string })[]> {
  const response = await fetchWithRetry(`${API_URL}/api/applications/list`, {
    method: "GET",
    headers: {
      Cookie: authCookie,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `Failed to get applications: ${error.error?.message || error.message || response.statusText}`,
    );
  }

  const result = await response.json();
  // Handle wrapped response format
  if (result.success && result.data) {
    return result.data;
  }
  return result;
}

/**
 * Archive an application via API
 */
export async function archiveApplication(
  id: string,
  authCookie: string,
): Promise<void> {
  const response = await fetchWithRetry(`${API_URL}/api/applications/${id}/archive`, {
    method: "POST",
    headers: {
      Cookie: authCookie,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `Failed to archive application: ${error.error?.message || error.message || response.statusText}`,
    );
  }
}

/**
 * Restore an archived application via API
 */
export async function restoreApplication(
  id: string,
  authCookie: string,
): Promise<void> {
  const response = await fetchWithRetry(`${API_URL}/api/applications/${id}/restore`, {
    method: "POST",
    headers: {
      Cookie: authCookie,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `Failed to restore application: ${error.error?.message || error.message || response.statusText}`,
    );
  }
}

/**
 * Get archived applications via API
 */
export async function getArchivedApplications(
  authCookie: string,
): Promise<(TestApplication & { id: string })[]> {
  const response = await fetchWithRetry(`${API_URL}/api/applications/archived/list`, {
    method: "GET",
    headers: {
      Cookie: authCookie,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `Failed to get archived applications: ${error.error?.message || error.message || response.statusText}`,
    );
  }

  const result = await response.json();
  if (result.success && result.data) {
    return result.data;
  }
  return result;
}

/**
 * Delete a user account (uses better-auth admin delete or direct cleanup)
 * Note: This might need adjustment based on your auth setup
 */
export async function deleteUser(userId: string): Promise<void> {
  // For now, we'll rely on the cascade delete when auth session expires
  // or implement a test-specific cleanup endpoint if needed
  console.log(`User ${userId} marked for cleanup`);
}
