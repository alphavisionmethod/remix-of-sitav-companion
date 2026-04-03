#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════
# SITA OS — VMware OVA Build Script
# Creates a deployable OVA from Docker Compose stack
# ═══════════════════════════════════════════════════════
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BUILD_DIR="$PROJECT_ROOT/build-ova"
OVA_NAME="sita-os"
VERSION="${VERSION:-1.0.0}"

echo "═══════════════════════════════════════════════════════"
echo "  SITA OS — OVA Build v${VERSION}"
echo "═══════════════════════════════════════════════════════"

# Step 1: Build Docker images
echo "[1/5] Building Docker images..."
cd "$PROJECT_ROOT"
docker compose build --no-cache

# Step 2: Export Docker images
echo "[2/5] Exporting Docker images..."
mkdir -p "$BUILD_DIR"
docker save sita-web:latest | gzip > "$BUILD_DIR/sita-web.tar.gz"

# Step 3: Generate health endpoint
echo "[3/5] Generating health.json..."
cat > "$BUILD_DIR/health.json" <<EOF
{
  "service": "sita-os",
  "version": "${VERSION}",
  "build_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "git_hash": "$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')",
  "status": "healthy"
}
EOF

# Step 4: Create deployment bundle
echo "[4/5] Creating deployment bundle..."
cp "$PROJECT_ROOT/docker-compose.yml" "$BUILD_DIR/"
cp "$PROJECT_ROOT/.env.example" "$BUILD_DIR/.env.example" 2>/dev/null || true
cp "$PROJECT_ROOT/nginx/default.conf" "$BUILD_DIR/nginx.conf"

cat > "$BUILD_DIR/deploy.sh" <<'DEPLOY'
#!/usr/bin/env bash
set -euo pipefail
echo "Loading SITA OS Docker images..."
docker load < sita-web.tar.gz
echo "Starting SITA OS..."
docker compose up -d
echo "SITA OS is running on http://localhost:8080"
echo "Health check: http://localhost:8080/health.json"
DEPLOY
chmod +x "$BUILD_DIR/deploy.sh"

# Step 5: Create tarball (OVA-ready bundle)
echo "[5/5] Creating distribution archive..."
cd "$BUILD_DIR/.."
tar czf "${OVA_NAME}-${VERSION}.tar.gz" -C "$BUILD_DIR" .

echo ""
echo "✅ Build complete: ${OVA_NAME}-${VERSION}.tar.gz"
echo ""
echo "To deploy on VMware:"
echo "  1. Create a VM with Ubuntu 22.04+ or Alpine"
echo "  2. Install Docker + Docker Compose"
echo "  3. Copy and extract the archive"
echo "  4. Run: ./deploy.sh"
echo "  5. Export VM as OVA from vSphere/VMware Workstation"
echo ""
