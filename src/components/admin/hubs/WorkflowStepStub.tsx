// ═══════════════════════════════════════════════════════════════
// SITA OS — Workflow Step Stub (Phase 25)
// Lightweight surface used to satisfy workflow-step routes that
// don't have a dedicated drill page yet. Renders a registry-driven
// hub index filtered to the relevant domain so operators can still
// navigate, plus a header explaining the workflow context.
// ═══════════════════════════════════════════════════════════════

import { AdminControlPlaneShell } from "@/components/admin/shells/AdminControlPlaneShell";
import { DomainHubIndex } from "@/components/admin/hubs/DomainHubIndex";
import type { AdminDomain } from "@/platform/architecture/admin-route-registry";

interface WorkflowStepStubProps {
  domain: AdminDomain;
  heading: string;
  intent: string;
}

export function WorkflowStepStub({ domain, heading, intent }: WorkflowStepStubProps) {
  return (
    <AdminControlPlaneShell>
      <DomainHubIndex
        domain={domain}
        heading={heading}
        intro={intent}
      />
    </AdminControlPlaneShell>
  );
}

export default WorkflowStepStub;
