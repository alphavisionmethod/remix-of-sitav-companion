#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# SITA OS — Monorepo Migration Script
# Run AFTER exporting to GitHub. Restructures from Lovable SPA
# into Turborepo + pnpm workspaces multi-plane monorepo.
#
# Usage: bash scripts/migrate/execute-migration.sh [--dry-run]
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

DRY_RUN=false
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=true

log() { echo "  [MIGRATE] $*"; }
run() {
  if $DRY_RUN; then echo "  [DRY-RUN] $*"; else eval "$@"; fi
}

log "═══ SITA OS Monorepo Migration ═══"
log "Mode: $($DRY_RUN && echo 'DRY RUN' || echo 'LIVE')"
log ""

# ── Phase 0: Prerequisites ──
log "Phase 0: Checking prerequisites..."
command -v pnpm >/dev/null 2>&1 || { log "ERROR: pnpm not found. Install: npm i -g pnpm"; exit 1; }
command -v npx >/dev/null 2>&1 || { log "ERROR: npx not found."; exit 1; }

# ── Phase 1: Create workspace structure ──
log "Phase 1: Creating workspace structure..."
DIRS=(
  "shared/contracts/core"
  "shared/contracts/business"
  "shared/contracts/finance"
  "shared/contracts/concierge"
  "shared/contracts/protocols"
  "shared/events"
  "shared/models"
  "shared/auth"
  "shared/sdk"
  "shared/design-tokens"
  "shared/database-schemas"
  "os/kernel"
  "os/runtime"
  "os/shell"
  "os/sdk"
  "os/security"
  "os/services"
  "os/graphics"
  "os/input"
  "backend/edge-functions"
  "backend/services"
  "backend/gateway"
  "backend/workers"
  "backend/libs"
  "apps/product-shell/src"
  "apps/admin-console/src"
  "apps/founder-center/src"
  "apps/mobile/src"
  "internal-tools/prompt-lab"
  "internal-tools/simulations"
  "internal-tools/reconciliation"
  "internal-tools/migrations"
  "infra/deploy"
  "infra/docker"
  "infra/ci"
  "infra/environments"
  "security/policies"
  "observability/dashboards"
  "compliance/audits"
)
for dir in "${DIRS[@]}"; do run "mkdir -p $dir"; done

# ── Phase 2: Move shared contracts ──
log "Phase 2: Moving shared contracts..."
run "cp -r src/packages/contracts/* shared/contracts/core/ 2>/dev/null || true"
run "cp -r src/packages/business-contracts/* shared/contracts/business/ 2>/dev/null || true"
run "cp -r src/packages/finance-contracts/* shared/contracts/finance/ 2>/dev/null || true"
run "cp -r src/packages/concierge-contracts/* shared/contracts/concierge/ 2>/dev/null || true"
run "cp -r src/packages/protocols/* shared/contracts/protocols/ 2>/dev/null || true"
run "cp -r src/packages/design-tokens/* shared/design-tokens/ 2>/dev/null || true"
run "cp -r src/packages/database-schemas/* shared/database-schemas/ 2>/dev/null || true"
run "cp -r src/packages/auth/* shared/auth/ 2>/dev/null || true"
run "cp -r src/packages/event-types/* shared/events/ 2>/dev/null || true"
run "cp -r src/packages/client-sdk/* shared/sdk/ 2>/dev/null || true"

# ── Phase 3: Move OS / Kernel ──
log "Phase 3: Moving OS plane..."
run "cp -r src/lib/nova-sdk/kernel/* os/kernel/ 2>/dev/null || true"
run "cp -r src/lib/nova-sdk/runtime/* os/runtime/ 2>/dev/null || true"
run "cp -r src/lib/nova-sdk/core/* os/sdk/ 2>/dev/null || true"
run "cp -r src/lib/nova-sdk/services/* os/services/ 2>/dev/null || true"
run "cp -r src/lib/nova-sdk/graphics/* os/graphics/ 2>/dev/null || true"
run "cp -r src/lib/nova-sdk/input/* os/input/ 2>/dev/null || true"
run "cp -r src/lib/nova-sdk/extensions/* os/sdk/ 2>/dev/null || true"
run "cp -r src/lib/nova-sdk/hooks/* os/sdk/ 2>/dev/null || true"
run "cp -r src/components/sita/shell/* os/shell/ 2>/dev/null || true"

# ── Phase 4: Move backend services ──
log "Phase 4: Moving backend plane..."
run "cp -r src/lib/core-services/* backend/services/ 2>/dev/null || true"
run "cp -r supabase/functions/* backend/edge-functions/ 2>/dev/null || true"
run "cp -r src/lib/platform-plane/* backend/gateway/ 2>/dev/null || true"

# ── Phase 5: Move app surfaces ──
log "Phase 5: Moving app surfaces..."
run "cp -r src/pages/ apps/product-shell/src/pages/ 2>/dev/null || true"
run "cp -r src/components/ apps/product-shell/src/components/ 2>/dev/null || true"
run "cp -r src/hooks/ apps/product-shell/src/hooks/ 2>/dev/null || true"

# Admin pages
run "mkdir -p apps/admin-console/src/pages"
run "mv apps/product-shell/src/pages/admin/ apps/admin-console/src/pages/ 2>/dev/null || true"

# Founder pages
run "mkdir -p apps/founder-center/src/pages"
run "mv apps/product-shell/src/pages/founder/ apps/founder-center/src/pages/ 2>/dev/null || true"

# Mobile pages
run "mkdir -p apps/mobile/src/pages"
run "mv apps/product-shell/src/pages/mobile/ apps/mobile/src/pages/ 2>/dev/null || true"

# ── Phase 6: Move infra ──
log "Phase 6: Moving infrastructure..."
run "cp -r infra/deploy/* infra/deploy/ 2>/dev/null || true"
run "cp docker-compose*.yml infra/docker/ 2>/dev/null || true"
run "cp Dockerfile* infra/docker/ 2>/dev/null || true"
run "cp nginx*.conf infra/docker/ 2>/dev/null || true"

# ── Phase 7: Generate workspace configs ──
log "Phase 7: Generating workspace configurations..."

# Root package.json
cat > package.json << 'PKG'
{
  "name": "sita-os",
  "private": true,
  "workspaces": ["shared/*", "os", "backend", "apps/*", "internal-tools/*"],
  "scripts": {
    "build": "turbo run build",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "typecheck": "turbo run typecheck",
    "check:boundaries": "tsx scripts/architecture/check-plane-boundaries.ts",
    "migrate:verify": "tsx scripts/migrate/verify-migration.ts"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.6.0",
    "tsx": "^4.0.0"
  }
}
PKG

# turbo.json
cat > turbo.json << 'TURBO'
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "typecheck": { "dependsOn": ["^build"] },
    "lint": {},
    "test": { "dependsOn": ["build"] }
  }
}
TURBO

# Per-plane package.json files
for plane in shared/contracts shared/design-tokens shared/auth shared/events shared/sdk shared/database-schemas; do
  name=$(echo "$plane" | tr '/' '-')
  cat > "$plane/package.json" << EOF
{ "name": "@sita/$name", "version": "1.0.0", "private": true, "main": "index.ts", "types": "index.ts" }
EOF
done

for app in apps/product-shell apps/admin-console apps/founder-center apps/mobile; do
  name=$(basename "$app")
  cat > "$app/package.json" << EOF
{
  "name": "@sita/$name",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@sita/shared-contracts": "workspace:*",
    "@sita/shared-design-tokens": "workspace:*",
    "@sita/shared-auth": "workspace:*",
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "scripts": { "dev": "vite", "build": "vite build", "typecheck": "tsc --noEmit" }
}
EOF
done

cat > os/package.json << 'EOF'
{ "name": "@sita/os", "version": "1.0.0", "private": true, "dependencies": { "@sita/shared-contracts": "workspace:*" } }
EOF

cat > backend/package.json << 'EOF'
{ "name": "@sita/backend", "version": "1.0.0", "private": true, "dependencies": { "@sita/shared-contracts": "workspace:*" } }
EOF

# ── Phase 8: Rewrite imports ──
log "Phase 8: Rewriting imports..."
if [ -f scripts/migrate/rewrite-imports.ts ]; then
  run "npx tsx scripts/migrate/rewrite-imports.ts"
else
  log "WARN: rewrite-imports.ts not found. Run import rewriting manually."
fi

# ── Phase 9: Install & verify ──
log "Phase 9: Installing dependencies..."
run "pnpm install"

log "Phase 10: Running verification..."
if [ -f scripts/migrate/verify-migration.ts ]; then
  run "npx tsx scripts/migrate/verify-migration.ts"
fi

log ""
log "═══ Migration complete! ═══"
log "Next steps:"
log "  1. Review moved files for correctness"
log "  2. Run: pnpm run typecheck"
log "  3. Run: pnpm run check:boundaries"
log "  4. Run: pnpm run build"
log "  5. Remove old src/ directories that were fully migrated"
