import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({ id: "test" }), useSearchParams: () => [new URLSearchParams(), vi.fn()] };
});

const pages: [string, () => Promise<any>][] = [
  ["ArchitectureBoundaryBoard", () => import("@/pages/admin/architecture/ArchitectureBoundaryBoard")],
  ["EpistemicFirewallBoard", () => import("@/pages/admin/architecture/EpistemicFirewallBoard")],
  ["GodTierIntegrationBoard", () => import("@/pages/admin/architecture/GodTierIntegrationBoard")],
  ["AdminAuditExplorer", () => import("@/pages/admin/cloud/AdminAuditExplorer")],
  ["AdminRBACConsole", () => import("@/pages/admin/cloud/AdminRBACConsole")],
  ["AdminSafetyRails", () => import("@/pages/admin/cloud/AdminSafetyRails")],
  ["AdminTokenManager", () => import("@/pages/admin/cloud/AdminTokenManager")],
  ["ApiGatewayRoutesAdmin", () => import("@/pages/admin/cloud/ApiGatewayRoutesAdmin")],
  ["ClientCapabilityAdmin", () => import("@/pages/admin/cloud/ClientCapabilityAdmin")],
  ["CloudActivityAdmin", () => import("@/pages/admin/cloud/CloudActivityAdmin")],
  ["CloudAdminLayout", () => import("@/pages/admin/cloud/CloudAdminLayout")],
  ["CloudAuditAdmin", () => import("@/pages/admin/cloud/CloudAuditAdmin")],
  ["CloudBackboneAdmin", () => import("@/pages/admin/cloud/CloudBackboneAdmin")],
  ["CloudBootstrapAdmin", () => import("@/pages/admin/cloud/CloudBootstrapAdmin")],
  ["CloudCollaborationAdmin", () => import("@/pages/admin/cloud/CloudCollaborationAdmin")],
  ["CloudComplianceAdmin", () => import("@/pages/admin/cloud/CloudComplianceAdmin")],
  ["CloudCostCapacityAdmin", () => import("@/pages/admin/cloud/CloudCostCapacityAdmin")],
  ["CloudDashboard", () => import("@/pages/admin/cloud/CloudDashboard")],
  ["CloudDeviceIdentityAdmin", () => import("@/pages/admin/cloud/CloudDeviceIdentityAdmin")],
  ["CloudDevicesAdmin", () => import("@/pages/admin/cloud/CloudDevicesAdmin")],
  ["CloudEncryptionAdmin", () => import("@/pages/admin/cloud/CloudEncryptionAdmin")],
  ["CloudFeatureFlagsAdmin", () => import("@/pages/admin/cloud/CloudFeatureFlagsAdmin")],
  ["CloudGovernanceAdmin", () => import("@/pages/admin/cloud/CloudGovernanceAdmin")],
  ["CloudIntegrityAdmin", () => import("@/pages/admin/cloud/CloudIntegrityAdmin")],
  ["CloudJobsAdmin", () => import("@/pages/admin/cloud/CloudJobsAdmin")],
  ["CloudLifecycleAdmin", () => import("@/pages/admin/cloud/CloudLifecycleAdmin")],
  ["CloudMaintenanceModeAdmin", () => import("@/pages/admin/cloud/CloudMaintenanceModeAdmin")],
  ["CloudMonitoringAdmin", () => import("@/pages/admin/cloud/CloudMonitoringAdmin")],
  ["CloudNamespacesAdmin", () => import("@/pages/admin/cloud/CloudNamespacesAdmin")],
  ["CloudObservabilityAdmin", () => import("@/pages/admin/cloud/CloudObservabilityAdmin")],
];

describe("Admin Subdirs Batch 14", () => {
  pages.forEach(([name, loader]) => {
    it(`${name} renders without crashing`, async () => {
      const mod: any = await loader();
      const Component = mod.default || Object.values(mod).find((v: any) => typeof v === "function");
      const { container } = render(<Component />, { authenticated: true });
      expect(container).toBeTruthy();
    });
  });
});
