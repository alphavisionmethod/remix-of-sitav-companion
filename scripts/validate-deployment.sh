#!/bin/sh
# Validate SITA OS deployment readiness
set -e

echo "═══ SITA OS Deployment Validator ═══"
echo ""

ERRORS=0

check() {
  if eval "$2" > /dev/null 2>&1; then
    echo "  ✅ $1"
  else
    echo "  ❌ $1"
    ERRORS=$((ERRORS + 1))
  fi
}

echo "🐳 Docker"
check "Docker installed" "command -v docker"
check "Docker Compose installed" "command -v docker compose || command -v docker-compose"
check "Dockerfile exists" "test -f Dockerfile"
check "docker-compose.yml exists" "test -f docker-compose.yml"

echo ""
echo "🌐 Nginx"
check "nginx config exists" "test -f nginx/default.conf"

echo ""
echo "📦 Build"
check "package.json exists" "test -f package.json"
check "vite.config.ts exists" "test -f vite.config.ts"
check "Build script exists" "grep -q '\"build\"' package.json"

echo ""
echo "🔐 Environment"
check ".env.production.example exists" "test -f .env.production.example"

echo ""
echo "📋 Scripts"
check "generate-health.sh exists" "test -f scripts/generate-health.sh"
check "build-ova.sh exists" "test -f scripts/build-ova.sh"
check "check-edge-function-health.ts exists" "test -f scripts/check-edge-function-health.ts"
check "check-route-drift.ts exists" "test -f scripts/check-route-drift.ts"
check "validate-deployment.sh exists" "test -f scripts/validate-deployment.sh"

echo ""
echo "🚀 Deploy Scripts"
check "OTA agent exists" "test -f deploy/ota-agent.sh || test -f scripts/release/iso/sita-ota-agent.sh"
check "First-boot script exists" "test -f deploy/first-boot.sh || test -f scripts/release/iso/sita-first-boot.sh || test -f scripts/first-boot.sh"
check "Metrics agent exists" "test -f deploy/metrics-agent.sh || test -f scripts/release/iso/sita-metrics-agent.sh || test -f scripts/metrics-agent.sh"
check "Backup script exists" "test -f deploy/backup.sh || test -f scripts/release/iso/sita-backup.sh || test -f scripts/backup.sh"

echo ""
echo "📄 Architecture Docs"
check "Service registry exists" "test -f docs/architecture/registry/services.yaml"
check "VMware deployment doc" "test -f docs/vmware-deployment.md"
check "Architecture docs directory" "test -d docs/architecture"

echo ""
echo "⚡ Edge Functions"
check "Edge functions directory" "test -d supabase/functions"
FN_COUNT=$(ls -d supabase/functions/*/index.ts 2>/dev/null | wc -l)
echo "  📊 $FN_COUNT edge functions found"
TEST_COUNT=$(ls supabase/functions/*/index_test.ts supabase/functions/*/index.test.ts 2>/dev/null | wc -l)
echo "  🧪 $TEST_COUNT edge function test files found"

echo ""
echo "📱 PWA"
check "Web manifest exists" "test -f public/manifest.webmanifest || test -f public/manifest.json"
check "Icon 192 exists" "test -f public/icons/icon-192.png"
check "Icon 512 exists" "test -f public/icons/icon-512.png"

echo ""
if [ $ERRORS -eq 0 ]; then
  echo "🎉 All checks passed! Ready for deployment."
else
  echo "⚠️  $ERRORS check(s) failed. Fix before deploying."
fi

exit $ERRORS
