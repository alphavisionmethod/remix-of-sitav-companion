// ═══════════════════════════════════════════════════════════════
// SITA OS — Trust & Security Hub (Phase 25)
// Canonical entry for /admin/trust-security.
// ═══════════════════════════════════════════════════════════════

import { lazy, Suspense } from "react";
import { AdminControlPlaneShell } from "@/platform/admin/components/admin/shells/AdminControlPlaneShell";
import { DomainHubLayout, type HubModule } from "@/platform/admin/components/admin/hubs/DomainHubLayout";

const SecurityCommandCenter = lazy(() => import("@/pages/admin/SecurityCommandCenter"));
const SEC01SessionSecrets = lazy(() => import("@/pages/admin/SEC01SessionSecrets"));
const SEC02SecurityFoundation = lazy(() => import("@/pages/admin/SEC02SecurityFoundation"));
const MCPoliciesFlags = lazy(() => import("@/pages/admin/modules/MCPoliciesFlags"));
const MCAuthorityMatrix = lazy(() => import("@/pages/admin/modules/MCAuthorityMatrix"));
const MCControlReceipts = lazy(() => import("@/pages/admin/modules/MCControlReceipts"));
const MCStateAuthority = lazy(() => import("@/pages/admin/modules/MCStateAuthority"));
const MCEmergencyAuthority = lazy(() => import("@/pages/admin/modules/MCEmergencyAuthority"));
const AuditComplianceWorkspace = lazy(() => import("@/pages/admin/AuditComplianceWorkspace"));

function ModuleFallback() {
  return (
    <div className="text-xs text-muted-foreground py-12 text-center">Loading module…</div>
  );
}

const wrap = (Comp: React.ComponentType) => () => (
  <Suspense fallback={<ModuleFallback />}>
    <Comp />
  </Suspense>
);

export default function TrustSecurityHome() {
  const modules: HubModule[] = [
    {
      id: "command",
      label: "Command Center",
      description: "Trust & security command center.",
      legacyPath: "/admin/security/command-center",
      render: wrap(SecurityCommandCenter),
    },
    {
      id: "policies",
      label: "Policies",
      description: "Policy editors and policy drift.",
      legacyPath: "/admin/mc/policies",
      render: wrap(MCPoliciesFlags),
    },
    {
      id: "proofs",
      label: "Proofs",
      description: "Proof gaps and control receipts.",
      legacyPath: "/admin/mc/control-receipts",
      render: wrap(MCControlReceipts),
    },
    {
      id: "permissions",
      label: "Permissions",
      description: "Authority matrix and permission grants.",
      legacyPath: "/admin/mc/authority-matrix",
      render: wrap(MCAuthorityMatrix),
    },
    {
      id: "sensitive-actions",
      label: "Sensitive Actions",
      description: "Sensitive action integrity and state authority.",
      legacyPath: "/admin/mc/state-authority",
      render: wrap(MCStateAuthority),
    },
    {
      id: "audit",
      label: "Audit Trail",
      description: "Audit trail and compliance workspace.",
      render: wrap(AuditComplianceWorkspace),
    },
    {
      id: "sessions",
      label: "Sessions & Secrets",
      description: "Session and secret management.",
      legacyPath: "/admin/security/sessions",
      render: wrap(SEC01SessionSecrets),
    },
    {
      id: "foundation",
      label: "Foundation",
      description: "Security foundation status.",
      legacyPath: "/admin/security/foundation",
      render: wrap(SEC02SecurityFoundation),
    },
    {
      id: "emergency",
      label: "Emergency",
      description: "Emergency authority controls.",
      legacyPath: "/admin/mc/emergency",
      render: wrap(MCEmergencyAuthority),
    },
  ];

  return (
    <AdminControlPlaneShell>
      <DomainHubLayout domain="trust-security" modules={modules} defaultTabId="command" />
    </AdminControlPlaneShell>
  );
}
