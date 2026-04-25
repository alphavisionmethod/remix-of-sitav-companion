// Parses /remember slash commands from chat input.
// Forms supported:
//   /remember I prefer concise answers
//   /remember [category] content text
//   /remember category=preference content here
// Returns null if it's not a /remember command.

export interface RememberCommand {
  category: string;
  content: string;
}

const VALID_CATEGORIES = new Set([
  "style", "format", "interest", "skill", "project",
  "pain_point", "goal", "work_context", "preference", "general",
]);

export function parseRememberCommand(raw: string): RememberCommand | null {
  const trimmed = raw.trim();
  if (!/^\/remember(\s|$)/i.test(trimmed)) return null;
  const body = trimmed.replace(/^\/remember\s*/i, "").trim();
  if (!body) return null;

  // Form: [category] rest
  const bracket = body.match(/^\[([a-z_]+)\]\s*(.+)$/i);
  if (bracket) {
    const cat = bracket[1].toLowerCase();
    const content = bracket[2].trim();
    if (content) return { category: VALID_CATEGORIES.has(cat) ? cat : "general", content };
  }

  // Form: category=preference rest
  const kv = body.match(/^category=([a-z_]+)\s+(.+)$/i);
  if (kv) {
    const cat = kv[1].toLowerCase();
    const content = kv[2].trim();
    if (content) return { category: VALID_CATEGORIES.has(cat) ? cat : "general", content };
  }

  // Default — heuristic category from leading keyword
  const lower = body.toLowerCase();
  let category = "general";
  if (lower.startsWith("i prefer ") || lower.startsWith("i like ") || lower.startsWith("don't ") || lower.startsWith("never ")) category = "preference";
  else if (lower.startsWith("i'm building ") || lower.startsWith("project:")) category = "project";
  else if (lower.startsWith("i want to ") || lower.startsWith("my goal ")) category = "goal";
  else if (lower.startsWith("i work as ") || lower.startsWith("i'm a ")) category = "work_context";

  return { category, content: body };
}
