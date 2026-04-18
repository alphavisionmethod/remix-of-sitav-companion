// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Deployment Map
// Runtime → deployment target mapping
// ═══════════════════════════════════════════════════════════════

import type { DeploymentRuntime } from "./deployment-unit-registry";

export interface RuntimeDeploymentTarget {
  runtime: DeploymentRuntime;
  deploymentTargets: string[];
  hostingProvider: string;
  scalingModel: string;
  costModel: string;
}

export const RUNTIME_DEPLOYMENT_MAP: readonly RuntimeDeploymentTarget[] = [
  { runtime: "web-spa", deploymentTargets: ["Lovable Hosting", "Vercel", "Netlify", "S3+CloudFront"], hostingProvider: "Lovable", scalingModel: "CDN-based, auto-scales globally", costModel: "Included in Lovable plan" },
  { runtime: "edge-function", deploymentTargets: ["Supabase Edge (Deno Deploy)"], hostingProvider: "Supabase via Lovable Cloud", scalingModel: "Serverless, auto-scales per request", costModel: "Pay per invocation" },
  { runtime: "electron", deploymentTargets: ["User machine (Windows/macOS/Linux)"], hostingProvider: "Self-hosted", scalingModel: "N/A — client-side", costModel: "Free (user's hardware)" },
  { runtime: "docker", deploymentTargets: ["Supabase managed", "AWS ECS", "GCP Cloud Run"], hostingProvider: "Supabase via Lovable Cloud", scalingModel: "Managed, vertical scaling", costModel: "Included in Lovable Cloud" },
  { runtime: "reverse-proxy", deploymentTargets: ["Docker Compose", "Kubernetes"], hostingProvider: "Self-hosted or cloud", scalingModel: "Horizontal pod scaling", costModel: "Infrastructure cost" },
  { runtime: "appliance", deploymentTargets: ["VMware ESXi", "VirtualBox", "Bare metal"], hostingProvider: "On-premises", scalingModel: "Single instance per VM", costModel: "Customer infrastructure" },
  { runtime: "mobile-pwa", deploymentTargets: ["Same as web-spa (PWA)"], hostingProvider: "Lovable", scalingModel: "CDN-based", costModel: "Included in Lovable plan" },
] as const;

export function getDeploymentTargetsForRuntime(runtime: DeploymentRuntime): RuntimeDeploymentTarget | undefined {
  return RUNTIME_DEPLOYMENT_MAP.find((r) => r.runtime === runtime);
}
