#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# SITA OS — Monorepo Migration Script (Complete)
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

# ── Phase 1: Create workspace structure ──
log "Phase 1: Creating workspace structure..."
DIRS=(
  # Shared
  "shared/contracts/core" "shared/contracts/business" "shared/contracts/finance"
  "shared/contracts/concierge" "shared/contracts/boardroom" "shared/contracts/enterprise"
  "shared/contracts/moat" "shared/contracts/policy" "shared/contracts/proof"
  "shared/contracts/reality" "shared/contracts/protocols" "shared/contracts/audit"
  "shared/contracts/shell-grammar" "shared/contracts/workflow"
  "shared/events" "shared/models" "shared/auth" "shared/sdk"
  "shared/design-tokens" "shared/database-schemas" "shared/feature-flags"
  "shared/entitlements" "shared/telemetry" "shared/advisor-config"
  "shared/feature-governance" "shared/internal-agent-config"
  "shared/store-metadata" "shared/template-registry"
  "shared/microinteraction-engine" "shared/pack-manifests"
  # OS
  "os/kernel" "os/kernel/ui" "os/runtime" "os/shell" "os/sdk/core"
  "os/sdk/services" "os/sdk/ui" "os/sdk/system" "os/sdk/extensions" "os/sdk/hooks"
  "os/security" "os/services" "os/services/sync" "os/graphics" "os/input"
  "os/boot" "os/ui"
  # Backend
  "backend/edge-functions" "backend/services" "backend/services/cloud"
  "backend/services/ai" "backend/services/intelligence" "backend/services/advisor"
  "backend/services/advisor-protocol" "backend/services/boardroom"
  "backend/services/strategic" "backend/services/domain-engines"
  "backend/services/compute-governance" "backend/services/no-hallucination"
  "backend/services/ai-engineering" "backend/services/detection"
  "backend/services/verification" "backend/services/shopify"
  "backend/gateway" "backend/gateway/ai"
  "backend/workers" "backend/libs/persistence" "backend/libs/observability"
  # Apps
  "apps/product-shell/src" "apps/admin-console/src/pages"
  "apps/admin-console/src/components/ai" "apps/admin-console/src/components/os"
  "apps/admin-console/src/components/governance" "apps/admin-console/src/lib/ai"
  "apps/founder-center/src/pages" "apps/founder-center/src/pages/mode"
  "apps/founder-center/src/pages/mission" "apps/founder-center/src/pages/enterprise"
  "apps/mobile/src/pages" "apps/mobile/src/components"
  # Internal tools
  "internal-tools/simulations" "internal-tools/fip"
  "internal-tools/dual-reality" "internal-tools/reality-audit"
  "internal-tools/reality-records" "internal-tools/demo-data"
  "internal-tools/seed" "internal-tools/reconciliation" "internal-tools/migrations"
  # Infra
  "infra/deploy" "infra/docker" "infra/ci" "infra/environments"
  "security/policies" "observability/dashboards" "compliance/audits"
)
for dir in "${DIRS[@]}"; do run "mkdir -p $dir"; done

# ── Phase 2: Move shared contracts ──
log "Phase 2: Moving shared contracts..."
SHARED_MOVES=(
  "src/packages/contracts:shared/contracts/core"
  "src/packages/business-contracts:shared/contracts/business"
  "src/packages/finance-contracts:shared/contracts/finance"
  "src/packages/concierge-contracts:shared/contracts/concierge"
  "src/packages/boardroom-contracts:shared/contracts/boardroom"
  "src/packages/enterprise-contracts:shared/contracts/enterprise"
  "src/packages/moat-contracts:shared/contracts/moat"
  "src/packages/policy-contracts:shared/contracts/policy"
  "src/packages/proof-model:shared/contracts/proof"
  "src/packages/reality-contracts:shared/contracts/reality"
  "src/packages/protocols:shared/contracts/protocols"
  "src/packages/audit-contracts:shared/contracts/audit"
  "src/packages/shell-grammar:shared/contracts/shell-grammar"
  "src/packages/workflow-primitives:shared/contracts/workflow"
  "src/packages/event-types:shared/events"
  "src/packages/design-tokens:shared/design-tokens"
  "src/packages/database-schemas:shared/database-schemas"
  "src/packages/auth:shared/auth"
  "src/packages/client-sdk:shared/sdk"
  "src/packages/feature-flags:shared/feature-flags"
  "src/packages/entitlements:shared/entitlements"
  "src/packages/telemetry:shared/telemetry"
  "src/packages/advisor-config:shared/advisor-config"
  "src/packages/feature-governance:shared/feature-governance"
  "src/packages/internal-agent-config:shared/internal-agent-config"
  "src/packages/store-metadata:shared/store-metadata"
  "src/packages/template-registry:shared/template-registry"
  "src/packages/microinteraction-engine:shared/microinteraction-engine"
  "src/packages/pack-manifests:shared/pack-manifests"
)
for mapping in "${SHARED_MOVES[@]}"; do
  IFS=':' read -r src dst <<< "$mapping"
  run "cp -r $src/* $dst/ 2>/dev/null || true"
done

# ── Phase 3: Move OS plane ──
log "Phase 3: Moving OS plane..."
run "cp -r src/lib/nova-sdk/kernel/* os/kernel/ 2>/dev/null || true"
run "cp -r src/lib/nova-sdk/runtime/* os/runtime/ 2>/dev/null || true"
run "cp -r src/lib/nova-sdk/core/* os/sdk/core/ 2>/dev/null || true"
run "cp -r src/lib/nova-sdk/services/* os/sdk/services/ 2>/dev/null || true"
run "cp -r src/lib/nova-sdk/ui/* os/sdk/ui/ 2>/dev/null || true"
run "cp -r src/lib/nova-sdk/system/* os/sdk/system/ 2>/dev/null || true"
run "cp -r src/lib/nova-sdk/extensions/* os/sdk/extensions/ 2>/dev/null || true"
run "cp -r src/lib/nova-sdk/hooks/* os/sdk/hooks/ 2>/dev/null || true"
run "cp -r src/lib/nova-sdk/graphics/* os/graphics/ 2>/dev/null || true"
run "cp -r src/lib/nova-sdk/input/* os/input/ 2>/dev/null || true"
run "cp -r src/lib/os-services/* os/services/ 2>/dev/null || true"
run "cp -r src/lib/os-security/* os/security/ 2>/dev/null || true"
run "cp -r src/lib/sync-engine/* os/services/sync/ 2>/dev/null || true"
run "cp -r src/components/sita/shell/* os/shell/ 2>/dev/null || true"
run "cp -r src/components/sita/os/* os/ui/ 2>/dev/null || true"
run "cp -r src/components/sita/boot/* os/boot/ 2>/dev/null || true"
run "cp -r src/components/sita/kernel/* os/kernel/ui/ 2>/dev/null || true"

# ── Phase 4: Move backend plane ──
log "Phase 4: Moving backend plane..."
run "cp -r src/lib/core-services/* backend/services/ 2>/dev/null || true"
run "cp -r src/lib/cloud-backbone/* backend/services/cloud/ 2>/dev/null || true"
run "cp -r src/lib/platform-plane/* backend/gateway/ 2>/dev/null || true"
run "cp -r src/lib/persistence/* backend/libs/persistence/ 2>/dev/null || true"
run "cp -r src/lib/observability/* backend/libs/observability/ 2>/dev/null || true"
run "cp -r src/lib/ai/* backend/services/ai/ 2>/dev/null || true"
run "cp -r src/lib/services/ai-gateway/* backend/gateway/ai/ 2>/dev/null || true"
run "cp -r src/lib/intelligence-architecture/* backend/services/intelligence/ 2>/dev/null || true"
run "cp -r src/lib/advisor-intelligence/* backend/services/advisor/ 2>/dev/null || true"
run "cp -r src/lib/advisor-protocol/* backend/services/advisor-protocol/ 2>/dev/null || true"
run "cp -r src/lib/boardroom/* backend/services/boardroom/ 2>/dev/null || true"
run "cp -r src/lib/strategic-intelligence/* backend/services/strategic/ 2>/dev/null || true"
run "cp -r src/lib/domain-engines/* backend/services/domain-engines/ 2>/dev/null || true"
run "cp -r src/lib/compute-governance/* backend/services/compute-governance/ 2>/dev/null || true"
run "cp -r src/lib/no-hallucination/* backend/services/no-hallucination/ 2>/dev/null || true"
run "cp -r src/lib/ai-engineering/* backend/services/ai-engineering/ 2>/dev/null || true"
run "cp -r src/lib/detection/* backend/services/detection/ 2>/dev/null || true"
run "cp -r src/lib/verification/* backend/services/verification/ 2>/dev/null || true"
run "cp -r src/lib/shopify/* backend/services/shopify/ 2>/dev/null || true"
run "cp -r src/lib/sovereign-ai-gateway/* backend/gateway/ai/ 2>/dev/null || true"
run "cp -r src/lib/internal-agents/* backend/workers/agents/ 2>/dev/null || true"
run "cp -r src/lib/platform-law/* backend/services/platform-law/ 2>/dev/null || true"
run "cp -r src/lib/capabilities/* backend/services/capabilities/ 2>/dev/null || true"
run "cp -r src/lib/delivery-methodology/* backend/services/delivery-methodology/ 2>/dev/null || true"
run "cp -r src/lib/dual-reality/* backend/services/dual-reality/ 2>/dev/null || true"
run "cp -r supabase/functions/* backend/edge-functions/ 2>/dev/null || true"

# ── Phase 4b: Move services tree (200+ subdirs) ──
log "Phase 4b: Moving services tree..."
run "mkdir -p backend/services/shim-layer"
run "cp -r src/lib/services/* backend/services/shim-layer/ 2>/dev/null || true"
run "rm -rf backend/services/shim-layer/ai-gateway 2>/dev/null || true"

# ── Phase 4c: Move ai-gateway budget gate ──
run "mkdir -p backend/gateway/budget"
run "cp -r src/lib/ai-gateway/* backend/gateway/budget/ 2>/dev/null || true"

# ── Phase 4d: Move engines ──
run "mkdir -p backend/services/engines"
run "cp -r src/lib/engines/* backend/services/engines/ 2>/dev/null || true"

# ── Phase 5: Move app surfaces ──
log "Phase 5: Moving app surfaces..."
run "cp -r src/pages/ apps/product-shell/src/pages/ 2>/dev/null || true"
run "cp -r src/components/ apps/product-shell/src/components/ 2>/dev/null || true"
run "cp -r src/hooks/ apps/product-shell/src/hooks/ 2>/dev/null || true"

# Admin
run "mv apps/product-shell/src/pages/admin/ apps/admin-console/src/pages/ 2>/dev/null || true"
run "cp -r src/components/admin/* apps/admin-console/src/components/ 2>/dev/null || true"
run "cp -r src/components/admin-ai/* apps/admin-console/src/components/ai/ 2>/dev/null || true"
run "cp -r src/components/admin-os/* apps/admin-console/src/components/os/ 2>/dev/null || true"
run "cp -r src/components/governance/* apps/admin-console/src/components/governance/ 2>/dev/null || true"
run "cp -r src/lib/admin-ai/* apps/admin-console/src/lib/ai/ 2>/dev/null || true"

# Founder
run "mv apps/product-shell/src/pages/owner/ apps/founder-center/src/pages/ 2>/dev/null || true"
run "mv apps/product-shell/src/pages/owner-mode/ apps/founder-center/src/pages/mode/ 2>/dev/null || true"
run "mv apps/product-shell/src/pages/mission-control/ apps/founder-center/src/pages/mission/ 2>/dev/null || true"
run "mv apps/product-shell/src/pages/enterprise/ apps/founder-center/src/pages/enterprise/ 2>/dev/null || true"

# Mobile
run "mv apps/product-shell/src/pages/mobile/ apps/mobile/src/pages/ 2>/dev/null || true"
run "cp -r src/components/mobile/* apps/mobile/src/components/ 2>/dev/null || true"

# ── Phase 6: Move internal tools ──
log "Phase 6: Moving internal tools..."
run "cp -r src/lib/simulation/* internal-tools/simulations/ 2>/dev/null || true"
run "cp -r src/lib/fip/* internal-tools/fip/ 2>/dev/null || true"
run "cp -r src/lib/dual-reality/* internal-tools/dual-reality/ 2>/dev/null || true"
run "cp -r src/lib/reality-audit/* internal-tools/reality-audit/ 2>/dev/null || true"
run "cp -r src/lib/reality-records/* internal-tools/reality-records/ 2>/dev/null || true"
run "cp -r src/lib/demo-data/* internal-tools/demo-data/ 2>/dev/null || true"
run "cp -r src/lib/seed/* internal-tools/seed/ 2>/dev/null || true"

# ── Phase 7: Move infra ──
log "Phase 7: Moving infrastructure..."
run "cp docker-compose*.yml infra/docker/ 2>/dev/null || true"
run "cp Dockerfile* infra/docker/ 2>/dev/null || true"

# ── Phase 8: Generate workspace configs ──
log "Phase 8: Generating workspace configurations..."

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

# ── Phase 9: Rewrite imports ──
log "Phase 9: Rewriting imports..."
if [ -f scripts/migrate/rewrite-imports.ts ]; then
  run "npx tsx scripts/migrate/rewrite-imports.ts"
fi

# ── Phase 10: Install & verify ──
log "Phase 10: Installing dependencies..."
run "pnpm install"

log "Phase 11: Running verification..."
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
