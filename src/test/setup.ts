import "@testing-library/jest-dom";

// Stub scrollIntoView (not implemented in jsdom)
Element.prototype.scrollIntoView = () => {};

// Polyfill ResizeObserver (used by Radix UI primitives like Slider, Popover)
if (typeof (globalThis as { ResizeObserver?: unknown }).ResizeObserver === "undefined") {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  (globalThis as { ResizeObserver: unknown }).ResizeObserver = ResizeObserverStub;
}

// Polyfill IntersectionObserver (used by lazy-loading & viewport hooks)
if (typeof (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver === "undefined") {
  class IntersectionObserverStub {
    root = null;
    rootMargin = "";
    thresholds = [];
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  (globalThis as { IntersectionObserver: unknown }).IntersectionObserver = IntersectionObserverStub;
}

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
