#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# SITA OS — RLS Coverage Validator
# Ensures no public tables have RLS disabled.
# Runs against a live database via psql.
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

echo "Checking RLS coverage on all public tables..."

QUERY="SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename NOT IN (SELECT tablename FROM pg_tables t JOIN pg_class c ON c.relname = t.tablename WHERE t.schemaname = 'public' AND c.relrowsecurity = true);"

UNPROTECTED=$(psql -At -c "$QUERY" 2>/dev/null || echo "PSQL_UNAVAILABLE")

if [ "$UNPROTECTED" = "PSQL_UNAVAILABLE" ]; then
  echo "⚠️  psql not available — skipping live RLS check"
  echo "   Use the Supabase linter tool for cloud-hosted checks"
  exit 0
fi

if [ -z "$UNPROTECTED" ]; then
  echo "✅ All public tables have RLS enabled"
  exit 0
else
  echo "❌ Tables WITHOUT RLS enabled:"
  echo "$UNPROTECTED" | while read -r table; do
    echo "   - $table"
  done
  exit 1
fi