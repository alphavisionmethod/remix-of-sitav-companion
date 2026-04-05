// SITA OS — Payment Execution Service
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
}
export const createPaymentExecution = () => new PaymentExecutionService();
