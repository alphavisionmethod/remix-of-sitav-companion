// ═══════════════════════════════════════════════════════
// SITA OS — Connectors Selectors
// ═══════════════════════════════════════════════════════

export const CONNECTORS = {
  CONNECTORS_PAGE: "[data-testid='connectors-page']",
  SERVICE_CARD: "[data-testid='connector-card']",
  CONNECT_BTN: "[data-testid='connector-connect-btn']",
  STATUS_BADGE: "[data-testid='connector-status']",
  PLANNED_LABEL: "[data-testid='connector-planned']",
  CONNECTED_LABEL: "[data-testid='connector-connected']",
  DISCONNECTED_LABEL: "[data-testid='connector-disconnected']",
  REFRESH_BTN: "[data-testid='connectors-refresh']",
} as const;
