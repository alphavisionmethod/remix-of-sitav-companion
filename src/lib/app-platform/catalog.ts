// ═══════════════════════════════════════════════════════════════
// SITA OS — Application Platform Mock Catalog
// 35+ apps across all categories
// ═══════════════════════════════════════════════════════════════

import type { AppDefinition, AppBundle, AppCategory } from "./types";

const defaultPerms = (domains: string[]): AppDefinition["permissions"] =>
  domains.map(d => ({
    id: d, domain: d, label: d.charAt(0).toUpperCase() + d.slice(1),
    description: `Access to ${d}`, granted: false, required: false, riskLevel: "low" as const,
  }));

export const APP_CATALOG: AppDefinition[] = [
  // ── Browsers ──
  {
    id: "chrome", name: "Google Chrome", publisher: "Google LLC", icon: "🌐", iconBg: "from-blue-500 to-red-400",
    category: "browsers", appClass: "native", trustLevel: "sita-verified", version: "124.0.6367", size: "320 MB",
    shortDescription: "Fast, secure browser by Google", fullDescription: "Google Chrome is a fast, secure, and free web browser built for the modern web. Chrome syncs across all your devices, fills in passwords automatically, and adapts to how you browse.",
    whySitaRecommends: "Best compatibility with modern web services and developer tools.",
    screenshots: [], rating: 4.7, downloads: 2_500_000, lastUpdated: "2026-03-28",
    releaseNotes: ["Performance improvements", "New AI-powered search features", "Security patches"],
    permissions: [...defaultPerms(["downloads", "notifications", "clipboard"]), { id: "camera", domain: "camera", label: "Camera", description: "For video calls and scanning", granted: false, required: false, riskLevel: "medium" }],
    fileAssociations: [{ extension: ".html", mimeType: "text/html", label: "HTML files", isDefault: true }, { extension: ".svg", mimeType: "image/svg+xml", label: "SVG files", isDefault: false }],
    protocolAssociations: [{ protocol: "http", label: "Web pages", isDefault: true }, { protocol: "https", label: "Secure web pages", isDefault: true }],
    worksWithSita: ["Dock integration", "Shell notifications", "Default browser support", "Protocol handling", "Deep link opening"],
    updateSource: "store-managed", startupBehavior: "none", notificationPermission: true,
    installStatus: "not-installed", pinnedToDock: false, featured: true, tags: ["browser", "web", "google"],
    receipts: [],
  },
  {
    id: "firefox", name: "Mozilla Firefox", publisher: "Mozilla Foundation", icon: "🦊", iconBg: "from-orange-500 to-red-500",
    category: "browsers", appClass: "native", trustLevel: "sita-verified", version: "126.0", size: "280 MB",
    shortDescription: "Privacy-focused open source browser", fullDescription: "Firefox is a free and open-source web browser developed by Mozilla. Known for strong privacy protections, enhanced tracking prevention, and a vast extension ecosystem.",
    whySitaRecommends: "Best privacy-first browser with enhanced tracking protection.",
    screenshots: [], rating: 4.6, downloads: 1_800_000, lastUpdated: "2026-03-25",
    releaseNotes: ["Enhanced tracking protection v3", "Faster JavaScript engine", "Container tab improvements"],
    permissions: defaultPerms(["downloads", "notifications"]),
    fileAssociations: [{ extension: ".html", mimeType: "text/html", label: "HTML files", isDefault: false }],
    protocolAssociations: [{ protocol: "http", label: "Web pages", isDefault: false }, { protocol: "https", label: "Secure web pages", isDefault: false }],
    worksWithSita: ["Dock integration", "Shell notifications", "Default browser support"],
    updateSource: "store-managed", startupBehavior: "none", notificationPermission: true,
    installStatus: "not-installed", pinnedToDock: false, tags: ["browser", "privacy", "mozilla"], receipts: [],
  },

  // ── Communication ──
  {
    id: "whatsapp", name: "WhatsApp", publisher: "Meta Platforms", icon: "💬", iconBg: "from-green-500 to-green-600",
    category: "communication", appClass: "wrapped-app", trustLevel: "sita-verified", version: "2.24.8", size: "85 MB",
    shortDescription: "End-to-end encrypted messaging", fullDescription: "WhatsApp is a free messaging and video calling app used by over 2 billion people worldwide. Features end-to-end encryption, voice and video calls, group chats, and file sharing.",
    screenshots: [], rating: 4.5, downloads: 5_000_000, lastUpdated: "2026-04-01",
    releaseNotes: ["Multi-device support improvements", "New emoji reactions", "Screen sharing in calls"],
    permissions: [...defaultPerms(["notifications", "camera", "microphone"]), { id: "contacts", domain: "contacts", label: "Contacts", description: "To find friends on WhatsApp", granted: false, required: true, riskLevel: "medium" }],
    fileAssociations: [], protocolAssociations: [{ protocol: "whatsapp", label: "WhatsApp links", isDefault: true }],
    worksWithSita: ["Dock integration", "Shell notifications", "Dedicated app window", "Protocol handling"],
    updateSource: "store-managed", startupBehavior: "background", notificationPermission: true,
    installStatus: "not-installed", pinnedToDock: false, featured: true, tags: ["messaging", "chat", "calls"], receipts: [],
  },
  {
    id: "slack", name: "Slack", publisher: "Salesforce", icon: "💼", iconBg: "from-purple-600 to-purple-400",
    category: "communication", appClass: "native", trustLevel: "sita-verified", version: "4.39.0", size: "210 MB",
    shortDescription: "Team communication hub", fullDescription: "Slack brings all your team's communication together, giving everyone a shared workspace where conversations are organized and accessible.",
    screenshots: [], rating: 4.4, downloads: 3_200_000, lastUpdated: "2026-03-30",
    releaseNotes: ["AI conversation summaries", "Improved canvas collaboration", "Performance boost"],
    permissions: defaultPerms(["notifications", "camera", "microphone", "clipboard"]),
    fileAssociations: [], protocolAssociations: [{ protocol: "slack", label: "Slack links", isDefault: true }],
    worksWithSita: ["Dock integration", "Shell notifications", "Startup launch", "Deep link opening"],
    updateSource: "store-managed", startupBehavior: "background", notificationPermission: true,
    installStatus: "not-installed", pinnedToDock: false, tags: ["team", "chat", "workspace"], receipts: [],
  },
  {
    id: "zoom", name: "Zoom", publisher: "Zoom Video Communications", icon: "📹", iconBg: "from-blue-500 to-blue-600",
    category: "communication", appClass: "native", trustLevel: "sita-verified", version: "6.0.1", size: "350 MB",
    shortDescription: "Video meetings and conferencing", fullDescription: "Zoom provides reliable, high-quality video meetings, webinars, and team chat for businesses and individuals. Features include virtual backgrounds, breakout rooms, and meeting recordings.",
    screenshots: [], rating: 4.3, downloads: 4_100_000, lastUpdated: "2026-03-29",
    releaseNotes: ["AI meeting notes", "Improved noise cancellation", "New whiteboard features"],
    permissions: [...defaultPerms(["notifications", "camera", "microphone"]), { id: "calendar", domain: "calendar", label: "Calendar", description: "To schedule and join meetings", granted: false, required: false, riskLevel: "low" }],
    fileAssociations: [], protocolAssociations: [{ protocol: "zoommtg", label: "Zoom meetings", isDefault: true }],
    worksWithSita: ["Dock integration", "Shell notifications", "Calendar integration", "Protocol handling"],
    updateSource: "store-managed", startupBehavior: "none", notificationPermission: true,
    installStatus: "not-installed", pinnedToDock: false, tags: ["video", "meetings", "conferencing"], receipts: [],
  },

  // ── Developer Tools ──
  {
    id: "vscode", name: "Visual Studio Code", publisher: "Microsoft", icon: "💻", iconBg: "from-blue-600 to-blue-500",
    category: "developer-tools", appClass: "native", trustLevel: "sita-verified", version: "1.92.0", size: "380 MB",
    shortDescription: "Powerful code editor", fullDescription: "Visual Studio Code is a lightweight but powerful source code editor available for desktop. It comes with built-in support for JavaScript, TypeScript, and Node.js with a rich ecosystem of extensions.",
    whySitaRecommends: "The most popular code editor with excellent extension support.",
    screenshots: [], rating: 4.9, downloads: 6_000_000, lastUpdated: "2026-04-02",
    releaseNotes: ["Copilot chat improvements", "New terminal features", "Profile sync enhancements"],
    permissions: [...defaultPerms(["files", "clipboard", "notifications"]), { id: "network", domain: "network", label: "Network", description: "For extensions and sync", granted: false, required: true, riskLevel: "low" }],
    fileAssociations: [
      { extension: ".js", mimeType: "text/javascript", label: "JavaScript", isDefault: true },
      { extension: ".ts", mimeType: "text/typescript", label: "TypeScript", isDefault: true },
      { extension: ".py", mimeType: "text/x-python", label: "Python", isDefault: true },
      { extension: ".json", mimeType: "application/json", label: "JSON", isDefault: true },
      { extension: ".md", mimeType: "text/markdown", label: "Markdown", isDefault: false },
    ],
    protocolAssociations: [{ protocol: "vscode", label: "VS Code links", isDefault: true }],
    worksWithSita: ["Dock integration", "Shell notifications", "File associations", "Protocol handling", "Secure file handoff"],
    updateSource: "store-managed", startupBehavior: "none", notificationPermission: true,
    installStatus: "not-installed", pinnedToDock: false, featured: true, tags: ["code", "editor", "development"], receipts: [],
  },
  {
    id: "github-desktop", name: "GitHub Desktop", publisher: "GitHub, Inc.", icon: "🐙", iconBg: "from-gray-800 to-gray-600",
    category: "developer-tools", appClass: "native", trustLevel: "sita-verified", version: "3.4.0", size: "180 MB",
    shortDescription: "Git client for GitHub", fullDescription: "GitHub Desktop simplifies your development workflow. Whether you're new to Git or a seasoned user, GitHub Desktop provides a visual interface to manage repositories.",
    screenshots: [], rating: 4.5, downloads: 1_200_000, lastUpdated: "2026-03-20",
    releaseNotes: ["Improved diff viewer", "Multi-account support", "Performance improvements"],
    permissions: defaultPerms(["files", "notifications"]),
    fileAssociations: [], protocolAssociations: [{ protocol: "github-mac", label: "GitHub links", isDefault: true }, { protocol: "x-github-client", label: "GitHub client", isDefault: true }],
    worksWithSita: ["Dock integration", "Shell notifications", "Protocol handling"],
    updateSource: "store-managed", startupBehavior: "none", notificationPermission: true,
    installStatus: "not-installed", pinnedToDock: false, tags: ["git", "github", "version-control"], receipts: [],
  },
  {
    id: "github-web", name: "GitHub", publisher: "GitHub, Inc.", icon: "🐙", iconBg: "from-gray-900 to-gray-700",
    category: "developer-tools", appClass: "web-app", trustLevel: "sita-verified", version: "Web", size: "0 MB",
    shortDescription: "Code hosting and collaboration", fullDescription: "GitHub is the world's leading platform for software development, collaboration, and version control. Access repositories, issues, pull requests, and CI/CD from a dedicated app window.",
    screenshots: [], rating: 4.8, downloads: 8_000_000, lastUpdated: "2026-04-03",
    releaseNotes: ["Copilot Workspace launch", "New code review features", "Mobile-responsive redesign"],
    permissions: defaultPerms(["notifications", "clipboard"]),
    fileAssociations: [], protocolAssociations: [],
    worksWithSita: ["Dock integration", "Shell notifications", "Dedicated app window"],
    updateSource: "publisher-managed", startupBehavior: "none", notificationPermission: true,
    installStatus: "not-installed", pinnedToDock: false, tags: ["code", "collaboration", "git"], receipts: [],
  },

  // ── Productivity ──
  {
    id: "notion", name: "Notion", publisher: "Notion Labs", icon: "📝", iconBg: "from-gray-900 to-gray-600",
    category: "productivity", appClass: "wrapped-app", trustLevel: "sita-verified", version: "3.8.0", size: "95 MB",
    shortDescription: "All-in-one workspace", fullDescription: "Notion is an all-in-one workspace where you can write, plan, collaborate, and organize. Combine notes, docs, project management, and wikis.",
    screenshots: [], rating: 4.7, downloads: 4_500_000, lastUpdated: "2026-03-31",
    releaseNotes: ["AI writing assistant v2", "New database views", "Improved mobile sync"],
    permissions: defaultPerms(["notifications", "clipboard", "files"]),
    fileAssociations: [], protocolAssociations: [{ protocol: "notion", label: "Notion links", isDefault: true }],
    worksWithSita: ["Dock integration", "Shell notifications", "Dedicated app window", "Deep link opening"],
    updateSource: "store-managed", startupBehavior: "none", notificationPermission: true,
    installStatus: "not-installed", pinnedToDock: false, tags: ["notes", "wiki", "project-management"], receipts: [],
  },
  {
    id: "figma", name: "Figma", publisher: "Figma, Inc.", icon: "🎨", iconBg: "from-purple-500 to-pink-500",
    category: "productivity", appClass: "wrapped-app", trustLevel: "sita-verified", version: "Web", size: "0 MB",
    shortDescription: "Collaborative design tool", fullDescription: "Figma is a collaborative interface design tool that enables teams to create, prototype, and hand off designs in real time.",
    screenshots: [], rating: 4.8, downloads: 3_800_000, lastUpdated: "2026-04-01",
    releaseNotes: ["AI-powered auto layout", "New component variants", "Dev mode enhancements"],
    permissions: defaultPerms(["clipboard", "files"]),
    fileAssociations: [{ extension: ".fig", mimeType: "application/figma", label: "Figma files", isDefault: true }],
    protocolAssociations: [{ protocol: "figma", label: "Figma links", isDefault: true }],
    worksWithSita: ["Dock integration", "Dedicated app window", "File associations", "Protocol handling"],
    updateSource: "publisher-managed", startupBehavior: "none", notificationPermission: false,
    installStatus: "not-installed", pinnedToDock: false, featured: true, tags: ["design", "ui", "collaboration"], receipts: [],
  },

  // ── Business ──
  {
    id: "stripe-dashboard", name: "Stripe Dashboard", publisher: "Stripe, Inc.", icon: "💳", iconBg: "from-indigo-600 to-purple-500",
    category: "business", appClass: "wrapped-app", trustLevel: "sita-verified", version: "Web", size: "0 MB",
    shortDescription: "Payment infrastructure dashboard", fullDescription: "The Stripe Dashboard gives you a complete view of your payments, customers, subscriptions, and revenue. Monitor transactions, manage disputes, and track your business metrics.",
    screenshots: [], rating: 4.6, downloads: 2_100_000, lastUpdated: "2026-04-02",
    releaseNotes: ["Revenue analytics v2", "Improved dispute management", "New payout views"],
    permissions: defaultPerms(["notifications"]),
    fileAssociations: [], protocolAssociations: [],
    worksWithSita: ["Dock integration", "Shell notifications", "Dedicated app window", "Trust-aware launches"],
    updateSource: "publisher-managed", startupBehavior: "none", notificationPermission: true,
    installStatus: "not-installed", pinnedToDock: false, tags: ["payments", "business", "analytics"], receipts: [],
  },

  // ── Finance ──
  {
    id: "calculator", name: "SITA Calculator", publisher: "SITA OS", icon: "🔢", iconBg: "from-gray-600 to-gray-500",
    category: "finance", appClass: "internal", trustLevel: "sita-verified", version: "1.0.0", size: "2 MB",
    shortDescription: "Premium calculator with unit conversion", fullDescription: "A beautifully designed calculator with scientific functions, unit conversion, currency conversion, and tip calculator.",
    screenshots: [], rating: 4.9, downloads: 50_000, lastUpdated: "2026-03-15",
    releaseNotes: ["Initial release"],
    permissions: [], fileAssociations: [], protocolAssociations: [],
    worksWithSita: ["Dock integration", "App receipts"],
    updateSource: "store-managed", startupBehavior: "none", notificationPermission: false,
    installStatus: "installed", installedAt: "2026-01-01", pinnedToDock: false, tags: ["calculator", "utility"], receipts: [],
  },

  // ── Media ──
  {
    id: "spotify", name: "Spotify", publisher: "Spotify AB", icon: "🎵", iconBg: "from-green-500 to-green-700",
    category: "entertainment", appClass: "native", trustLevel: "sita-verified", version: "1.2.28", size: "250 MB",
    shortDescription: "Music and podcasts", fullDescription: "Spotify gives you instant access to millions of songs, podcasts, and videos from artists all over the world. Discover new music, create playlists, and listen offline.",
    screenshots: [], rating: 4.5, downloads: 7_000_000, lastUpdated: "2026-03-27",
    releaseNotes: ["AI DJ improvements", "New podcast chapters", "Crossfade enhancements"],
    permissions: defaultPerms(["notifications"]),
    fileAssociations: [], protocolAssociations: [{ protocol: "spotify", label: "Spotify links", isDefault: true }],
    worksWithSita: ["Dock integration", "Shell notifications", "Protocol handling", "Background operation"],
    updateSource: "store-managed", startupBehavior: "background", notificationPermission: true,
    installStatus: "not-installed", pinnedToDock: false, tags: ["music", "podcasts", "streaming"], receipts: [],
  },

  // ── Utilities ──
  {
    id: "1password", name: "1Password", publisher: "AgileBits Inc.", icon: "🔐", iconBg: "from-blue-700 to-blue-500",
    category: "security", appClass: "native", trustLevel: "sita-verified", version: "8.10.30", size: "190 MB",
    shortDescription: "Password manager", fullDescription: "1Password remembers all your passwords, so you don't have to. Save your passwords and log in to sites with a single click.",
    screenshots: [], rating: 4.8, downloads: 2_800_000, lastUpdated: "2026-03-26",
    releaseNotes: ["Passkey support expanded", "Improved autofill", "Watchtower enhancements"],
    permissions: [...defaultPerms(["clipboard", "notifications"]), { id: "autofill", domain: "autofill", label: "Autofill", description: "Fill passwords automatically", granted: false, required: true, riskLevel: "high" }],
    fileAssociations: [], protocolAssociations: [{ protocol: "onepassword", label: "1Password links", isDefault: true }],
    worksWithSita: ["Dock integration", "Shell notifications", "Startup launch", "Autofill integration"],
    updateSource: "store-managed", startupBehavior: "background", notificationPermission: true,
    installStatus: "not-installed", pinnedToDock: false, tags: ["password", "security", "vault"], receipts: [],
  },
  {
    id: "obsidian", name: "Obsidian", publisher: "Dynalist Inc.", icon: "💎", iconBg: "from-purple-900 to-purple-700",
    category: "productivity", appClass: "native", trustLevel: "publisher-verified", version: "1.6.7", size: "170 MB",
    shortDescription: "Knowledge base and note-taking", fullDescription: "Obsidian is a powerful and extensible knowledge base that works on local Markdown files. Build your personal wiki with bidirectional linking.",
    screenshots: [], rating: 4.7, downloads: 1_500_000, lastUpdated: "2026-03-22",
    releaseNotes: ["Canvas improvements", "New themes", "Plugin API v2"],
    permissions: defaultPerms(["files", "clipboard"]),
    fileAssociations: [{ extension: ".md", mimeType: "text/markdown", label: "Markdown", isDefault: false }],
    protocolAssociations: [{ protocol: "obsidian", label: "Obsidian links", isDefault: true }],
    worksWithSita: ["Dock integration", "File associations", "Protocol handling", "Secure file handoff"],
    updateSource: "publisher-managed", startupBehavior: "none", notificationPermission: false,
    installStatus: "not-installed", pinnedToDock: false, tags: ["notes", "markdown", "knowledge"], receipts: [],
  },
  {
    id: "linear", name: "Linear", publisher: "Linear Inc.", icon: "📐", iconBg: "from-indigo-600 to-violet-500",
    category: "productivity", appClass: "web-app", trustLevel: "sita-verified", version: "Web", size: "0 MB",
    shortDescription: "Issue tracking for high-performance teams", fullDescription: "Linear is a better way to build products. Streamlined issue tracking, project management, and product roadmaps designed for speed.",
    screenshots: [], rating: 4.8, downloads: 900_000, lastUpdated: "2026-04-01",
    releaseNotes: ["Triage improvements", "New cycle analytics", "AI project suggestions"],
    permissions: defaultPerms(["notifications", "clipboard"]),
    fileAssociations: [], protocolAssociations: [{ protocol: "linear", label: "Linear links", isDefault: true }],
    worksWithSita: ["Dock integration", "Shell notifications", "Dedicated app window", "Deep link opening"],
    updateSource: "publisher-managed", startupBehavior: "none", notificationPermission: true,
    installStatus: "not-installed", pinnedToDock: false, isNew: true, tags: ["project", "issues", "agile"], receipts: [],
  },
  {
    id: "canva", name: "Canva", publisher: "Canva Pty Ltd", icon: "🖌️", iconBg: "from-cyan-500 to-blue-500",
    category: "productivity", appClass: "web-app", trustLevel: "sita-verified", version: "Web", size: "0 MB",
    shortDescription: "Visual design made easy", fullDescription: "Canva makes it easy to create professional designs and share them with anyone. Create presentations, social media graphics, videos, and more.",
    screenshots: [], rating: 4.6, downloads: 5_500_000, lastUpdated: "2026-03-30",
    releaseNotes: ["Magic Studio AI tools", "New video editor", "Brand kit improvements"],
    permissions: defaultPerms(["files", "clipboard"]),
    fileAssociations: [], protocolAssociations: [],
    worksWithSita: ["Dock integration", "Dedicated app window", "Secure file handoff"],
    updateSource: "publisher-managed", startupBehavior: "none", notificationPermission: false,
    installStatus: "not-installed", pinnedToDock: false, tags: ["design", "graphics", "presentations"], receipts: [],
  },
  {
    id: "gmail", name: "Gmail", publisher: "Google LLC", icon: "📧", iconBg: "from-red-500 to-red-400",
    category: "communication", appClass: "wrapped-app", trustLevel: "sita-verified", version: "Web", size: "0 MB",
    shortDescription: "Email by Google", fullDescription: "Gmail is a free email service built on the idea that email can be more intuitive, efficient, and useful. Get 15 GB of storage, less spam, and mobile access.",
    screenshots: [], rating: 4.5, downloads: 9_000_000, lastUpdated: "2026-04-02",
    releaseNotes: ["Gemini integration", "Smart compose improvements", "New label management"],
    permissions: defaultPerms(["notifications", "contacts"]),
    fileAssociations: [{ extension: ".eml", mimeType: "message/rfc822", label: "Email files", isDefault: true }],
    protocolAssociations: [{ protocol: "mailto", label: "Email links", isDefault: true }],
    worksWithSita: ["Dock integration", "Shell notifications", "Dedicated app window", "Default mail app", "Protocol handling"],
    updateSource: "publisher-managed", startupBehavior: "background", notificationPermission: true,
    installStatus: "not-installed", pinnedToDock: false, featured: true, tags: ["email", "google", "communication"], receipts: [],
  },
  {
    id: "google-docs", name: "Google Docs", publisher: "Google LLC", icon: "📄", iconBg: "from-blue-400 to-blue-500",
    category: "productivity", appClass: "web-app", trustLevel: "sita-verified", version: "Web", size: "0 MB",
    shortDescription: "Online document editor", fullDescription: "Create, edit, and collaborate on documents online. Google Docs brings your documents to life with smart editing and styling tools.",
    screenshots: [], rating: 4.5, downloads: 7_000_000, lastUpdated: "2026-04-01",
    releaseNotes: ["AI writing tools", "Improved offline mode", "New templates"],
    permissions: defaultPerms(["files", "clipboard"]),
    fileAssociations: [{ extension: ".docx", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", label: "Word documents", isDefault: false }],
    protocolAssociations: [],
    worksWithSita: ["Dock integration", "Dedicated app window", "File associations"],
    updateSource: "publisher-managed", startupBehavior: "none", notificationPermission: false,
    installStatus: "not-installed", pinnedToDock: false, tags: ["documents", "writing", "collaboration"], receipts: [],
  },
  {
    id: "docker-desktop", name: "Docker Desktop", publisher: "Docker, Inc.", icon: "🐳", iconBg: "from-blue-600 to-cyan-500",
    category: "developer-tools", appClass: "native", trustLevel: "publisher-verified", version: "4.30.0", size: "750 MB",
    shortDescription: "Container development environment", fullDescription: "Docker Desktop is the easiest way to build and share containerized applications and microservices. Includes Docker Engine, CLI, Compose, and Kubernetes.",
    screenshots: [], rating: 4.4, downloads: 1_800_000, lastUpdated: "2026-03-28",
    releaseNotes: ["Compose Watch improvements", "Resource optimization", "New extension API"],
    permissions: [...defaultPerms(["files", "network"]), { id: "system", domain: "system", label: "System Access", description: "Required for container runtime", granted: false, required: true, riskLevel: "high" }],
    fileAssociations: [{ extension: ".dockerfile", mimeType: "text/x-dockerfile", label: "Dockerfiles", isDefault: true }],
    protocolAssociations: [{ protocol: "docker", label: "Docker links", isDefault: true }],
    worksWithSita: ["Dock integration", "Shell notifications", "Background operation", "File associations"],
    updateSource: "publisher-managed", startupBehavior: "background", notificationPermission: true,
    installStatus: "not-installed", pinnedToDock: false, tags: ["containers", "devops", "kubernetes"], receipts: [],
  },
  {
    id: "postman", name: "Postman", publisher: "Postman, Inc.", icon: "🚀", iconBg: "from-orange-500 to-orange-400",
    category: "developer-tools", appClass: "native", trustLevel: "sita-verified", version: "11.2.0", size: "290 MB",
    shortDescription: "API development platform", fullDescription: "Postman simplifies each step of building an API and streamlines collaboration so you can create better APIs—faster.",
    screenshots: [], rating: 4.6, downloads: 2_200_000, lastUpdated: "2026-03-25",
    releaseNotes: ["AI assistant for APIs", "Collection improvements", "New mock server features"],
    permissions: defaultPerms(["files", "clipboard", "network"]),
    fileAssociations: [{ extension: ".postman_collection.json", mimeType: "application/json", label: "Postman Collections", isDefault: true }],
    protocolAssociations: [{ protocol: "postman", label: "Postman links", isDefault: true }],
    worksWithSita: ["Dock integration", "File associations", "Protocol handling"],
    updateSource: "store-managed", startupBehavior: "none", notificationPermission: false,
    installStatus: "not-installed", pinnedToDock: false, tags: ["api", "testing", "development"], receipts: [],
  },
  {
    id: "terminal", name: "SITA Terminal", publisher: "SITA OS", icon: "⬛", iconBg: "from-gray-900 to-gray-800",
    category: "developer-tools", appClass: "internal", trustLevel: "sita-verified", version: "1.0.0", size: "5 MB",
    shortDescription: "Premium terminal emulator", fullDescription: "A beautiful, GPU-accelerated terminal with tabs, split panes, themes, and shell integration. Supports bash, zsh, fish, and PowerShell.",
    screenshots: [], rating: 4.9, downloads: 80_000, lastUpdated: "2026-03-01",
    releaseNotes: ["Initial release"],
    permissions: [...defaultPerms(["files"]), { id: "system", domain: "system", label: "System Access", description: "Terminal requires system access", granted: true, required: true, riskLevel: "high" }],
    fileAssociations: [{ extension: ".sh", mimeType: "application/x-sh", label: "Shell scripts", isDefault: true }],
    protocolAssociations: [],
    worksWithSita: ["Dock integration", "File associations", "Secure file handoff"],
    updateSource: "store-managed", startupBehavior: "none", notificationPermission: false,
    installStatus: "installed", installedAt: "2026-01-01", pinnedToDock: true, tags: ["terminal", "shell", "cli"], receipts: [],
  },
  {
    id: "files-app", name: "SITA Files", publisher: "SITA OS", icon: "📁", iconBg: "from-blue-500 to-blue-400",
    category: "utilities", appClass: "internal", trustLevel: "sita-verified", version: "1.0.0", size: "8 MB",
    shortDescription: "Intelligent file manager", fullDescription: "A beautiful file manager with intelligent classification, search, tagging, and cloud integration.",
    screenshots: [], rating: 4.8, downloads: 50_000, lastUpdated: "2026-03-01",
    releaseNotes: ["Initial release"],
    permissions: defaultPerms(["files"]),
    fileAssociations: [], protocolAssociations: [{ protocol: "file", label: "Local files", isDefault: true }],
    worksWithSita: ["Dock integration", "Default file manager", "Secure file handoff"],
    updateSource: "store-managed", startupBehavior: "none", notificationPermission: false,
    installStatus: "installed", installedAt: "2026-01-01", pinnedToDock: true, tags: ["files", "manager"], receipts: [],
  },
  {
    id: "settings-app", name: "SITA Settings", publisher: "SITA OS", icon: "⚙️", iconBg: "from-gray-500 to-gray-400",
    category: "utilities", appClass: "internal", trustLevel: "sita-verified", version: "1.0.0", size: "3 MB",
    shortDescription: "System settings and preferences", fullDescription: "Configure every aspect of your SITA OS experience.",
    screenshots: [], rating: 4.7, downloads: 50_000, lastUpdated: "2026-03-01",
    releaseNotes: ["Initial release"],
    permissions: [], fileAssociations: [], protocolAssociations: [],
    worksWithSita: ["Dock integration", "System integration"],
    updateSource: "store-managed", startupBehavior: "none", notificationPermission: false,
    installStatus: "installed", installedAt: "2026-01-01", pinnedToDock: false, tags: ["settings", "preferences"], receipts: [],
  },
];

// ── Bundles ──

export const APP_BUNDLES: AppBundle[] = [
  {
    id: "business-starter", name: "Business Starter Pack", subtitle: "Everything you need to run your business",
    description: "Get Chrome, Slack, Zoom, Gmail, and Stripe Dashboard — all configured and ready for business.",
    icon: "💼", iconBg: "from-primary to-primary/60", appIds: ["chrome", "slack", "zoom", "gmail", "stripe-dashboard", "notion"],
    recommendedFor: ["business", "founders", "operators"], totalSize: "1.1 GB", featured: true,
  },
  {
    id: "developer-essentials", name: "Developer Essentials", subtitle: "Your complete dev environment",
    description: "VS Code, GitHub Desktop, Docker Desktop, Postman, Terminal, and Chrome — ready to code.",
    icon: "🛠️", iconBg: "from-blue-600 to-blue-400", appIds: ["vscode", "github-desktop", "docker-desktop", "postman", "terminal", "chrome"],
    recommendedFor: ["developer", "engineer", "devops"], totalSize: "1.9 GB",
  },
  {
    id: "communication-pack", name: "Communication Pack", subtitle: "Stay connected everywhere",
    description: "WhatsApp, Slack, Zoom, and Gmail — all your communication channels in one place.",
    icon: "📡", iconBg: "from-green-500 to-emerald-400", appIds: ["whatsapp", "slack", "zoom", "gmail"],
    recommendedFor: ["everyone", "business", "personal"], totalSize: "730 MB",
  },
  {
    id: "creator-pack", name: "Creator Pack", subtitle: "Design, write, and create",
    description: "Figma, Canva, Notion, Obsidian, and Google Docs — everything creative.",
    icon: "🎨", iconBg: "from-pink-500 to-purple-500", appIds: ["figma", "canva", "notion", "obsidian", "google-docs"],
    recommendedFor: ["designer", "writer", "content"], totalSize: "265 MB",
  },
  {
    id: "household-pack", name: "Household Coordination Pack", subtitle: "Run your household smoothly",
    description: "Chrome, WhatsApp, Gmail, Google Docs, and SITA Files — household essentials.",
    icon: "🏠", iconBg: "from-amber-500 to-orange-400", appIds: ["chrome", "whatsapp", "gmail", "google-docs", "files-app"],
    recommendedFor: ["family", "household", "personal"], totalSize: "405 MB",
  },
];

// ── Helpers ──

export const APP_CATEGORIES: { id: AppCategory; label: string; icon: string }[] = [
  { id: "browsers", label: "Browsers", icon: "🌐" },
  { id: "communication", label: "Communication", icon: "💬" },
  { id: "productivity", label: "Productivity", icon: "📋" },
  { id: "developer-tools", label: "Developer Tools", icon: "💻" },
  { id: "business", label: "Business", icon: "💼" },
  { id: "finance", label: "Finance", icon: "💰" },
  { id: "media", label: "Media", icon: "🎬" },
  { id: "utilities", label: "Utilities", icon: "🔧" },
  { id: "household", label: "Household", icon: "🏠" },
  { id: "security", label: "Security", icon: "🔐" },
  { id: "education", label: "Education", icon: "📚" },
  { id: "entertainment", label: "Entertainment", icon: "🎮" },
  { id: "enterprise", label: "Enterprise", icon: "🏢" },
  { id: "extensions", label: "Extensions", icon: "🧩" },
];

export function getInstalledApps() { return APP_CATALOG.filter(a => a.installStatus === "installed"); }
export function getUpdateAvailable() { return APP_CATALOG.filter(a => a.installStatus === "update-available"); }
export function getFeaturedApps() { return APP_CATALOG.filter(a => a.featured); }
export function getAppsByCategory(cat: AppCategory) { return APP_CATALOG.filter(a => a.category === cat); }
export function getAppById(id: string) { return APP_CATALOG.find(a => a.id === id); }
export function getBundleById(id: string) { return APP_BUNDLES.find(b => b.id === id); }

export function searchApps(query: string) {
  const q = query.toLowerCase();
  return APP_CATALOG.filter(a =>
    a.name.toLowerCase().includes(q) ||
    a.publisher.toLowerCase().includes(q) ||
    a.tags.some(t => t.includes(q)) ||
    a.category.includes(q)
  );
}

export function getRecommendedApps(profile: { domains: string[]; role: string }) {
  const isDev = profile.role.toLowerCase().includes("dev") || profile.domains.includes("developer");
  const isBiz = profile.domains.includes("business");
  const isFin = profile.domains.includes("finance");

  return APP_CATALOG.filter(a => {
    if (a.installStatus === "installed") return false;
    if (isDev && a.category === "developer-tools") return true;
    if (isBiz && (a.category === "business" || a.category === "communication")) return true;
    if (isFin && a.category === "finance") return true;
    if (a.featured) return true;
    return false;
  }).slice(0, 8);
}
