// ═══════════════════════════════════════════════════════════════
// SITA OS — Imports & Exports Advisor recommendations.
//
// Surfaces three real, RLS-scoped trade patterns:
//   1. Vendors with no recent contact (stale relationships)
//   2. Trade documents missing classification (compliance gap)
//   3. Vendors missing country (sourcing data gap)
// All values come from real tables; empty-state honest.
// Each row carries a glass-box explainability popover.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Ship, FileText, MapPin, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { askBusinessAdvisor } from "@/lib/ai-platform/runtime";
import { ImportsExportsDetailDrawer, type ImpExpDrawerTarget } from "./ImportsExportsDetailDrawer";
import { CFOExplainabilityPopover, type CFOExplainability } from "../cfo/CFOExplainabilityPopover";

interface VendorRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  country: string | null;
  last_contacted_at: string | null;
  source: string | null;
  tags: string[] | null;
  created_at: string;
}

interface DocRow {
  id: string;
  filename: string;
  classification: string | null;
  status: string | null;
  created_at: string;
}

interface ImpExpSnapshot {
  staleVendors: VendorRow[];
  unclassifiedDocs: DocRow[];
  countryless: VendorRow[];
  totalVendors: number;
  totalDocs: number;
  loadedAt: string;
}

const STALE_DAYS = 30;
const TRADE_DOC_PATTERNS = ["customs", "shipping", "trade", "import", "export", "bill of lading", "invoice"];

function vendorName(v: VendorRow): string {
  const n = [v.first_name, v.last_name].filter(Boolean).join(" ").trim();
  return n || "(unnamed vendor)";
}

function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
}

async function loadImpExpSnapshot(userId: string): Promise<ImpExpSnapshot> {
  const staleCutoff = new Date(Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const tradeOr = TRADE_DOC_PATTERNS
    .map((p) => `classification.ilike.%${p}%,filename.ilike.%${p}%`)
    .join(",");

  const [vendorRes, docRes] = await Promise.all([
    supabase
      .from("crm_contacts")
      .select("id, first_name, last_name, country, last_contacted_at, source, tags, created_at")
      .eq("user_id", userId)
      .or("source.ilike.%vendor%,source.ilike.%supplier%,tags.cs.{vendor},tags.cs.{supplier}")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("file_metadata")
      .select("id, filename, classification, status, created_at")
      .eq("user_id", userId)
      .or(tradeOr)
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  const vendors = (vendorRes.data ?? []) as VendorRow[];
  const docs = (docRes.data ?? []) as DocRow[];

  const staleVendors = vendors
    .filter((v) => !v.last_contacted_at || v.last_contacted_at < staleCutoff)
    .slice(0, 10);
  const unclassifiedDocs = docs.filter((d) => !d.classification).slice(0, 10);
  const countryless = vendors.filter((v) => !v.country).slice(0, 10);

  return {
    staleVendors,
    unclassifiedDocs,
    countryless,
    totalVendors: vendors.length,
    totalDocs: docs.length,
    loadedAt: new Date().toISOString(),
  };
}

export function ImportsExportsRecommendations() {
  const [snapshot, setSnapshot] = useState<ImpExpSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawerTarget, setDrawerTarget] = useState<ImpExpDrawerTarget | null>(null);
  const [askLoading, setAskLoading] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data: u } = await supabase.auth.getUser();
      const userId = u?.user?.id;
      if (!userId) {
        if (!cancelled) setLoading(false);
        return;
      }
      const snap = await loadImpExpSnapshot(userId);
      if (!cancelled) {
        setSnapshot(snap);
        setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function askForDraft(key: string, prompt: string) {
    setAskLoading(key);
    try {
      const r = await askBusinessAdvisor({
        advisorId: "imports-exports-advisor",
        prompt,
        intent: "draft",
      });
      setDrafts((d) => ({ ...d, [key]: r.response.content }));
    } finally {
      setAskLoading(null);
    }
  }

  const groups = useMemo(() => {
    if (!snapshot) return [];
    const snapTime = new Date(snapshot.loadedAt).toLocaleString();
    const oldestVendor = snapshot.staleVendors[0];
    const firstDoc = snapshot.unclassifiedDocs[0];

    return [
      {
        key: "stale-vendors",
        icon: Ship,
        title: `Vendors with no recent contact (> ${STALE_DAYS}d)`,
        description:
          snapshot.totalVendors === 0
            ? "No vendors tagged yet — tag CRM contacts as 'vendor' or 'supplier' to surface them here."
            : snapshot.staleVendors.length === 0
              ? `All ${snapshot.totalVendors} tagged vendor${snapshot.totalVendors === 1 ? "" : "s"} contacted within ${STALE_DAYS} days.`
              : `${snapshot.staleVendors.length} vendor${snapshot.staleVendors.length === 1 ? "" : "s"} cold or never contacted.`,
        action: oldestVendor
          ? {
              label: "Re-engagement plan",
              prompt: `Vendor "${vendorName(oldestVendor)}" (${oldestVendor.country ?? "country unknown"}) has not been contacted in over ${STALE_DAYS} days. Recommend a 3-step re-engagement plan: (1) outreach angle, (2) what to verify before re-ordering, (3) risk to flag. Recommend-only.`,
            }
          : null,
        explain: {
          subject: "Stale vendor detection",
          sources: [
            {
              table: "crm_contacts",
              purpose: "CRM contacts tagged as vendor/supplier (RLS-scoped).",
              rowCount: snapshot.totalVendors,
              asOf: snapshot.loadedAt,
            },
          ],
          assumptions: [
            "Vendor = source contains 'vendor'/'supplier' OR tags include 'vendor'/'supplier'.",
            `Stale = last_contacted_at older than ${STALE_DAYS} days OR never set.`,
            "Top 10 most-recent matches are surfaced.",
          ],
          steps: [
            { label: "Pull vendors", detail: "SELECT crm_contacts WHERE vendor-tag (RLS).", output: `${snapshot.totalVendors} row${snapshot.totalVendors === 1 ? "" : "s"}` },
            { label: "Filter stale", detail: `last_contacted_at older than ${STALE_DAYS}d or null.`, output: `${snapshot.staleVendors.length} flagged` },
          ],
          footer: `Snapshot taken ${snapTime} · row-level security enforced.`,
        } satisfies CFOExplainability,
        items: snapshot.staleVendors.map((v) => {
          const days = daysSince(v.last_contacted_at);
          return {
            id: v.id,
            kind: "vendor" as const,
            primary: vendorName(v),
            secondary: `${v.country ?? "country unknown"} · ${v.last_contacted_at ? `${days}d since contact` : "never contacted"}`,
            chip: v.last_contacted_at ? `${days}d` : "cold",
            chipVariant: "outline" as const,
            explain: {
              subject: `${vendorName(v)} — vendor relationship`,
              sources: [{ table: "crm_contacts", purpose: "Single vendor record.", rowCount: 1, asOf: v.created_at }],
              assumptions: [
                v.last_contacted_at ? `last_contacted_at is older than ${STALE_DAYS}d.` : "No last_contacted_at recorded.",
                "Tag/source flagged this contact as vendor.",
              ],
              steps: [
                { label: "Read tags/source", detail: "Confirm vendor tag.", output: (v.tags ?? []).join(",") || v.source || "—" },
                { label: "Read last contact", detail: "Compute staleness.", output: v.last_contacted_at ? `${days}d ago` : "never" },
              ],
            } satisfies CFOExplainability,
          };
        }),
      },
      {
        key: "unclassified-docs",
        icon: FileText,
        title: "Trade documents missing classification",
        description:
          snapshot.totalDocs === 0
            ? "No trade-flavoured documents uploaded yet."
            : snapshot.unclassifiedDocs.length === 0
              ? `All ${snapshot.totalDocs} trade document${snapshot.totalDocs === 1 ? "" : "s"} are classified.`
              : `${snapshot.unclassifiedDocs.length} trade document${snapshot.unclassifiedDocs.length === 1 ? "" : "s"} need classification.`,
        action: firstDoc
          ? {
              label: "Classification draft",
              prompt: `Trade document "${firstDoc.filename}" was uploaded with no classification. Recommend the most-likely classification (e.g. customs declaration, bill of lading, commercial invoice, packing list, certificate of origin) and what owner-side validation is required. Recommend-only.`,
            }
          : null,
        explain: {
          subject: "Unclassified trade document detection",
          sources: [
            {
              table: "file_metadata",
              purpose: "Files matching trade/customs keywords (RLS-scoped).",
              rowCount: snapshot.totalDocs,
              asOf: snapshot.loadedAt,
            },
          ],
          assumptions: [
            `Trade scope = filename or classification matches one of: ${TRADE_DOC_PATTERNS.join(", ")}.`,
            "Missing = classification IS NULL.",
          ],
          steps: [
            { label: "Pull trade docs", detail: "SELECT file_metadata matching trade keywords (RLS).", output: `${snapshot.totalDocs} row${snapshot.totalDocs === 1 ? "" : "s"}` },
            { label: "Filter missing", detail: "Keep classification IS NULL.", output: `${snapshot.unclassifiedDocs.length} flagged` },
          ],
          footer: `Snapshot taken ${snapTime}.`,
        } satisfies CFOExplainability,
        items: snapshot.unclassifiedDocs.map((d) => ({
          id: d.id,
          kind: "doc" as const,
          primary: d.filename,
          secondary: `${d.status ?? "no status"} · uploaded ${new Date(d.created_at).toLocaleDateString()}`,
          chip: "unclassified",
          chipVariant: "destructive" as const,
          explain: {
            subject: `${d.filename} — classification missing`,
            sources: [{ table: "file_metadata", purpose: "Single document record.", rowCount: 1, asOf: d.created_at }],
            assumptions: ["File matches trade keyword pattern.", "classification is NULL."],
            steps: [
              { label: "Match trade keyword", detail: "Filename or prior classification matches a trade pattern.", output: d.filename },
              { label: "Read classification", detail: "Confirm NULL.", output: "missing" },
            ],
          } satisfies CFOExplainability,
        })),
      },
      {
        key: "countryless-vendors",
        icon: MapPin,
        title: "Vendors missing country (sourcing gap)",
        description:
          snapshot.totalVendors === 0
            ? "No vendors tagged yet."
            : snapshot.countryless.length === 0
              ? "Every tagged vendor has a country recorded."
              : `${snapshot.countryless.length} vendor${snapshot.countryless.length === 1 ? "" : "s"} missing country — blocks tariff/lead-time reasoning.`,
        action: snapshot.countryless[0]
          ? {
              label: "Sourcing checklist",
              prompt: `${snapshot.countryless.length} vendor${snapshot.countryless.length === 1 ? "" : "s"} are tagged but missing country of origin. Recommend the top 3 fields the operator should backfill before any cross-border decision can be reasoned about. Recommend-only.`,
            }
          : null,
        explain: {
          subject: "Vendor country-of-origin gap",
          sources: [
            {
              table: "crm_contacts",
              purpose: "Vendor-tagged contacts (RLS-scoped).",
              rowCount: snapshot.totalVendors,
              asOf: snapshot.loadedAt,
            },
          ],
          assumptions: [
            "Country is required for tariff, lead time, and incoterm reasoning.",
            "Vendor = source contains 'vendor'/'supplier' OR tags include 'vendor'/'supplier'.",
          ],
          steps: [
            { label: "Pull vendors", detail: "SELECT vendor-tagged contacts (RLS).", output: `${snapshot.totalVendors}` },
            { label: "Filter missing country", detail: "Keep country IS NULL.", output: `${snapshot.countryless.length}` },
          ],
          footer: `Snapshot taken ${snapTime}.`,
        } satisfies CFOExplainability,
        items: snapshot.countryless.map((v) => ({
          id: v.id,
          kind: "vendor" as const,
          primary: vendorName(v),
          secondary: `tags: ${(v.tags ?? []).join(", ") || "—"}`,
          chip: "no country",
          chipVariant: "outline" as const,
          explain: {
            subject: `${vendorName(v)} — country missing`,
            sources: [{ table: "crm_contacts", purpose: "Single vendor record.", rowCount: 1, asOf: v.created_at }],
            assumptions: ["Country is required for cross-border reasoning."],
            steps: [
              { label: "Read country", detail: "Confirm NULL.", output: "missing" },
            ],
          } satisfies CFOExplainability,
        })),
      },
    ];
  }, [snapshot]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin inline mr-2" />Loading trade recommendations…
        </CardContent>
      </Card>
    );
  }

  if (!snapshot) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Sign in to see trade recommendations.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map((g) => {
        const Icon = g.icon;
        return (
          <Card key={g.key}>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">{g.title}</CardTitle>
                  <CFOExplainabilityPopover
                    data={g.explain}
                    triggerLabel={`Explain how ${g.title} was computed`}
                  />
                </div>
                {g.action && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => askForDraft(g.key, g.action!.prompt)}
                    disabled={askLoading === g.key}
                    className="text-xs"
                  >
                    {askLoading === g.key ? (
                      <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" />Drafting…</>
                    ) : (
                      g.action.label
                    )}
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{g.description}</p>
            </CardHeader>
            <CardContent className="pt-0">
              {g.items.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">Nothing to flag right now.</p>
              ) : (
                <ScrollArea className="max-h-[280px] pr-3">
                  <ul className="space-y-1.5">
                    {g.items.map((it) => (
                      <li
                        key={`${g.key}-${it.id}`}
                        className="rounded-md border border-border bg-background hover:bg-muted/40 transition-colors cursor-pointer px-2 py-1.5"
                        onClick={() => setDrawerTarget({ id: it.id, kind: it.kind, label: it.primary })}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-medium truncate">{it.primary}</p>
                              <CFOExplainabilityPopover data={it.explain} />
                            </div>
                            <p className="text-[11px] text-muted-foreground truncate">{it.secondary}</p>
                          </div>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border shrink-0 ${it.chipVariant === "destructive" ? "border-destructive/40 text-destructive" : "border-border text-muted-foreground"}`}>
                            {it.chip}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              )}
              {drafts[g.key] && (
                <div className="mt-2 rounded-md border border-border bg-muted/30 p-2">
                  <p className="text-[10px] uppercase text-muted-foreground mb-1">Advisor draft</p>
                  <p className="text-xs whitespace-pre-wrap">{drafts[g.key]}</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
      <ImportsExportsDetailDrawer
        target={drawerTarget}
        onClose={() => setDrawerTarget(null)}
      />
    </div>
  );
}