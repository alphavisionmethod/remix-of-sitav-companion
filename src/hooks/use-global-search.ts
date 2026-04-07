// ═══════════════════════════════════════════════════════════════
// SITA OS — Global Search Hook
// Live Supabase cross-domain entity search
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";

export interface SearchResult {
  id: string;
  type: "lead" | "customer" | "task" | "invoice" | "file" | "workflow" | "receipt" | "approval" | "note" | "bill" | "booking" | "incident" | "setting";
  title: string;
  subtitle?: string;
  domain: "business" | "finance" | "concierge" | "system" | "files" | "workflows" | "proof";
  metadata?: Record<string, string | number | null>;
  actionUrl?: string;
  sensitivity?: "public" | "restricted" | "confidential";
  relevance: number;
  updatedAt?: string;
}

export interface SearchFilters {
  domains?: string[];
  types?: string[];
  dateRange?: "today" | "week" | "month" | "all";
}

export function useGlobalSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [facets, setFacets] = useState<Record<string, Record<string, number>>>({});
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(async (query: string, filters?: SearchFilters) => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setFacets({});
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    const q = `%${query.trim()}%`;
    const allResults: SearchResult[] = [];

    try {
      // Run all domain searches in parallel
      const [leads, customers, tasks, invoices, bills, workflows, approvals, incidents, files] = await Promise.all([
        // Leads
        fromTable("leads").select("id, name, company, status, email, source, updated_at")
          .or(`name.ilike.${q},company.ilike.${q},email.ilike.${q}`)
          .limit(8),
        // Customers
        fromTable("customers").select("id, name, company, email, status, updated_at")
          .or(`name.ilike.${q},company.ilike.${q},email.ilike.${q}`)
          .limit(8),
        // Tasks
        fromTable("tasks").select("id, title, status, priority, category, updated_at")
          .ilike("title", q)
          .limit(8),
        // Invoices
        fromTable("invoices").select("id, invoice_number, amount, status, due_date, updated_at")
          .or(`invoice_number.ilike.${q},status.ilike.${q}`)
          .limit(8),
        // Bills
        fromTable("bills").select("id, payee, amount, status, due_date, updated_at")
          .ilike("payee", q)
          .limit(8),
        // Workflows
        fromTable("workflows").select("id, name, description, active, updated_at")
          .or(`name.ilike.${q},description.ilike.${q}`)
          .limit(8),
        // Approvals
        fromTable("approval_queue").select("id, action_summary, status, action_type, updated_at")
          .ilike("action_summary", q)
          .limit(8),
        // Incidents
        fromTable("incidents").select("id, title, severity, status, source, updated_at")
          .ilike("title", q)
          .limit(8),
        // Files
        fromTable("file_metadata").select("id, filename, classification, status, updated_at")
          .ilike("filename", q)
          .limit(8),
      ]);

      if (controller.signal.aborted) return;

      // Map results
      leads.data?.forEach(r => allResults.push({
        id: r.id, type: "lead", title: r.name, subtitle: r.company || r.email || undefined,
        domain: "business", actionUrl: "/business", relevance: 0.9,
        metadata: { status: r.status, source: r.source }, updatedAt: r.updated_at,
      }));

      customers.data?.forEach(r => allResults.push({
        id: r.id, type: "customer", title: r.name, subtitle: r.company || r.email || undefined,
        domain: "business", actionUrl: "/business", relevance: 0.85,
        metadata: { status: r.status }, updatedAt: r.updated_at,
      }));

      tasks.data?.forEach(r => allResults.push({
        id: r.id, type: "task", title: r.title,
        subtitle: `${r.priority} priority · ${r.status}`,
        domain: "concierge", actionUrl: "/concierge", relevance: 0.8,
        metadata: { status: r.status, priority: r.priority, category: r.category }, updatedAt: r.updated_at,
      }));

      invoices.data?.forEach(r => allResults.push({
        id: r.id, type: "invoice", title: `Invoice ${r.invoice_number}`,
        subtitle: `$${r.amount?.toLocaleString()} · ${r.status}`,
        domain: "finance", actionUrl: "/money", relevance: 0.85,
        metadata: { amount: r.amount, status: r.status, due_date: r.due_date }, updatedAt: r.updated_at,
      }));

      bills.data?.forEach(r => allResults.push({
        id: r.id, type: "bill", title: r.payee,
        subtitle: `$${r.amount?.toLocaleString()} · ${r.status}`,
        domain: "finance", actionUrl: "/money", relevance: 0.8,
        metadata: { amount: r.amount, status: r.status, due_date: r.due_date }, updatedAt: r.updated_at,
      }));

      workflows.data?.forEach(r => allResults.push({
        id: r.id, type: "workflow", title: r.name,
        subtitle: r.description || (r.active ? "Active" : "Inactive"),
        domain: "workflows", actionUrl: "/workflows", relevance: 0.75,
        metadata: { active: r.active ? "yes" : "no" }, updatedAt: r.updated_at,
      }));

      approvals.data?.forEach(r => allResults.push({
        id: r.id, type: "approval", title: r.action_summary,
        subtitle: `${r.action_type || "Action"} · ${r.status}`,
        domain: "system", actionUrl: "/approvals", relevance: 0.85,
        metadata: { status: r.status, type: r.action_type }, updatedAt: r.updated_at,
      }));

      incidents.data?.forEach(r => allResults.push({
        id: r.id, type: "incident", title: r.title,
        subtitle: `${r.severity} · ${r.status}`,
        domain: "system", actionUrl: "/mission-control", relevance: 0.9,
        sensitivity: r.severity === "critical" ? "confidential" : "restricted",
        metadata: { severity: r.severity, status: r.status, source: r.source }, updatedAt: r.updated_at,
      }));

      files.data?.forEach(r => allResults.push({
        id: r.id, type: "file", title: r.filename,
        subtitle: r.classification || r.status,
        domain: "files", actionUrl: "/files", relevance: 0.7,
        metadata: { classification: r.classification, status: r.status }, updatedAt: r.updated_at,
      }));

      // Apply filters
      let filtered = allResults;
      if (filters?.domains?.length) {
        filtered = filtered.filter(r => filters.domains!.includes(r.domain));
      }
      if (filters?.types?.length) {
        filtered = filtered.filter(r => filters.types!.includes(r.type));
      }

      // Sort by relevance then recency
      filtered.sort((a, b) => b.relevance - a.relevance);

      // Build facets
      const domainFacets: Record<string, number> = {};
      const typeFacets: Record<string, number> = {};
      allResults.forEach(r => {
        domainFacets[r.domain] = (domainFacets[r.domain] || 0) + 1;
        typeFacets[r.type] = (typeFacets[r.type] || 0) + 1;
      });

      setResults(filtered);
      setFacets({ domain: domainFacets, type: typeFacets });
    } catch (err) {
      if (!controller.signal.aborted) {
        console.error("Search error:", err);
        setResults([]);
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setFacets({});
  }, []);

  return { results, loading, facets, search, clearResults };
}
