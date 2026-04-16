// ═══════════════════════════════════════════════════════════════
// SITA OS — Ingress Owner Map
// Ownership per ingress layer
// ═══════════════════════════════════════════════════════════════

import { INGRESS_NODES } from "./ingress-topology-registry";

export interface IngressOwnership {
  ingressId: string;
  owner: string;
  escalationContact: string;
  configManagedBy: "lovable" | "supabase" | "self-hosted" | "team";
  changeApprovalRequired: boolean;
}

export const INGRESS_OWNERSHIP: readonly IngressOwnership[] = [
  { ingressId: "ingress-lovable", owner: "platform", escalationContact: "Lovable support", configManagedBy: "lovable", changeApprovalRequired: false },
  { ingressId: "ingress-supabase", owner: "platform", escalationContact: "Lovable Cloud support", configManagedBy: "supabase", changeApprovalRequired: false },
  { ingressId: "ingress-nginx", owner: "deployment", escalationContact: "Infrastructure team", configManagedBy: "team", changeApprovalRequired: true },
  { ingressId: "ingress-traefik", owner: "deployment", escalationContact: "Infrastructure team", configManagedBy: "team", changeApprovalRequired: true },
  { ingressId: "ingress-kong", owner: "deployment", escalationContact: "API gateway team", configManagedBy: "team", changeApprovalRequired: true },
] as const;

export function getIngressOwnership(id: string): IngressOwnership | undefined {
  return INGRESS_OWNERSHIP.find((o) => o.ingressId === id);
}

export function getManagedIngress(): IngressOwnership[] {
  return INGRESS_OWNERSHIP.filter((o) => o.configManagedBy === "lovable" || o.configManagedBy === "supabase");
}

export function getSelfHostedIngress(): IngressOwnership[] {
  return INGRESS_OWNERSHIP.filter((o) => o.configManagedBy === "team" || o.configManagedBy === "self-hosted");
}
