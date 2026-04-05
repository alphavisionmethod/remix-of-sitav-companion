// SITA OS — File Ingestion (merge: connector-control-plane)
export interface IngestedFile { id: string; filename: string; mimeType: string; sizeBytes: number; status: 'pending' | 'processing' | 'classified' | 'failed'; classification?: string; extractedData?: Record<string, unknown>; ingestedAt: string; }
export class FileIngestionService {
  private files: IngestedFile[] = [];
  private counter = 0;
  ingest(filename: string, mimeType: string, sizeBytes: number): IngestedFile { const f: IngestedFile = { id: `file-${++this.counter}`, filename, mimeType, sizeBytes, status: 'pending', ingestedAt: new Date().toISOString() }; this.files.push(f); return f; }
  classify(id: string, classification: string, data?: Record<string, unknown>): boolean { const f = this.files.find(x => x.id === id); if (!f) return false; f.classification = classification; f.extractedData = data; f.status = 'classified'; return true; }
  getFile(id: string): IngestedFile | undefined { return this.files.find(f => f.id === id); }
  listFiles(status?: string): IngestedFile[] { return status ? this.files.filter(f => f.status === status) : [...this.files]; }
  getStats() { return { total: this.files.length, byStatus: this.files.reduce((a, f) => { a[f.status] = (a[f.status] || 0) + 1; return a; }, {} as Record<string, number>) }; }
}
export const createFileIngestion = () => new FileIngestionService();
