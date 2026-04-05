// ═══════════════════════════════════════════════════════════════
// SITA OS — Persistable Interface
// All engines/services that survive refresh implement this
// ═══════════════════════════════════════════════════════════════

export interface Persistable {
  /** Serialize all mutable state to a plain JSON-safe object */
  serialize(): Record<string, unknown>;
  /** Restore state from a previously serialized snapshot */
  hydrate(state: Record<string, unknown>): void;
}

/** Type guard to check if an object implements Persistable */
export function isPersistable(obj: unknown): obj is Persistable {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof (obj as any).serialize === "function" &&
    typeof (obj as any).hydrate === "function"
  );
}

/** Helper: serialize a Map<string, T> to an array of [key, value] */
export function serializeMap<T>(map: Map<string, T>): Array<[string, T]> {
  return Array.from(map.entries());
}

/** Helper: hydrate a Map<string, T> from an array of [key, value] */
export function hydrateMap<T>(entries: Array<[string, T]>): Map<string, T> {
  return new Map(entries ?? []);
}
