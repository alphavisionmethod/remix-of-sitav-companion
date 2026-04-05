-- ═══════════════════════════════════════════════════════════════
-- SITA OS — Required PostgreSQL Extensions
-- Enables all extensions needed by Supabase and SITA OS.
-- ═══════════════════════════════════════════════════════════════

-- Core Supabase extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"      WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto"        WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgjwt"           WITH SCHEMA extensions;

-- Full-text search and indexing
CREATE EXTENSION IF NOT EXISTS "pg_trgm"         WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "btree_gist"      WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "btree_gin"       WITH SCHEMA extensions;

-- JSON processing
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Network types (used by audit_logs ip_address)
CREATE EXTENSION IF NOT EXISTS "citext"          WITH SCHEMA extensions;

-- Moddatetime for automatic updated_at columns
CREATE EXTENSION IF NOT EXISTS "moddatetime"     WITH SCHEMA extensions;

-- Grant extension usage to all roles
GRANT USAGE ON SCHEMA extensions TO anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA extensions TO anon, authenticated, service_role;
