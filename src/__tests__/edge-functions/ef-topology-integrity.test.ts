import { describe, it, expect } from "vitest";
import { EDGE_FUNCTION_REGISTRY, type CallerClass } from "@/lib/backend-topology/edge-function-registry";

const VALID_CALLER_CLASSES: CallerClass[] = [
  "frontend-user", "frontend-admin", "public-bff", "admin-bff",
  "domain-function", "orchestration-function", "connector-webhook",
  "runtime-system", "scheduler", "kernel", "external-webhook",
  "service-internal", "any-authenticated",
];

describe("Edge Function Topology Integrity", () => {
  const nameSet = new Set(EDGE_FUNCTION_REGISTRY.map(e => e.name));

  it("all callsInto targets exist in registry or are generic class refs", () => {
    const invalid: string[] = [];
    const genericRefs = new Set(["domain-function", "connector-webhook"]);
    for (const entry of EDGE_FUNCTION_REGISTRY) {
      for (const target of entry.callsInto) {
        if (!nameSet.has(target) && !genericRefs.has(target)) {
          invalid.push(`${entry.name} → ${target}`);
        }
      }
    }
    expect(invalid, `Invalid callsInto: ${invalid.slice(0, 10).join("; ")}`).toHaveLength(0);
  });

  it("all allowedCallers are valid caller classes", () => {
    const validSet = new Set<string>(VALID_CALLER_CLASSES);
    const invalid: string[] = [];
    for (const entry of EDGE_FUNCTION_REGISTRY) {
      for (const caller of entry.allowedCallers) {
        if (!validSet.has(caller)) {
          invalid.push(`${entry.name}: ${caller}`);
        }
      }
    }
    expect(invalid, `Invalid callers: ${invalid.join("; ")}`).toHaveLength(0);
  });

  it("no function has empty allowedCallers", () => {
    const empty = EDGE_FUNCTION_REGISTRY.filter(e => e.allowedCallers.length === 0);
    expect(empty.map(e => e.name), "Empty allowedCallers").toHaveLength(0);
  });

  it("BFF functions do not call RUNTIME_SYSTEM_FUNCTION entries", () => {
    const runtimeFns = new Set(
      EDGE_FUNCTION_REGISTRY.filter(e => e.category === "RUNTIME_SYSTEM_FUNCTION").map(e => e.name)
    );
    const bffs = EDGE_FUNCTION_REGISTRY.filter(e => e.category === "PUBLIC_BFF" || e.category === "ADMIN_BFF");
    const violations: string[] = [];
    for (const bff of bffs) {
      for (const target of bff.callsInto) {
        if (runtimeFns.has(target)) {
          violations.push(`${bff.name} → ${target}`);
        }
      }
    }
    expect(violations, `BFF→Runtime violations: ${violations.join("; ")}`).toHaveLength(0);
  });

  it("every entry has non-empty description and runtimeConsequence", () => {
    const bad = EDGE_FUNCTION_REGISTRY.filter(e => !e.description || !e.runtimeConsequence);
    expect(bad.map(e => e.name)).toHaveLength(0);
  });
});