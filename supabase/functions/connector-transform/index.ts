// ═══════════════════════════════════════════════════════════════
// SITA OS — Connector Data Transformation Engine
// Normalize, map, convert & validate connector data
// ═══════════════════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleCors, corsHeaders, corsResponse, corsError } from "../_shared/cors.ts";
import { requireAuth, AuthResult } from "../_shared/auth.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";
import { EdgeLogger } from "../_shared/logger.ts";
import { z } from "https://esm.sh/zod@3.23.8";

const logger = new EdgeLogger("connector-transform");

const ActionSchema = z.object({
  action: z.enum(["normalize", "map-fields", "convert", "validate-schema"]),
  source_connector: z.string().optional(),
  target_table: z.string().optional(),
  data: z.union([z.record(z.unknown()), z.array(z.record(z.unknown()))]).optional(),
});

// ═══ Canonical SITA schemas for normalization targets ═══
const CANONICAL_SCHEMAS: Record<string, Record<string, { type: string; required: boolean; aliases: string[] }>> = {
  customers: {
    id: { type: "string", required: false, aliases: ["customer_id", "contact_id", "client_id"] },
    name: { type: "string", required: true, aliases: ["full_name", "display_name", "customer_name", "contact_name"] },
    email: { type: "string", required: true, aliases: ["email_address", "primary_email", "mail"] },
    phone: { type: "string", required: false, aliases: ["phone_number", "mobile", "tel", "telephone"] },
    company: { type: "string", required: false, aliases: ["company_name", "organization", "org", "business_name"] },
    address: { type: "string", required: false, aliases: ["street_address", "address_line1", "billing_address"] },
    city: { type: "string", required: false, aliases: ["town", "locality"] },
    country: { type: "string", required: false, aliases: ["country_code", "nation"] },
    created_at: { type: "string", required: false, aliases: ["create_date", "date_created", "created"] },
    tags: { type: "array", required: false, aliases: ["labels", "categories"] },
  },
  invoices: {
    id: { type: "string", required: false, aliases: ["invoice_id", "inv_id", "number"] },
    customer_id: { type: "string", required: true, aliases: ["client_id", "contact_id", "buyer_id"] },
    amount: { type: "number", required: true, aliases: ["total", "total_amount", "amount_due", "grand_total"] },
    currency: { type: "string", required: true, aliases: ["currency_code", "cur"] },
    status: { type: "string", required: true, aliases: ["state", "payment_status", "invoice_status"] },
    issued_at: { type: "string", required: false, aliases: ["issue_date", "created_at", "date", "invoice_date"] },
    due_at: { type: "string", required: false, aliases: ["due_date", "payment_due", "due"] },
    description: { type: "string", required: false, aliases: ["memo", "notes", "subject", "line_description"] },
  },
  transactions: {
    id: { type: "string", required: false, aliases: ["transaction_id", "txn_id", "payment_id"] },
    amount: { type: "number", required: true, aliases: ["total", "value", "payment_amount"] },
    currency: { type: "string", required: true, aliases: ["currency_code"] },
    type: { type: "string", required: true, aliases: ["transaction_type", "txn_type", "category"] },
    date: { type: "string", required: true, aliases: ["transaction_date", "created_at", "posted_at", "booked_at"] },
    description: { type: "string", required: false, aliases: ["memo", "narrative", "reference", "notes"] },
    counterparty: { type: "string", required: false, aliases: ["merchant", "payee", "payer", "vendor"] },
  },
  opportunities: {
    id: { type: "string", required: false, aliases: ["deal_id", "opportunity_id", "opp_id"] },
    title: { type: "string", required: true, aliases: ["name", "deal_name", "opportunity_name", "subject"] },
    value: { type: "number", required: false, aliases: ["amount", "deal_value", "expected_revenue"] },
    stage: { type: "string", required: true, aliases: ["status", "pipeline_stage", "deal_stage"] },
    customer_id: { type: "string", required: false, aliases: ["contact_id", "account_id", "company_id"] },
    close_date: { type: "string", required: false, aliases: ["expected_close", "closing_date", "close_at"] },
    probability: { type: "number", required: false, aliases: ["win_probability", "confidence", "likelihood"] },
  },
};

function normalizeRecord(record: Record<string, unknown>, targetTable: string): { normalized: Record<string, unknown>; unmapped: string[] } {
  const schema = CANONICAL_SCHEMAS[targetTable];
  if (!schema) return { normalized: record, unmapped: [] };

  const normalized: Record<string, unknown> = {};
  const mappedSourceKeys = new Set<string>();

  for (const [canonicalKey, def] of Object.entries(schema)) {
    // Direct match
    if (record[canonicalKey] !== undefined) {
      normalized[canonicalKey] = record[canonicalKey];
      mappedSourceKeys.add(canonicalKey);
      continue;
    }
    // Alias match
    for (const alias of def.aliases) {
      const lowerAlias = alias.toLowerCase();
      const matchKey = Object.keys(record).find(k => k.toLowerCase() === lowerAlias);
      if (matchKey && record[matchKey] !== undefined) {
        normalized[canonicalKey] = record[matchKey];
        mappedSourceKeys.add(matchKey);
        break;
      }
    }
  }

  const unmapped = Object.keys(record).filter(k => !mappedSourceKeys.has(k));
  return { normalized, unmapped };
}

function mapFields(sourceFields: string[], targetTable: string): { mappings: Record<string, string | null>; coverage: number } {
  const schema = CANONICAL_SCHEMAS[targetTable];
  if (!schema) return { mappings: {}, coverage: 0 };

  const mappings: Record<string, string | null> = {};
  let mapped = 0;

  for (const field of sourceFields) {
    const lower = field.toLowerCase();
    let match: string | null = null;

    for (const [canonicalKey, def] of Object.entries(schema)) {
      if (canonicalKey === lower || def.aliases.some(a => a.toLowerCase() === lower)) {
        match = canonicalKey;
        break;
      }
    }
    mappings[field] = match;
    if (match) mapped++;
  }

  return { mappings, coverage: sourceFields.length > 0 ? Math.round((mapped / sourceFields.length) * 100) : 0 };
}

function validateSchema(data: Record<string, unknown>, targetTable: string): { valid: boolean; errors: string[]; warnings: string[] } {
  const schema = CANONICAL_SCHEMAS[targetTable];
  if (!schema) return { valid: false, errors: [`Unknown target table: ${targetTable}`], warnings: [] };

  const errors: string[] = [];
  const warnings: string[] = [];

  for (const [key, def] of Object.entries(schema)) {
    if (def.required && (data[key] === undefined || data[key] === null)) {
      errors.push(`Missing required field: ${key}`);
    }
    if (data[key] !== undefined && data[key] !== null) {
      const actualType = Array.isArray(data[key]) ? "array" : typeof data[key];
      if (actualType !== def.type) {
        warnings.push(`Field '${key}' expected type '${def.type}' but got '${actualType}'`);
      }
    }
  }

  const extraFields = Object.keys(data).filter(k => !schema[k]);
  if (extraFields.length > 0) {
    warnings.push(`Extra fields not in schema: ${extraFields.join(", ")}`);
  }

  return { valid: errors.length === 0, errors, warnings };
}

serve(async (req) => {
  const corsRes = handleCors(req);
  if (corsRes) return corsRes;

  const start = Date.now();
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const rl = checkRateLimit(`transform:${ip}`, 120, 60_000);
  if (!rl.allowed) return rateLimitResponse(rl, corsHeaders);

  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;
  const { user, supabase } = auth as AuthResult;

  try {
    const body = await req.json();
    const parsed = ActionSchema.safeParse(body);
    if (!parsed.success) {
      return corsError("Validation failed: " + JSON.stringify(parsed.error.flatten().fieldErrors), 400);
    }

    const { action, source_connector, target_table, data } = parsed.data;
    let result: unknown;

    switch (action) {
      case "normalize": {
        if (!target_table || !CANONICAL_SCHEMAS[target_table]) {
          return corsError(`Invalid target_table. Must be one of: ${Object.keys(CANONICAL_SCHEMAS).join(", ")}`, 400);
        }
        if (!data) return corsError("'data' required for normalize", 400);

        const records = Array.isArray(data) ? data : [data];
        const results = records.map(r => normalizeRecord(r, target_table));
        result = {
          normalized: results.map(r => r.normalized),
          unmapped_fields: [...new Set(results.flatMap(r => r.unmapped))],
          record_count: records.length,
          target_table,
          source_connector,
        };
        break;
      }

      case "map-fields": {
        if (!target_table || !CANONICAL_SCHEMAS[target_table]) {
          return corsError(`Invalid target_table. Must be one of: ${Object.keys(CANONICAL_SCHEMAS).join(", ")}`, 400);
        }
        if (!data || Array.isArray(data)) return corsError("'data' must be a single object for map-fields", 400);

        const sourceFields = Object.keys(data);
        result = {
          ...mapFields(sourceFields, target_table),
          target_table,
          source_connector,
          available_targets: Object.keys(CANONICAL_SCHEMAS),
        };
        break;
      }

      case "convert": {
        if (!target_table || !CANONICAL_SCHEMAS[target_table]) {
          return corsError(`Invalid target_table. Must be one of: ${Object.keys(CANONICAL_SCHEMAS).join(", ")}`, 400);
        }
        if (!data) return corsError("'data' required for convert", 400);

        const records = Array.isArray(data) ? data : [data];
        const converted = records.map(r => {
          const { normalized } = normalizeRecord(r, target_table);
          const validation = validateSchema(normalized, target_table);
          return { record: normalized, valid: validation.valid, warnings: validation.warnings };
        });

        result = {
          converted: converted.map(c => c.record),
          validation_summary: {
            total: converted.length,
            valid: converted.filter(c => c.valid).length,
            invalid: converted.filter(c => !c.valid).length,
            warnings: [...new Set(converted.flatMap(c => c.warnings))],
          },
          target_table,
          source_connector,
        };
        break;
      }

      case "validate-schema": {
        if (!target_table || !CANONICAL_SCHEMAS[target_table]) {
          return corsError(`Invalid target_table. Must be one of: ${Object.keys(CANONICAL_SCHEMAS).join(", ")}`, 400);
        }
        if (!data || Array.isArray(data)) return corsError("'data' must be a single object for validate-schema", 400);

        result = {
          ...validateSchema(data, target_table),
          target_table,
          schema: Object.fromEntries(
            Object.entries(CANONICAL_SCHEMAS[target_table]).map(([k, v]) => [k, { type: v.type, required: v.required }])
          ),
        };
        break;
      }
    }

    // Audit log
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: `connector_transform:${action}`,
      category: "connector",
      actor: "user",
      target_type: target_table || "unknown",
      severity: "low",
      details: { action, source_connector, target_table },
    });

    const latency = Date.now() - start;
    logger.complete(200, latency, { action, userId: user.id });
    return corsResponse({ success: true, action, ...result, latency_ms: latency });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    logger.error("Transform failed", { error: msg, userId: user.id });
    return corsError(msg, 500);
  }
});
