# Supabase Schema Documentation

This directory contains schema documentation for the SITA OS database.

## Structure

Schema definitions are managed through migrations in `supabase/migrations/`.
The auto-generated TypeScript types are at `src/integrations/supabase/types.ts`.

## Registry

The programmatic schema registry is at `src/lib/db/schema-registry.ts`, which maps all 201 tables with domain classification, RLS status, and tenancy boundaries.

## Conventions

- All tables use `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- Timestamps use `created_at TIMESTAMPTZ DEFAULT now()` and `updated_at TIMESTAMPTZ DEFAULT now()`
- User-scoped tables include `user_id UUID NOT NULL` referencing auth.users
- All tables have RLS enabled with appropriate policies
