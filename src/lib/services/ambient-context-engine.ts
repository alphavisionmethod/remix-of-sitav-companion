// ═══════════════════════════════════════════════════════════════
// SITA OS — Ambient Context Engine v2
// Event-driven clipboard, form tracking, selection tracking,
// activity summary, related files, proactive intelligence
// ═══════════════════════════════════════════════════════════════

export type SuggestionType =
  | "related_entity"
  | "clipboard_action"
  | "continue_workflow"
  | "predicted_next"
  | "recent_coaccessed"
  | "time_pattern"
  | "context_restore"
  | "selection_action";

export interface AmbientSuggestion {
  id: string;
  type: SuggestionType;
  title: string;
  subtitle?: string;
  icon: string;
  relevance: number; // 0-1
  action: string;
  metadata?: Record<string, unknown>;
  createdAt: number;
  expiresAt?: number;
}

export interface ActivityNode {
  id: string;
  type: "page" | "entity" | "file" | "person" | "action";
  label: string;
  path?: string;
  lastAccessed: number;
  accessCount: number;
  dwellMs: number;
  coAccessedWith: string[];
}

export interface ClipboardEntry {
  content: string;
  type: "text" | "url" | "email" | "number" | "json" | "unknown";
  timestamp: number;
  source?: string;
}

export interface ContextSnapshot {
  path: string;
  scrollY: number;
  formData?: Record<string, string>;
  selection?: string;
  timestamp: number;
  windowId?: string;
}

export interface ActivitySummary {
  currentFocus: string;
  durationMinutes: number;
  recentPages: { label: string; path: string; dwellMs: number }[];
  topEntities: { label: string; accessCount: number }[];
  sessionDepth: number;
}

// ── Clipboard Content Classifier ─────────────────────────────

function classifyClipboard(text: string): ClipboardEntry["type"] {
  if (!text || text.length === 0) return "unknown";
  const trimmed = text.trim();
  if (/^https?:\/\//.test(trimmed)) return "url";
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "email";
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return "number";
  try { JSON.parse(trimmed); return "json"; } catch {}
  return "text";
}

// ── Clipboard Action Suggestions ─────────────────────────────

function clipboardSuggestions(entry: ClipboardEntry): AmbientSuggestion[] {
  const suggestions: AmbientSuggestion[] = [];
  const base = { createdAt: Date.now(), expiresAt: Date.now() + 60_000 };

  switch (entry.type) {
    case "url":
      suggestions.push({
        ...base, id: `clip-open-${entry.timestamp}`, type: "clipboard_action",
        title: "Open copied URL", subtitle: entry.content.slice(0, 60),
        icon: "🔗", relevance: 0.9, action: `open_url:${entry.content}`,
      });
      suggestions.push({
        ...base, id: `clip-share-${entry.timestamp}`, type: "clipboard_action",
        title: "Share link", subtitle: "Send to someone",
        icon: "📤", relevance: 0.7, action: `share:${entry.content}`,
      });
      break;
    case "email":
      suggestions.push({
        ...base, id: `clip-email-${entry.timestamp}`, type: "clipboard_action",
        title: "Compose email", subtitle: `To: ${entry.content}`,
        icon: "✉️", relevance: 0.85, action: `email:${entry.content}`,
      });
      suggestions.push({
        ...base, id: `clip-lookup-${entry.timestamp}`, type: "clipboard_action",
        title: "Look up contact", subtitle: entry.content,
        icon: "👤", relevance: 0.7, action: `lookup:${entry.content}`,
      });
      break;
    case "number":
      suggestions.push({
        ...base, id: `clip-calc-${entry.timestamp}`, type: "clipboard_action",
        title: "Use in calculation", subtitle: `Value: ${entry.content}`,
        icon: "🔢", relevance: 0.6, action: `calculate:${entry.content}`,
      });
      break;
    case "text":
      if (entry.content.length > 20) {
        suggestions.push({
          ...base, id: `clip-note-${entry.timestamp}`, type: "clipboard_action",
          title: "Save as note", subtitle: entry.content.slice(0, 50) + "…",
          icon: "📝", relevance: 0.65, action: `save_note:${entry.content.slice(0, 200)}`,
        });
      }
      suggestions.push({
        ...base, id: `clip-search-${entry.timestamp}`, type: "clipboard_action",
        title: "Search for this", subtitle: entry.content.slice(0, 40),
        icon: "🔍", relevance: 0.5, action: `search:${entry.content}`,
      });
      break;
  }
  return suggestions;
}

// ── Time Pattern Detector ─────────────────────────────────────

interface TimePattern {
  hour: number;
  dayOfWeek: number;
  frequentPages: string[];
}

function detectTimePatterns(nodes: ActivityNode[]): TimePattern[] {
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay();

  const recentNodes = nodes
    .filter(n => n.type === "page" && n.accessCount >= 2)
    .sort((a, b) => b.accessCount - a.accessCount)
    .slice(0, 5);

  if (recentNodes.length === 0) return [];

  return [{
    hour,
    dayOfWeek,
    frequentPages: recentNodes.map(n => n.path || n.id),
  }];
}

// ── Relation Graph ────────────────────────────────────────────

function inferRelations(
  currentNodeId: string,
  nodes: Map<string, ActivityNode>
): ActivityNode[] {
  const current = nodes.get(currentNodeId);
  if (!current) return [];

  const related = new Map<string, number>();
  for (const coId of current.coAccessedWith) {
    related.set(coId, (related.get(coId) || 0) + 1);
  }

  for (const [id, node] of nodes) {
    if (id === currentNodeId) continue;
    if (node.coAccessedWith.includes(currentNodeId)) {
      related.set(id, (related.get(id) || 0) + 1);
    }
  }

  return Array.from(related.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([id]) => nodes.get(id)!)
    .filter(Boolean);
}

// ── Ambient Context Engine (Singleton) ────────────────────────

const STORAGE_KEY = "sita-ambient-context";
const MAX_NODES = 200;
const MAX_SUGGESTIONS = 8;
const SESSION_WINDOW_MS = 30 * 60 * 1000;

class AmbientContextEngine {
  private nodes: Map<string, ActivityNode> = new Map();
  private clipboard: ClipboardEntry[] = [];
  private contextSnapshots: Map<string, ContextSnapshot> = new Map();
  private formStates: Map<string, Record<string, string>> = new Map();
  private lastSelection: { path: string; text: string; timestamp: number } | null = null;
  private suggestions: AmbientSuggestion[] = [];
  private listeners: Set<(suggestions: AmbientSuggestion[]) => void> = new Set();
  private sessionNodes: string[] = [];
  private sessionStartTime = Date.now();
  private initialized = false;

  // ── Init ──────────────────────────────────────────────────

  init() {
    if (this.initialized) return;
    this.initialized = true;
    this.sessionStartTime = Date.now();
    this.loadFromStorage();
    // No more clipboard polling — we use event-driven trackClipboardEvent()
  }

  private loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.nodes) {
        for (const [id, node] of Object.entries(data.nodes)) {
          this.nodes.set(id, node as ActivityNode);
        }
      }
      const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
      for (const [id, node] of this.nodes) {
        if (node.lastAccessed < cutoff) this.nodes.delete(id);
      }
      if (this.nodes.size > MAX_NODES) {
        const sorted = [...this.nodes.entries()].sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
        for (let i = 0; i < sorted.length - MAX_NODES; i++) {
          this.nodes.delete(sorted[i][0]);
        }
      }
    } catch { }
  }

  private saveToStorage() {
    try {
      const obj: Record<string, ActivityNode> = {};
      for (const [id, node] of this.nodes) obj[id] = node;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes: obj }));
    } catch { }
  }

  destroy() {
    this.saveToStorage();
  }

  // ── Event-Driven Clipboard ─────────────────────────────────

  trackClipboardEvent(text: string, source?: string) {
    if (!text || text.length === 0 || text.length > 2000) return;
    const entry: ClipboardEntry = {
      content: text,
      type: classifyClipboard(text),
      timestamp: Date.now(),
      source: source || window.location.pathname,
    };
    this.clipboard.unshift(entry);
    if (this.clipboard.length > 20) this.clipboard.pop();

    const clipSuggestions = clipboardSuggestions(entry);
    this.addSuggestions(clipSuggestions);
  }

  getLastClipboard(): ClipboardEntry | null {
    return this.clipboard[0] || null;
  }

  // ── Form State Tracking ────────────────────────────────────

  trackFormField(path: string, fieldName: string, value: string) {
    const existing = this.formStates.get(path) || {};
    existing[fieldName] = value;
    this.formStates.set(path, existing);

    // Also update context snapshot
    const snap = this.contextSnapshots.get(path);
    if (snap) {
      snap.formData = existing;
    }
  }

  getFormState(path: string): Record<string, string> | null {
    return this.formStates.get(path) || null;
  }

  // ── Selection Tracking ─────────────────────────────────────

  trackSelection(path: string, selectedText: string) {
    if (!selectedText || selectedText.length < 3) return;
    this.lastSelection = { path, text: selectedText, timestamp: Date.now() };

    // Generate search suggestion for selection
    if (selectedText.length >= 5 && selectedText.length < 200) {
      this.addSuggestions([{
        id: `sel-search-${Date.now()}`,
        type: "selection_action",
        title: `Search for "${selectedText.slice(0, 40)}"`,
        subtitle: "Search selected text",
        icon: "🔍",
        relevance: 0.7,
        action: `search:${selectedText}`,
        createdAt: Date.now(),
        expiresAt: Date.now() + 30_000,
      }]);
    }
  }

  // ── Activity Summary ───────────────────────────────────────

  getActivitySummary(): ActivitySummary {
    const now = Date.now();
    const durationMinutes = Math.round((now - this.sessionStartTime) / 60_000);

    // Current focus = most recent page
    const currentPageId = this.sessionNodes[this.sessionNodes.length - 1] || "";
    const currentNode = this.nodes.get(currentPageId);
    const currentFocus = currentNode?.label || "Desktop";

    // Recent pages sorted by last access
    const recentPages = [...this.nodes.values()]
      .filter(n => n.type === "page")
      .sort((a, b) => b.lastAccessed - a.lastAccessed)
      .slice(0, 5)
      .map(n => ({ label: n.label, path: n.path || "", dwellMs: n.dwellMs }));

    // Top entities
    const topEntities = [...this.nodes.values()]
      .filter(n => n.type === "entity")
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, 5)
      .map(n => ({ label: n.label, accessCount: n.accessCount }));

    return {
      currentFocus,
      durationMinutes,
      recentPages,
      topEntities,
      sessionDepth: this.sessionNodes.length,
    };
  }

  // ── Related Files / Co-Accessed Pages ──────────────────────

  getRelatedFiles(path: string): { label: string; path: string; accessCount: number }[] {
    const nodeId = `page:${path}`;
    const related = inferRelations(nodeId, this.nodes);
    return related
      .filter(n => n.type === "page" && n.path)
      .map(n => ({ label: n.label, path: n.path!, accessCount: n.accessCount }));
  }

  // ── Activity Tracking ──────────────────────────────────────

  trackPageVisit(path: string, label?: string) {
    const id = `page:${path}`;
    const existing = this.nodes.get(id);
    const now = Date.now();

    if (existing) {
      existing.lastAccessed = now;
      existing.accessCount++;
      if (label) existing.label = label;
    } else {
      this.nodes.set(id, {
        id, type: "page", label: label || path,
        path, lastAccessed: now, accessCount: 1,
        dwellMs: 0, coAccessedWith: [],
      });
    }

    for (const prevId of this.sessionNodes.slice(-5)) {
      if (prevId === id) continue;
      const prevNode = this.nodes.get(prevId);
      if (prevNode && !prevNode.coAccessedWith.includes(id)) {
        prevNode.coAccessedWith.push(id);
        if (prevNode.coAccessedWith.length > 20) prevNode.coAccessedWith.shift();
      }
      const curNode = this.nodes.get(id)!;
      if (!curNode.coAccessedWith.includes(prevId)) {
        curNode.coAccessedWith.push(prevId);
        if (curNode.coAccessedWith.length > 20) curNode.coAccessedWith.shift();
      }
    }

    this.sessionNodes.push(id);
    if (this.sessionNodes.length > 50) this.sessionNodes.shift();

    this.regenerateSuggestions(id);
    this.saveToStorage();
  }

  trackDwell(path: string, dwellMs: number) {
    const id = `page:${path}`;
    const node = this.nodes.get(id);
    if (node) {
      node.dwellMs += dwellMs;
    }
  }

  trackEntity(entityId: string, entityType: string, label: string) {
    const id = `entity:${entityType}:${entityId}`;
    const existing = this.nodes.get(id);
    const now = Date.now();

    if (existing) {
      existing.lastAccessed = now;
      existing.accessCount++;
    } else {
      this.nodes.set(id, {
        id, type: "entity", label,
        lastAccessed: now, accessCount: 1,
        dwellMs: 0, coAccessedWith: [],
      });
    }

    const currentPage = this.sessionNodes[this.sessionNodes.length - 1];
    if (currentPage && currentPage !== id) {
      const pageNode = this.nodes.get(currentPage);
      if (pageNode && !pageNode.coAccessedWith.includes(id)) {
        pageNode.coAccessedWith.push(id);
      }
      const entityNode = this.nodes.get(id)!;
      if (!entityNode.coAccessedWith.includes(currentPage)) {
        entityNode.coAccessedWith.push(currentPage);
      }
    }

    this.saveToStorage();
  }

  // ── Context Snapshot / Restore ─────────────────────────────

  saveContext(path: string, snapshot: Omit<ContextSnapshot, "path" | "timestamp">) {
    const formData = this.formStates.get(path);
    this.contextSnapshots.set(path, {
      ...snapshot,
      path,
      timestamp: Date.now(),
      formData: formData || snapshot.formData,
      selection: this.lastSelection?.path === path ? this.lastSelection.text : snapshot.selection,
    });
  }

  getContext(path: string): ContextSnapshot | null {
    const snap = this.contextSnapshots.get(path);
    if (!snap) return null;
    if (Date.now() - snap.timestamp > SESSION_WINDOW_MS) {
      this.contextSnapshots.delete(path);
      return null;
    }
    return snap;
  }

  // ── Suggestion Generation ─────────────────────────────────

  private regenerateSuggestions(currentNodeId?: string) {
    const newSuggestions: AmbientSuggestion[] = [];
    const now = Date.now();

    // 1. Related entities (co-accessed)
    if (currentNodeId) {
      const related = inferRelations(currentNodeId, this.nodes);
      for (const node of related.slice(0, 3)) {
        newSuggestions.push({
          id: `related-${node.id}`, type: "related_entity",
          title: node.label,
          subtitle: `Accessed ${node.accessCount} times`,
          icon: node.type === "page" ? "📄" : node.type === "entity" ? "🔗" : "📁",
          relevance: Math.min(1, 0.5 + node.accessCount * 0.05),
          action: node.path ? `navigate:${node.path}` : `view:${node.id}`,
          createdAt: now,
        });
      }
    }

    // 2. Context restoration suggestions
    for (const [path, snap] of this.contextSnapshots) {
      if (path === window.location.pathname) continue;
      if (now - snap.timestamp > SESSION_WINDOW_MS) continue;
      const pageNode = this.nodes.get(`page:${path}`);
      if (pageNode && pageNode.dwellMs > 10_000) {
        const hasFormData = snap.formData && Object.keys(snap.formData).length > 0;
        newSuggestions.push({
          id: `restore-${path}`, type: "context_restore",
          title: `Continue: ${pageNode.label}`,
          subtitle: hasFormData ? "Resume with unsaved form data" : "Resume where you left off",
          icon: "🔄", relevance: hasFormData ? 0.95 : 0.85,
          action: `restore:${path}`,
          createdAt: now, expiresAt: now + SESSION_WINDOW_MS,
        });
      }
    }

    // 3. Time-based patterns
    const patterns = detectTimePatterns([...this.nodes.values()]);
    for (const pattern of patterns) {
      for (const pagePath of pattern.frequentPages.slice(0, 2)) {
        const node = this.nodes.get(`page:${pagePath}`);
        if (!node || pagePath === window.location.pathname) continue;
        newSuggestions.push({
          id: `time-${pagePath}`, type: "time_pattern",
          title: node.label,
          subtitle: "Usually visited around now",
          icon: "⏰", relevance: 0.6,
          action: `navigate:${pagePath}`,
          createdAt: now,
        });
      }
    }

    // 4. Predicted next
    if (currentNodeId) {
      const current = this.nodes.get(currentNodeId);
      if (current) {
        const transitionCounts = new Map<string, number>();
        for (const coId of current.coAccessedWith) {
          transitionCounts.set(coId, (transitionCounts.get(coId) || 0) + 1);
        }
        const topTransition = [...transitionCounts.entries()]
          .sort((a, b) => b[1] - a[1])[0];
        if (topTransition && topTransition[1] >= 2) {
          const nextNode = this.nodes.get(topTransition[0]);
          if (nextNode && nextNode.path) {
            newSuggestions.push({
              id: `predict-${nextNode.id}`, type: "predicted_next",
              title: `Next: ${nextNode.label}`,
              subtitle: "You usually go here next",
              icon: "🎯", relevance: 0.75,
              action: `navigate:${nextNode.path}`,
              createdAt: now,
            });
          }
        }
      }
    }

    // Keep clipboard + selection suggestions that haven't expired
    const existingEphemeral = this.suggestions.filter(
      s => (s.type === "clipboard_action" || s.type === "selection_action") &&
           (!s.expiresAt || s.expiresAt > now)
    );
    newSuggestions.push(...existingEphemeral);

    this.suggestions = newSuggestions
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, MAX_SUGGESTIONS);

    this.notify();
  }

  private addSuggestions(items: AmbientSuggestion[]) {
    const map = new Map(this.suggestions.map(s => [s.id, s]));
    for (const item of items) map.set(item.id, item);

    const now = Date.now();
    this.suggestions = [...map.values()]
      .filter(s => !s.expiresAt || s.expiresAt > now)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, MAX_SUGGESTIONS);

    this.notify();
  }

  // ── Subscription ──────────────────────────────────────────

  subscribe(listener: (suggestions: AmbientSuggestion[]) => void) {
    this.listeners.add(listener);
    listener(this.suggestions);
    return () => { this.listeners.delete(listener); };
  }

  private notify() {
    for (const fn of this.listeners) fn(this.suggestions);
  }

  getSuggestions(): AmbientSuggestion[] {
    return this.suggestions;
  }

  dismissSuggestion(id: string) {
    this.suggestions = this.suggestions.filter(s => s.id !== id);
    this.notify();
  }

  acceptSuggestion(id: string) {
    const suggestion = this.suggestions.find(s => s.id === id);
    if (suggestion) {
      const nodeId = suggestion.action.split(":").slice(1).join(":");
      const node = this.nodes.get(nodeId) || this.nodes.get(`page:${nodeId}`);
      if (node) node.accessCount += 2;
    }
    this.suggestions = this.suggestions.filter(s => s.id !== id);
    this.notify();
  }

  // ── Stats ─────────────────────────────────────────────────

  getStats() {
    return {
      totalNodes: this.nodes.size,
      totalSuggestions: this.suggestions.length,
      clipboardEntries: this.clipboard.length,
      contextSnapshots: this.contextSnapshots.size,
      sessionDepth: this.sessionNodes.length,
      formStates: this.formStates.size,
    };
  }
}

// Singleton export
export const ambientContext = new AmbientContextEngine();
