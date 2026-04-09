// SITA OS — Demo Data: Enterprise

export const DEMO_TEAM_MEMBERS = [
  { id: "1", name: "Sarah Chen", email: "sarah@acme.co", role: "admin", status: "active", lastSeen: "2 min ago", trustScore: 98 },
  { id: "2", name: "Marcus Rivera", email: "marcus@acme.co", role: "moderator", status: "active", lastSeen: "1 hour ago", trustScore: 92 },
  { id: "3", name: "Aisha Patel", email: "aisha@acme.co", role: "user", status: "active", lastSeen: "Today", trustScore: 88 },
  { id: "4", name: "James Wong", email: "james@acme.co", role: "user", status: "invited", lastSeen: "Never", trustScore: 0 },
];

export const DEMO_COMPLIANCE_ITEMS = [
  { id: "iso27001", name: "ISO 27001", status: "compliant", lastAudit: "2026-03-15", evidence: 12, nextReview: "2026-09-15" },
  { id: "soc2", name: "SOC 2 Type II", status: "in-progress", lastAudit: "2026-01-20", evidence: 8, nextReview: "2026-07-20" },
  { id: "gdpr", name: "GDPR", status: "compliant", lastAudit: "2026-02-10", evidence: 15, nextReview: "2026-08-10" },
  { id: "nist", name: "NIST CSF", status: "review-needed", lastAudit: "2025-11-01", evidence: 6, nextReview: "2026-05-01" },
];

export const DEMO_SLA_METRICS = [
  { name: "Uptime", target: 99.9, actual: 99.97, unit: "%" },
  { name: "Response Time (p95)", target: 200, actual: 142, unit: "ms" },
  { name: "Incident Resolution", target: 4, actual: 2.3, unit: "hrs" },
  { name: "Data Recovery", target: 1, actual: 0.5, unit: "hrs" },
];

export const DEMO_DEPLOYMENTS = [
  { id: "1", env: "production", version: "v2.14.3", status: "healthy", deployed: "2 hours ago", by: "CI/CD" },
  { id: "2", env: "staging", version: "v2.15.0-rc1", status: "testing", deployed: "30 min ago", by: "Sarah Chen" },
  { id: "3", env: "production", version: "v2.14.2", status: "rolled-back", deployed: "Yesterday", by: "CI/CD" },
];

export const DEMO_ENT_CAPABILITIES = ["biz-crm-read", "biz-crm-write", "fin-accounts-read", "fin-payment-execute", "con-calendar-read", "con-booking-create", "plat-diagnostic", "plat-config-write"];

export const DEMO_ROLES = ["admin", "moderator", "user"];
