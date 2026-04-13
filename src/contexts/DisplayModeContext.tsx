// DisplayModeContext — Backward-compatible re-export from AppearanceContext
// All display mode logic now lives in AppearanceContext.tsx
export { useDisplayMode } from "./AppearanceContext";

// Re-export the provider under the old name for any remaining references
export { AppearanceProvider as DisplayModeProvider } from "./AppearanceContext";
