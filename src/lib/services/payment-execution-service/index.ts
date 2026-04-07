// SITA OS — Payment Execution Service
import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export interface PaymentRequest { id: string; amount: number; currency: string; method: string; recipientId: string; status: 'pending' | 'processing' | 'completed' | 'failed'; createdAt: string; completedAt?: string; reference?: string; }
export class PaymentExecutionService {
  private payments: PaymentRequest[] = [];
  private counter = 0;
  initiate(amount: number, currency: string, method: string, recipientId: string): PaymentRequest { const p: PaymentRequest = { id: `pay-${++this.counter}`, amount, currency, method, recipientId, status: 'pending', createdAt: new Date().toISOString() }; this.payments.push(p); return p; }
  process(id: string): boolean { const p = this.payments.find(x => x.id === id); if (p && p.status === 'pending') { p.status = 'processing'; return true; } return false; }
  complete(id: string, reference: string): boolean { const p = this.payments.find(x => x.id === id); if (p) { p.status = 'completed'; p.completedAt = new Date().toISOString(); p.reference = reference; return true; } return false; }
  fail(id: string): boolean { const p = this.payments.find(x => x.id === id); if (p) { p.status = 'failed'; return true; } return false; }
  getPayment(id: string): PaymentRequest | undefined { return this.payments.find(p => p.id === id); }
  listPayments(status?: string): PaymentRequest[] { return status ? this.payments.filter(p => p.status === status) : [...this.payments]; }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("payment-execution-service", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      payments: this.payments,
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.payments) this.payments = state.payments as never;
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("payment-execution-service");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}
export const createPaymentExecution = () => new PaymentExecutionService();

