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

echo ""
if [ $ERRORS -eq 0 ]; then
  echo "🎉 All checks passed! Ready for deployment."
else
  echo "⚠️  $ERRORS check(s) failed. Fix before deploying."
fi

exit $ERRORS
