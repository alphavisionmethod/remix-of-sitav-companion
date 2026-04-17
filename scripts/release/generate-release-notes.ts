#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Generate Release Notes
// Reads git log between the last two tags (or HEAD) and emits
//   - generated/RELEASE_NOTES.md
//   - generated/release-notes.json
// ═══════════════════════════════════════════════════════════════
import * as fs from "fs";
import { execSync } from "child_process";

function safeExec(cmd: string): string {
  try {
    return execSync(cmd, { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return "";
  }
}

const lastTag = safeExec("git describe --tags --abbrev=0");
const prevTag = lastTag ? safeExec(`git describe --tags --abbrev=0 ${lastTag}^`) : "";
const range = prevTag && lastTag ? `${prevTag}..${lastTag}` : "HEAD~50..HEAD";

const log = safeExec(`git log ${range} --pretty=format:"%H|%h|%an|%ae|%ad|%s" --date=iso`);
const lines = log.split("\n").filter(Boolean);

interface Commit {
  sha: string;
  short: string;
  author: string;
  email: string;
  date: string;
  subject: string;
  category: string;
}

function categorize(subject: string): string {
  const s = subject.toLowerCase();
  if (s.startsWith("feat") || s.includes("✨")) return "feature";
  if (s.startsWith("fix") || s.includes("🐛")) return "fix";
  if (s.startsWith("docs")) return "docs";
  if (s.startsWith("chore") || s.startsWith("refactor")) return "chore";
  if (s.startsWith("test")) return "test";
  if (s.startsWith("perf")) return "perf";
  if (s.startsWith("security") || s.includes("🔒")) return "security";
  return "other";
}

const commits: Commit[] = lines.map((line) => {
  const [sha, short, author, email, date, ...rest] = line.split("|");
  const subject = rest.join("|");
  return { sha, short, author, email, date, subject, category: categorize(subject) };
});

const groups: Record<string, Commit[]> = {};
for (const c of commits) {
  (groups[c.category] ||= []).push(c);
}

const headTag = lastTag || "HEAD";
const generatedAt = new Date().toISOString();
const json = {
  version: "1.0.0",
  generatedAt,
  range,
  fromTag: prevTag || null,
  toTag: lastTag || "HEAD",
  totalCommits: commits.length,
  byCategory: Object.fromEntries(Object.entries(groups).map(([k, v]) => [k, v.length])),
  commits,
};

fs.mkdirSync("generated", { recursive: true });
fs.writeFileSync("generated/release-notes.json", JSON.stringify(json, null, 2));

const order = ["feature", "fix", "security", "perf", "test", "docs", "chore", "other"];
const titleMap: Record<string, string> = {
  feature: "✨ Features",
  fix: "🐛 Fixes",
  security: "🔒 Security",
  perf: "⚡ Performance",
  test: "🧪 Tests",
  docs: "📝 Documentation",
  chore: "🔧 Chores",
  other: "📦 Other",
};

let md = `# SITA OS — Release Notes\n\n`;
md += `**Tag:** \`${headTag}\`  \n`;
md += `**Range:** \`${range}\`  \n`;
md += `**Generated:** ${generatedAt}  \n`;
md += `**Total commits:** ${commits.length}\n\n`;

for (const cat of order) {
  const list = groups[cat];
  if (!list || list.length === 0) continue;
  md += `## ${titleMap[cat]} (${list.length})\n\n`;
  for (const c of list) {
    md += `- \`${c.short}\` ${c.subject} — _${c.author}_\n`;
  }
  md += `\n`;
}

if (commits.length === 0) {
  md += `_No commits in range. (Likely no git history available in this environment.)_\n`;
}

fs.writeFileSync("generated/RELEASE_NOTES.md", md);
console.log(`✅ generate-release-notes: ${commits.length} commits → generated/RELEASE_NOTES.md`);
