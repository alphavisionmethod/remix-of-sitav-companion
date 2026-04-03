// ═══════════════════════════════════════════════════════════════
// SITA OS — Gmail Connector
// ═══════════════════════════════════════════════════════════════

export interface GmailCapabilities {
  send: (params: { to: string; subject: string; body: string; cc?: string[]; attachments?: string[] }) => GmailResult;
  read: (params: { query?: string; maxResults?: number; labelIds?: string[] }) => GmailResult;
  label: (params: { messageId: string; addLabels: string[]; removeLabels?: string[] }) => GmailResult;
}

export interface GmailResult { success: boolean; data?: Record<string, unknown>; error?: string }

export function createGmailConnector(): GmailCapabilities {
  return {
    send: (params) => ({ success: true, data: { messageId: crypto.randomUUID(), to: params.to, subject: params.subject, sentAt: new Date().toISOString() } }),
    read: (params) => ({ success: true, data: { messages: [{ id: "msg-1", subject: "Re: Proposal", from: "client@example.com", date: new Date().toISOString(), snippet: "Looks great..." }], resultCount: 1, query: params.query || "inbox" } }),
    label: (params) => ({ success: true, data: { messageId: params.messageId, labelsApplied: params.addLabels } }),
  };
}
