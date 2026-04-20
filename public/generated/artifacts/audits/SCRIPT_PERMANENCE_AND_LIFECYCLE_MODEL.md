# Script Permanence and Lifecycle Model

## Permanence Classes

| Class | Description | Example |
|-------|-------------|---------|
| **Permanent** | Durable governance — survives all refactors | Architecture checks, manifest generators |
| **Migration** | Temporary — used during a specific refactor, then archived | Codemods, import rewrites, service consolidation |
| **Ops** | Operational — run on-demand for support/recovery | DR drills, backup restore, secret rotation |

## Lifecycle

1. **Created** — Script added with registry entry
2. **Active** — Running in CI or on-demand
3. **Deprecated** — Replacement identified, wrapper created
4. **Archived** — Moved to `scripts/legacy/`
5. **Deleted** — Removed after all references updated

## Rules

- No deletion without replacement identification
- No deletion without CI reference update
- Archived scripts live in `scripts/legacy/archived-phase-scripts/`
- Wrappers live in `scripts/legacy/wrappers/` during migration
