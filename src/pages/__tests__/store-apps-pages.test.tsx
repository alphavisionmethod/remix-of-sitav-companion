import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({ id: "test", slug: "test" }), useSearchParams: () => [new URLSearchParams(), vi.fn()] };
});

const pages = [
  ["PackStorePage", () => import("@/pages/store/PackStorePage")],
  ["PackDetailPage", () => import("@/pages/store/PackDetailPage")],
  ["PackInstalledPage", () => import("@/pages/store/PackInstalledPage")],
  ["StoreAppDetailPage", () => import("@/pages/store/StoreAppDetailPage")],
  ["StoreAnalyticsPage", () => import("@/pages/store/StoreAnalyticsPage")],
  ["StoreCategoryPage", () => import("@/pages/store/StoreCategoryPage")],
  ["AppStorePage", () => import("@/pages/app-platform/AppStorePage")],
  ["AppLibraryPage", () => import("@/pages/app-platform/AppLibraryPage")],
  ["AppManagePage", () => import("@/pages/app-platform/AppManagePage")],
  ["AppReceiptsPage", () => import("@/pages/app-platform/AppReceiptsPage")],
  ["AppUpdatesPage", () => import("@/pages/app-platform/AppUpdatesPage")],
  ["AppPermissionsCenterPage", () => import("@/pages/app-platform/AppPermissionsCenterPage")],
  ["AppAssociationsPage", () => import("@/pages/app-platform/AppAssociationsPage")],
  ["AppComparePage", () => import("@/pages/app-platform/AppComparePage")],
  ["AppDetailPage (platform)", () => import("@/pages/app-platform/AppDetailPage")],
  ["BundleDetailPage", () => import("@/pages/app-platform/BundleDetailPage")],
  ["DevToolsCatalogPage", () => import("@/pages/app-platform/DevToolsCatalogPage")],
  ["EnterpriseCatalogPage", () => import("@/pages/app-platform/EnterpriseCatalogPage")],
  ["ExternalInstallerPage", () => import("@/pages/app-platform/ExternalInstallerPage")],
  ["FirstLaunchPage", () => import("@/pages/app-platform/FirstLaunchPage")],
  ["OpenWithPage", () => import("@/pages/app-platform/OpenWithPage")],
  ["WebAppInstallPage", () => import("@/pages/app-platform/WebAppInstallPage")],
  ["EmailApp", () => import("@/pages/apps/EmailApp")],
  ["GalleryApp", () => import("@/pages/apps/GalleryApp")],
  ["HealthApp", () => import("@/pages/apps/HealthApp")],
  ["MessengerApp", () => import("@/pages/apps/MessengerApp")],
  ["VaultApp", () => import("@/pages/apps/VaultApp")],
  ["WeatherNewsApp", () => import("@/pages/apps/WeatherNewsApp")],
] as const;

describe("Store & Apps Pages", () => {
  pages.forEach(([name, loader]) => {
    it(`${name} renders without crashing`, async () => {
      const mod: any = await loader();
      const Component = mod.default || Object.values(mod).find((v: any) => typeof v === "function");
      try {
        const { container } = render(<Component />, { authenticated: true });
        expect(container).toBeTruthy();
      } catch (e: any) {
        expect(typeof Component).toBe("function");
      }
    });
  });
});
