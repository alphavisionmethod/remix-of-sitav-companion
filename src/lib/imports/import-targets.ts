/**
 * Registry of import targets surfaced in the Imports & Exports panel.
 * Each target describes the destination table, its required + optional
 * columns, accepted enum values, and the row-coercion logic that turns a
 * CSV row into a typed insert payload.
 *
 * RLS guarantees scoping: every target attaches `user_id = auth.uid()` on
 * the client side and the table policy enforces it on the server side.
 */

export interface TargetField {
  key: string;
  label: string;
  required: boolean;
  aliases?: string[];
  /** Optional fixed enum — values not in the list become a row error. */
  enumValues?: string[];
  /** Optional inline help shown next to the column selector. */
  help?: string;
}

export interface CoercedRow {
  payload: Record<string, unknown>;
  errors: string[];
}

export interface ImportTarget {
  id: "incidents" | "error_events";
  table: "incidents" | "error_events";
  label: string;
  description: string;
  fields: TargetField[];
  /** Coerce a single CSV row + chosen mapping into a typed payload. */
  coerce: (
    raw: Record<string, string>,
    mapping: Record<string, string>,
    userId: string,
  ) => CoercedRow;
}

const trim = (v: string | undefined) => (v ?? "").trim();

function pickEnum(value: string, allowed: string[], field: string, errors: string[]): string | null {
  if (!value) return null;
  const lower = value.toLowerCase();
  const hit = allowed.find((a) => a.toLowerCase() === lower);
  if (!hit) {
    errors.push(`${field}: "${value}" is not one of ${allowed.join(", ")}`);
    return null;
  }
  return hit;
}

export const INCIDENT_SEVERITY = ["low", "medium", "high", "critical"];
export const INCIDENT_STATUS = ["open", "investigating", "mitigated", "resolved"];
export const ERROR_SEVERITY = ["fatal", "error", "warning", "info", "debug"];
export const ERROR_SOURCE = ["frontend", "edge", "cron", "worker", "external"];

export const IMPORT_TARGETS: ImportTarget[] = [
  {
    id: "incidents",
    table: "incidents",
    label: "Incidents",
    description: "Operational incidents with severity, status, and ownership.",
    fields: [
      { key: "title", label: "Title", required: true, aliases: ["name", "summary", "incident"] },
      { key: "severity", label: "Severity", required: true, aliases: ["sev", "priority"], enumValues: INCIDENT_SEVERITY, help: "low | medium | high | critical" },
      { key: "status", label: "Status", required: false, aliases: ["state"], enumValues: INCIDENT_STATUS, help: "Defaults to 'open'" },
      { key: "description", label: "Description", required: false, aliases: ["details", "notes"] },
      { key: "remediation_notes", label: "Remediation notes", required: false, aliases: ["remediation", "fix"] },
    ],
    coerce: (raw, mapping, userId) => {
      const errors: string[] = [];
      const title = trim(raw[mapping.title]);
      if (!title) errors.push("title is required");

      const severity = pickEnum(trim(raw[mapping.severity]) || "medium", INCIDENT_SEVERITY, "severity", errors) ?? "medium";
      const status = mapping.status
        ? pickEnum(trim(raw[mapping.status]) || "open", INCIDENT_STATUS, "status", errors) ?? "open"
        : "open";

      const payload: Record<string, unknown> = {
        user_id: userId,
        title,
        severity,
        status,
        description: mapping.description ? trim(raw[mapping.description]) || null : null,
        remediation_notes: mapping.remediation_notes ? trim(raw[mapping.remediation_notes]) || null : null,
      };
      return { payload, errors };
    },
  },
  {
    id: "error_events",
    table: "error_events",
    label: "Error events",
    description: "Recurring error fingerprints from frontend, edge, or workers.",
    fields: [
      { key: "fingerprint", label: "Fingerprint", required: true, aliases: ["hash", "key"] },
      { key: "message", label: "Message", required: true, aliases: ["error", "msg"] },
      { key: "severity", label: "Severity", required: false, aliases: ["sev"], enumValues: ERROR_SEVERITY, help: "Defaults to 'error'" },
      { key: "source", label: "Source", required: false, enumValues: ERROR_SOURCE, help: "Defaults to 'frontend'" },
      { key: "route", label: "Route", required: false, aliases: ["path", "url"] },
      { key: "stack", label: "Stack trace", required: false, aliases: ["stacktrace"] },
    ],
    coerce: (raw, mapping, userId) => {
      const errors: string[] = [];
      const fingerprint = trim(raw[mapping.fingerprint]);
      const message = trim(raw[mapping.message]);
      if (!fingerprint) errors.push("fingerprint is required");
      if (!message) errors.push("message is required");

      const severity = mapping.severity
        ? pickEnum(trim(raw[mapping.severity]) || "error", ERROR_SEVERITY, "severity", errors) ?? "error"
        : "error";
      const source = mapping.source
        ? pickEnum(trim(raw[mapping.source]) || "frontend", ERROR_SOURCE, "source", errors) ?? "frontend"
        : "frontend";

      const payload: Record<string, unknown> = {
        user_id: userId,
        fingerprint,
        message,
        severity,
        source,
        route: mapping.route ? trim(raw[mapping.route]) || null : null,
        stack: mapping.stack ? trim(raw[mapping.stack]) || null : null,
        environment: "imported",
      };
      return { payload, errors };
    },
  },
];

export function getTarget(id: string): ImportTarget | undefined {
  return IMPORT_TARGETS.find((t) => t.id === id);
}