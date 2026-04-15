// ═══════════════════════════════════════════════════════════════
// SITA OS — Entity Identity: Canonical ID Scheme
// Unified identity for every entity in the operating system
// ═══════════════════════════════════════════════════════════════

export type EntityKind =
  | 'user' | 'session' | 'device' | 'service'
  | 'app' | 'driver' | 'update' | 'policy'
  | 'audit' | 'hardware' | 'capability' | 'workflow';

export interface EntityId {
  kind: EntityKind;
  id: string;
  /** Full canonical form: "service:healthd" */
  canonical: string;
  /** Optional human label */
  label?: string;
  /** Creation timestamp */
  createdAt: number;
}

const ID_PATTERN = /^([a-z]+):([a-zA-Z0-9._\-:]+)$/;

/** Parse a canonical ID string like "service:healthd" */
export function parseEntityId(canonical: string): EntityId | null {
  const match = canonical.match(ID_PATTERN);
  if (!match) return null;
  const kind = match[1] as EntityKind;
  const VALID: Set<string> = new Set<string>([
    'user','session','device','service','app','driver',
    'update','policy','audit','hardware','capability','workflow',
  ]);
  if (!VALID.has(kind)) return null;
  return { kind, id: match[2], canonical, createdAt: Date.now() };
}

/** Create a canonical ID */
export function makeEntityId(kind: EntityKind, id: string, label?: string): EntityId {
  return { kind, id, canonical: `${kind}:${id}`, label, createdAt: Date.now() };
}

/** Identity Registry — tracks every known entity */
class EntityRegistry {
  private entities = new Map<string, EntityId>();

  register(entity: EntityId): void {
    this.entities.set(entity.canonical, entity);
  }

  resolve(canonical: string): EntityId | undefined {
    return this.entities.get(canonical);
  }

  resolveOrCreate(canonical: string): EntityId {
    const existing = this.entities.get(canonical);
    if (existing) return existing;
    const parsed = parseEntityId(canonical);
    if (!parsed) throw new Error(`Invalid entity ID: ${canonical}`);
    this.register(parsed);
    return parsed;
  }

  listByKind(kind: EntityKind): EntityId[] {
    return [...this.entities.values()].filter(e => e.kind === kind);
  }

  count(): number { return this.entities.size; }
  all(): EntityId[] { return [...this.entities.values()]; }

  unregister(canonical: string): boolean {
    return this.entities.delete(canonical);
  }
}

export const entityRegistry = new EntityRegistry();

// Pre-register core system services
const CORE_SERVICES = [
  'settingsd','crashd','healthd','timed','accessibilityd',
  'powerd','wifid','btd','automationd','search-indexer',
  'help-engine','shieldd','policyd','secretsd','sessiond',
  'authd','networkd','updated','pkgd','bootctrl',
  'driverd','hald','audiod','deviced','ipc-bus',
];
CORE_SERVICES.forEach(s => entityRegistry.register(makeEntityId('service', s)));
