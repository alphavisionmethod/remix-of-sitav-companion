import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";
import { initPerformanceMonitor } from "@/lib/services/performance-monitor";
import { initSentry } from "@/lib/observability/sentry";
import { initErrorMonitoring } from "@/lib/services/error-monitoring-service";
import { installFetchInterceptor } from "@/lib/observability/request-context";
import { startSpanExporter } from "@/lib/observability/apm";
import { startUptimeHeartbeat } from "@/lib/observability/uptime";
import { validateEnv } from "@/lib/env-validation";

// ── Boot-time env check ──
validateEnv();

// ── Service Worker registration with iframe / preview-host guard ──
if ('serviceWorker' in navigator) {
  const isInIframe = (() => {
    try { return window.self !== window.top; } catch { return true; }
  })();

  const host = window.location.hostname;
  const isPreviewHost =
    host.includes('id-preview--') ||
    host.includes('lovableproject.com') ||
    host.includes('lovable.app') ||
    host === 'localhost' ||
    host === '127.0.0.1';

  if (isInIframe || isPreviewHost) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => r.unregister().catch(() => {}));
    }).catch(() => {});
  } else {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }
}

// ── Phase 20: Production observability boot order ──
// 1) Sentry first so subsequent errors during boot are captured.
// 2) Native error sink (always-on, even without Sentry DSN).
// 3) Fetch interceptor (correlation-id / traceparent propagation).
// 4) Performance monitor.
// 5) APM span exporter (background batch every 15s).
// 6) Uptime heartbeat (every 60s while tab is visible).
initSentry();
initErrorMonitoring();
installFetchInterceptor();
initPerformanceMonitor();
startSpanExporter();
startUptimeHeartbeat();

createRoot(document.getElementById("root")!).render(<App />);
