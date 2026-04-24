/**
 * Tiny dependency-free CSV parser used by the Imports & Exports panel.
 * Handles quoted fields, escaped quotes, CRLF/LF line endings, and trims
 * trailing empty lines. Not meant to cover every RFC 4180 edge case — but
 * good enough for human-authored incident/error exports.
 */
export interface ParsedCsv {
  headers: string[];
  rows: Record<string, string>[];
}

export function parseCsv(input: string): ParsedCsv {
  const text = input.replace(/^\uFEFF/, ""); // strip BOM
  const records: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ",") {
      row.push(field);
      field = "";
      continue;
    }
    if (ch === "\n" || ch === "\r") {
      // handle CRLF as single newline
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      records.push(row);
      row = [];
      field = "";
      continue;
    }
    field += ch;
  }
  // flush trailing field/row
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    records.push(row);
  }

  // drop empty trailing rows
  while (records.length > 0 && records[records.length - 1].every((c) => c.trim() === "")) {
    records.pop();
  }

  if (records.length === 0) return { headers: [], rows: [] };

  const headers = records[0].map((h) => h.trim());
  const rows = records.slice(1).map((cells) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = (cells[i] ?? "").trim();
    });
    return obj;
  });
  return { headers, rows };
}

/**
 * Suggest a mapping from CSV headers → known target fields. Case- and
 * separator-insensitive. Returns the chosen header per field, or "" if no
 * confident match. Used to pre-fill the column mapper UI.
 */
export function suggestMapping(
  csvHeaders: string[],
  targetFields: { key: string; aliases?: string[] }[],
): Record<string, string> {
  const norm = (s: string) => s.toLowerCase().replace(/[\s_\-./]+/g, "");
  const headerByNorm = new Map<string, string>();
  csvHeaders.forEach((h) => headerByNorm.set(norm(h), h));

  const out: Record<string, string> = {};
  for (const field of targetFields) {
    const candidates = [field.key, ...(field.aliases ?? [])];
    let match = "";
    for (const c of candidates) {
      const hit = headerByNorm.get(norm(c));
      if (hit) {
        match = hit;
        break;
      }
    }
    out[field.key] = match;
  }
  return out;
}