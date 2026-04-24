// ═══════════════════════════════════════════════════════════════
// SITA OS — JarvisBridge (Phase J)
// One canonical operating-intelligence surface that fuses the
// Sita Phase A–I stack into a single window. Pure composition;
// every panel is read-only over existing tables and services.
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { NowPanel } from "@/components/sita/jarvis/NowPanel";
import { WorldModelPanel } from "@/components/sita/jarvis/WorldModelPanel";
import { CouncilPanel } from "@/components/sita/jarvis/CouncilPanel";
import { ActionQueuePanel } from "@/components/sita/jarvis/ActionQueuePanel";
import { TimelinePanel } from "@/components/sita/jarvis/TimelinePanel";
import { ExplainPanel } from "@/components/sita/jarvis/ExplainPanel";
import type { JarvisActionItem } from "@/lib/sita-jarvis";

export default function JarvisBridge() {
  const [selected, setSelected] = useState<JarvisActionItem | null>(null);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-4" data-testid="jarvis-bridge">
      <SitaPageHeader
        icon={<Sparkles className="h-6 w-6" />}
        title="Jarvis Bridge"
        subtitle="One operating intelligence — world model, council, briefings, action queue, and reasoning in a single view."
      />

      {/* Three-column layout that gracefully reflows on narrow viewports. */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left rail — Now + World model */}
        <div className="lg:col-span-3 space-y-4">
          <NowPanel />
          <WorldModelPanel />
        </div>

        {/* Center rail — Action queue + Council */}
        <div className="lg:col-span-5 space-y-4">
          <ActionQueuePanel selectedKey={selected?.key ?? null} onSelect={setSelected} />
          <CouncilPanel />
        </div>

        {/* Right rail — Explain + Timeline */}
        <div className="lg:col-span-4 space-y-4">
          <ExplainPanel item={selected} />
          <TimelinePanel />
        </div>
      </div>
    </div>
  );
}