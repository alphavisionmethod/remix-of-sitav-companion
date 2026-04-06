// ═══════════════════════════════════════════════════════
// SITA OS — Test User Fixtures
// Centralized test user configuration from env vars
// ═══════════════════════════════════════════════════════

export interface TestUser {
  email: string;
  password: string;
  role: "user" | "operator" | "admin";
  displayName: string;
}

export const TEST_USERS = {
  primary: {
    email: process.env.TEST_USER_EMAIL || "",
    password: process.env.TEST_USER_PASSWORD || "",
    role: "user" as const,
    displayName: "Primary Test User",
  },
  operator: {
    email: process.env.TEST_OPERATOR_EMAIL || process.env.TEST_USER_EMAIL || "",
    password: process.env.TEST_OPERATOR_PASSWORD || process.env.TEST_USER_PASSWORD || "",
    role: "operator" as const,
    displayName: "Operator Test User",
  },
  admin: {
    email: process.env.TEST_ADMIN_EMAIL || process.env.TEST_USER_EMAIL || "",
    password: process.env.TEST_ADMIN_PASSWORD || process.env.TEST_USER_PASSWORD || "",
    role: "admin" as const,
    displayName: "Admin Test User",
  },
} as const;

/**
 * Check if primary test credentials are available.
 */
export function hasTestCredentials(): boolean {
  return !!TEST_USERS.primary.email && !!TEST_USERS.primary.password;
}

/**
 * Check if operator credentials are available.
 */
export function hasOperatorCredentials(): boolean {
  return !!TEST_USERS.operator.email && !!TEST_USERS.operator.password;
}

/**
 * Check if admin credentials are available.
 */
export function hasAdminCredentials(): boolean {
  return !!TEST_USERS.admin.email && !!TEST_USERS.admin.password;
}
