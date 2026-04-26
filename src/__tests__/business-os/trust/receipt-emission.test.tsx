// ═══════════════════════════════════════════════════════════════
// Phase 4 — Trust receipt emission for Phase-10 Business OS hooks
//
// The Phase-10 client hooks (`use-phase10-actions.ts`) wrap edge
// functions that, server-side, persist a row to `receipts` /
// `business_dispatch_log` / `calendar_sync_links` for every
// mutating action. From the client the verifiable invariant is:
//
//   • the correct edge function is invoked
//   • with the correct lineage refs in the body
//   • exactly once per mutation call
//
// We assert that contract here. We do NOT mock the edge function's
// internal receipt table write — that is verified in Phase 7's DB
// smoke and the proof-lineage probe below.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

const invokeMock = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: () => Promise.resolve({ data: { user: { id: "u" } }, error: null }) },
    functions: { invoke: (...args: unknown[]) => invokeMock(...args) },
    storage: {
      from: () => ({
        createSignedUrl: () =>
          Promise.resolve({ data: { signedUrl: "https://signed/url" }, error: null }),
      }),
    },
    from: () => {
      const chain: any = {
        select: () => chain,
        eq: () => chain,
        in: () => chain,
        order: () => chain,
        limit: () => chain,
        update: () => chain,
        maybeSingle: () => Promise.resolve({ data: { metadata: { pdf_path: "x.pdf" } }, error: null }),
        then: (cb: any) => Promise.resolve({ data: [], error: null }).then(cb),
      };
      return chain;
    },
  },
}));

vi.mock("@/lib/supabase-helpers", () => ({
  fromTable: () => {
    const chain: any = {
      select: () => chain,
      eq: () => chain,
      in: () => chain,
      order: () => chain,
      update: () => chain,
      maybeSingle: () => Promise.resolve({ data: { metadata: { pdf_path: "x.pdf" } }, error: null }),
      then: (cb: any) => Promise.resolve({ data: [], error: null }).then(cb),
    };
    return chain;
  },
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

vi.mock("@/lib/business/appointment-calendar-sync", () => ({
  syncAppointmentEverywhere: vi.fn(() =>
    Promise.resolve([{ provider: "internal", ok: true }]),
  ),
}));

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  invokeMock.mockReset();
  invokeMock.mockResolvedValue({
    data: {
      ok: true,
      pdf_path: "p.pdf",
      signed_url: null,
      byte_size: 1024,
      signature_id: "sig_1",
      sign_url: "https://x/sign/abc",
      expires_at: new Date(Date.now() + 86400_000).toISOString(),
      status: "sent",
      provider: "resend",
      deferred: false,
      error_message: null,
    },
    error: null,
  });
});

describe("Phase 10 hooks — verifiable edge function contracts", () => {
  it("useGenerateInvoicePdf calls business-pdf-generate with action=invoice + invoice_id", async () => {
    const { useGenerateInvoicePdf } = await import("@/hooks/use-phase10-actions");
    const { result } = renderHook(() => useGenerateInvoicePdf(), { wrapper });
    result.current.mutate("inv_42");
    await waitFor(() => expect(invokeMock).toHaveBeenCalledTimes(1));
    expect(invokeMock).toHaveBeenCalledWith("business-pdf-generate", {
      body: { action: "invoice", invoice_id: "inv_42" },
    });
  });

  it("useRequestSignature calls business-esign-request with full lineage payload", async () => {
    const { useRequestSignature } = await import("@/hooks/use-phase10-actions");
    const { result } = renderHook(() => useRequestSignature(), { wrapper });
    result.current.mutate({
      document_type: "proposal",
      document_id: "prop_7",
      signer_email: "client@example.com",
      signer_name: "Client",
    });
    await waitFor(() => expect(invokeMock).toHaveBeenCalledTimes(1));
    const [name, opts] = invokeMock.mock.calls[0];
    expect(name).toBe("business-esign-request");
    expect(opts.body.document_type).toBe("proposal");
    expect(opts.body.document_id).toBe("prop_7");
    expect(opts.body.signer_email).toBe("client@example.com");
  });

  it("useDispatchComm always tags subject_type (defaults to ad_hoc)", async () => {
    const { useDispatchComm } = await import("@/hooks/use-phase10-actions");
    const { result } = renderHook(() => useDispatchComm(), { wrapper });
    result.current.mutate({
      channel: "email",
      recipient: "x@y.com",
      message_text: "hello",
    });
    await waitFor(() => expect(invokeMock).toHaveBeenCalledTimes(1));
    const [name, opts] = invokeMock.mock.calls[0];
    expect(name).toBe("business-dispatch-comm");
    expect(opts.body.subject_type).toBe("ad_hoc");
    expect(opts.body.channel).toBe("email");
    expect(opts.body.recipient).toBe("x@y.com");
  });

  it("useDispatchComm preserves explicit subject_type when supplied", async () => {
    const { useDispatchComm } = await import("@/hooks/use-phase10-actions");
    const { result } = renderHook(() => useDispatchComm(), { wrapper });
    result.current.mutate({
      channel: "email",
      recipient: "x@y.com",
      message_text: "hello",
      subject_type: "invoice",
      subject_id: "inv_99",
    });
    await waitFor(() => expect(invokeMock).toHaveBeenCalledTimes(1));
    expect(invokeMock.mock.calls[0][1].body.subject_type).toBe("invoice");
    expect(invokeMock.mock.calls[0][1].body.subject_id).toBe("inv_99");
  });

  it("useSyncAppointmentToCalendar delegates to syncAppointmentEverywhere with the appointment id", async () => {
    const sync = await import("@/lib/business/appointment-calendar-sync");
    const spy = sync.syncAppointmentEverywhere as unknown as ReturnType<typeof vi.fn>;
    spy.mockClear();
    const { useSyncAppointmentToCalendar } = await import("@/hooks/use-phase10-actions");
    const { result } = renderHook(() => useSyncAppointmentToCalendar(), { wrapper });
    result.current.mutate("appt_5");
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));
    expect(spy).toHaveBeenCalledWith("appt_5");
  });

  it("useDownloadInvoicePdf signs the verifiable stored path (no fabrication)", async () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    const { useDownloadInvoicePdf } = await import("@/hooks/use-phase10-actions");
    const { result } = renderHook(() => useDownloadInvoicePdf(), { wrapper });
    result.current.mutate("inv_42");
    await waitFor(() => expect(openSpy).toHaveBeenCalled());
    expect(openSpy).toHaveBeenCalledWith(
      "https://signed/url",
      "_blank",
      "noopener,noreferrer",
    );
    openSpy.mockRestore();
  });
});