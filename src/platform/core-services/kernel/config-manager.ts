// ═══════════════════════════════════════════════════════════════
// SITA OS — Configuration Manager
// Typed key-value config store with namespaces, schema validation,
// overlay hierarchy, change tracking with receipts, atomic updates
// ═══════════════════════════════════════════════════════════════

export type ConfigLayer = "default" | "system" | "user" | "runtime";
export type ConfigValueType = "string" | "number" | "boolean" | "json";

const LAYER_PRIORITY: Record<ConfigLayer, number> = {
  default: 0,
  system: 1,
  user: 2,
  runtime: 3,
};

export interface ConfigEntry {
  namespace: string;
  key: string;
  value: unknown;
  type: ConfigValueType;
  layer: ConfigLayer;
  setAt: number;
  setBy: string;  // actor who set this value
  description?: string;
}

export interface ConfigChangeRecord {
  id: string;
  timestamp: number;
  namespace: string;
  key: string;
  oldValue: unknown;
  newValue: unknown;
  oldLayer: ConfigLayer;
  newLayer: ConfigLayer;
  actor: string;
  reason?: string;
}

export interface ConfigSchema {
  namespace: string;
  key: string;
  type: ConfigValueType;
  required: boolean;
  defaultValue?: unknown;
  description: string;
  validValues?: unknown[];
  minValue?: number;
  maxValue?: number;
}

export class ConfigManager {
  private entries: Map<string, ConfigEntry[]> = new Map(); // key = "namespace.key" → layered values
  private schemas: Map<string, ConfigSchema> = new Map();
  private changeLog: ConfigChangeRecord[] = [];
  private _changeCounter = 0;

  /** Register a config schema */
  registerSchema(schema: ConfigSchema): void {
    this.schemas.set(`${schema.namespace}.${schema.key}`, schema);
    if (schema.defaultValue !== undefined) {
      this.set(schema.namespace, schema.key, schema.defaultValue, "default", "system", schema.description);
    }
  }

  /** Register multiple schemas at once */
  registerSchemas(schemas: ConfigSchema[]): void {
    for (const s of schemas) this.registerSchema(s);
  }

  /** Set a config value at a specific layer */
  set(
    namespace: string,
    key: string,
    value: unknown,
    layer: ConfigLayer,
    actor: string,
    reason?: string
  ): { success: boolean; error?: string } {
    const fullKey = `${namespace}.${key}`;

    // Validate against schema if exists
    const schema = this.schemas.get(fullKey);
    if (schema) {
      const validation = this.validate(value, schema);
      if (!validation.valid) return { success: false, error: validation.error };
    }

    const layers = this.entries.get(fullKey) ?? [];
    const existing = layers.find(e => e.layer === layer);
    const oldValue = this.get(namespace, key);

    if (existing) {
      existing.value = value;
      existing.setAt = Date.now();
      existing.setBy = actor;
    } else {
      layers.push({
        namespace,
        key,
        value,
        type: (schema?.type ?? typeof value) as ConfigValueType,
        layer,
        setAt: Date.now(),
        setBy: actor,
        description: schema?.description,
      });
      this.entries.set(fullKey, layers);
    }

    // Record change
    this.changeLog.push({
      id: `cfg_${++this._changeCounter}`,
      timestamp: Date.now(),
      namespace,
      key,
      oldValue: oldValue?.value,
      newValue: value,
      oldLayer: oldValue?.layer ?? layer,
      newLayer: layer,
      actor,
      reason,
    });

    return { success: true };
  }

  /** Get resolved config value (highest priority layer wins) */
  get(namespace: string, key: string): ConfigEntry | undefined {
    const layers = this.entries.get(`${namespace}.${key}`);
    if (!layers || layers.length === 0) return undefined;

    return layers.reduce((best, entry) =>
      LAYER_PRIORITY[entry.layer] > LAYER_PRIORITY[best.layer] ? entry : best
    );
  }

  /** Get all values in a namespace */
  getNamespace(namespace: string): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [fullKey, layers] of this.entries) {
      if (fullKey.startsWith(`${namespace}.`)) {
        const key = fullKey.slice(namespace.length + 1);
        const resolved = layers.reduce((best, entry) =>
          LAYER_PRIORITY[entry.layer] > LAYER_PRIORITY[best.layer] ? entry : best
        );
        result[key] = resolved.value;
      }
    }
    return result;
  }

  /** Get all layers for a specific key (for debugging overlay resolution) */
  getLayers(namespace: string, key: string): ConfigEntry[] {
    return [...(this.entries.get(`${namespace}.${key}`) ?? [])].sort(
      (a, b) => LAYER_PRIORITY[a.layer] - LAYER_PRIORITY[b.layer]
    );
  }

  /** Remove a value from a specific layer */
  unset(namespace: string, key: string, layer: ConfigLayer, actor: string): void {
    const fullKey = `${namespace}.${key}`;
    const layers = this.entries.get(fullKey);
    if (!layers) return;

    const idx = layers.findIndex(e => e.layer === layer);
    if (idx >= 0) {
      const old = layers[idx];
      layers.splice(idx, 1);
      this.changeLog.push({
        id: `cfg_${++this._changeCounter}`,
        timestamp: Date.now(),
        namespace,
        key,
        oldValue: old.value,
        newValue: undefined,
        oldLayer: layer,
        newLayer: layer,
        actor,
        reason: "unset",
      });
    }
  }

  /** Diff two namespaces */
  diff(namespace: string, layerA: ConfigLayer, layerB: ConfigLayer): Array<{
    key: string;
    valueA: unknown;
    valueB: unknown;
  }> {
    const diffs: Array<{ key: string; valueA: unknown; valueB: unknown }> = [];

    for (const [fullKey, layers] of this.entries) {
      if (!fullKey.startsWith(`${namespace}.`)) continue;
      const key = fullKey.slice(namespace.length + 1);
      const a = layers.find(e => e.layer === layerA);
      const b = layers.find(e => e.layer === layerB);
      if (a?.value !== b?.value) {
        diffs.push({ key, valueA: a?.value, valueB: b?.value });
      }
    }

    return diffs;
  }

  /** Validate a value against a schema */
  private validate(value: unknown, schema: ConfigSchema): { valid: boolean; error?: string } {
    if (schema.validValues && !schema.validValues.includes(value)) {
      return { valid: false, error: `value must be one of: ${schema.validValues.join(", ")}` };
    }
    if (schema.type === "number" && typeof value === "number") {
      if (schema.minValue !== undefined && value < schema.minValue) {
        return { valid: false, error: `value must be >= ${schema.minValue}` };
      }
      if (schema.maxValue !== undefined && value > schema.maxValue) {
        return { valid: false, error: `value must be <= ${schema.maxValue}` };
      }
    }
    return { valid: true };
  }

  getChangeLog(): ConfigChangeRecord[] { return [...this.changeLog]; }

  getStats() {
    const allKeys = new Set<string>();
    for (const fullKey of this.entries.keys()) allKeys.add(fullKey);

    return {
      totalKeys: allKeys.size,
      totalLayers: [...this.entries.values()].reduce((sum, l) => sum + l.length, 0),
      schemas: this.schemas.size,
      changes: this.changeLog.length,
      namespaces: [...new Set([...allKeys].map(k => k.split(".")[0]))],
    };
  }
}
