#!/bin/sh
# Generate health.json with build metadata
set -e

VERSION="${BUILD_VERSION:-1.0.0}"
GIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
BUILD_DATE=$(date -u +%Y-%m-%dT%H:%M:%SZ)
NODE_VERSION=$(node --version 2>/dev/null || echo "unknown")

cat > "${1:-dist/health.json}" << EOF
{
  "service": "sita-os",
  "version": "${VERSION}",
  "git_hash": "${GIT_HASH}",
  "build_date": "${BUILD_DATE}",
  "node_version": "${NODE_VERSION}",
  "status": "healthy"
}
EOF

echo "✅ health.json generated at ${1:-dist/health.json}"
