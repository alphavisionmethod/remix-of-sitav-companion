// ═══════════════════════════════════════════════════════════════
// Nova Kernel — Compositor
// Window surface tracking, z-order, hit-testing, dirty regions
// ═══════════════════════════════════════════════════════════════

export interface SurfaceBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CompositorSurface {
  windowId: string;
  pid: number;
  zIndex: number;
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
  registerSurface(windowId: string, pid: number, bounds: SurfaceBounds, title = ""): CompositorSurface {
    const surface: CompositorSurface = {
      windowId,
      pid,
      zIndex: this.nextZ++,
      bounds,
      visible: true,
      opacity: 1,
      dirty: true,
      title,
    };
    this.surfaces.set(windowId, surface);
    console.log(`[Kernel:Compositor] Registered surface "${windowId}" (PID ${pid}) at z=${surface.zIndex}`);
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

  /** Bring a surface to front */
  bringToFront(windowId: string): void {
    const surface = this.surfaces.get(windowId);
    if (surface) {
      surface.zIndex = this.nextZ++;
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

  /** Hit-test: find topmost visible surface at (x, y) */
  findSurfaceAt(x: number, y: number): CompositorSurface | null {
    const ordered = this.getRenderOrder();
    // Traverse back-to-front (highest z last), return last match
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

  /** Get surfaces in render order (lowest z first) */
  getRenderOrder(): CompositorSurface[] {
    return Array.from(this.surfaces.values())
      .filter(s => s.visible)
      .sort((a, b) => a.zIndex - b.zIndex);
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
    };
  }

  /** Reset compositor (kernel shutdown) */
  reset(): void {
    this.surfaces.clear();
    this.nextZ = 1;
  }
}

export const Compositor = new CompositorClass();
