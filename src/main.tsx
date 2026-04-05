import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initPerformanceMonitor } from "@/lib/services/performance-monitor";

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// Init performance monitoring
initPerformanceMonitor();

createRoot(document.getElementById("root")!).render(<App />);
