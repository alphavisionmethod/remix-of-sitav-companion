// ═══════════════════════════════════════════════════════════════
// SITA OS — Approvals Hub (Phase 3)
// Canonical entry for /admin/approvals. Unifies AI Approval Desk,
// HQ Approval Queue, AIT07 Approval Queue and Advisor Action
// Approval into one owner workflow surface.
// ═══════════════════════════════════════════════════════════════

import { lazy, Suspense } from "react";
import { AdminControlPlaneShell } from "@/platform/admin/components/admin/shells/AdminControlPlaneShell";
import { DomainHubLayout, type HubModule } from "@/platform/admin/components/admin/hubs/DomainHubLayout";

const AIApprovalDesk = lazy(() => import("@/pages/admin/AIApprovalDesk"));
const AIT07ApprovalQueue = lazy(() => import("@/pages/admin/AIT07ApprovalQueuePage"));
const HQApprovalQueue = lazy(() => import("@/pages/admin/AIT07ApprovalQueuePage"));
const AdvisorActionApproval = lazy(
  () => import("@/pages/admin/AdvisorActionApprovalAdmin"),
);
const Layer7FollowthroughBoard = lazy(() =>
  import("@/components/admin/boardroom/Layer7FollowthroughBoard").then((m) => ({
    default: m.Layer7FollowthroughBoard,
  })),
);

function ModuleFallback() {
  return (
    <div className="text-xs text-muted-foreground py-12 text-center">
      Loading module…
    </div>
  );
}

const wrap = (Comp: React.ComponentType) => () => (
  <Suspense fallback={<ModuleFallback />}>
    <Comp />
  </Suspense>
);

export default function ApprovalsHome() {
  const modules: HubModule[] = [
    {
      id: "pending",
      label: "Pending",
      description: "Awaiting owner decision.",
      badge: { label: "queue", tone: "warning" },
      legacyPath: "/admin/ai-team/approvals",
      render: wrap(AIT07ApprovalQueue),
    },
    {
      id: "ai-desk",
      label: "AI Desk",
      description: "AI-generated proposals awaiting confirmation.",
      legacyPath: "/admin/ai-approval-desk",
      render: wrap(AIApprovalDesk),
    },
    {
      id: "advisor-actions",
      label: "Advisor Actions",
      description: "Board-of-Advisor action approvals.",
      legacyPath: "/admin/advisor-board/actions",
      render: wrap(AdvisorActionApproval),
    },
    {
      id: "hq-queue",
      label: "HQ Queue",
      description: "Headquarter-level approval queue.",
      legacyPath: "/admin/ai-team/approval-queue",
      render: wrap(HQApprovalQueue),
    },
    {
      id: "layer7-followthrough",
      label: "Layer 7 Follow-through",
      description: "Boardroom post-approval chain — dispatched, executed, outcome-tracked, reflected.",
      badge: { label: "L7", tone: "default" },
      legacyPath: "/admin/boardroom/followthrough",
      render: wrap(Layer7FollowthroughBoard),
    },
  ];

  return (
    <AdminControlPlaneShell>
      <DomainHubLayout domain="approvals" modules={modules} defaultTabId="pending" />
    </AdminControlPlaneShell>
  );
}
