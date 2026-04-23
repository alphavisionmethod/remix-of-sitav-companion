// ═══════════════════════════════════════════════════════════════
// SITA OS — Environment Error Boundary
// Blocks the entire app tree when critical env vars are missing.
// Renders a user-safe, non-technical error screen.
// ═══════════════════════════════════════════════════════════════

import { type ReactNode, useMemo } from "react";
import { AlertTriangle, RefreshCw, Settings } from "lucide-react";
import { getEnvValidation } from "@/lib/env-validation";

interface EnvErrorBoundaryProps {
  children: ReactNode;
}

/**
 * Synchronous guard that prevents the app from rendering when
 * required environment variables are missing. This runs before
 * any provider or router mounts.
 */
export function EnvErrorBoundary({ children }: EnvErrorBoundaryProps) {
  const result = useMemo(() => getEnvValidation(), []);

  if (result.valid) return <>{children}</>;

  return (
    <div
      role="alert"
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "hsl(222 47% 6%)", color: "hsl(0 0% 90%)" }}
    >
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div
          className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: "hsl(0 72% 51% / 0.12)" }}
        >
          <AlertTriangle className="h-7 w-7" style={{ color: "hsl(0 72% 60%)" }} />
        </div>

        {/* Title */}
        <div>
          <h1 className="text-xl font-bold" style={{ color: "hsl(0 0% 93%)" }}>
            Configuration Error
          </h1>
          <p className="text-sm mt-2" style={{ color: "hsl(0 0% 55%)" }}>
            SITA OS cannot start because critical configuration is missing.
            This is an infrastructure issue — your data is safe.
          </p>
        </div>

        {/* Missing vars */}
        <div
          className="rounded-xl p-4 text-left space-y-1"
          style={{ background: "hsl(0 0% 100% / 0.04)" }}
        >
          <p className="text-xs font-medium flex items-center gap-1.5" style={{ color: "hsl(0 0% 65%)" }}>
            <Settings className="h-3.5 w-3.5" />
            Missing required variables
          </p>
          {result.missing.map((key) => (
            <p
              key={key}
              className="text-xs font-mono pl-5"
              style={{ color: "hsl(0 72% 65%)" }}
            >
              {key}
            </p>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{
              background: "hsl(0 0% 100% / 0.08)",
              color: "hsl(0 0% 85%)",
            }}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>

        {/* Footer */}
        <p className="text-[11px]" style={{ color: "hsl(0 0% 35%)" }}>
          If this persists, contact your administrator or check the deployment environment.
        </p>
      </div>
    </div>
  );
}