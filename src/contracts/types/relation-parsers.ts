/**
 * Typed parsers for Supabase nested relation payloads.
 * Use these at the query boundary to safely extract joined relation objects
 * instead of casting with `as any`.
 */
import { isRecord, getString } from "./guards";

// ── Relation Reference Types ─────────────────────────────────

export interface ScheduledJobRef {
  name: string;
  domain: string;
  job_class: string;
  target_function: string;
  max_retries?: number;
}

export interface ProviderFamilyRef {
  name: string;
  provider_key: string;
}

export interface ProviderCapabilityRef {
  display_name: string;
}

export interface WorkflowRef {
  name: string;
  trigger_event?: string;
}

// ── Parsers ──────────────────────────────────────────────────

export function parseScheduledJobRef(raw: unknown): ScheduledJobRef {
  if (!isRecord(raw)) return { name: "", domain: "", job_class: "", target_function: "" };
  return {
    name: getString(raw, "name"),
    domain: getString(raw, "domain"),
    job_class: getString(raw, "job_class"),
    target_function: getString(raw, "target_function"),
    max_retries: typeof raw.max_retries === "number" ? raw.max_retries : undefined,
  };
}

export function parseProviderFamilyRef(raw: unknown): ProviderFamilyRef {
  if (!isRecord(raw)) return { name: "", provider_key: "" };
  return {
    name: getString(raw, "name"),
    provider_key: getString(raw, "provider_key"),
  };
}

export function parseProviderCapabilityRef(raw: unknown): ProviderCapabilityRef {
  if (!isRecord(raw)) return { display_name: "" };
  return {
    display_name: getString(raw, "display_name"),
  };
}

export function parseWorkflowRef(raw: unknown): WorkflowRef {
  if (!isRecord(raw)) return { name: "" };
  return {
    name: getString(raw, "name"),
    trigger_event: typeof raw.trigger_event === "string" ? raw.trigger_event : undefined,
  };
}

// ── Relation accessor (generic) ─────────────────────────────

/** Safely access a nested relation field from a Supabase row */
export function getRelation<T>(row: unknown, key: string, parser: (raw: unknown) => T): T {
  if (!isRecord(row)) return parser(undefined);
  return parser(row[key]);
}
