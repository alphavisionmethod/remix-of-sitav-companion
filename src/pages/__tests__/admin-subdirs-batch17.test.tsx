import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({ id: "test" }), useSearchParams: () => [new URLSearchParams(), vi.fn()] };
});

const pages = [
  ["MCSystemHealth", () => import("@/pages/admin/modules/MCSystemHealth")],
  ["MCTrustSecurity", () => import("@/pages/admin/modules/MCTrustSecurity")],
  ["MCUsersCenter", () => import("@/pages/admin/modules/MCUsersCenter")],
  ["MCWorkspacesContinuity", () => import("@/pages/admin/modules/MCWorkspacesContinuity")],
  ["PLE01Overview", () => import("@/pages/admin/platform-law/PLE01Overview")],
  ["PLE02LawRegistry", () => import("@/pages/admin/platform-law/PLE02LawRegistry")],
  ["PLE03ScaffoldRegistry", () => import("@/pages/admin/platform-law/PLE03ScaffoldRegistry")],
  ["PLE04CIGateMonitor", () => import("@/pages/admin/platform-law/PLE04CIGateMonitor")],
  ["PLE05ManifestEnforcer", () => import("@/pages/admin/platform-law/PLE05ManifestEnforcer")],
  ["PLE06OwnershipBoard", () => import("@/pages/admin/platform-law/PLE06OwnershipBoard")],
  ["PLE07ComplianceDashboard", () => import("@/pages/admin/platform-law/PLE07ComplianceDashboard")],
  ["PLT05ViolationTriage", () => import("@/pages/admin/platform-law/PLT05ViolationTriage")],
  ["PLT06FeatureCompliance", () => import("@/pages/admin/platform-law/PLT06FeatureCompliance")],
  ["PLT08LaunchEnforcement", () => import("@/pages/admin/platform-law/PLT08LaunchEnforcement")],
  ["PLT10DriftRadar", () => import("@/pages/admin/platform-law/PLT10DriftRadar")],
  ["CoreServicePersistence", () => import("@/pages/admin/reality-audit/CoreServicePersistence")],
  ["LaunchHonestyBoard", () => import("@/pages/admin/reality-audit/LaunchHonestyBoard")],
  ["MockReplacementProgram", () => import("@/pages/admin/reality-audit/MockReplacementProgram")],
  ["RCP01Overview", () => import("@/pages/admin/reality-audit/RCP01Overview")],
  ["RCP03FeatureDetail", () => import("@/pages/admin/reality-audit/RCP03FeatureDetail")],
  ["RCP05MockSourceInventory", () => import("@/pages/admin/reality-audit/RCP05MockSourceInventory")],
  ["RCP07RouteHeatmap", () => import("@/pages/admin/reality-audit/RCP07RouteHeatmap")],
  ["RCP08ContractReadiness", () => import("@/pages/admin/reality-audit/RCP08ContractReadiness")],
  ["RCP10WavePlanner", () => import("@/pages/admin/reality-audit/RCP10WavePlanner")],
  ["RCP11ProgressTimeline", () => import("@/pages/admin/reality-audit/RCP11ProgressTimeline")],
  ["RealityClassificationMatrix", () => import("@/pages/admin/reality-audit/RealityClassificationMatrix")],
  ["RuntimeTruthGate", () => import("@/pages/admin/reality-audit/RuntimeTruthGate")],
  ["JVC01JourneyVerificationOverview", () => import("@/pages/admin/verification/JVC01JourneyVerificationOverview")],
  ["JVC04ButtonCTAHealth", () => import("@/pages/admin/verification/JVC04ButtonCTAHealth")],
  ["JVC05RedirectIntegrityMap", () => import("@/pages/admin/verification/JVC05RedirectIntegrityMap")],
] as const;

describe("Admin Subdirs Batch 17", () => {
  pages.forEach(([name, loader]) => {
    it(`${name} renders without crashing`, async () => {
      const mod: any = await loader();
      const Component = mod.default || Object.values(mod).find((v: any) => typeof v === "function");
      const { container } = render(<Component />, { authenticated: true });
      expect(container).toBeTruthy();
    });
  });
});
