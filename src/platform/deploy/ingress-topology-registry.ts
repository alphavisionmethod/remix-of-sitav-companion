// ═══════════════════════════════════════════════════════════════
// SITA OS — Ingress Topology Registry
// nginx/traefik/kong roles and routing
// ═══════════════════════════════════════════════════════════════

export type IngressRole = "spa-serving" | "api-gateway" | "reverse-proxy" | "load-balancer" | "tls-termination" | "rate-limiting";
export type IngressEnvironment = "development" | "staging" | "production" | "appliance";

export interface IngressNode {
  id: string;
  name: string;
  technology: "nginx" | "traefik" | "kong" | "lovable-hosting" | "supabase-gateway";
  roles: IngressRole[];
  environments: IngressEnvironment[];
  configPath: string;
  upstreamTargets: string[];
  tlsTermination: boolean;
  rateLimiting: boolean;
  owner: string;
  description: string;
}

export const INGRESS_NODES: readonly IngressNode[] = [
  {
    id: "ingress-lovable",
    name: "Lovable Hosting CDN",
    technology: "lovable-hosting",
    roles: ["spa-serving", "tls-termination"],
    environments: ["production"],
    configPath: "N/A (managed)",
    upstreamTargets: ["web-frontend"],
    tlsTermination: true,
    rateLimiting: false,
    owner: "platform",
    description: "Managed CDN serving the React SPA. Handles HTTPS, caching, and SPA fallback routing.",
  },
  {
    id: "ingress-supabase",
    name: "Supabase API Gateway",
    technology: "supabase-gateway",
    roles: ["api-gateway", "rate-limiting", "tls-termination"],
    environments: ["production"],
    configPath: "N/A (managed)",
    upstreamTargets: ["edge-functions", "supabase-db"],
    tlsTermination: true,
    rateLimiting: true,
    owner: "platform",
    description: "Managed Supabase gateway handling REST, Realtime, Auth, and Edge Function routing.",
  },
  {
    id: "ingress-nginx",
    name: "Nginx Reverse Proxy",
    technology: "nginx",
    roles: ["spa-serving", "reverse-proxy", "tls-termination"],
    environments: ["staging", "appliance"],
    configPath: "nginx/default.conf",
    upstreamTargets: ["web-frontend"],
    tlsTermination: true,
    rateLimiting: false,
    owner: "deployment",
    description: "Self-hosted nginx for staging and appliance deployments. Serves SPA and proxies API.",
  },
  {
    id: "ingress-traefik",
    name: "Traefik Edge Router",
    technology: "traefik",
    roles: ["reverse-proxy", "load-balancer", "tls-termination"],
    environments: ["staging", "production"],
    configPath: "deploy/traefik/",
    upstreamTargets: ["nginx-proxy", "kong-gateway"],
    tlsTermination: true,
    rateLimiting: false,
    owner: "deployment",
    description: "Traefik as edge router with automatic Let's Encrypt TLS and service discovery.",
  },
  {
    id: "ingress-kong",
    name: "Kong API Gateway",
    technology: "kong",
    roles: ["api-gateway", "rate-limiting", "tls-termination"],
    environments: ["staging", "production"],
    configPath: "deploy/kong.yml",
    upstreamTargets: ["edge-functions"],
    tlsTermination: true,
    rateLimiting: true,
    owner: "deployment",
    description: "Kong for advanced API management: rate limiting, auth plugins, request transformation.",
  },
] as const;

export function getIngressNode(id: string): IngressNode | undefined {
  return INGRESS_NODES.find((n) => n.id === id);
}

export function getIngressByEnvironment(env: IngressEnvironment): IngressNode[] {
  return INGRESS_NODES.filter((n) => n.environments.includes(env));
}

export function getIngressByRole(role: IngressRole): IngressNode[] {
  return INGRESS_NODES.filter((n) => n.roles.includes(role));
}
