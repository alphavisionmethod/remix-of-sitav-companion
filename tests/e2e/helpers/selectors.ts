// ═══════════════════════════════════════════════════════
// SITA OS — E2E Selector Constants
// Centralized test selectors for stable automation
// ═══════════════════════════════════════════════════════

export const SEL = {
  // Auth
  LOGIN_PAGE: "[data-testid='login-page']",
  LOGIN_EMAIL: "input[type='email'], input[placeholder*='email' i]",
  LOGIN_PASSWORD: "input[type='password']",
  LOGIN_SUBMIT: "[data-testid='login-submit']",
  SIGNUP_PAGE: "[data-testid='signup-page']",
  SIGNUP_SUBMIT: "[data-testid='signup-submit']",
  SIGN_OUT_BTN: "[data-testid='sign-out-btn']",

  // Navigation
  SIDEBAR_NAV: "[data-testid='sidebar-nav']",
  NAV_HOME: "[data-testid='nav-home']",

  // Files
  FILES_PAGE: "[data-testid='files-page']",
  FILE_UPLOAD: "[data-testid='file-upload']",

  // Boardroom
  BOARDROOM_PAGE: "[data-testid='boardroom-page']",
  BOARDROOM_REFRESH: "[data-testid='boardroom-refresh']",

  // Advisors / AI
  ADVISORS_PAGE: "[data-testid='advisors-page']",
  ADVISOR_CHAT_SEND: "[data-testid='advisor-chat-send']",
  ADVISOR_CHAT_INPUT: "[data-testid='advisor-chat-input']",

  // Approvals
  APPROVALS_PAGE: "[data-testid='approvals-page']",
  APPROVAL_APPROVE_BTN: "[data-testid='approval-approve-btn']",
  APPROVAL_REJECT_BTN: "[data-testid='approval-reject-btn']",

  // Connectors
  CONNECTORS_PAGE: "[data-testid='connectors-page']",

  // Settings
  SETTINGS_PAGE: "[data-testid='settings-page']",
  SETTINGS_SAVE: "[data-testid='settings-save']",

  // Admin
  ADMIN_AI_RUNTIME: "[data-testid='admin-ai-runtime']",
  ADMIN_TEAM: "[data-testid='admin-team']",

  // Demo mode
  DEMO_BADGE: "[data-testid='demo-mode-badge']",

  // States
  LOADING_STATE: "[data-testid='loading-state']",
  EMPTY_STATE: "[data-testid='empty-state']",
  ERROR_STATE: "[data-testid='error-state']",

  // Toast
  TOAST: "[data-sonner-toast]",
} as const;
