import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";
import { initPerformanceMonitor } from "@/lib/services/performance-monitor";

// ── Service Worker registration with iframe / preview-host guard ──
// Phase 13 — never register SW inside Lovable preview or any iframe context.
// SW caching inside the editor preview would serve stale builds and mask code changes.
if ('serviceWorker' in navigator) {
  const isInIframe = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true; // Cross-origin security block → assume iframe
    }
  })();

  const host = window.location.hostname;
  const isPreviewHost =
    host.includes('id-preview--') ||
    host.includes('lovableproject.com') ||
    host.includes('lovable.app') ||
    host === 'localhost' ||
    host === '127.0.0.1';

  if (isInIframe || isPreviewHost) {
    // Defensive cleanup: unregister any SW that may have been installed earlier
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => r.unregister().catch(() => {}));
    }).catch(() => {});
  } else {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }
}

// Init performance monitoring
initPerformanceMonitor();

createRoot(document.getElementById("root")!).render(<App />);
