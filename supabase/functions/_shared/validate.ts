import { corsError } from "./cors.ts";

const MAX_BODY_SIZE = 100 * 1024; // 100KB

type FieldType = "string" | "number" | "boolean" | "object" | "array";

interface FieldRule {
  type: FieldType;
  required?: boolean;
  maxLength?: number;
  min?: number;
  max?: number;
  enum?: string[];
}

type Schema = Record<string, FieldRule>;

/**
 * Parse and validate JSON body with size limit and schema checks.
 * Returns parsed data or a Response (error).
 */
export async function validateBody<T = Record<string, unknown>>(
  req: Request,
  schema?: Schema
): Promise<T | Response> {
  // Size check
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) {
    return corsError("Request body too large (max 100KB)", 413);
  }

  let body: unknown;
  try {
    const text = await req.text();
    if (text.length > MAX_BODY_SIZE) {
      return corsError("Request body too large (max 100KB)", 413);
    }
    body = JSON.parse(text);
  } catch {
    return corsError("Invalid JSON body", 400);
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return corsError("Request body must be a JSON object", 400);
  }

  if (!schema) return body as T;

  const errors: string[] = [];
  const data = body as Record<string, unknown>;

  for (const [field, rule] of Object.entries(schema)) {
    const value = data[field];

    if (value === undefined || value === null) {
      if (rule.required) errors.push(`${field} is required`);
      continue;
    }

    // Type checks
    if (rule.type === "array") {
      if (!Array.isArray(value)) errors.push(`${field} must be an array`);
    } else if (typeof value !== rule.type) {
      errors.push(`${field} must be a ${rule.type}`);
      continue;
    }

    if (rule.type === "string" && typeof value === "string") {
      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push(`${field} exceeds max length ${rule.maxLength}`);
      }
      if (rule.enum && !rule.enum.includes(value)) {
        errors.push(`${field} must be one of: ${rule.enum.join(", ")}`);
      }
    }

    if (rule.type === "number" && typeof value === "number") {
      if (rule.min !== undefined && value < rule.min) errors.push(`${field} must be >= ${rule.min}`);
      if (rule.max !== undefined && value > rule.max) errors.push(`${field} must be <= ${rule.max}`);
    }
  }

  if (errors.length > 0) {
    return corsError(errors.join("; "), 400);
  }

  return data as T;
}

/**
 * Validate query params exist.
 */
export function requireParams(url: URL, ...params: string[]): string | null {
  for (const p of params) {
    if (!url.searchParams.get(p)) return `${p} is required`;
  }
  return null;
}
