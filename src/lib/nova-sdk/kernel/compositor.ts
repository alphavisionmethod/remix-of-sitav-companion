// ═══════════════════════════════════════════════════════════════
// Nova Kernel — Compositor
// Window surface tracking, z-order, hit-testing, dirty regions
// Now with layer-based z-order (normal < modal < overlay)
// ═══════════════════════════════════════════════════════════════

export interface SurfaceBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type SurfaceLayer = "normal" | "modal" | "overlay";

const LAYER_BASE: Record<SurfaceLayer, number> = {
  normal: 0,
  modal: 10000,
  overlay: 20000,
};

export interface CompositorSurface {
  windowId: string;
  pid: number;
  zIndex: number;
  layer: SurfaceLayer;
  bounds: SurfaceBounds;
  visible: boolean;
  opacity: number;
  dirty: boolean;
  title: string;
}

class CompositorClass {
  private surfaces = new Map<string, CompositorSurface>();
  private nextZ = 1;

  /** Register a new window surface */
  registerSurface(windowId: string, pid: number, bounds: SurfaceBounds, title = "", layer: SurfaceLayer = "normal"): CompositorSurface {
    const surface: CompositorSurface = {
      windowId,
      pid,
      zIndex: this.nextZ++,
      layer,
      bounds,
      visible: true,
      opacity: 1,
      dirty: true,
      title,
    };
    this.surfaces.set(windowId, surface);
    console.log(`[Kernel:Compositor] Registered surface "${windowId}" (PID ${pid}) layer=${layer} z=${surface.zIndex}`);
    return surface;
  }

  /** Remove a surface */
  removeSurface(windowId: string): boolean {
    const removed = this.surfaces.delete(windowId);
    if (removed) {
      console.log(`[Kernel:Compositor] Removed surface "${windowId}"`);
    }
    return removed;
  }

  /** Bring a surface to front within its layer */
  bringToFront(windowId: string): void {
    const surface = this.surfaces.get(windowId);
    if (surface) {
      surface.zIndex = this.nextZ++;
      surface.dirty = true;
    }
  }

  /** Change surface layer (e.g., promote to modal) */
  setLayer(windowId: string, layer: SurfaceLayer): void {
    const surface = this.surfaces.get(windowId);
    if (surface) {
      surface.layer = layer;
      surface.dirty = true;
    }
  }

  /** Update surface bounds (on move/resize) */
  updateBounds(windowId: string, bounds: Partial<SurfaceBounds>): void {
    const surface = this.surfaces.get(windowId);
    if (surface) {
      Object.assign(surface.bounds, bounds);
      surface.dirty = true;
    }
  }

  /** Set surface visibility (minimize/restore) */
  setVisible(windowId: string, visible: boolean): void {
    const surface = this.surfaces.get(windowId);
    if (surface) {
      surface.visible = visible;
      surface.dirty = true;
    }
  }

  /** Check if a surface is fully occluded by higher surfaces */
  isFullyOccluded(windowId: string): boolean {
    const target = this.surfaces.get(windowId);
    if (!target || !target.visible) return true;

    const effectiveZ = LAYER_BASE[target.layer] + target.zIndex;
    const tb = target.bounds;

    for (const s of this.surfaces.values()) {
      if (s.windowId === windowId || !s.visible) continue;
      const sz = LAYER_BASE[s.layer] + s.zIndex;
      if (sz <= effectiveZ) continue;

      // Check if s fully covers target
      if (
        s.bounds.x <= tb.x &&
        s.bounds.y <= tb.y &&
        s.bounds.x + s.bounds.width >= tb.x + tb.width &&
        s.bounds.y + s.bounds.height >= tb.y + tb.height
      ) {
        return true;
      }
    }
    return false;
  }

  /** Hit-test: find topmost visible surface at (x, y) */
  findSurfaceAt(x: number, y: number): CompositorSurface | null {
    const ordered = this.getRenderOrder();
    for (let i = ordered.length - 1; i >= 0; i--) {
      const s = ordered[i];
      if (!s.visible) continue;
      const { bounds } = s;
      if (x >= bounds.x && x <= bounds.x + bounds.width &&
          y >= bounds.y && y <= bounds.y + bounds.height) {
        return s;
      }
    }
    return null;
  }

  /** Get surfaces in render order — sorted by layer first, then zIndex */
  getRenderOrder(): CompositorSurface[] {
    return Array.from(this.surfaces.values())
      .filter(s => s.visible)
      .sort((a, b) => {
        const aEff = LAYER_BASE[a.layer] + a.zIndex;
        const bEff = LAYER_BASE[b.layer] + b.zIndex;
        return aEff - bEff;
      });
  }

  /** Mark all surfaces clean after render */
  clearDirty(): void {
    this.surfaces.forEach(s => { s.dirty = false; });
  }

  /** Get dirty surfaces needing repaint */
  getDirty(): CompositorSurface[] {
    return Array.from(this.surfaces.values()).filter(s => s.dirty);
  }

  getSurface(windowId: string): CompositorSurface | undefined {
    return this.surfaces.get(windowId);
  }

  listSurfaces(): CompositorSurface[] {
    return Array.from(this.surfaces.values());
  }

  getStats() {
    const all = this.listSurfaces();
    return {
      totalSurfaces: all.length,
      visible: all.filter(s => s.visible).length,
      dirty: all.filter(s => s.dirty).length,
      topZ: this.nextZ - 1,
      layers: {
        normal: all.filter(s => s.layer === "normal").length,
        modal: all.filter(s => s.layer === "modal").length,
        overlay: all.filter(s => s.layer === "overlay").length,
      },
    };
  }

  /** Reset compositor (kernel shutdown) */
  reset(): void {
    this.surfaces.clear();
    this.nextZ = 1;
  }
}

export const Compositor = new CompositorClass();
