-- ═══════════════════════════════════════════════════════════════
-- SITA OS — Supabase Database Role Initialization
-- Creates all required roles for self-hosted Supabase operation.
-- Must run BEFORE migrations.
-- ═══════════════════════════════════════════════════════════════

-- Idempotent role creation
DO $$
BEGIN
  -- anon: used by PostgREST for unauthenticated requests
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN NOINHERIT;
  END IF;

  -- authenticated: used by PostgREST for authenticated requests
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN NOINHERIT;
  END IF;

  -- service_role: elevated access for server-side operations
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;
  END IF;

  -- authenticator: PostgREST connects as this role, switches to anon/authenticated
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticator') THEN
    CREATE ROLE authenticator NOINHERIT LOGIN PASSWORD 'CHANGE_ME_IN_ENV';
  END IF;

  -- supabase_admin: full admin access for migrations and management
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supabase_admin') THEN
    CREATE ROLE supabase_admin NOLOGIN SUPERUSER CREATEDB CREATEROLE REPLICATION BYPASSRLS;
  END IF;

  -- supabase_auth_admin: used by GoTrue auth service
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supabase_auth_admin') THEN
    CREATE ROLE supabase_auth_admin NOLOGIN NOINHERIT CREATEROLE;
  END IF;

  -- supabase_storage_admin: used by Storage API
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supabase_storage_admin') THEN
    CREATE ROLE supabase_storage_admin NOLOGIN NOINHERIT;
  END IF;

  -- supabase_functions_admin: used by Edge Functions runtime
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supabase_functions_admin') THEN
    CREATE ROLE supabase_functions_admin NOLOGIN NOINHERIT;
  END IF;

  -- dashboard_user: used by Supabase Studio
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'dashboard_user') THEN
    CREATE ROLE dashboard_user NOLOGIN NOINHERIT;
  END IF;
END
$$;

-- ── Grant role switching to authenticator ──────────────────────
GRANT anon TO authenticator;
GRANT authenticated TO authenticator;
GRANT service_role TO authenticator;

-- ── Grant schema usage ────────────────────────────────────────
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON SCHEMA public TO supabase_admin;

-- ── Default privileges for future objects ──────────────────────
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public
  GRANT EXECUTE ON FUNCTIONS TO anon, authenticated, service_role;

-- ── Auth schema ───────────────────────────────────────────────
CREATE SCHEMA IF NOT EXISTS auth;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;

-- ── Storage schema ────────────────────────────────────────────
CREATE SCHEMA IF NOT EXISTS storage;
GRANT ALL ON SCHEMA storage TO supabase_storage_admin;
GRANT USAGE ON SCHEMA storage TO anon, authenticated, service_role;

-- ── Realtime schema ───────────────────────────────────────────
CREATE SCHEMA IF NOT EXISTS _realtime;
CREATE SCHEMA IF NOT EXISTS realtime;

-- ── Supabase internal schemas ─────────────────────────────────
CREATE SCHEMA IF NOT EXISTS supabase_functions;
GRANT ALL ON SCHEMA supabase_functions TO supabase_functions_admin;

CREATE SCHEMA IF NOT EXISTS extensions;
GRANT USAGE ON SCHEMA extensions TO anon, authenticated, service_role;

-- ── Grant admin roles to postgres ─────────────────────────────
GRANT supabase_admin TO postgres;
GRANT supabase_auth_admin TO postgres;
GRANT supabase_storage_admin TO postgres;
GRANT supabase_functions_admin TO postgres;

-- ── Search path ───────────────────────────────────────────────
ALTER ROLE authenticator SET search_path TO public, extensions;
ALTER ROLE anon SET search_path TO public, extensions;
ALTER ROLE authenticated SET search_path TO public, extensions;
ALTER ROLE service_role SET search_path TO public, extensions;
