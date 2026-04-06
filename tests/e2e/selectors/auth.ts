// ═══════════════════════════════════════════════════════
// SITA OS — Auth Selectors
// ═══════════════════════════════════════════════════════

export const AUTH = {
  LOGIN_PAGE: "[data-testid='login-page']",
  LOGIN_EMAIL: "input[type='email'], input[placeholder*='email' i]",
  LOGIN_PASSWORD: "input[type='password']",
  LOGIN_SUBMIT: "[data-testid='login-submit']",
  LOGIN_SUBMIT_ROLE: "button:has-text('Sign In'), button:has-text('Log In')",
  SIGNUP_PAGE: "[data-testid='signup-page']",
  SIGNUP_SUBMIT: "[data-testid='signup-submit']",
  SIGN_OUT_BTN: "[data-testid='sign-out-btn']",
  SIGN_OUT_ROLE: "button:has-text('Sign Out'), button:has-text('Log Out')",
  AUTH_ERROR: "[data-testid='auth-error']",
  FORGOT_PASSWORD: "[data-testid='forgot-password']",
} as const;
