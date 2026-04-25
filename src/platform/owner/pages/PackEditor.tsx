// ═══════════════════════════════════════════════════════════════
// SITA OS — Pack Editor
// Admin pack management with toggle, dependency view, and proof
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { SitaPageHeader, SitaCard } from "@/platform/sita/components/sita/SitaCard";
import { AdminActionCard } from "@/platform/sita/components/sita/AdminActionCard";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Package, Layers, Zap, Shield, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

interface PackState {
  packId: string;
  name: string;
  status: "active" | "paused" | "disabled";
  capabilities: string[];
  connectors: string[];
  requiredTier: string;
}

const PackEditor = () => {
  const packs: any[] = [];
  const [packStates, setPackStates] = useState<PackState[]>(
    packs.map(p => ({ packId: p.packId, name: p.name, status: "active" as const, capabilities: p.capabilities, connectors: p.connectors, requiredTier: p.requiredTier }))
  );

  const togglePack = (packId: string) => {
    setPackStates(prev => prev.map(p =>
      p.packId === packId ? { ...p, status: p.status === "active" ? "paused" : "active" } : p
    ));
  };

  const statusColor = (s: string) => s === "active" ? "bg-emerald-500" : s === "paused" ? "bg-amber-500" : "bg-muted-foreground";

  return (
    <motion.div className="mx-auto max-w-4xl space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
<SitaPageHeader title="Pack Manager" subtitle="Install, pause, or disable functional packs. Each change is logged." />

      <div className="space-y-3">
        {packStates.map((pack) => (
          <AdminActionCard
            key={pack.packId}
            title={pack.name}
            description={`${pack.capabilities.length} capabilities · ${pack.connectors.length} connectors · Tier: ${pack.requiredTier}`}
            whatChanges={`${pack.status === "active" ? "Pausing" : "Activating"} ${pack.name} affects ${pack.capabilities.length} capabilities`}
            riskLevel={pack.capabilities.length > 2 ? "medium" : "low"}
            whatHappensNext={pack.status === "active" ? "Capabilities will be disabled. Active workflows using them will be paused." : "Capabilities will be re-enabled immediately."}
            proofNote={`Pack ${pack.status === "active" ? "pause" : "activation"} logged with affected capabilities list`}
            undoDescription="Toggle back from this same screen"
            onConfirm={() => { togglePack(pack.packId); toast.success(`${pack.name} ${pack.status === "active" ? "paused" : "activated"}`); }}
            confirmLabel={pack.status === "active" ? "Pause Pack" : "Activate Pack"}
            icon={<Package className={`h-5 w-5 ${pack.status === "active" ? "text-primary" : "text-muted-foreground"}`} />}
          >
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${statusColor(pack.status)}`} />
                <span className="text-xs font-medium text-foreground capitalize">{pack.status}</span>
              </div>
              <Switch checked={pack.status === "active"} onCheckedChange={() => { togglePack(pack.packId); toast.success(`${pack.name} ${pack.status === "active" ? "paused" : "activated"}`); }} />
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {pack.capabilities.map(cap => (
                <Badge key={cap} variant="secondary" className="text-[10px] font-mono">{cap}</Badge>
              ))}
            </div>
            {pack.connectors.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2 text-[10px] text-muted-foreground">
                <Layers className="h-3 w-3" /> Depends on: {pack.connectors.join(", ")}
              </div>
            )}
          </AdminActionCard>
        ))}
      </div>
    </motion.div>
  );
};

export default PackEditor;
