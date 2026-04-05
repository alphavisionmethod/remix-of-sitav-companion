// SITA OS — Self Healing Service
export interface HealingAction { id: string; trigger: string; action: string; status: 'detected' | 'healing' | 'healed' | 'failed'; detectedAt: string; healedAt?: string; }
export class SelfHealingService {
  private actions: HealingAction[] = [];
  private counter = 0;
  detect(trigger: string, action: string): HealingAction { const h: HealingAction = { id: `heal-${++this.counter}`, trigger, action, status: 'detected', detectedAt: new Date().toISOString() }; this.actions.push(h); return h; }
  startHealing(id: string): void { const a = this.actions.find(x => x.id === id); if (a) a.status = 'healing'; }
  markHealed(id: string): void { const a = this.actions.find(x => x.id === id); if (a) { a.status = 'healed'; a.healedAt = new Date().toISOString(); } }
  markFailed(id: string): void { const a = this.actions.find(x => x.id === id); if (a) a.status = 'failed'; }
  getActive(): HealingAction[] { return this.actions.filter(a => a.status === 'detected' || a.status === 'healing'); }
  getHistory(): HealingAction[] { return [...this.actions]; }
  getStats(): { total: number; healed: number; failed: number; active: number } { return { total: this.actions.length, healed: this.actions.filter(a => a.status === 'healed').length, failed: this.actions.filter(a => a.status === 'failed').length, active: this.getActive().length }; }
}
export const createSelfHealing = () => new SelfHealingService();
