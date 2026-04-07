// SITA OS — File Ingestion (merge: connector-control-plane)
import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export interface IngestedFile { id: string; filename: string; mimeType: string; sizeBytes: number; status: 'pending' | 'processing' | 'classified' | 'failed'; classification?: string; extractedData?: Record<string, unknown>; ingestedAt: string; }
export class FileIngestionService {
  private files: IngestedFile[] = [];
  private counter = 0;
  ingest(filename: string, mimeType: string, sizeBytes: number): IngestedFile { const f: IngestedFile = { id: `file-${++this.counter}`, filename, mimeType, sizeBytes, status: 'pending', ingestedAt: new Date().toISOString() }; this.files.push(f); return f; }
  classify(id: string, classification: string, data?: Record<string, unknown>): boolean { const f = this.files.find(x => x.id === id); if (!f) return false; f.classification = classification; f.extractedData = data; f.status = 'classified'; return true; }
  getFile(id: string): IngestedFile | undefined { return this.files.find(f => f.id === id); }
  listFiles(status?: string): IngestedFile[] { return status ? this.files.filter(f => f.status === status) : [...this.files]; }
  getStats() { return { total: this.files.length, byStatus: this.files.reduce((a, f) => { a[f.status] = (a[f.status] || 0) + 1; return a; }, {} as Record<string, number>) }; }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("file-ingestion", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      files: this.files,
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.files) this.files = state.files as never;
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("file-ingestion");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}
export const createFileIngestion = () => new FileIngestionService();

