#!/usr/bin/env node
// SITA OS — Error Boundary Coverage Audit
// Checks that route components have error boundary wrappers
import * as fs from "fs";

const appContent = fs.readFileSync("src/App.tsx", "utf-8");

// Check for error boundary imports/usage
const hasErrorBoundary = appContent.includes("ErrorBoundary") || appContent.includes("errorElement");
const routeCount = (appContent.match(/<Route\s+path="/g) || []).length;

const report = {
  version: "1.0.0",
  generatedAt: new Date().toISOString(),
  hasGlobalErrorBoundary: hasErrorBoundary,
  totalRoutes: routeCount,
  coverage: hasErrorBoundary ? "global" : "none",
  recommendation: hasErrorBoundary ? "Error boundary coverage is present" : "Add a global ErrorBoundary wrapper around the router",
};

console.log(`✅ Error boundary audit: ${report.coverage} coverage across ${routeCount} routes`);
if (!hasErrorBoundary) {
  console.warn("⚠️ No ErrorBoundary detected in App.tsx — consider adding one");
}
