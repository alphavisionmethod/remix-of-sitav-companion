// ═══════════════════════════════════════════════════════════════
// SITA OS — Kernel Event Subscription Hook
// React-safe EventBus subscriptions with auto-cleanup
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef, useState, useCallback } from "react";
import { useSitaKernel } from "@/platform/sita/contexts/SitaKernelContext";
import type { BusEvent } from "@/platform/core-services/event-bus";

/**
 * Subscribe to a specific event topic on the shared kernel EventBus.
 * Auto-unsubscribes on unmount.
 */
export function useKernelEvent(
  topic: string,
  handler: (event: BusEvent) => void
): void {
  const kernel = useSitaKernel();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const subId = kernel.eventBus.subscribe(
      topic,
      (event) => handlerRef.current(event),
      `hook-${topic}`
    );
    return () => {
      kernel.eventBus.unsubscribe(subId);
    };
  }, [kernel, topic]);
}

/**
 * Collect a live stream of events matching a topic pattern.
 * Returns the most recent N events.
 */
export function useKernelEventStream(topic: string, maxEvents = 50) {
  const kernel = useSitaKernel();
  const [events, setEvents] = useState<BusEvent[]>([]);

  useEffect(() => {
    // Seed with existing log entries
    const existing = kernel.eventBus.getLog().filter(e => {
      if (topic === "*") return true;
      if (topic.endsWith(".*")) return e.topic.startsWith(topic.slice(0, -1));
      return e.topic === topic;
    }).slice(-maxEvents);
    setEvents(existing);

    const subId = kernel.eventBus.subscribe(topic, (event) => {
      setEvents(prev => {
        const next = [...prev, event];
        return next.length > maxEvents ? next.slice(-maxEvents) : next;
      });
    }, `stream-${topic}`);

    return () => {
      kernel.eventBus.unsubscribe(subId);
    };
  }, [kernel, topic, maxEvents]);

  const clear = useCallback(() => setEvents([]), []);

  return { events, clear, count: events.length };
}

/**
 * Get aggregate event counts by topic from the kernel EventBus.
 */
export function useKernelEventCounts() {
  const kernel = useSitaKernel();
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const refresh = () => setCounts(kernel.eventBus.getTopicCounts());
    refresh();

    const subId = kernel.eventBus.subscribe("*", refresh, "event-counts");
    return () => {
      kernel.eventBus.unsubscribe(subId);
    };
  }, [kernel]);

  return counts;
}
