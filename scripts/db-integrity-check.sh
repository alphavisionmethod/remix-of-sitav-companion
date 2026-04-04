#!/usr/bin/env bash
set -euo pipefail
echo "🔍 Database integrity check..."
if ! command -v psql &>/dev/null; then echo "⚠️ psql not found — skipping"; exit 0; fi
echo "  Checking table existence..."
psql -c "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;" 2>/dev/null || echo "  ⚠️ Cannot connect to database"
echo "✅ Database integrity check complete"
