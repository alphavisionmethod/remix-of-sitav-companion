// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Route Truth Contract Types
// Route truth validation: manifest entries, drift detection
// ═══════════════════════════════════════════════════════════════

/** HTTP method for route declarations */
export type RouteMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS";

/** Route truth match state */
export type RouteTruthState = "matched" | "drifted" | "missing-backend" | "missing-manifest" | "deprecated";

/** Single entry in the admin API manifest */
export interface AdminApiManifestEntry {
  routeKey: string;
  method: RouteMethod;
  path: string;
  serviceOwner: string;
  handlerPath: string;
  version: string;
  deprecated: boolean;
  requiredRole: string | null;
  riskTier: "standard" | "elevated" | "critical";
  proofRequired: boolean;
  description: string;
  addedAt: string;
  lastVerifiedAt: string | null;
}

/** Result of comparing a manifest entry against runtime truth */
export interface AdminRouteTruthResult {
  routeKey: string;
  method: RouteMethod;
  path: string;
  state: RouteTruthState;
  manifestEntry: AdminApiManifestEntry | null;
  runtimeHandler: string | null;
  driftDetails: {
    field: string;
    expected: string;
    actual: string;
  }[] | null;
  lastCheckedAt: string;
}

/** Full validation output for admin route truth */
export interface RouteTruthValidation {
  validatedAt: string;
  manifestVersion: string;
  manifestStaleness: {
    lastGeneratedAt: string;
    staleDays: number;
    isStale: boolean;
  };
  totalRoutes: number;
  matched: number;
  drifted: number;
  missingBackend: number;
  missingManifest: number;
  deprecated: number;
  results: AdminRouteTruthResult[];
  overallHealth: "healthy" | "degraded" | "critical";
  recommendations: string[];
}

/** Route truth snapshot for diagnostics display */
export interface RouteTruthSnapshot {
  id: string;
  capturedAt: string;
  capturedBy: string;
  validation: RouteTruthValidation;
  notes: string | null;
}
