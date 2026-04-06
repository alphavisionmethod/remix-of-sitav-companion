import { describe, it, expect } from "vitest";
import {
  FileIngestionService,
  classifyFile,
  detectSensitivity,
  extractDeadlines,
} from "@/lib/core-services/file-ingestion";

describe("File Ingestion Chain — Integration", () => {
  it("ingests and classifies an invoice", async () => {
    const svc = new FileIngestionService();
    const file = await svc.ingest({
      filename: "invoice-2024-001.pdf",
      mimeType: "application/pdf",
      sizeBytes: 150000,
      textContent: "Invoice #001 — Due by 12/31/2024. Total: $5,000",
      uploadedBy: "user-1",
    });

    expect(file.classification).toBe("invoice");
    expect(file.status).toBe("completed");
    expect(file.workflowSuggestions).toContain("route-to-approvals");
    expect(file.deadlines.length).toBeGreaterThan(0);
  });

  it("detects sensitivity levels", () => {
    expect(detectSensitivity("Contains SSN 123-45-6789")).toBe("restricted");
    expect(detectSensitivity("Bank account routing number")).toBe("confidential");
    expect(detectSensitivity("Regular meeting notes")).toBe("public");
    expect(detectSensitivity("Medical records review")).toBe("restricted");
  });

  it("classifies files by name and content", () => {
    expect(classifyFile("contract-nda.pdf", "application/pdf")).toBe("contract");
    expect(classifyFile("receipt-payment.pdf", "application/pdf")).toBe("receipt");
    expect(classifyFile("w-2-2024.pdf", "application/pdf")).toBe("tax-document");
    expect(classifyFile("memo.docx", "application/docx")).toBe("correspondence");
    expect(classifyFile("random.txt", "text/plain")).toBe("general");
  });

  it("extracts deadlines from text", () => {
    const deadlines = extractDeadlines("Payment due by 06/15/2024. Renewal: 12/01/2024");
    expect(deadlines.length).toBeGreaterThanOrEqual(1);
  });

  it("assigns retention policy based on sensitivity", async () => {
    const svc = new FileIngestionService();

    const restricted = await svc.ingest({
      filename: "passport-scan.pdf",
      mimeType: "application/pdf",
      sizeBytes: 50000,
      textContent: "Passport ID: AB1234567",
      uploadedBy: "user-1",
    });
    expect(restricted.retentionPolicy).toBe("7-year");

    const general = await svc.ingest({
      filename: "notes.txt",
      mimeType: "text/plain",
      sizeBytes: 1000,
      textContent: "Meeting notes from today",
      uploadedBy: "user-1",
    });
    expect(general.retentionPolicy).toBe("standard");
  });

  it("retrieves files by classification", async () => {
    const svc = new FileIngestionService();
    await svc.ingest({ filename: "inv-1.pdf", mimeType: "application/pdf", sizeBytes: 100, textContent: "invoice", uploadedBy: "u1" });
    await svc.ingest({ filename: "inv-2.pdf", mimeType: "application/pdf", sizeBytes: 100, textContent: "invoice", uploadedBy: "u1" });
    await svc.ingest({ filename: "contract.pdf", mimeType: "application/pdf", sizeBytes: 100, textContent: "contract", uploadedBy: "u1" });

    expect(svc.getFilesByClassification("invoice")).toHaveLength(2);
    expect(svc.getFilesByClassification("contract")).toHaveLength(1);
  });
});
