import { describe, it, expect } from "vitest";
import {
  linkInvoiceToQuote,
  detectUnlinkedInvoices,
  computeQuoteToInvoiceRate,
} from "@/lib/services/business-os/invoice-linking.service";
import { makeInvoice } from "../_helpers/business-fixtures-extra";

describe("invoice-linking.service", () => {
  describe("linkInvoiceToQuote", () => {
    it("computes 0% variance when invoice matches quote total", () => {
      const link = linkInvoiceToQuote(makeInvoice({ amount: 1000 }), "q1", 100_000);
      expect(link.variance).toBe(0);
    });

    it("computes positive variance when invoice exceeds quote", () => {
      const link = linkInvoiceToQuote(makeInvoice({ amount: 1100 }), "q1", 100_000);
      expect(link.variance).toBe(10);
    });

    it("computes negative variance when invoice is below quote", () => {
      const link = linkInvoiceToQuote(makeInvoice({ amount: 900 }), "q1", 100_000);
      expect(link.variance).toBe(-10);
    });

    it("variance defaults to 0 when quote total is 0 (no division-by-zero)", () => {
      const link = linkInvoiceToQuote(makeInvoice({ amount: 1000 }), "q1", 0);
      expect(link.variance).toBe(0);
    });
  });

  describe("detectUnlinkedInvoices", () => {
    it("returns invoices not present in the linked-id set", () => {
      const inv = [makeInvoice({ id: "a" }), makeInvoice({ id: "b" }), makeInvoice({ id: "c" })];
      const unlinked = detectUnlinkedInvoices(inv, new Set(["b"]));
      expect(unlinked.map(i => i.id)).toEqual(["a", "c"]);
    });

    it("returns all invoices when set is empty", () => {
      expect(detectUnlinkedInvoices([makeInvoice()], new Set()).length).toBe(1);
    });
  });

  describe("computeQuoteToInvoiceRate", () => {
    it("returns 0 when no quotes (no division-by-zero)", () => {
      expect(computeQuoteToInvoiceRate(0, 5)).toBe(0);
    });
    it("rounds to nearest integer percent", () => {
      expect(computeQuoteToInvoiceRate(7, 4)).toBe(57);
    });
  });
});
