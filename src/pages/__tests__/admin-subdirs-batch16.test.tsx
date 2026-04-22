import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({ id: "test" }), useSearchParams: () => [new URLSearchParams(), vi.fn()] };
});

const pages = [
  ["ITC10RuntimeEvidence", () => import("@/pages/admin/implementation-truth/ITC10RuntimeEvidence")],
  ["ITC11PromptTraceability", () => import("@/pages/admin/implementation-truth/ITC11PromptTraceability")],
  ["ITC12ValidationPipeline", () => import("@/pages/admin/implementation-truth/ITC12ValidationPipeline")],
  ["ITC13LaunchTruthGate", () => import("@/pages/admin/implementation-truth/ITC13LaunchTruthGate")],
  ["ITC14ManifestExplorer", () => import("@/pages/admin/implementation-truth/ITC14ManifestExplorer")],
  ["IntelligenceLayerAdmin", () => import("@/pages/admin/intelligence/IntelligenceLayerAdmin")],
  ["MCAIControl", () => import("@/pages/admin/modules/MCAIControl")],
  ["MCApprovalFlow", () => import("@/pages/admin/modules/MCApprovalFlow")],
  ["MCArchitectureDashboard", () => import("@/pages/admin/modules/MCArchitectureDashboard")],
  ["MCArchitectureTests", () => import("@/pages/admin/modules/MCArchitectureTests")],
  ["MCAuthorityMatrix", () => import("@/pages/admin/modules/MCAuthorityMatrix")],
  ["MCCommandRouting", () => import("@/pages/admin/modules/MCCommandRouting")],
  ["MCControlReceipts", () => import("@/pages/admin/modules/MCControlReceipts")],
  ["MCCostsAIBudgets", () => import("@/pages/admin/modules/MCCostsAIBudgets")],
  ["MCDevicesCenter", () => import("@/pages/admin/modules/MCDevicesCenter")],
  ["MCEmergencyAuthority", () => import("@/pages/admin/modules/MCEmergencyAuthority")],
  ["MCEventRouting", () => import("@/pages/admin/modules/MCEventRouting")],
  ["MCFailureRecovery", () => import("@/pages/admin/modules/MCFailureRecovery")],
  ["MCFeatureOwnership", () => import("@/pages/admin/modules/MCFeatureOwnership")],
  ["MCIncidents", () => import("@/pages/admin/modules/MCIncidents")],
  ["MCJobsMaintenance", () => import("@/pages/admin/modules/MCJobsMaintenance")],
  ["MCKnowledgeBase", () => import("@/pages/admin/modules/MCKnowledgeBase")],
  ["MCLogsAudit", () => import("@/pages/admin/modules/MCLogsAudit")],
  ["MCPlatformAdaptation", () => import("@/pages/admin/modules/MCPlatformAdaptation")],
  ["MCPoliciesFlags", () => import("@/pages/admin/modules/MCPoliciesFlags")],
  ["MCReleasesUpdates", () => import("@/pages/admin/modules/MCReleasesUpdates")],
  ["MCStateAuthority", () => import("@/pages/admin/modules/MCStateAuthority")],
  ["MCStorageCenter", () => import("@/pages/admin/modules/MCStorageCenter")],
  ["MCSupport", () => import("@/pages/admin/modules/MCSupport")],
  ["MCSyncCloud", () => import("@/pages/admin/modules/MCSyncCloud")],
] as const;

describe("Admin Subdirs Batch 16", () => {
  pages.forEach(([name, loader]) => {
    it(`${name} renders without crashing`, async () => {
      const mod: any = await loader();
      const Component = mod.default || Object.values(mod).find((v: any) => typeof v === "function");
      const { container } = render(<Component />, { authenticated: true });
      expect(container).toBeTruthy();
    });
  });
});
