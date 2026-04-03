// SITA OS — Banking Connector (Plaid)
export interface BankingCapabilities {
  getAccounts: () => ConnectorResult;
  getTransactions: (params: { accountId: string; startDate: string; endDate: string }) => ConnectorResult;
  getBalance: (accountId: string) => ConnectorResult;
  initiateTransfer: (params: { fromAccount: string; toAccount: string; amountCents: number; memo?: string }) => ConnectorResult;
}
interface ConnectorResult { success: boolean; data?: Record<string, unknown>; error?: string }

export function createBankingConnector(): BankingCapabilities {
  return {
    getAccounts: () => ({ success: true, data: { accounts: [{ id: "ba-1", name: "Business Checking", balanceCents: 14500000, type: "checking" }, { id: "ba-2", name: "Savings", balanceCents: 8700000, type: "savings" }] } }),
    getTransactions: (p) => ({ success: true, data: { accountId: p.accountId, transactions: [{ id: "txn-1", amountCents: -250000, description: "Office Supplies", date: new Date().toISOString(), category: "office" }], count: 1 } }),
    getBalance: (accountId) => ({ success: true, data: { accountId, balanceCents: 14500000, asOf: new Date().toISOString() } }),
    initiateTransfer: (p) => ({ success: true, data: { transferId: crypto.randomUUID(), ...p, status: "pending", initiatedAt: new Date().toISOString() } }),
  };
}
