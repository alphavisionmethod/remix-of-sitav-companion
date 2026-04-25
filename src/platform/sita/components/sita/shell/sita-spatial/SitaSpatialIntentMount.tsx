// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase F: Spatial Intent Mount
// Listens to "sita-voice-intent" and reacts to spatial verbs.
// ═══════════════════════════════════════════════════════════════

import { useEffect } from "react";
import { toast } from "sonner";
import { offerHandoff } from "@/lib/sita-spatial/handoff-bus";

export function SitaSpatialIntentMount() {
  useEffect(() => {
    const handler = (e: Event) => {
      const intent = (e as CustomEvent<{ kind: string; verb?: string; topic?: string; raw?: string }>).detail;
      if (!intent || intent.kind !== "spatial_command") return;
      if (intent.verb === "convene_board") {
        window.dispatchEvent(
          new CustomEvent("sita-boardroom:convene", { detail: { topic: intent.topic ?? "Strategic review" } }),
        );
      } else if (intent.verb === "spatial_mode") {
        // Synthesize the keystroke for SitaSpatialField
        window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space", shiftKey: true, metaKey: true }));
      } else if (intent.verb === "handoff") {
        void offerHandoff({ intent: intent.raw ?? "Continue here" }).then((s) => {
          if (s) toast.success("Handoff offered to your other devices");
        });
      }
    };
    window.addEventListener("sita-voice-intent", handler);
    return () => window.removeEventListener("sita-voice-intent", handler);
  }, []);
  return null;
}
