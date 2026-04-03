import { describe, it, expect } from "vitest";
import { classifyFile, detectSensitivity } from "@/lib/core-services/file-ingestion";

describe("File Ingestion Service", () => {
  it("classifies a PDF as invoice", () => {
    const result = classifyFile("Invoice_1042.pdf", "application/pdf", "Invoice for design services");
    expect(result).toBe("invoice");
  });

  it("classifies a contract document", () => {
    const result = classifyFile("Service_Agreement.docx", "application/msword", "Service agreement NDA");
    expect(result).toBe("contract");
  });

  it("detects restricted sensitivity for identity documents", () => {
    const result = detectSensitivity("Passport identification document scan with SSN");
    expect(["restricted", "confidential"]).toContain(result);
  });

  it("detects public sensitivity for general receipts", () => {
    const result = detectSensitivity("Costco groceries household supplies");
    expect(result).toBe("public");
  });
});
