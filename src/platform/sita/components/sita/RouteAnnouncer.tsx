// ═══════════════════════════════════════════════════════════════
// SITA OS — Route Announcer (WCAG 2.1 AA §4.1.3)
// Announces page transitions to screen readers via aria-live
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const routeLabels: Record<string, string> = {
  "/": "Daily Pulse",
  "/home": "Daily Pulse",
  "/desktop": "Desktop",
  "/login": "Sign In",
  "/signup": "Create Account",
  "/forgot-password": "Forgot Password",
  "/reset-password": "Reset Password",
  "/business": "Business Center",
  "/money": "Money Center",
  "/concierge": "Concierge",
  "/settings": "Settings",
  "/admin": "Admin Dashboard",
  "/files": "Files Center",
  "/connectors": "Connector Hub",
  "/advisors": "Advisor Workspace",
  "/search": "Search",
};

function getPageLabel(pathname: string): string {
  if (routeLabels[pathname]) return routeLabels[pathname];

  // Build label from path segments
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return "Home";

  return segments
    .map((s) => s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(" — ");
}

export const RouteAnnouncer = () => {
  const location = useLocation();
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    // Delay slightly so the DOM settles before announcing
    const timer = setTimeout(() => {
      setAnnouncement(`Navigated to ${getPageLabel(location.pathname)}`);
    }, 100);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
};
