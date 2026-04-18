// ═══════════════════════════════════════════════════════════════
// Nova SDK — useAppRuntime Hook
// Provides access to the managed runtime for the current app
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { AppRegistry } from "../core/registry";
import type { AppRuntime } from "../runtime/managed-runtime";

export function useAppRuntime(appId: string): {
  runtime: AppRuntime | undefined;
  eventLoop: AppRuntime["eventLoop"] | undefined;
  memory: AppRuntime["memory"] | undefined;
  resources: AppRuntime["resources"] | undefined;
  errorBoundary: AppRuntime["errorBoundary"] | undefined;
  diagnostics: ReturnType<AppRuntime["diagnostics"]["appId"] extends string ? () => any : never> | undefined;
} {
  return useMemo(() => {
    const app = AppRegistry.getApp(appId);
    const runtime = app?.runtime;
    return {
      runtime,
      eventLoop: runtime?.eventLoop,
      memory: runtime?.memory,
      resources: runtime?.resources,
      errorBoundary: runtime?.errorBoundary,
      diagnostics: runtime?.diagnostics,
    };
  }, [appId]);
}
