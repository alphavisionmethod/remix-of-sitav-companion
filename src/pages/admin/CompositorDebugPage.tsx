import { CompositorDebugOverlay } from "@/platform/sita/components/sita/kernel/CompositorDebugOverlay";

export default function CompositorDebugPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Compositor Debug Overlay</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Live visualization of damage regions, snap zones, and window bounds
          </p>
        </div>
        <CompositorDebugOverlay />
      </div>
    </div>
  );
}
