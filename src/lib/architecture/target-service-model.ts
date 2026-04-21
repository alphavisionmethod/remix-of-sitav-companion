// ═══════════════════════════════════════════════════════════════
// SITA OS — Target Service Model (45 services across 15 domains)
// ═══════════════════════════════════════════════════════════════

export interface TargetServiceDef {
  domain: string;
  services: string[];
  description: string;
  owner: string;
}

export const TARGET_SERVICE_MODEL: readonly TargetServiceDef[] = [
  {
    domain: "identity-contacts",
    services: ["auth-service", "profile-service", "contact-service", "account-service"],
    description: "User identity, authentication, profiles, CRM contacts, and account management",
    owner: "platform",
  },
  {
    domain: "website-content",
    services: ["content-service", "seo-service", "media-service"],
    description: "Public website content, SEO, and media asset management",
    owner: "product",
  },
  {
    domain: "waitlist-beta",
    services: ["waitlist-service", "beta-program-service"],
    description: "Waitlist collection, beta applications, invites, and activation",
    owner: "growth",
  },
  {
    domain: "investor-dealroom",
    services: ["investor-service", "deal-room-service", "document-access-service"],
    description: "Investor relations, deal room access, document sharing with gating",
    owner: "growth",
  },
  {
    domain: "donor-crowdfund",
    services: ["crowdfund-service", "pledge-service", "payment-service"],
    description: "Crowdfunding campaigns, pledge management, payment processing",
    owner: "growth",
  },
  {
    domain: "advisory-boardroom",
    services: ["advisor-service", "boardroom-service", "recommendation-service"],
    description: "AI advisors, multi-advisor boardroom sessions, recommendation lifecycle",
    owner: "intelligence",
  },
  {
    domain: "workflow-engine",
    services: ["workflow-service", "trigger-service", "step-executor-service"],
    description: "Workflow definitions, event triggers, step execution, outcome recording",
    owner: "platform",
  },
  {
    domain: "campaigns-messaging",
    services: ["campaign-service", "message-service", "delivery-service"],
    description: "Campaign creation, message rendering, delivery tracking, suppression",
    owner: "growth",
  },
  {
    domain: "analytics-attribution",
    services: ["analytics-service", "attribution-service", "event-service"],
    description: "Analytics collection, attribution modeling, event tracking",
    owner: "product",
  },
  {
    domain: "trust-receipts-audit",
    services: ["receipt-service", "audit-service", "consent-service", "compliance-service"],
    description: "Receipts, audit logging, consent management, compliance enforcement",
    owner: "trust",
  },
  {
    domain: "launchpad-build",
    services: ["build-registry-service", "release-service", "download-service"],
    description: "Build artifacts, release management, download delivery, checksum verification",
    owner: "platform",
  },
  {
    domain: "platform-integrations",
    services: ["connector-service", "oauth-service", "webhook-service"],
    description: "Third-party connectors, OAuth flows, webhook management",
    owner: "platform",
  },
  {
    domain: "ai-orchestration",
    services: ["model-router-service", "budget-service", "inference-service", "prompt-service", "fallback-service"],
    description: "AI model routing, budget enforcement, inference pipeline, prompt management, fallback chains",
    owner: "intelligence",
  },
  {
    domain: "admin-command",
    services: ["admin-service", "operator-service"],
    description: "Admin surfaces, operator tools, founder command center",
    owner: "platform",
  },
  {
    domain: "os-platform",
    services: ["kernel-service", "daemon-service", "shell-service"],
    description: "OS substrate, daemon management, shell runtime, platform services",
    owner: "platform",
  },
] as const;

export function getTotalTargetServices(): number {
  return TARGET_SERVICE_MODEL.reduce((sum, d) => sum + d.services.length, 0);
}