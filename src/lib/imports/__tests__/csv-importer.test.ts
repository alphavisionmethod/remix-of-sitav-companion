import { describe, it, expect } from "vitest";
import { parseCsv, suggestMapping } from "../csv-parser";
import { IMPORT_TARGETS, getTarget } from "../import-targets";

const USER = "00000000-0000-0000-0000-000000000001";

describe("parseCsv", () => {
  it("parses headers and rows", () => {
    const out = parseCsv("a,b,c\n1,2,3\n4,5,6\n");
    expect(out.headers).toEqual(["a", "b", "c"]);
    expect(out.rows).toEqual([
      { a: "1", b: "2", c: "3" },
      { a: "4", b: "5", c: "6" },
    ]);
  });

  it("handles quoted fields with commas and escaped quotes", () => {
    const out = parseCsv('title,note\n"Hello, world","She said ""hi"""\n');
    expect(out.rows[0]).toEqual({ title: "Hello, world", note: 'She said "hi"' });
  });

  it("handles CRLF line endings and trims trailing blank rows", () => {
    const out = parseCsv("a,b\r\n1,2\r\n\r\n");
    expect(out.rows).toEqual([{ a: "1", b: "2" }]);
  });

  it("strips BOM and ignores empty input", () => {
    expect(parseCsv("\uFEFFa\n1\n").headers).toEqual(["a"]);
    expect(parseCsv("")).toEqual({ headers: [], rows: [] });
  });
});

describe("suggestMapping", () => {
  const target = getTarget("incidents")!;

  it("matches by exact key, alias, and case-insensitively", () => {
    const headers = ["Title", "Sev", "State", "details"];
    const m = suggestMapping(headers, target.fields);
    expect(m.title).toBe("Title");
    expect(m.severity).toBe("Sev");
    expect(m.status).toBe("State");
    expect(m.description).toBe("details");
  });

  it("returns empty string when no header matches", () => {
    const m = suggestMapping(["foo", "bar"], target.fields);
    expect(m.title).toBe("");
    expect(m.severity).toBe("");
  });

  it("normalises separators (snake_case, kebab-case, dotted)", () => {
    const m = suggestMapping(["remediation-notes"], target.fields);
    expect(m.remediation_notes).toBe("remediation-notes");
  });
});

describe("incidents target.coerce", () => {
  const t = getTarget("incidents")!;
  const baseMap = {
    title: "title",
    severity: "severity",
    status: "status",
    description: "description",
    remediation_notes: "",
  };

  it("returns a clean payload for a valid row", () => {
    const { payload, errors } = t.coerce(
      { title: "DB outage", severity: "high", status: "open", description: "boom" },
      baseMap,
      USER,
    );
    expect(errors).toEqual([]);
    expect(payload).toMatchObject({
      user_id: USER,
      title: "DB outage",
      severity: "high",
      status: "open",
      description: "boom",
      remediation_notes: null,
    });
  });

  it("flags missing title", () => {
    const { errors } = t.coerce({ title: "", severity: "low" }, baseMap, USER);
    expect(errors).toContain("title is required");
  });

  it("rejects out-of-enum severity", () => {
    const { errors } = t.coerce(
      { title: "x", severity: "spicy", status: "open" },
      baseMap,
      USER,
    );
    expect(errors.some((e) => e.startsWith("severity:"))).toBe(true);
  });

  it("defaults status to 'open' when no header is mapped", () => {
    const { payload } = t.coerce(
      { title: "x", severity: "medium" },
      { ...baseMap, status: "" },
      USER,
    );
    expect(payload.status).toBe("open");
  });
});

describe("error_events target.coerce", () => {
  const t = getTarget("error_events")!;
  const map = {
    fingerprint: "fp",
    message: "msg",
    severity: "sev",
    source: "",
    route: "",
    stack: "",
  };

  it("requires fingerprint and message", () => {
    const { errors } = t.coerce({ fp: "", msg: "" }, map, USER);
    expect(errors).toContain("fingerprint is required");
    expect(errors).toContain("message is required");
  });

  it("attaches user_id and defaults source to 'frontend' and severity to 'error'", () => {
    const { payload, errors } = t.coerce(
      { fp: "abc123", msg: "TypeError x" },
      { ...map, severity: "" },
      USER,
    );
    expect(errors).toEqual([]);
    expect(payload).toMatchObject({
      user_id: USER,
      fingerprint: "abc123",
      message: "TypeError x",
      severity: "error",
      source: "frontend",
      environment: "imported",
    });
  });

  it("validates source enum when mapped", () => {
    const { errors } = t.coerce(
      { fp: "x", msg: "y", src: "spaceship" },
      { ...map, source: "src" },
      USER,
    );
    expect(errors.some((e) => e.startsWith("source:"))).toBe(true);
  });
});

describe("registry", () => {
  it("exposes incidents and error_events", () => {
    expect(IMPORT_TARGETS.map((t) => t.id).sort()).toEqual(["error_events", "incidents"]);
  });
});