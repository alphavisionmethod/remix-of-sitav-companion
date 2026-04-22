import { useEffect, type RefObject } from "react";

// ═══════════════════════════════════════════════════════════════
// SITA OS — Window Keyboard Scroll Navigation
//
// Enables OS-like keyboard scrolling for the focused window:
//   • Arrow Up/Down — scroll 40px
//   • PageUp/PageDown — scroll one viewport height
//   • Home/End — scroll to top/bottom
//   • Space / Shift+Space — page scroll (like browsers)
//
// Only active when no input/textarea/contenteditable is focused,
// preventing conflicts with text editing.
// ═══════════════════════════════════════════════════════════════

const ARROW_SCROLL_PX = 40;

function isEditableTarget(el: Element | null): boolean {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if ((el as HTMLElement).isContentEditable) return true;
  return false;
}

export function useWindowKeyboardScroll(
  scrollRef: RefObject<HTMLDivElement | null>,
  windowId: string,
) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const el = scrollRef.current;
      if (!el) return;

      // Don't intercept if user is typing in an input
      if (isEditableTarget(document.activeElement)) return;

      // Only handle if our window container (or its ancestors) is the
      // closest .os-window-focused element
      const windowEl = el.closest(".os-window-focused");
      if (!windowEl) return;

      let handled = false;

      switch (e.key) {
        case "ArrowUp":
          el.scrollBy({ top: -ARROW_SCROLL_PX, behavior: "smooth" });
          handled = true;
          break;
        case "ArrowDown":
          el.scrollBy({ top: ARROW_SCROLL_PX, behavior: "smooth" });
          handled = true;
          break;
        case "PageUp":
          el.scrollBy({ top: -el.clientHeight, behavior: "smooth" });
          handled = true;
          break;
        case "PageDown":
          el.scrollBy({ top: el.clientHeight, behavior: "smooth" });
          handled = true;
          break;
        case "Home":
          el.scrollTo({ top: 0, behavior: "smooth" });
          handled = true;
          break;
        case "End":
          el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
          handled = true;
          break;
        case " ":
          if (e.shiftKey) {
            el.scrollBy({ top: -el.clientHeight * 0.9, behavior: "smooth" });
          } else {
            el.scrollBy({ top: el.clientHeight * 0.9, behavior: "smooth" });
          }
          handled = true;
          break;
      }

      if (handled) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener("keydown", handler, { passive: false });
    return () => document.removeEventListener("keydown", handler);
  }, [scrollRef, windowId]);
}