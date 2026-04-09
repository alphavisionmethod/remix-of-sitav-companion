// ═══════════════════════════════════════════════════════════════
// SITA OS — Skip to Content Link (WCAG 2.1 AA §2.4.1)
// Visible on focus, jumps to main content area
// ═══════════════════════════════════════════════════════════════

export const SkipToContent = () => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-md focus:bg-primary focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background focus:text-sm focus:font-medium"
  >
    Skip to main content
  </a>
);
