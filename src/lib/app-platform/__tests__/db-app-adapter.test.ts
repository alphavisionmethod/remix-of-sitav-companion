import { describe, it, expect } from "vitest";
import { dbToAppDefinition, dbRowsToAppDefinitions } from "@/lib/app-platform/db-app-adapter";
import type { CatalogApp } from "@/lib/services/app-store/catalog.service";
import type { InstalledAppRow } from "@/lib/services/app-store/install.service";

const baseCatalog: CatalogApp = {
  app_id: "sita.business", slug: "sita-business", name: "Business OS", short_name: "Business",
  description: "Run your business", publisher: "SITA", app_type: "internal",
  launch_strategy: "internal_route", launch_target: { route: "/business" },
  category: "business", tags: ["crm"], icon_url: "💼", banner_url: null, screenshots: [],
  permissions_required: [], supported_surfaces: ["desktop"],
  installability: "preinstalled", verification_status: "verified", trust_level: "first_party",
  version: "1.0.0", latest_version: "1.0.0", enabled: true, featured: true, pinned_default: true,
  sort_order: 0, requires_auth: true, requires_shell: true, offline_support: "partial",
  window_defaults: {}, manifest_json: {}, update_channel: "stable",
};

describe("db-app-adapter", () => {
  it("maps preinstalled internal app to installed", () => {
    const def = dbToAppDefinition(baseCatalog);
    expect(def.id).toBe("sita.business");
    expect(def.installStatus).toBe("installed");
    expect(def.appClass).toBe("internal");
    expect(def.routePath).toBe("/business");
    expect(def.trustLevel).toBe("sita-verified");
  });

  it("derives update-available when versions differ", () => {
    const installed: InstalledAppRow = {
      id: "i1", user_id: "u1", app_id: "sita.business", install_status: "installed",
      enabled: true, pinned: true, favorite: false, pinned_order: 0, launch_count: 5,
      last_launched_at: null, version_installed: "0.9.0",
      permissions_granted: {}, config_json: {}, source_channel: "system_default",
      installed_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
    const def = dbToAppDefinition(baseCatalog, installed);
    expect(def.installStatus).toBe("update-available");
    expect(def.pinnedToDock).toBe(true);
  });

  it("dbRowsToAppDefinitions joins by app_id", () => {
    const defs = dbRowsToAppDefinitions([baseCatalog], []);
    expect(defs).toHaveLength(1);
    expect(defs[0].installStatus).toBe("installed");
  });
});
