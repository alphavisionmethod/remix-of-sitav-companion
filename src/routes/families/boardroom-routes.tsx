import { Route } from "react-router-dom";
import { lazy } from "react";

const Boardroom = lazy(() => import("@/pages/Boardroom"));
const BoardroomReplay = lazy(() => import("@/pages/boardroom/BoardroomReplay"));
const BoardroomHistory = lazy(() => import("@/pages/boardroom/BoardroomHistory"));
const WeeklyBoardroom = lazy(() => import("@/pages/WeeklyBoardroom"));
const ProofCenter = lazy(() => import("@/pages/ProofCenter"));
const WorkflowsCenter = lazy(() => import("@/pages/WorkflowsCenter"));
const ApprovalsCenter = lazy(() => import("@/pages/ApprovalsCenter"));
const ApprovalChamber = lazy(() => import("@/pages/ApprovalChamber"));

export function getBoardroomRoutes() {
  return (
    <>
      <Route path="/boardroom" element={<Boardroom />} />
      <Route path="/boardroom/business" element={<Boardroom />} />
      <Route path="/boardroom/finance" element={<Boardroom />} />
      <Route path="/boardroom/family" element={<Boardroom />} />
      <Route path="/boardroom/opportunity" element={<Boardroom />} />
      <Route path="/boardroom/morning" element={<Boardroom />} />
      <Route path="/boardroom/weekly" element={<Boardroom />} />
      <Route path="/boardroom/incidents" element={<Boardroom />} />
      <Route path="/boardroom/replay" element={<BoardroomReplay />} />
      <Route path="/boardroom/history" element={<BoardroomHistory />} />
      <Route path="/boardroom/weekly-review" element={<WeeklyBoardroom />} />

      {/* Proof Center */}
      <Route path="/proof" element={<ProofCenter />} />
      <Route path="/proof/receipts" element={<ProofCenter />} />
      <Route path="/proof/executions" element={<ProofCenter />} />
      <Route path="/proof/verifications" element={<ProofCenter />} />
      <Route path="/proof/rollbacks" element={<ProofCenter />} />

      {/* Workflows */}
      <Route path="/workflows" element={<WorkflowsCenter />} />
      <Route path="/workflows/active" element={<WorkflowsCenter />} />
      <Route path="/workflows/history" element={<WorkflowsCenter />} />
      <Route path="/workflows/templates" element={<WorkflowsCenter />} />

      {/* Approvals */}
      <Route path="/approvals" element={<ApprovalsCenter />} />
      <Route path="/approvals/pending" element={<ApprovalsCenter />} />
      <Route path="/approvals/simulated" element={<ApprovalsCenter />} />
      <Route path="/approvals/history" element={<ApprovalsCenter />} />
      <Route path="/approval-chamber" element={<ApprovalChamber />} />
    </>
  );
}
