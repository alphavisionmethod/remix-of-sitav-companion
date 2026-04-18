// ═══════════════════════════════════════════════════════════════
// SITA OS — Pipeline Bootstrap Hook
// Boots orchestration pipeline and wires auto-escalation
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef } from "react";
import { initAdvisorConsumer } from "@/lib/services/orchestration-pipeline/module-advisor-consumer";
import { initAppBoardSynthesizer, shouldAutoEscalate } from "@/lib/services/orchestration-pipeline/app-board-synthesizer";
import { getEventBus, type BusEvent } from "@/platform/core-services/event-bus";
import { escalateToBoardroom } from "@/lib/services/boardroom-bridge";
import { registerItem, transitionState } from "@/lib/services/orchestration-pipeline/issue-lifecycle";
import type { AppBoardSynthesis, Domain } from "@/lib/services/orchestration-pipeline/types";

const DOMAINS: Domain[] = ["business", "finance", "concierge"];

export function usePipelineBootstrap() {
  const cleanupRef = useRef<(() => void)[]>([]);
  const bootedRef = useRef(false);

  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;

    // Boot pipeline consumers
    const cleanup1 = initAdvisorConsumer();
    const cleanup2 = initAppBoardSynthesizer();

    // Auto-escalation watcher: subscribe to board synthesis events
    const bus = getEventBus();
    const subId = bus.subscribe("board.synthesis.*", (event: BusEvent) => {
      const synthesis = event.payload as unknown as AppBoardSynthesis;
      if (!synthesis?.app_id) return;

      const domain = synthesis.app_id as Domain;
      if (shouldAutoEscalate(domain) && synthesis.boardroom_candidate_motion) {
        const itemId = `auto-${domain}-${Date.now()}`;
        registerItem(itemId);
        transitionState(itemId, "advisor_review", "Auto-escalation from pipeline");
        transitionState(itemId, "app_board_review", "Board synthesis complete");
        transitionState(itemId, "boardroom_candidate", `Worthiness score ${synthesis.boardroom_worthiness_score.toFixed(2)} >= 0.65`);

        // Fire escalation (demo-safe — bridge handles demo mode)
        escalateToBoardroom({
          title: synthesis.boardroom_candidate_motion.slice(0, 120),
          domain,
          severity: synthesis.boardroom_worthiness_score > 0.8 ? "high" : "medium",
          description: synthesis.issue_summary,
          advisorSummaries: Object.fromEntries(synthesis.module_advisor_positions.map(p => [p.advisor_id, p.summary])),
          escalationReason: `Auto-escalation: worthiness ${synthesis.boardroom_worthiness_score.toFixed(2)} >= 0.65`,
        }).catch(() => {/* bridge handles errors */});
      }
    }, "pipeline-bootstrap-auto-escalation");

    // Lifecycle transition logger
    const lifecycleSubId = bus.subscribe("lifecycle.transition", (event: BusEvent) => {
      const { item_id, from_state, to_state } = event.payload as any;
      console.debug(`[Pipeline] Lifecycle: ${item_id} ${from_state} → ${to_state}`);
    }, "pipeline-bootstrap-lifecycle-logger");

    cleanupRef.current = [
      cleanup1,
      cleanup2,
      () => { bus.unsubscribe(subId); },
      () => { bus.unsubscribe(lifecycleSubId); },
    ];

    return () => {
      cleanupRef.current.forEach((fn) => fn());
      bootedRef.current = false;
    };
  }, []);
}
