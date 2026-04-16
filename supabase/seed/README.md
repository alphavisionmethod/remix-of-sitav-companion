# Supabase Seed Data

This directory contains seed data for development and testing.

## Edge Function Seeder

The `seed-user-data` edge function provides runtime seeding for demo/test users.

## Seed Strategy

1. **Capabilities** — Core OS capabilities are seeded via migration
2. **Admin Roles** — Default admin roles seeded via migration
3. **API Gateway Routes** — Default routes seeded via migration
4. **Demo Data** — Use the `seed-user-data` edge function for user-scoped demo data

## Usage

```bash
# Invoke the seed function
curl -X POST ${SUPABASE_URL}/functions/v1/seed-user-data \
  -H "Authorization: Bearer ${USER_JWT}" \
  -H "Content-Type: application/json"
```
