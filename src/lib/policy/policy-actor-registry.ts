// ═══════════════════════════════════════════════════════════════
// SITA OS — Policy Actor Registry (Phase 3 of Meta-Architecture)
//
// Canonical taxonomy of every actor class that can invoke a
// privileged action. Every policy decision in the unified matrix
// must resolve to exactly one PolicyActor.
// ═══════════════════════════════════════════════════════════════

export type PolicyActor =
  | "user"               // Authenticated end-user (owner of own data)
  | "owner-admin"        // Owner with admin/operator privileges on their tenant
  | "platform-admin"     // SITA platform operator (cross-tenant)
  | "advisor"            // AI advisor agent
  | "automation"         // Scheduled or triggered automation
  | "service-role"       // Backend service-role key (RLS bypass)
  | "support-flow"       // Human support agent acting on behalf of user
  | "anonymous";         // Pre-auth / public surface

export interface PolicyActorMetadata {
  actor: PolicyActor;
  label: string;
  description: string;
  /** Trust ceiling — even a trusted device can never elevate above this. */
  maxTrustLevel: 0 | 1 | 2 | 3 | 4;
  /** Whether this actor can be bound to a real human identity. */
  isHuman: boolean;
  /** RLS strategy in effect for this actor by default. */
  rlsStrategy: "user-scope" | "role-scope" | "tenant-scope" | "bypass" | "deny-all";
  /** Default audit posture. */
  defaultAuditPosture: "verbose" | "standard" | "minimal";
}

export const POLICY_ACTOR_REGISTRY: readonly PolicyActorMetadata[] = [
  { actor: "user",           label: "Authenticated User",   description: "End-user authenticated via Supabase Auth.",               maxTrustLevel: 3, isHuman: true,  rlsStrategy: "user-scope",   defaultAuditPosture: "standard" },
  { actor: "owner-admin",    label: "Owner / Tenant Admin", description: "Tenant owner with admin permissions on their own data.", maxTrustLevel: 4, isHuman: true,  rlsStrategy: "tenant-scope", defaultAuditPosture: "verbose" },
  { actor: "platform-admin", label: "Platform Admin",       description: "SITA operator with cross-tenant authority.",             maxTrustLevel: 4, isHuman: true,  rlsStrategy: "role-scope",   defaultAuditPosture: "verbose" },
  { actor: "advisor",        label: "AI Advisor Agent",     description: "Autonomous AI advisor acting under autonomy policy.",    maxTrustLevel: 2, isHuman: false, rlsStrategy: "user-scope",   defaultAuditPosture: "verbose" },
  { actor: "automation",     label: "Automation",           description: "Scheduled or event-triggered automation.",                maxTrustLevel: 2, isHuman: false, rlsStrategy: "user-scope",   defaultAuditPosture: "standard" },
  { actor: "service-role",   label: "Service Role",         description: "Backend service-role key for edge functions.",            maxTrustLevel: 4, isHuman: false, rlsStrategy: "bypass",       defaultAuditPosture: "verbose" },
  { actor: "support-flow",   label: "Support Flow",         description: "Human support agent acting on behalf of a user.",         maxTrustLevel: 3, isHuman: true,  rlsStrategy: "role-scope",   defaultAuditPosture: "verbose" },
  { actor: "anonymous",      label: "Anonymous",            description: "Unauthenticated pre-auth surface.",                       maxTrustLevel: 0, isHuman: false, rlsStrategy: "deny-all",     defaultAuditPosture: "minimal" },
] as const;

export const ALL_POLICY_ACTORS: readonly PolicyActor[] =
  POLICY_ACTOR_REGISTRY.map((a) => a.actor);

export function getActorMetadata(actor: PolicyActor): PolicyActorMetadata {
  const m = POLICY_ACTOR_REGISTRY.find((a) => a.actor === actor);
  if (!m) throw new Error(`[policy-actor-registry] Unknown actor: ${actor}`);
  return m;
}

export function isHumanActor(actor: PolicyActor): boolean {
  return getActorMetadata(actor).isHuman;
}

export function getActorMaxTrust(actor: PolicyActor): number {
  return getActorMetadata(actor).maxTrustLevel;
}
