// ═══════════════════════════════════════════════════════════════
// SITA OS — Schema Registry
// Central registration of contract schemas for runtime validation
// ═══════════════════════════════════════════════════════════════

import type { z } from "zod";

export type ContractLayer = "truth" | "runtime" | "read-model" | "specialized" | "admin";

export interface SchemaRegistryEntry {
  name: string;
  family: string;
  layer: ContractLayer;
  schema: z.ZodTypeAny;
  version: string;
  description: string;
}

const registry = new Map<string, SchemaRegistryEntry>();

export const SchemaRegistry = {
  register(entry: SchemaRegistryEntry): void {
    if (registry.has(entry.name)) {
      console.warn(`[SchemaRegistry] Overwriting existing schema: ${entry.name}`);
    }
    registry.set(entry.name, entry);
  },

  get(name: string): SchemaRegistryEntry | undefined {
    return registry.get(name);
  },

  validate(name: string, data: unknown): { success: boolean; errors?: string[] } {
    const entry = registry.get(name);
    if (!entry) return { success: false, errors: [`Schema "${name}" not registered`] };
    const result = entry.schema.safeParse(data);
    if (result.success) return { success: true };
    return {
      success: false,
      errors: result.error.issues.map(i => `${i.path.join(".")}: ${i.message}`),
    };
  },

  list(): SchemaRegistryEntry[] {
    return Array.from(registry.values());
  },

  listByLayer(layer: ContractLayer): SchemaRegistryEntry[] {
    return Array.from(registry.values()).filter(e => e.layer === layer);
  },

  listByFamily(family: string): SchemaRegistryEntry[] {
    return Array.from(registry.values()).filter(e => e.family === family);
  },

  has(name: string): boolean {
    return registry.has(name);
  },

  clear(): void {
    registry.clear();
  },

  size(): number {
    return registry.size;
  },
};
