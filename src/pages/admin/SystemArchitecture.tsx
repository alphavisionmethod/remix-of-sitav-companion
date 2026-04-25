// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin: System Architecture
// Surfaces the canonical SITA 3-layer stack health to operators.
// Route: /admin/system-architecture
// ═══════════════════════════════════════════════════════════════

import { PermissionGatedRoute } from "@/platform/auth/components/auth/PermissionGatedRoute";
import { SystemStackHealthCard } from "@/platform/admin/components/admin/SystemStackHealthCard";

function SystemArchitectureContent() {
  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">System Architecture</h1>
        <p className="text-sm text-muted-foreground">
          Live view of the canonical SITA 3-layer stack and the 8 Layer-3 platform services.
        </p>
      </header>

      <SystemStackHealthCard />
    </div>
  );
}

export default function SystemArchitecture() {
  return (
    <PermissionGatedRoute permission="admin.architecture.view">
      <SystemArchitectureContent />
    </PermissionGatedRoute>
  );
}
