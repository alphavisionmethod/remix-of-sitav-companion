import { useCallback, useRef, type RefObject } from "react";

// ═══════════════════════════════════════════════════════════════
// SITA OS — Window Scroll Position Sync
//
// Saves and restores the scroll position of a window's content
// area across drag/resize operations so content never jumps.
// Uses a ref-based approach — zero React re-renders.
// ═══════════════════════════════════════════════════════════════

export function useWindowScrollSync(scrollRef: RefObject<HTMLDivElement | null>) {
  const savedPos = useRef({ top: 0, left: 0 });

  const saveScroll = useCallback(() => {
    const el = scrollRef.current;
    if (el) {
      savedPos.current = { top: el.scrollTop, left: el.scrollLeft };
    }
  }, [scrollRef]);

  const restoreScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    // Use rAF to restore after the browser has committed the layout change
    requestAnimationFrame(() => {
      // Clamp to valid range (content may have reflowed after resize)
      const maxTop = el.scrollHeight - el.clientHeight;
      const maxLeft = el.scrollWidth - el.clientWidth;
      el.scrollTop = Math.min(savedPos.current.top, Math.max(0, maxTop));
      el.scrollLeft = Math.min(savedPos.current.left, Math.max(0, maxLeft));
    });
  }, [scrollRef]);

  return { saveScroll, restoreScroll };
}