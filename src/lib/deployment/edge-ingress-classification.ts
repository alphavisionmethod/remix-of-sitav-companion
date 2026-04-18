// ═══════════════════════════════════════════════════════════════
// SITA OS — Edge Ingress Classification
// SPA/API/admin/webhook/connector ingress classification
// ═══════════════════════════════════════════════════════════════

export type IngressTrafficClass = "spa-frontend" | "api-rest" | "api-realtime" | "admin-ui" | "webhook-inbound" | "connector-oauth" | "appliance-local" | "desktop-update";

export interface IngressClassification {
  trafficClass: IngressTrafficClass;
  description: string;
  handledBy: string[];
  authRequired: boolean;
  rateLimited: boolean;
  cacheable: boolean;
  expectedVolume: "high" | "medium" | "low";
}

export const EDGE_INGRESS_CLASSIFICATIONS: readonly IngressClassification[] = [
  { trafficClass: "spa-frontend", description: "Static SPA assets (HTML, JS, CSS, images)", handledBy: ["ingress-lovable", "ingress-nginx"], authRequired: false, rateLimited: false, cacheable: true, expectedVolume: "high" },
  { trafficClass: "api-rest", description: "REST API calls to Supabase/Edge Functions", handledBy: ["ingress-supabase", "ingress-kong"], authRequired: true, rateLimited: true, cacheable: false, expectedVolume: "high" },
  { trafficClass: "api-realtime", description: "WebSocket connections for Supabase Realtime", handledBy: ["ingress-supabase"], authRequired: true, rateLimited: false, cacheable: false, expectedVolume: "medium" },
  { trafficClass: "admin-ui", description: "Admin/control plane UI requests", handledBy: ["ingress-lovable", "ingress-nginx"], authRequired: true, rateLimited: false, cacheable: true, expectedVolume: "low" },
  { trafficClass: "webhook-inbound", description: "Inbound webhooks from external services", handledBy: ["ingress-supabase", "ingress-kong"], authRequired: false, rateLimited: true, cacheable: false, expectedVolume: "low" },
  { trafficClass: "connector-oauth", description: "OAuth callback flows for connector auth", handledBy: ["ingress-supabase"], authRequired: false, rateLimited: true, cacheable: false, expectedVolume: "low" },
  { trafficClass: "appliance-local", description: "Local network requests to appliance instance", handledBy: ["ingress-nginx"], authRequired: true, rateLimited: false, cacheable: true, expectedVolume: "low" },
  { trafficClass: "desktop-update", description: "Electron auto-update feed requests", handledBy: ["ingress-lovable"], authRequired: false, rateLimited: true, cacheable: true, expectedVolume: "low" },
] as const;

export function getClassification(cls: IngressTrafficClass): IngressClassification | undefined {
  return EDGE_INGRESS_CLASSIFICATIONS.find((c) => c.trafficClass === cls);
}

export function getAuthRequiredTraffic(): IngressClassification[] {
  return EDGE_INGRESS_CLASSIFICATIONS.filter((c) => c.authRequired);
}
