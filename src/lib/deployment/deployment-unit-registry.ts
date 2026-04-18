// ═══════════════════════════════════════════════════════════════
// SITA OS — Deployment Unit Registry
// All deployable units with full metadata
// ═══════════════════════════════════════════════════════════════

export type DeploymentRuntime = "web-spa" | "edge-function" | "electron" | "docker" | "appliance" | "mobile-pwa" | "reverse-proxy";
export type DeploymentEnvironment = "development" | "staging" | "production";

export interface DeploymentUnit {
  id: string;
  name: string;
  runtime: DeploymentRuntime;
  description: string;
  buildCommand: string;
  buildOutput: string;
  healthEndpoint: string | null;
  owner: string;
  dependencies: string[];
  releaseGates: string[];
  rollbackStrategy: string;
  environmentVariables: string[];
  ports: number[];
  scalable: boolean;
}

export const DEPLOYMENT_UNITS: readonly DeploymentUnit[] = [
  {
    id: "web-frontend",
    name: "SITA OS Web Frontend",
    runtime: "web-spa",
    description: "Vite-built React SPA served via CDN/Lovable hosting",
    buildCommand: "npx vite build",
    buildOutput: "dist/",
    healthEndpoint: null,
    owner: "platform",
    dependencies: ["edge-functions"],
    releaseGates: ["tsc-no-errors", "route-integrity", "visual-regression"],
    rollbackStrategy: "Deploy previous dist/ bundle from CDN cache",
    environmentVariables: ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"],
    ports: [443],
    scalable: true,
  },
  {
    id: "edge-functions",
    name: "Supabase Edge Functions",
    runtime: "edge-function",
    description: "Deno-based serverless functions deployed to Supabase Edge",
    buildCommand: "supabase functions deploy",
    buildOutput: "supabase/functions/*/",
    healthEndpoint: "/functions/v1/health",
    owner: "platform",
    dependencies: ["supabase-db"],
    releaseGates: ["edge-function-tests", "jwt-validation"],
    rollbackStrategy: "Re-deploy previous function version",
    environmentVariables: ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"],
    ports: [443],
    scalable: true,
  },
  {
    id: "supabase-db",
    name: "Supabase PostgreSQL Database",
    runtime: "docker",
    description: "Managed PostgreSQL database with RLS policies",
    buildCommand: "supabase db push",
    buildOutput: "supabase/migrations/",
    healthEndpoint: "/rest/v1/",
    owner: "platform",
    dependencies: [],
    releaseGates: ["migration-safety", "rls-coverage"],
    rollbackStrategy: "Run reverse migration SQL",
    environmentVariables: ["POSTGRES_URL"],
    ports: [5432],
    scalable: false,
  },
  {
    id: "electron-desktop",
    name: "SITA OS Desktop (Electron)",
    runtime: "electron",
    description: "Electron-packaged desktop application for Windows, macOS, Linux",
    buildCommand: "npx vite build && npx @electron/packager .",
    buildOutput: "electron-release/",
    healthEndpoint: null,
    owner: "runtime",
    dependencies: ["web-frontend"],
    releaseGates: ["electron-bridge-tests", "signing-verification", "update-flow"],
    rollbackStrategy: "Auto-rollback via electron-updater; keep 2 previous versions",
    environmentVariables: ["SITA_RELEASE_CHANNEL", "ELECTRON_UPDATE_FEED_URL"],
    ports: [],
    scalable: false,
  },
  {
    id: "nginx-proxy",
    name: "Nginx Reverse Proxy",
    runtime: "reverse-proxy",
    description: "Nginx serving static assets and proxying API requests",
    buildCommand: "docker build -f Dockerfile .",
    buildOutput: "Docker image",
    healthEndpoint: "/health",
    owner: "deployment",
    dependencies: ["web-frontend"],
    releaseGates: ["config-validation"],
    rollbackStrategy: "Roll back Docker image tag",
    environmentVariables: ["NGINX_PORT", "UPSTREAM_URL"],
    ports: [80, 443],
    scalable: true,
  },
  {
    id: "traefik-proxy",
    name: "Traefik Edge Router",
    runtime: "reverse-proxy",
    description: "Traefik reverse proxy with automatic TLS and routing rules",
    buildCommand: "docker-compose up traefik",
    buildOutput: "deploy/traefik/",
    healthEndpoint: "/api/health",
    owner: "deployment",
    dependencies: [],
    releaseGates: ["routing-validation"],
    rollbackStrategy: "Revert traefik config and restart",
    environmentVariables: ["TRAEFIK_DASHBOARD_AUTH"],
    ports: [80, 443, 8080],
    scalable: true,
  },
  {
    id: "kong-gateway",
    name: "Kong API Gateway",
    runtime: "reverse-proxy",
    description: "Kong API gateway for rate limiting, auth, and API management",
    buildCommand: "docker-compose up kong",
    buildOutput: "deploy/kong.yml",
    healthEndpoint: "/status",
    owner: "deployment",
    dependencies: ["edge-functions"],
    releaseGates: ["api-route-validation"],
    rollbackStrategy: "Revert kong.yml declarative config",
    environmentVariables: ["KONG_DATABASE", "KONG_PROXY_LISTEN"],
    ports: [8000, 8443, 8001],
    scalable: true,
  },
  {
    id: "appliance-iso",
    name: "SITA Appliance (ISO/OVA)",
    runtime: "appliance",
    description: "Self-contained appliance image for VMware/bare-metal deployment",
    buildCommand: "scripts/build-iso.sh",
    buildOutput: "output/*.iso, output/*.ova",
    healthEndpoint: null,
    owner: "deployment",
    dependencies: ["web-frontend", "nginx-proxy"],
    releaseGates: ["iso-boot-test", "appliance-health-check"],
    rollbackStrategy: "Restore from previous appliance snapshot",
    environmentVariables: [],
    ports: [80, 443],
    scalable: false,
  },
] as const;

/** Get a deployment unit by ID */
export function getDeploymentUnit(id: string): DeploymentUnit | undefined {
  return DEPLOYMENT_UNITS.find((u) => u.id === id);
}

/** Get all units by runtime type */
export function getUnitsByRuntime(runtime: DeploymentRuntime): DeploymentUnit[] {
  return DEPLOYMENT_UNITS.filter((u) => u.runtime === runtime);
}

/** Get dependency graph as adjacency list */
export function getDeploymentDependencyGraph(): Map<string, string[]> {
  const graph = new Map<string, string[]>();
  for (const unit of DEPLOYMENT_UNITS) {
    graph.set(unit.id, [...unit.dependencies]);
  }
  return graph;
}

/** Get units with no dependencies (roots) */
export function getRootDeploymentUnits(): DeploymentUnit[] {
  return DEPLOYMENT_UNITS.filter((u) => u.dependencies.length === 0);
}

export const DEPLOYMENT_UNIT_COUNT = DEPLOYMENT_UNITS.length;
