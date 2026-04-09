// SITA OS — Demo Data: Admin Intelligence

export const DEMO_INTEL_AGENTS = [
  { id: "a-1", name: "Finance Advisor", composite: 82, quality: 88, costEff: 76, acceptance: 0.92, override: 0.08, falsePositive: 0.03, verification: 0.95, reuse: 0.45, downstream: 78, trend: "improving" },
  { id: "a-2", name: "Self-Healing Agent", composite: 91, quality: 90, costEff: 95, acceptance: 0.95, override: 0.05, falsePositive: 0.02, verification: 0.98, reuse: 0.62, downstream: 88, trend: "improving" },
  { id: "a-3", name: "Strategy Synthesizer", composite: 71, quality: 85, costEff: 52, acceptance: 0.78, override: 0.22, falsePositive: 0.08, verification: 0.82, reuse: 0.28, downstream: 65, trend: "degrading" },
  { id: "a-4", name: "Growth Agent", composite: 74, quality: 80, costEff: 68, acceptance: 0.85, override: 0.15, falsePositive: 0.05, verification: 0.88, reuse: 0.35, downstream: 72, trend: "stable" },
  { id: "a-5", name: "Monitor Agent", composite: 93, quality: 92, costEff: 96, acceptance: 0.98, override: 0.02, falsePositive: 0.01, verification: 0.99, reuse: 0.72, downstream: 90, trend: "improving" },
  { id: "a-6", name: "Design Agent", composite: 77, quality: 83, costEff: 71, acceptance: 0.82, override: 0.18, falsePositive: 0.06, verification: 0.86, reuse: 0.40, downstream: 74, trend: "stable" },
];

export const DEMO_WORKFLOWS = [
  { id: "w-1", name: "Incident Response", composite: 88, quality: 92, costEff: 84, acceptance: 0.96, override: 0.04, reuse: 0.58, trend: "improving" },
  { id: "w-2", name: "Release Approval", composite: 82, quality: 86, costEff: 78, acceptance: 0.90, override: 0.10, reuse: 0.42, trend: "stable" },
  { id: "w-3", name: "Lead Qualification", composite: 76, quality: 80, costEff: 72, acceptance: 0.85, override: 0.15, reuse: 0.35, trend: "stable" },
  { id: "w-4", name: "Portfolio Rebalance", composite: 69, quality: 75, costEff: 63, acceptance: 0.78, override: 0.22, reuse: 0.30, trend: "degrading" },
];

export const DEMO_PATHS = [
  { label: "root-cause → fix-plan", composite: 90, cost: 45, quality: 94, acceptance: 0.96, reuse: 0.65 },
  { label: "fingerprint → self-heal", composite: 92, cost: 20, quality: 96, acceptance: 0.98, reuse: 0.78 },
  { label: "thesis → trade-memo", composite: 72, cost: 120, quality: 82, acceptance: 0.80, reuse: 0.25 },
  { label: "diagnostic → recommendation", composite: 78, cost: 80, quality: 84, acceptance: 0.85, reuse: 0.38 },
  { label: "strategy → synthesis", composite: 68, cost: 150, quality: 80, acceptance: 0.75, reuse: 0.20 },
];

export const DEMO_INTEL_PATTERNS = [
  { id: "ct-1", label: "API timeout cascade after deploy", type: "issue_fingerprint", domain: "engineering", confidence: 94, tenants: 18, anonymization: "k_anonymity", approved: true, restrictions: ["confidence_gated"], privacyGates: ["no_pii", "min_source_count", "min_confidence"] },
  { id: "ct-2", label: "Lead cold after 48hr no follow-up", type: "workflow_pattern", domain: "revenue-business", confidence: 88, tenants: 31, anonymization: "aggregation", approved: true, restrictions: ["confidence_gated"], privacyGates: ["no_pii", "min_source_count"] },
  { id: "ct-3", label: "Migration timeout on large tables", type: "deployment_pattern", domain: "engineering", confidence: 91, tenants: 12, anonymization: "k_anonymity", approved: true, restrictions: ["enterprise_opt_out"], privacyGates: ["no_pii", "min_source_count", "min_confidence", "low_false_positive"] },
  { id: "ct-4", label: "Cache flush resolves 80% of 5xx", type: "self_heal_pattern", domain: "engineering", confidence: 96, tenants: 45, anonymization: "aggregation", approved: true, restrictions: [], privacyGates: ["no_pii", "min_source_count", "min_confidence", "low_false_positive"] },
  { id: "ct-5", label: "Mobile CTA below fold drop", type: "conversion_pattern", domain: "digital-presence", confidence: 74, tenants: 8, anonymization: "k_anonymity", approved: false, restrictions: ["confidence_gated", "low_source_count"], privacyGates: ["no_pii"] },
  { id: "ct-6", label: "Dark mode contrast failures", type: "design_pattern", domain: "digital-presence", confidence: 78, tenants: 5, anonymization: "aggregation", approved: false, restrictions: ["low_source_count"], privacyGates: ["no_pii"] },
  { id: "ct-7", label: "Env var drift staging/prod", type: "config_drift", domain: "engineering", confidence: 85, tenants: 0, anonymization: "redaction", approved: false, restrictions: ["tenant_private", "enterprise_opt_out"], privacyGates: [] },
];

export const DEMO_RESTRICTED_DOMAINS = ["investment-finance", "concierge-household"];

export const DEMO_ENTERPRISE_EXCLUSIONS = ["Acme Corp (custom policy)", "FinanceHQ (regulatory)"];

export const DEMO_INTEL_DIFFS = [
  { id: "dr-1", domain: "investment-finance", desc: "Portfolio state — minor price fluctuation", materiality: 22, action: "reuse-as-is", costFull: 120, costActual: 5, deltas: 2, confidence: 92, preserved: 8, invalidated: 0, changes: ["AAPL +1.2%", "Bond yield -0.05%"] },
  { id: "dr-2", domain: "engineering", desc: "Build pipeline — new dependency added", materiality: 68, action: "partial-update", costFull: 120, costActual: 35, deltas: 5, confidence: 65, preserved: 4, invalidated: 3, changes: ["New dep: @supabase/ssr", "CI config updated", "Test coverage drop 2%", "Build time +8s", "Lock file changed"] },
  { id: "dr-3", domain: "revenue-business", desc: "CRM state — one lead status change", materiality: 12, action: "reuse-as-is", costFull: 80, costActual: 3, deltas: 1, confidence: 96, preserved: 12, invalidated: 0, changes: ["Lead #42 → qualified"] },
  { id: "dr-4", domain: "digital-presence", desc: "Website structure — major layout change detected", materiality: 85, action: "full-reanalysis", costFull: 150, costActual: 150, deltas: 8, confidence: 38, preserved: 1, invalidated: 6, changes: ["Hero section redesign", "Nav restructure", "CTA moved", "Footer updated", "New section added", "Color scheme shift", "Font change", "Mobile layout changed"] },
  { id: "dr-5", domain: "compliance-trust", desc: "Trust policy — no changes", materiality: 5, action: "reuse-as-is", costFull: 100, costActual: 4, deltas: 0, confidence: 98, preserved: 5, invalidated: 0, changes: [] },
  { id: "dr-6", domain: "admin-ops", desc: "Team structure — new member added", materiality: 35, action: "partial-update", costFull: 90, costActual: 28, deltas: 3, confidence: 78, preserved: 6, invalidated: 1, changes: ["New team member", "Permission grant", "Workflow route updated"] },
];

export const DEMO_ESCALATIONS = [
  { id: "esc-1", domain: "engineering", trigger: "low_confidence", from: "utility", to: "premium", cost: 180, justified: true, outcome: "accepted", desc: "Complex race condition in payment flow", ago: "2hr" },
  { id: "esc-2", domain: "investment-finance", trigger: "high_stakes", from: "standard", to: "premium", cost: 120, justified: true, outcome: "accepted", desc: "Portfolio rebalance recommendation $200k+", ago: "4hr" },
  { id: "esc-3", domain: "revenue-business", trigger: "ambiguity", from: "utility", to: "standard", cost: 45, justified: false, outcome: "overridden", desc: "Lead scoring edge case — could have been cached", ago: "6hr" },
  { id: "esc-4", domain: "compliance-trust", trigger: "explicit_user_request", from: "standard", to: "exceptional", cost: 350, justified: true, outcome: "accepted", desc: "Regulatory compliance deep analysis requested", ago: "8hr" },
  { id: "esc-5", domain: "digital-presence", trigger: "invalidated_prior_reasoning", from: "utility", to: "premium", cost: 150, justified: true, outcome: "accepted", desc: "Major layout change invalidated all prior analysis", ago: "1d" },
  { id: "esc-6", domain: "engineering", trigger: "novelty", from: "standard", to: "premium", cost: 130, justified: false, outcome: "low_value", desc: "New framework — could have used reference pattern", ago: "1d" },
  { id: "esc-7", domain: "admin-ops", trigger: "enterprise_policy", from: "utility", to: "standard", cost: 60, justified: true, outcome: "accepted", desc: "Enterprise policy requires standard+ for ops decisions", ago: "2d" },
];

export const DEMO_INTEL_ASSETS = [
  { id: "ia-1", type: "root-cause-analysis", domain: "engineering", title: "Memory leak in portfolio renderer", confidence: 92, freshness: "2hr", verificationState: "verified", reuseEligible: true, usageCount: 12, qualityScore: 92, acceptanceRate: 0.95, status: "active", savings: 540, invalidationTriggers: ["deployment", "dependency_update"], evidenceRefs: 3, lastUsed: "1hr ago" },
  { id: "ia-2", type: "investment-thesis", domain: "investment-finance", title: "Tech sector rotation thesis Q2", confidence: 88, freshness: "6hr", verificationState: "verified", reuseEligible: true, usageCount: 8, qualityScore: 88, acceptanceRate: 0.88, status: "active", savings: 960, invalidationTriggers: ["market_event"], evidenceRefs: 5, lastUsed: "3hr ago" },
  { id: "ia-3", type: "automation-playbook", domain: "revenue-business", title: "Lead follow-up sequence playbook", confidence: 85, freshness: "1d", verificationState: "verified", reuseEligible: true, usageCount: 24, qualityScore: 85, acceptanceRate: 0.92, status: "active", savings: 1080, invalidationTriggers: ["pricing_change"], evidenceRefs: 2, lastUsed: "30min ago" },
  { id: "ia-4", type: "website-diagnostic", domain: "digital-presence", title: "Homepage conversion bottleneck", confidence: 78, freshness: "4hr", verificationState: "pending", reuseEligible: true, usageCount: 6, qualityScore: 78, acceptanceRate: 0.83, status: "active", savings: 420, invalidationTriggers: ["layout_change", "content_update"], evidenceRefs: 4, lastUsed: "2hr ago" },
  { id: "ia-5", type: "issue-fingerprint", domain: "engineering", title: "API timeout pattern — payment service", confidence: 94, freshness: "30min", verificationState: "verified", reuseEligible: true, usageCount: 18, qualityScore: 94, acceptanceRate: 0.97, status: "active", savings: 810, invalidationTriggers: ["architecture_change"], evidenceRefs: 6, lastUsed: "15min ago" },
  { id: "ia-6", type: "strategic-summary", domain: "admin-ops", title: "Q2 operational priorities synthesis", confidence: 62, freshness: "3d", verificationState: "stale", reuseEligible: false, usageCount: 5, qualityScore: 62, acceptanceRate: 0.80, status: "stale", savings: 450, invalidationTriggers: ["policy_change"], evidenceRefs: 2, lastUsed: "2d ago" },
  { id: "ia-7", type: "decision-frame", domain: "compliance-trust", title: "Data residency decision framework", confidence: 90, freshness: "12hr", verificationState: "verified", reuseEligible: true, usageCount: 3, qualityScore: 90, acceptanceRate: 1.0, status: "active", savings: 360, invalidationTriggers: ["regulatory_change"], evidenceRefs: 8, lastUsed: "6hr ago" },
  { id: "ia-8", type: "pattern", domain: "engineering", title: "Common N+1 query regression pattern", confidence: 96, freshness: "1hr", verificationState: "verified", reuseEligible: true, usageCount: 31, qualityScore: 96, acceptanceRate: 0.98, status: "active", savings: 1400, invalidationTriggers: ["schema_change"], evidenceRefs: 12, lastUsed: "10min ago" },
];

export const DEMO_INTEL_PACKETS = [
  { domain: "admin-ops", tokenCount: 1200, compressionRatio: 0.12, fresh: true, changes: 3, risks: 1, constraints: 2, priorRecs: 4, unresolved: 1, confidence: 82, compiledAgo: "15min", compileCost: 8, compileLatency: 240, qualityScore: 85 },
  { domain: "engineering", tokenCount: 1800, compressionRatio: 0.15, fresh: true, changes: 5, risks: 2, constraints: 3, priorRecs: 6, unresolved: 2, confidence: 76, compiledAgo: "8min", compileCost: 12, compileLatency: 380, qualityScore: 78 },
  { domain: "revenue-business", tokenCount: 1400, compressionRatio: 0.11, fresh: true, changes: 2, risks: 0, constraints: 1, priorRecs: 5, unresolved: 0, confidence: 89, compiledAgo: "22min", compileCost: 9, compileLatency: 290, qualityScore: 88 },
  { domain: "digital-presence", tokenCount: 2100, compressionRatio: 0.18, fresh: false, changes: 8, risks: 3, constraints: 2, priorRecs: 3, unresolved: 4, confidence: 58, compiledAgo: "2hr", compileCost: 15, compileLatency: 520, qualityScore: 62 },
  { domain: "investment-finance", tokenCount: 1600, compressionRatio: 0.14, fresh: true, changes: 4, risks: 1, constraints: 4, priorRecs: 7, unresolved: 1, confidence: 84, compiledAgo: "12min", compileCost: 10, compileLatency: 340, qualityScore: 86 },
  { domain: "concierge-household", tokenCount: 900, compressionRatio: 0.08, fresh: true, changes: 1, risks: 0, constraints: 0, priorRecs: 2, unresolved: 0, confidence: 94, compiledAgo: "45min", compileCost: 5, compileLatency: 150, qualityScore: 92 },
  { domain: "connectors-integrations", tokenCount: 1100, compressionRatio: 0.10, fresh: true, changes: 2, risks: 1, constraints: 1, priorRecs: 3, unresolved: 1, confidence: 80, compiledAgo: "30min", compileCost: 7, compileLatency: 210, qualityScore: 82 },
  { domain: "launch-deployment", tokenCount: 1500, compressionRatio: 0.13, fresh: true, changes: 3, risks: 2, constraints: 2, priorRecs: 4, unresolved: 2, confidence: 72, compiledAgo: "18min", compileCost: 11, compileLatency: 360, qualityScore: 74 },
  { domain: "compliance-trust", tokenCount: 1300, compressionRatio: 0.12, fresh: true, changes: 0, risks: 0, constraints: 5, priorRecs: 3, unresolved: 0, confidence: 96, compiledAgo: "1hr", compileCost: 8, compileLatency: 260, qualityScore: 94 },
];

export const DEMO_REUSE_DATA = {
  reuseRate: 0.64,
  adaptedReuseRate: 0.22,
  directReuseRate: 0.42,
  costAvoided: 8420,
  totalReuses: 187,
  invalidatedAssets: 6,
  avgConfidence: 87,
  confidenceTrend: "improving" as const,
};

export const DEMO_ASSET_CLASSES = [
  { type: "root-cause-analysis", reuses: 42, savings: 2100, trend: "up" },
  { type: "issue-fingerprint", reuses: 38, savings: 1900, trend: "up" },
  { type: "automation-playbook", reuses: 31, savings: 1550, trend: "stable" },
  { type: "strategic-summary", reuses: 24, savings: 960, trend: "up" },
  { type: "investment-thesis", reuses: 18, savings: 720, trend: "down" },
  { type: "website-diagnostic", reuses: 15, savings: 600, trend: "stable" },
  { type: "design-recommendation", reuses: 12, savings: 360, trend: "up" },
  { type: "release-readiness-packet", reuses: 7, savings: 230, trend: "stable" },
];

export const DEMO_DOMAIN_REUSE = [
  { domain: "engineering", reuseRate: 0.72, savings: 3200, assets: 28, invalidated: 2 },
  { domain: "revenue-business", reuseRate: 0.68, savings: 1800, assets: 15, invalidated: 1 },
  { domain: "investment-finance", reuseRate: 0.58, savings: 1400, assets: 12, invalidated: 0 },
  { domain: "digital-presence", reuseRate: 0.52, savings: 980, assets: 10, invalidated: 2 },
  { domain: "admin-ops", reuseRate: 0.48, savings: 640, assets: 8, invalidated: 1 },
  { domain: "compliance-trust", reuseRate: 0.45, savings: 400, assets: 5, invalidated: 0 },
];

export const DEMO_INVALIDATION_FEED = [
  { asset: "Q1 revenue projection model", reason: "pricing_change", domain: "revenue-business", ago: "2hr" },
  { asset: "Build pipeline root-cause", reason: "dependency_update", domain: "engineering", ago: "4hr" },
  { asset: "Homepage conversion diagnosis", reason: "layout_change", domain: "digital-presence", ago: "6hr" },
  { asset: "API timeout pattern", reason: "architecture_change", domain: "engineering", ago: "1d" },
  { asset: "SEO keyword strategy", reason: "content_update", domain: "digital-presence", ago: "1d" },
  { asset: "Quarterly ops synthesis", reason: "policy_change", domain: "admin-ops", ago: "2d" },
];

export const DEMO_CONFIDENCE_TREND = [
  { period: "Week 1", avg: 78 },
  { period: "Week 2", avg: 81 },
  { period: "Week 3", avg: 84 },
  { period: "Week 4", avg: 87 },
];

export const DEMO_INTEL_OUTCOMES = [
  { type: "incident_prevented", count: 8, costCents: 2400, valueCents: 48000, roi: 20.0, accepted: 8, rejected: 0, domain: "engineering" },
  { type: "self_heal_success", count: 22, costCents: 1100, valueCents: 22000, roi: 20.0, accepted: 21, rejected: 1, domain: "engineering" },
  { type: "retention_saved", count: 2, costCents: 1600, valueCents: 24000, roi: 15.0, accepted: 2, rejected: 0, domain: "revenue-business" },
  { type: "lead_recovered", count: 6, costCents: 1800, valueCents: 18000, roi: 10.0, accepted: 5, rejected: 1, domain: "revenue-business" },
  { type: "automation_completed", count: 18, costCents: 900, valueCents: 9000, roi: 10.0, accepted: 17, rejected: 1, domain: "admin-ops" },
  { type: "strategic_accepted", count: 3, costCents: 4800, valueCents: 36000, roi: 7.5, accepted: 3, rejected: 0, domain: "admin-ops" },
  { type: "issue_resolved", count: 14, costCents: 4200, valueCents: 28000, roi: 6.7, accepted: 12, rejected: 2, domain: "engineering" },
  { type: "release_approved", count: 4, costCents: 3200, valueCents: 16000, roi: 5.0, accepted: 4, rejected: 0, domain: "engineering" },
  { type: "design_improvement_accepted", count: 5, costCents: 2500, valueCents: 8000, roi: 3.2, accepted: 4, rejected: 1, domain: "digital-presence" },
  { type: "cost_saved", count: 7, costCents: 3500, valueCents: 12000, roi: 3.4, accepted: 6, rejected: 1, domain: "admin-ops" },
];

export const DEMO_REASONING_PATHS = [
  { path: "fingerprint → self-heal", cost: 1100, value: 22000, acceptance: 0.95, recommendation: "expand" as const },
  { path: "root-cause → fix-plan", cost: 2400, value: 48000, acceptance: 0.92, recommendation: "expand" as const },
  { path: "lead-scoring → follow-up", cost: 1800, value: 18000, acceptance: 0.83, recommendation: "maintain" as const },
  { path: "strategy → synthesis", cost: 4800, value: 36000, acceptance: 1.0, recommendation: "maintain" as const },
  { path: "diagnostic → redesign", cost: 2500, value: 8000, acceptance: 0.80, recommendation: "optimize" as const },
  { path: "deep-analysis → report", cost: 6000, value: 10000, acceptance: 0.60, recommendation: "downgrade" as const },
];

export const DEMO_INTEL_PATTERNS_PATTERN_LEARNING_CENTER = [
  { id: "p-1", type: "issue_fingerprint", domain: "engineering", label: "API timeout cascade after deploy", confidence: 94, falsePositive: 2, sourceCount: 42, privacy: "anonymizable", reusable: true, description: "Cascading timeout pattern detected post-deployment in microservice mesh" },
  { id: "p-2", type: "workflow_pattern", domain: "revenue-business", label: "Lead cold after 48hr no follow-up", confidence: 88, falsePositive: 5, sourceCount: 67, privacy: "anonymizable", reusable: true, description: "Leads consistently going cold without 48hr follow-up touch" },
  { id: "p-3", type: "deployment_pattern", domain: "engineering", label: "Migration timeout on large tables", confidence: 91, falsePositive: 3, sourceCount: 23, privacy: "anonymizable", reusable: true, description: "DB migrations exceeding timeout threshold on tables > 1M rows" },
  { id: "p-4", type: "self_heal_pattern", domain: "engineering", label: "Cache flush resolves 80% of 5xx", confidence: 96, falsePositive: 1, sourceCount: 89, privacy: "public_safe", reusable: true, description: "Cache flush is highly effective first-response for 5xx spike events" },
  { id: "p-5", type: "conversion_pattern", domain: "digital-presence", label: "Mobile CTA below fold = 40% drop", confidence: 82, falsePositive: 8, sourceCount: 34, privacy: "anonymizable", reusable: true, description: "Primary CTA placement below fold on mobile causes significant conversion drop" },
  { id: "p-6", type: "design_pattern", domain: "digital-presence", label: "Dark mode contrast failures", confidence: 78, falsePositive: 12, sourceCount: 18, privacy: "public_safe", reusable: true, description: "Common contrast ratio failures in dark mode implementations" },
  { id: "p-7", type: "config_drift", domain: "engineering", label: "Env var drift across staging/prod", confidence: 85, falsePositive: 6, sourceCount: 31, privacy: "tenant_private", reusable: false, description: "Environment variable configuration drift between staging and production" },
  { id: "p-8", type: "incident_cluster", domain: "engineering", label: "Friday deploy → weekend incidents", confidence: 72, falsePositive: 15, sourceCount: 12, privacy: "anonymizable", reusable: true, description: "Correlation between Friday deployments and weekend incident spikes" },
];

export const DEMO_DIGESTS = [
  { id: "d-1", type: "daily_summary", domain: "engineering", fresh: true, hitRate: 0.82, genCost: 15, avoidedSpend: 120, age: "2hr", expiresIn: "22hr", cacheStatus: "cached" },
  { id: "d-2", type: "boardroom_packet", domain: "admin-ops", fresh: true, hitRate: 0.75, genCost: 25, avoidedSpend: 200, age: "4hr", expiresIn: "20hr", cacheStatus: "cached" },
  { id: "d-3", type: "risk_packet", domain: "compliance-trust", fresh: true, hitRate: 0.68, genCost: 18, avoidedSpend: 90, age: "1hr", expiresIn: "23hr", cacheStatus: "cached" },
  { id: "d-4", type: "release_packet", domain: "engineering", fresh: true, hitRate: 0.90, genCost: 20, avoidedSpend: 180, age: "30min", expiresIn: "23.5hr", cacheStatus: "cached" },
  { id: "d-5", type: "opportunity_packet", domain: "revenue-business", fresh: true, hitRate: 0.72, genCost: 12, avoidedSpend: 85, age: "3hr", expiresIn: "21hr", cacheStatus: "cached" },
  { id: "d-6", type: "mission_digest", domain: "engineering", fresh: false, hitRate: 0.45, genCost: 22, avoidedSpend: 60, age: "28hr", expiresIn: "expired", cacheStatus: "stale" },
  { id: "d-7", type: "daily_summary", domain: "investment-finance", fresh: true, hitRate: 0.78, genCost: 16, avoidedSpend: 130, age: "5hr", expiresIn: "19hr", cacheStatus: "cached" },
  { id: "d-8", type: "daily_summary", domain: "digital-presence", fresh: false, hitRate: 0.35, genCost: 14, avoidedSpend: 30, age: "26hr", expiresIn: "expired", cacheStatus: "stale" },
];

export const DEMO_PROFILES = [
  { domain: "engineering", taskType: "root-cause", version: "v3.2", maxContext: "B", packetDriven: true, redundancy: 8, costReduction: 42, qualityImpact: 2, active: true },
  { domain: "engineering", taskType: "fix-plan", version: "v2.8", maxContext: "B", packetDriven: true, redundancy: 12, costReduction: 38, qualityImpact: 1, active: true },
  { domain: "revenue-business", taskType: "lead-scoring", version: "v2.1", maxContext: "A", packetDriven: true, redundancy: 5, costReduction: 55, qualityImpact: 0, active: true },
  { domain: "revenue-business", taskType: "strategy", version: "v1.5", maxContext: "C", packetDriven: false, redundancy: 28, costReduction: 15, qualityImpact: -3, active: true },
  { domain: "digital-presence", taskType: "seo-audit", version: "v2.0", maxContext: "B", packetDriven: true, redundancy: 15, costReduction: 35, qualityImpact: 1, active: true },
  { domain: "digital-presence", taskType: "conversion-analysis", version: "v1.8", maxContext: "C", packetDriven: false, redundancy: 32, costReduction: 10, qualityImpact: -2, active: true },
  { domain: "investment-finance", taskType: "thesis-generation", version: "v2.4", maxContext: "C", packetDriven: true, redundancy: 18, costReduction: 28, qualityImpact: 0, active: true },
  { domain: "investment-finance", taskType: "risk-assessment", version: "v3.0", maxContext: "B", packetDriven: true, redundancy: 6, costReduction: 48, qualityImpact: 3, active: true },
  { domain: "compliance-trust", taskType: "policy-check", version: "v2.6", maxContext: "A", packetDriven: true, redundancy: 3, costReduction: 62, qualityImpact: 5, active: true },
  { domain: "admin-ops", taskType: "synthesis", version: "v1.2", maxContext: "D", packetDriven: false, redundancy: 45, costReduction: 5, qualityImpact: -5, active: false },
];
