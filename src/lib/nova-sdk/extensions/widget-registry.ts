// ═══════════════════════════════════════════════════════════════
// Nova SDK — Widget Registry
// Dashboard widget framework with sandboxed rendering
// ═══════════════════════════════════════════════════════════════

import type { NovaPermissionId } from "../core/manifest";
import type { ComponentType } from "react";

export type WidgetSize = "small" | "medium" | "large";
export type WidgetCategory = "system" | "productivity" | "finance" | "social" | "utility" | "custom";

export interface WidgetManifest {
  id: string;
  name: string;
  description?: string;
  size: WidgetSize;
  refreshInterval?: number; // ms, 0 = no auto-refresh
  component: ComponentType<WidgetProps>;
  permissions: NovaPermissionId[];
  category: WidgetCategory;
  icon?: string;
  minWidth?: number;
  minHeight?: number;
}

export interface WidgetProps {
  widgetId: string;
  size: WidgetSize;
  onRequestRefresh?: () => void;
}

export interface WidgetPlacement {
  widgetId: string;
  position: { x: number; y: number };
  active: boolean;
  placedAt: number;
}

class WidgetRegistryClass {
  private widgets = new Map<string, WidgetManifest>();
  private placements = new Map<string, WidgetPlacement>();

  registerWidget(manifest: WidgetManifest): void {
    if (this.widgets.has(manifest.id)) {
      console.warn(`[WidgetRegistry] Widget "${manifest.id}" already registered — overwriting`);
    }
    this.widgets.set(manifest.id, manifest);
  }

  unregisterWidget(id: string): boolean {
    this.placements.delete(id);
    return this.widgets.delete(id);
  }

  getWidget(id: string): WidgetManifest | undefined {
    return this.widgets.get(id);
  }

  getWidgets(category?: WidgetCategory): WidgetManifest[] {
    const all = Array.from(this.widgets.values());
    return category ? all.filter(w => w.category === category) : all;
  }

  placeWidget(id: string, position: { x: number; y: number }): boolean {
    if (!this.widgets.has(id)) return false;
    this.placements.set(id, { widgetId: id, position, active: true, placedAt: Date.now() });
    return true;
  }

  removeWidget(id: string): boolean {
    return this.placements.delete(id);
  }

  getActiveWidgets(): (WidgetManifest & { placement: WidgetPlacement })[] {
    const results: (WidgetManifest & { placement: WidgetPlacement })[] = [];
    for (const [id, placement] of this.placements) {
      if (!placement.active) continue;
      const manifest = this.widgets.get(id);
      if (manifest) results.push({ ...manifest, placement });
    }
    return results;
  }

  reset(): void {
    this.widgets.clear();
    this.placements.clear();
  }

  getStats() {
    return {
      registered: this.widgets.size,
      active: Array.from(this.placements.values()).filter(p => p.active).length,
      byCategory: {
        system: this.getWidgets("system").length,
        productivity: this.getWidgets("productivity").length,
        finance: this.getWidgets("finance").length,
        social: this.getWidgets("social").length,
        utility: this.getWidgets("utility").length,
        custom: this.getWidgets("custom").length,
      },
    };
  }
}

export const WidgetRegistry = new WidgetRegistryClass();
