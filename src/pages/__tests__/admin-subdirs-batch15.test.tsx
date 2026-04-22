import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({ id: "test" }), useSearchParams: () => [new URLSearchParams(), vi.fn()] };
});

const pages: [string, () => Promise<any>][] = [
  ["CloudPolicyAdmin", () => import("@/pages/admin/cloud/CloudPolicyAdmin")],
  ["CloudRecoveryAdmin", () => import("@/pages/admin/cloud/CloudRecoveryAdmin")],
  ["CloudSharingAdmin", () => import("@/pages/admin/cloud/CloudSharingAdmin")],
  ["CloudStorageAdmin", () => import("@/pages/admin/cloud/CloudStorageAdmin")],
  ["CloudStorageHealthAdmin", () => import("@/pages/admin/cloud/CloudStorageHealthAdmin")],
  ["CloudSupportConsole", () => import("@/pages/admin/cloud/CloudSupportConsole")],
  ["CloudSyncAdmin", () => import("@/pages/admin/cloud/CloudSyncAdmin")],
  ["CloudSyncObjectsAdmin", () => import("@/pages/admin/cloud/CloudSyncObjectsAdmin")],
  ["CloudTenantAdmin", () => import("@/pages/admin/cloud/CloudTenantAdmin")],
  ["CloudUsersAdmin", () => import("@/pages/admin/cloud/CloudUsersAdmin")],
  ["CloudWorkerOpsAdmin", () => import("@/pages/admin/cloud/CloudWorkerOpsAdmin")],
  ["ConfigChangeHistory", () => import("@/pages/admin/cloud/ConfigChangeHistory")],
  ["DataFlowMapAdmin", () => import("@/pages/admin/cloud/DataFlowMapAdmin")],
  ["DomainOwnershipAdmin", () => import("@/pages/admin/cloud/DomainOwnershipAdmin")],
  ["EnvironmentSwitcher", () => import("@/pages/admin/cloud/EnvironmentSwitcher")],
  ["PlatformPlaneOverview", () => import("@/pages/admin/cloud/PlatformPlaneOverview")],
  ["ReadModelSnapshotsAdmin", () => import("@/pages/admin/cloud/ReadModelSnapshotsAdmin")],
  ["ReleaseGovernanceAdmin", () => import("@/pages/admin/cloud/ReleaseGovernanceAdmin")],
  ["ServiceIdentityAdmin", () => import("@/pages/admin/cloud/ServiceIdentityAdmin")],
  ["SupportCaseManager", () => import("@/pages/admin/cloud/SupportCaseManager")],
  ["SupportConsoleSafe", () => import("@/pages/admin/cloud/SupportConsoleSafe")],
  ["ITC01Overview", () => import("@/pages/admin/implementation-truth/ITC01Overview")],
  ["ITC02SpecRegistry", () => import("@/pages/admin/implementation-truth/ITC02SpecRegistry")],
  ["ITC03ContractVerification", () => import("@/pages/admin/implementation-truth/ITC03ContractVerification")],
  ["ITC04WiringGraph", () => import("@/pages/admin/implementation-truth/ITC04WiringGraph")],
  ["ITC05ReadinessScoreboard", () => import("@/pages/admin/implementation-truth/ITC05ReadinessScoreboard")],
  ["ITC06DriftRadar", () => import("@/pages/admin/implementation-truth/ITC06DriftRadar")],
  ["ITC07ImplementationMap", () => import("@/pages/admin/implementation-truth/ITC07ImplementationMap")],
  ["ITC08ArchitectureCompliance", () => import("@/pages/admin/implementation-truth/ITC08ArchitectureCompliance")],
  ["ITC09RouteInventory", () => import("@/pages/admin/implementation-truth/ITC09RouteInventory")],
];

describe("Admin Subdirs Batch 15", () => {
  pages.forEach(([name, loader]) => {
    it(`${name} renders without crashing`, async () => {
      const mod: any = await loader();
      const Component = mod.default || Object.values(mod).find((v: any) => typeof v === "function");
      const { container } = render(<Component />, { authenticated: true });
      expect(container).toBeTruthy();
    });
  });
});
