// Re-export of the canonical Concierge page-state honesty helper so
// both domains use the same rule. We intentionally keep one source
// of truth in the concierge tree and import it here — no fork.
export { expectHonestStateSignal } from "@/__tests__/concierge/pages/_shared";
