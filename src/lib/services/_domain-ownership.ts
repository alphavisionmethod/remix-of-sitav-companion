// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Service Domain Ownership Registry
// Every directory under src/lib/services/ MUST be registered here.
// This registry is the single source of truth for service taxonomy.
// ═══════════════════════════════════════════════════════════════

export type ServiceDomain =
  | "core-platform"
  | "trust-security"
  | "ai-intelligence"
  | "business-finance-concierge"
  | "communications"
  | "platform-infrastructure"
  | "connectors"
  | "support-recovery"
  | "observability"
  | "governance";

export type ServiceStatus = "active" | "deprecated" | "experimental" | "internal";

export interface ServiceEntry {
  directory: string;
  domain: ServiceDomain;
  owner: string;
  status: ServiceStatus;
  description: string;
  /** If deprecated, which canonical service replaces it */
  replacedBy?: string;
}

/**
 * Canonical registry of all service directories.
 * CI validator `scripts/validators/check-service-domain-ownership.sh`
 * ensures every directory under src/lib/services/ has an entry here.
 */
export const SERVICE_REGISTRY: ServiceEntry[] = [
  // ── Core Platform ─────────────────────────────────────────
  { directory: "brain-core", domain: "core-platform", owner: "platform-team", status: "active", description: "Client-side brain-core for demo/offline mode (production authority: deploy/brain-core/)" },
  { directory: "policy-engine", domain: "core-platform", owner: "platform-team", status: "active", description: "Policy evaluation and enforcement engine" },
  { directory: "approval-engine", domain: "core-platform", owner: "platform-team", status: "active", description: "Multi-tier approval workflow orchestrator" },
  { directory: "capability-router", domain: "core-platform", owner: "platform-team", status: "active", description: "Routes capabilities to correct service implementations" },
  { directory: "executor-service", domain: "core-platform", owner: "platform-team", status: "active", description: "Action execution with proof emission" },
  { directory: "receipt-service", domain: "core-platform", owner: "platform-team", status: "active", description: "Immutable receipt generation and verification" },
  { directory: "verification-engine", domain: "core-platform", owner: "platform-team", status: "active", description: "Multi-layer verification and truth checking" },
  { directory: "event-bus", domain: "core-platform", owner: "platform-team", status: "active", description: "Internal event publication and subscription" },
  { directory: "service-registry", domain: "core-platform", owner: "platform-team", status: "active", description: "Runtime service discovery and health tracking" },
  { directory: "database", domain: "core-platform", owner: "platform-team", status: "active", description: "Database client abstraction and query helpers" },

  // ── Trust & Security ──────────────────────────────────────
  { directory: "trust-governor", domain: "trust-security", owner: "security-team", status: "active", description: "Trust scoring and autonomous decision boundaries" },
  { directory: "keyvault", domain: "trust-security", owner: "security-team", status: "active", description: "Secret management and key lifecycle" },
  { directory: "duress-detection", domain: "trust-security", owner: "security-team", status: "active", description: "Behavioral anomaly and duress signal detection" },
  { directory: "emergency-halt", domain: "trust-security", owner: "security-team", status: "active", description: "System-wide emergency stop orchestration" },
  { directory: "injection-firewall", domain: "trust-security", owner: "security-team", status: "active", description: "Prompt injection and input sanitization" },
  { directory: "tenant-firewall", domain: "trust-security", owner: "security-team", status: "active", description: "Multi-tenant data isolation enforcement" },
  { directory: "trusted-device", domain: "trust-security", owner: "security-team", status: "active", description: "Device trust registration and verification" },
  { directory: "security", domain: "trust-security", owner: "security-team", status: "active", description: "Core security utilities and middleware" },
  { directory: "security-privacy", domain: "trust-security", owner: "security-team", status: "active", description: "Privacy controls and data protection" },

  // ── AI & Intelligence ─────────────────────────────────────
  { directory: "ai-gateway", domain: "ai-intelligence", owner: "ai-team", status: "active", description: "Client-side AI gateway forwarding to edge function" },
  { directory: "inference-gateway", domain: "ai-intelligence", owner: "ai-team", status: "active", description: "Model inference routing with fallback chains" },
  { directory: "ai-workforce", domain: "ai-intelligence", owner: "ai-team", status: "active", description: "Internal AI agent workforce management" },
  { directory: "ai-economics", domain: "ai-intelligence", owner: "ai-team", status: "active", description: "AI cost tracking, budgeting, and margin protection" },
  { directory: "model-router", domain: "ai-intelligence", owner: "ai-team", status: "active", description: "Model tier selection and budget-aware routing" },
  { directory: "council-orchestrator", domain: "ai-intelligence", owner: "ai-team", status: "active", description: "Multi-advisor council deliberation orchestrator" },
  { directory: "boardroom-service", domain: "ai-intelligence", owner: "ai-team", status: "active", description: "Boardroom session and decision management" },

  // ── Business / Finance / Concierge ────────────────────────
  { directory: "business-os", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Business domain engine (CRM, pipeline, revenue)" },
  { directory: "finance-os", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Finance domain engine (reserves, bills, investments)" },
  { directory: "concierge-os", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Concierge domain engine (household, travel, tasks)" },

  // ── Communications ────────────────────────────────────────
  { directory: "communication-service", domain: "communications", owner: "platform-team", status: "active", description: "Unified communication abstraction" },
  { directory: "messaging-gateway", domain: "communications", owner: "platform-team", status: "active", description: "Multi-channel message routing" },
  { directory: "notifications", domain: "communications", owner: "platform-team", status: "active", description: "Notification delivery and preference management" },
  { directory: "push-notification", domain: "communications", owner: "platform-team", status: "active", description: "Web Push (VAPID) delivery service" },

  // ── Platform Infrastructure ───────────────────────────────
  { directory: "realtime-gateway", domain: "platform-infrastructure", owner: "platform-team", status: "active", description: "Real-time event streaming via Supabase Realtime" },
  { directory: "degraded-mode", domain: "platform-infrastructure", owner: "platform-team", status: "active", description: "Graceful degradation orchestrator" },

  // ── Connectors ────────────────────────────────────────────
  { directory: "connector-control-plane", domain: "connectors", owner: "integrations-team", status: "active", description: "Connector lifecycle management" },
  { directory: "connector-engine", domain: "connectors", owner: "integrations-team", status: "active", description: "Connector execution engine" },
  { directory: "connector-runners", domain: "connectors", owner: "integrations-team", status: "active", description: "Per-provider connector runner implementations" },
  { directory: "connector-truth", domain: "connectors", owner: "integrations-team", status: "active", description: "Connector health verification and truth probes" },

  // ── Support & Recovery ────────────────────────────────────
  { directory: "support-diagnostics", domain: "support-recovery", owner: "platform-team", status: "active", description: "Support bundle generation and diagnostics" },
  { directory: "self-healing", domain: "support-recovery", owner: "platform-team", status: "active", description: "Automated remediation and recovery workflows" },
  { directory: "incident-management", domain: "support-recovery", owner: "platform-team", status: "active", description: "Incident tracking and resolution" },

  // ── Observability ─────────────────────────────────────────
  { directory: "observability", domain: "observability", owner: "platform-team", status: "active", description: "Structured logging, tracing, and SLO monitoring" },
  { directory: "observability-hub", domain: "observability", owner: "platform-team", status: "active", description: "Centralized observability dashboard data provider" },

  // ── Fleet (complementary, not duplicative) ────────────────
  { directory: "fleet", domain: "platform-infrastructure", owner: "platform-team", status: "active", description: "Fleet instance registration and lifecycle" },
  { directory: "fleet-health", domain: "platform-infrastructure", owner: "platform-team", status: "active", description: "Fleet health monitoring and alerting" },
  { directory: "fleet-ota", domain: "platform-infrastructure", owner: "platform-team", status: "active", description: "Fleet over-the-air update distribution" },

  // ── AI Intelligence (extended) ────────────────────────────
  { directory: "accuracy-classifier", domain: "ai-intelligence", owner: "ai-team", status: "active", description: "AI output accuracy classification and scoring" },
  { directory: "ai-memory-graph", domain: "ai-intelligence", owner: "ai-team", status: "active", description: "AI memory graph for contextual recall" },
  { directory: "attention-os", domain: "ai-intelligence", owner: "ai-team", status: "active", description: "Attention and focus management for AI agents" },
  { directory: "boardroom", domain: "ai-intelligence", owner: "ai-team", status: "active", description: "Boardroom UI logic and presentation layer" },
  { directory: "canonical-pipeline", domain: "ai-intelligence", owner: "ai-team", status: "active", description: "9-stage canonical AI pipeline orchestration" },
  { directory: "chief-of-staff", domain: "ai-intelligence", owner: "ai-team", status: "active", description: "Chief-of-staff meta-advisor orchestration" },
  { directory: "conscience-gate", domain: "ai-intelligence", owner: "ai-team", status: "active", description: "Ethical and safety gating for AI actions" },
  { directory: "context-graph", domain: "ai-intelligence", owner: "ai-team", status: "active", description: "Contextual knowledge graph for AI reasoning" },
  { directory: "decision-intelligence", domain: "ai-intelligence", owner: "ai-team", status: "active", description: "Decision quality scoring and recommendation engine" },
  { directory: "epistemic-firewall", domain: "ai-intelligence", owner: "ai-team", status: "active", description: "Truth boundary enforcement for AI outputs" },
  { directory: "explainability", domain: "ai-intelligence", owner: "ai-team", status: "active", description: "AI decision explainability and transparency" },
  { directory: "multi-agent-debate", domain: "ai-intelligence", owner: "ai-team", status: "active", description: "Multi-agent debate and consensus protocol" },
  { directory: "predictive-intent", domain: "ai-intelligence", owner: "ai-team", status: "active", description: "Predictive intent classification" },
  { directory: "predictive-needs", domain: "ai-intelligence", owner: "ai-team", status: "active", description: "Proactive needs anticipation engine" },
  { directory: "prompt-assembler", domain: "ai-intelligence", owner: "ai-team", status: "active", description: "Dynamic prompt assembly and template management" },
  { directory: "self-learning", domain: "ai-intelligence", owner: "ai-team", status: "active", description: "Self-improvement and feedback learning loops" },
  { directory: "timing-intelligence", domain: "ai-intelligence", owner: "ai-team", status: "active", description: "Optimal timing and scheduling intelligence" },
  { directory: "workspace-intelligence", domain: "ai-intelligence", owner: "ai-team", status: "active", description: "Workspace context and productivity intelligence" },

  // ── Advisor Services ──────────────────────────────────────
  { directory: "advisor-feedback", domain: "ai-intelligence", owner: "ai-team", status: "active", description: "Advisor feedback collection and quality scoring" },
  { directory: "advisor-knowledge", domain: "ai-intelligence", owner: "ai-team", status: "active", description: "Advisor domain knowledge base management" },
  { directory: "advisor-memory", domain: "ai-intelligence", owner: "ai-team", status: "active", description: "Advisor long-term memory persistence" },

  // ── Core Platform (extended) ──────────────────────────────
  { directory: "action-queue", domain: "core-platform", owner: "platform-team", status: "active", description: "Async action queue with priority scheduling" },
  { directory: "action-safety", domain: "core-platform", owner: "platform-team", status: "active", description: "Action safety classification and risk assessment" },
  { directory: "admin-service", domain: "core-platform", owner: "platform-team", status: "active", description: "Admin panel service layer" },
  { directory: "api-gateway", domain: "core-platform", owner: "platform-team", status: "active", description: "Client-side API gateway abstraction (server: deploy/api-gateway/)" },
  { directory: "architecture", domain: "governance", owner: "platform-team", status: "internal", description: "Architecture governance and validation rules" },
  { directory: "auth", domain: "trust-security", owner: "security-team", status: "active", description: "Authentication service abstraction" },
  { directory: "boot-persistence", domain: "core-platform", owner: "platform-team", status: "active", description: "Boot state persistence and resume" },
  { directory: "boundary-engine", domain: "governance", owner: "platform-team", status: "active", description: "Service boundary enforcement and validation" },
  { directory: "constitution-compiler", domain: "governance", owner: "platform-team", status: "active", description: "Constitution rule compilation" },
  { directory: "constitution-engine", domain: "governance", owner: "platform-team", status: "active", description: "Runtime constitution enforcement engine" },
  { directory: "continuity-engine", domain: "core-platform", owner: "platform-team", status: "active", description: "Session and workflow continuity management" },
  { directory: "data-scope-model", domain: "governance", owner: "platform-team", status: "active", description: "Data scope and access boundary model" },
  { directory: "demo-governance", domain: "governance", owner: "platform-team", status: "internal", description: "Demo mode governance and data gating" },
  { directory: "domain-runtime", domain: "core-platform", owner: "platform-team", status: "active", description: "Domain-specific runtime configuration" },
  { directory: "engineering-governance", domain: "governance", owner: "platform-team", status: "internal", description: "Engineering standards and governance rules" },
  { directory: "flagship-loops", domain: "core-platform", owner: "platform-team", status: "active", description: "Core flagship feedback loop orchestration" },
  { directory: "frontend", domain: "core-platform", owner: "platform-team", status: "active", description: "Frontend service utilities and helpers" },
  { directory: "golden-trace-runner", domain: "core-platform", owner: "platform-team", status: "active", description: "Golden path trace execution and validation" },
  { directory: "handoff", domain: "core-platform", owner: "platform-team", status: "active", description: "Context handoff between advisors/services" },
  { directory: "identity", domain: "trust-security", owner: "security-team", status: "active", description: "Identity resolution and management" },
  { directory: "identity-auth", domain: "trust-security", owner: "security-team", status: "active", description: "Identity-based authentication flows" },
  { directory: "immune-controller", domain: "trust-security", owner: "security-team", status: "active", description: "System immune response and threat containment" },
  { directory: "intent-inbox", domain: "core-platform", owner: "platform-team", status: "active", description: "Intent queue and inbox management" },
  { directory: "intent-orchestrator", domain: "core-platform", owner: "platform-team", status: "active", description: "Intent routing and orchestration" },
  { directory: "launch-gate", domain: "governance", owner: "platform-team", status: "active", description: "Launch readiness gate evaluation" },
  { directory: "launch-readiness", domain: "governance", owner: "platform-team", status: "active", description: "Launch readiness scoring and checklist" },
  { directory: "memory-governance", domain: "governance", owner: "platform-team", status: "active", description: "Memory lifecycle and retention governance" },
  { directory: "memory-service", domain: "core-platform", owner: "platform-team", status: "active", description: "Cross-service memory persistence layer" },
  { directory: "meta-governance", domain: "governance", owner: "platform-team", status: "active", description: "Meta-level governance and policy orchestration" },
  { directory: "mnemosyne", domain: "ai-intelligence", owner: "ai-team", status: "active", description: "Long-term memory retrieval and consolidation" },
  { directory: "natural-language-policy", domain: "governance", owner: "platform-team", status: "active", description: "Natural language policy definition and evaluation" },
  { directory: "offline-queue", domain: "platform-infrastructure", owner: "platform-team", status: "active", description: "Offline action queue with sync-on-reconnect" },
  { directory: "offline-sync", domain: "platform-infrastructure", owner: "platform-team", status: "active", description: "Offline data synchronization engine" },
  { directory: "onboarding", domain: "core-platform", owner: "platform-team", status: "active", description: "User onboarding workflow orchestration" },
  { directory: "onboarding-daemon", domain: "core-platform", owner: "platform-team", status: "active", description: "Background onboarding task daemon" },
  { directory: "orchestration-pipeline", domain: "core-platform", owner: "platform-team", status: "active", description: "7-layer orchestration pipeline management" },
  { directory: "os-awareness", domain: "platform-infrastructure", owner: "platform-team", status: "active", description: "OS-level awareness and environment detection" },
  { directory: "os-orchestration", domain: "platform-infrastructure", owner: "platform-team", status: "active", description: "OS-level orchestration and daemon management" },
  { directory: "os-unification", domain: "platform-infrastructure", owner: "platform-team", status: "active", description: "Cross-platform OS unification layer" },
  { directory: "owner-control-room", domain: "core-platform", owner: "platform-team", status: "active", description: "Owner control room data and command layer" },
  { directory: "performance-monitor", domain: "observability", owner: "platform-team", status: "active", description: "Runtime performance monitoring and alerting" },
  { directory: "platform-readiness", domain: "governance", owner: "platform-team", status: "active", description: "Platform readiness assessment and scoring" },
  { directory: "preferences", domain: "core-platform", owner: "platform-team", status: "active", description: "User preference storage and retrieval" },
  { directory: "profiles", domain: "core-platform", owner: "platform-team", status: "active", description: "User profile management" },
  { directory: "proof-orchestrator", domain: "core-platform", owner: "platform-team", status: "active", description: "Proof generation and verification orchestration" },
  { directory: "protocol-bridge", domain: "platform-infrastructure", owner: "platform-team", status: "active", description: "Protocol translation and bridging" },
  { directory: "provider-family", domain: "connectors", owner: "integrations-team", status: "active", description: "Provider family grouping and management" },
  { directory: "rex", domain: "core-platform", owner: "platform-team", status: "active", description: "Runtime experience engine" },
  { directory: "role-permission-engine", domain: "trust-security", owner: "security-team", status: "active", description: "RBAC role and permission evaluation" },
  { directory: "search-fabric", domain: "core-platform", owner: "platform-team", status: "active", description: "Universal search across all domains" },
  { directory: "session-resume", domain: "core-platform", owner: "platform-team", status: "active", description: "Session state resume and recovery" },
  { directory: "setup", domain: "core-platform", owner: "platform-team", status: "active", description: "Initial setup and configuration wizard" },
  { directory: "simulator", domain: "ai-intelligence", owner: "ai-team", status: "active", description: "Scenario simulation engine" },
  { directory: "sita-modes", domain: "core-platform", owner: "platform-team", status: "active", description: "OS mode management (focus, zen, etc.)" },
  { directory: "surface-detection", domain: "platform-infrastructure", owner: "platform-team", status: "active", description: "Runtime surface detection (web/desktop/mobile)" },
  { directory: "surface-portability", domain: "platform-infrastructure", owner: "platform-team", status: "active", description: "Cross-surface portability layer" },
  { directory: "system-updates", domain: "platform-infrastructure", owner: "platform-team", status: "active", description: "System update management and delivery" },
  { directory: "truth-indices", domain: "governance", owner: "platform-team", status: "active", description: "Truth index generation and drift detection" },
  { directory: "universal-state-sync", domain: "platform-infrastructure", owner: "platform-team", status: "active", description: "Cross-device state synchronization" },
  { directory: "update-daemon", domain: "platform-infrastructure", owner: "platform-team", status: "active", description: "Background update daemon" },
  { directory: "voice-command", domain: "core-platform", owner: "platform-team", status: "active", description: "Voice command processing and dispatch" },
  { directory: "workflow-engine", domain: "core-platform", owner: "platform-team", status: "active", description: "Workflow definition and execution engine" },

  // ── Business Domain (extended) ────────────────────────────
  { directory: "analytics", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Business analytics and reporting" },
  { directory: "anomaly-alert", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Business anomaly detection and alerting" },
  { directory: "attribution-analytics", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Revenue and marketing attribution analytics" },
  { directory: "auto-proposal", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Automated proposal generation" },
  { directory: "autonomous-negotiation", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "AI-assisted negotiation engine" },
  { directory: "billing", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Billing and invoicing service" },
  { directory: "booking-scheduling", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Appointment booking and scheduling" },
  { directory: "capital-allocation", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Capital allocation optimization" },
  { directory: "client-sentiment", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Client sentiment analysis and tracking" },
  { directory: "competitive-intelligence", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Competitive landscape intelligence" },
  { directory: "compound-life-score", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Compound life score calculation" },
  { directory: "desk", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Service desk and support ticket management" },
  { directory: "digest-engine", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Daily/weekly digest generation engine" },
  { directory: "digest-journal", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Digest journal and history" },
  { directory: "digital-legacy-vault", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Digital legacy and estate planning vault" },
  { directory: "digital-twins", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Digital twin state management" },
  { directory: "document-engine", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Document generation and management" },
  { directory: "document-signature", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Document signing and verification" },
  { directory: "entity-graph", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Entity relationship graph" },
  { directory: "family-command-center", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Family command center dashboard" },
  { directory: "family-constitution", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Family governance constitution" },
  { directory: "file-ingestion", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "File upload and ingestion processing" },
  { directory: "founder-orchestrator", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Founder workflow orchestration" },
  { directory: "fraud-sentinel", domain: "trust-security", owner: "security-team", status: "active", description: "Fraud detection and prevention" },
  { directory: "governance-simulator", domain: "governance", owner: "platform-team", status: "active", description: "Policy governance simulation" },
  { directory: "habit-tracker", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Habit tracking and streaks" },
  { directory: "household-org-graph", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Household organizational graph" },
  { directory: "lease-manager", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Lease and contract management" },
  { directory: "legacy-planning", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Legacy and succession planning" },
  { directory: "life-growth", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Personal growth tracking and goals" },
  { directory: "life-score", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Life score calculation engine" },
  { directory: "life-simulation", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Life scenario simulation" },
  { directory: "operating-autopilot", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Business operating autopilot mode" },
  { directory: "opportunity-engine", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Opportunity detection and scoring" },
  { directory: "opportunity-graph", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Opportunity relationship graph" },
  { directory: "opportunity-radar", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Real-time opportunity radar and alerts" },
  { directory: "outcome-engine", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Outcome tracking and measurement" },
  { directory: "payment-execution-service", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Payment execution and gateway integration" },
  { directory: "personal-graph", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Personal knowledge and relationship graph" },
  { directory: "personal-operating-model", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Personal operating model and priorities" },
  { directory: "personalization-engine", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Experience personalization engine" },
  { directory: "projection-service", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Financial projection service" },
  { directory: "projections", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Multi-domain projection calculations" },
  { directory: "recommendation-execution", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Recommendation action execution" },
  { directory: "relationship-intelligence", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Relationship health and intelligence" },
  { directory: "release-intelligence", domain: "governance", owner: "platform-team", status: "active", description: "Release intelligence and readiness" },
  { directory: "revenue-autopilot", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Revenue optimization autopilot" },
  { directory: "revenue-growth", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Revenue growth tracking and levers" },
  { directory: "revenue-leak-detector", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Revenue leak detection and recovery" },
  { directory: "revenue-ticker", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Real-time revenue ticker" },
  { directory: "sovereign-calculation", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Sovereign wealth calculation engine" },
  { directory: "sovereign-exporter", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Data sovereignty export tools" },
  { directory: "sovereign-time", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Time sovereignty and allocation tracking" },
  { directory: "time-wealth", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Time wealth scoring and optimization" },
  { directory: "timeline-calendar", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Unified timeline and calendar" },
  { directory: "website-management", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Business website management tools" },
  { directory: "widget-marketplace", domain: "business-finance-concierge", owner: "domain-team", status: "active", description: "Widget marketplace and distribution" },

  // ── Platform Infrastructure (extended) ────────────────────
  { directory: "adaptive-interface", domain: "platform-infrastructure", owner: "platform-team", status: "active", description: "Adaptive UI based on context and user behavior" },
  { directory: "alerting", domain: "platform-infrastructure", owner: "platform-team", status: "active", description: "System-wide alert routing and escalation" },
  { directory: "app-ingestion", domain: "platform-infrastructure", owner: "platform-team", status: "active", description: "App package ingestion and validation" },
  { directory: "app-store", domain: "platform-infrastructure", owner: "platform-team", status: "active", description: "SITA app store catalog and distribution" },
  { directory: "audit-ledger", domain: "governance", owner: "platform-team", status: "active", description: "Immutable audit ledger" },
  { directory: "audit-trail-timeline", domain: "governance", owner: "platform-team", status: "active", description: "Audit trail timeline visualization data" },
  { directory: "biometric-auth", domain: "trust-security", owner: "security-team", status: "active", description: "Biometric authentication flows" },
  { directory: "cloud-control-plane-infra", domain: "platform-infrastructure", owner: "platform-team", status: "active", description: "Cloud control plane infrastructure" },
  { directory: "device-mesh", domain: "platform-infrastructure", owner: "platform-team", status: "active", description: "Device mesh networking and discovery" },
  { directory: "ecosystem-orchestrator", domain: "platform-infrastructure", owner: "platform-team", status: "active", description: "Ecosystem-level orchestration" },
  { directory: "edge-device-runtime", domain: "platform-infrastructure", owner: "platform-team", status: "active", description: "Edge device runtime management" },
  { directory: "enterprise-control-plane", domain: "platform-infrastructure", owner: "platform-team", status: "active", description: "Enterprise-level control plane" },
  { directory: "experience-signature", domain: "core-platform", owner: "platform-team", status: "active", description: "Experience signature and consistency engine" },
  { directory: "google-provider-family", domain: "connectors", owner: "integrations-team", status: "active", description: "Google services provider family" },
  { directory: "i18n", domain: "platform-infrastructure", owner: "platform-team", status: "active", description: "Internationalization and localization" },
  { directory: "integration-concierge", domain: "connectors", owner: "integrations-team", status: "active", description: "Integration setup concierge and wizard" },
  { directory: "integration-hub", domain: "connectors", owner: "integrations-team", status: "active", description: "Integration hub catalog and management" },
  { directory: "native-apps", domain: "platform-infrastructure", owner: "platform-team", status: "active", description: "Native app registration and lifecycle" },
  { directory: "pack-management-service", domain: "platform-infrastructure", owner: "platform-team", status: "active", description: "Content pack management and distribution" },
  { directory: "trust-actions", domain: "trust-security", owner: "security-team", status: "active", description: "Trust-scoped action authorization" },
  { directory: "trust-state-service", domain: "trust-security", owner: "security-team", status: "active", description: "Trust state persistence and queries" },

  // ── Internal / Test ───────────────────────────────────────
  { directory: "__tests__", domain: "core-platform", owner: "platform-team", status: "internal", description: "Service layer test utilities" },
];

/** Look up a service entry by directory name */
export function getServiceEntry(directory: string): ServiceEntry | undefined {
  return SERVICE_REGISTRY.find((s) => s.directory === directory);
}

/** Get all services in a domain */
export function getServicesByDomain(domain: ServiceDomain): ServiceEntry[] {
  return SERVICE_REGISTRY.filter((s) => s.domain === domain);
}

/** Get all active services */
export function getActiveServices(): ServiceEntry[] {
  return SERVICE_REGISTRY.filter((s) => s.status === "active");
}