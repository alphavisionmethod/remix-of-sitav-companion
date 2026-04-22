import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({}), useSearchParams: () => [new URLSearchParams(), vi.fn()] };
});

const pages = [
  ["OwnerModePage", () => import("@/pages/owner-mode/OwnerModePage")],
  ["AdvisorConfig", () => import("@/pages/owner/AdvisorConfig")],
  ["ConstitutionEditor", () => import("@/pages/owner/ConstitutionEditor")],
  ["LeaseDashboard", () => import("@/pages/owner/LeaseDashboard")],
  ["OwnerAiTeamUpdatesPage", () => import("@/pages/owner/OwnerAiTeamUpdatesPage")],
  ["OwnerApprovalsPage", () => import("@/pages/owner/OwnerApprovalsPage")],
  ["OwnerPulsePage", () => import("@/pages/owner/OwnerPulsePage")],
  ["PackEditor", () => import("@/pages/owner/PackEditor")],
  ["PricingEditor", () => import("@/pages/owner/PricingEditor")],
  ["GoogleConnectedAccounts", () => import("@/pages/settings/GoogleConnectedAccounts")],
  ["NotificationPreferences", () => import("@/pages/settings/NotificationPreferences")],
  ["IntegrationsCatalog", () => import("@/pages/integrations/IntegrationsCatalog")],
  ["ConnectionsList", () => import("@/pages/integrations/ConnectionsList")],
  ["ConnectionDetail", () => import("@/pages/integrations/ConnectionDetail")],
  ["ActionsApprovals", () => import("@/pages/integrations/ActionsApprovals")],
  ["ProviderDetail", () => import("@/pages/integrations/ProviderDetail")],
  ["EnterpriseControlPlane", () => import("@/pages/enterprise/EnterpriseControlPlane")],
  ["UsersAdminPage", () => import("@/pages/UsersAdminPage")],
] as const;

describe("Owner & Settings Pages", () => {
  pages.forEach(([name, loader]) => {
    it(`${name} renders without crashing`, async () => {
      const mod: any = await loader();
      const Component = mod.default || Object.values(mod).find((v: any) => typeof v === "function");
      const { container } = render(<Component />, { authenticated: true });
      expect(container).toBeTruthy();
    });
  });
});
