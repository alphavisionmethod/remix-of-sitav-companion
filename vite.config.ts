import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { execSync } from "child_process";
import fs from "fs";
import { sentryVitePlugin } from "@sentry/vite-plugin";

function healthJsonPlugin() {
  return {
    name: "generate-health-json",
    closeBundle() {
      const distDir = path.resolve(__dirname, "dist");
      if (!fs.existsSync(distDir)) return;
      let gitHash = "unknown";
      try { gitHash = execSync("git rev-parse --short HEAD").toString().trim(); } catch {}
      const health = {
        service: "sita-os",
        status: "healthy",
        version: gitHash,
        buildTime: new Date().toISOString(),
      };
      fs.writeFileSync(path.join(distDir, "health.json"), JSON.stringify(health, null, 2));
    },
  };
}

// Phase 13.1 — Auto-rewrite public host placeholder in dist/ on build.
// Reads $WEB_PUBLIC_HOST (default keeps placeholder so partial→ready flips honestly).
function publicHostRewritePlugin() {
  const PLACEHOLDER = "https://app.sita.os";
  const target = (process.env.WEB_PUBLIC_HOST || "").replace(/\/$/, "");
  return {
    name: "rewrite-public-host",
    closeBundle() {
      if (!target) {
        console.log("[rewrite-public-host] WEB_PUBLIC_HOST not set — keeping placeholder");
        return;
      }
      const distDir = path.resolve(__dirname, "dist");
      if (!fs.existsSync(distDir)) return;
      const targets = ["robots.txt", "sitemap.xml", "manifest.webmanifest", "index.html"];
      let total = 0;
      for (const rel of targets) {
        const p = path.join(distDir, rel);
        if (!fs.existsSync(p)) continue;
        const before = fs.readFileSync(p, "utf8");
        const after = before.split(PLACEHOLDER).join(target);
        if (before !== after) {
          fs.writeFileSync(p, after);
          const count = before.split(PLACEHOLDER).length - 1;
          total += count;
          console.log(`[rewrite-public-host] ${rel}: ${count} replacement(s)`);
        }
      }
      console.log(`[rewrite-public-host] Done — ${total} total replacement(s) → ${target}`);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: process.env.ELECTRON_BUILD ? './' : '/',
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    healthJsonPlugin(),
    publicHostRewritePlugin(),
    // Phase 20.1.D — Sentry sourcemap upload (gated on build secret)
    process.env.SENTRY_AUTH_TOKEN ? sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      release: { name: process.env.VITE_APP_RELEASE || undefined },
      sourcemaps: { assets: "./dist/**" },
      disable: !process.env.SENTRY_AUTH_TOKEN,
    }) : null,
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  build: {
    target: "es2020",
    cssCodeSplit: true,
    // Phase 20.1.D — emit hidden sourcemaps when uploading to Sentry,
    // never bundle them into the public dist otherwise.
    sourcemap: process.env.SENTRY_AUTH_TOKEN ? "hidden" : false,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Core React
          if (id.includes("node_modules/react-dom")) return "vendor-react";
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-router")) return "vendor-react";
          // Radix UI
          if (id.includes("node_modules/@radix-ui")) return "vendor-ui";
          // Charts
          if (id.includes("node_modules/recharts") || id.includes("node_modules/d3-") || id.includes("node_modules/victory")) return "vendor-charts";
          // Motion
          if (id.includes("node_modules/framer-motion")) return "vendor-motion";
          // Query
          if (id.includes("node_modules/@tanstack")) return "vendor-query";
          // Supabase
          if (id.includes("node_modules/@supabase")) return "vendor-supabase";
          // i18n
          if (id.includes("node_modules/i18next") || id.includes("node_modules/react-i18next")) return "vendor-i18n";
          // Markdown
          if (id.includes("node_modules/react-markdown") || id.includes("node_modules/remark") || id.includes("node_modules/rehype") || id.includes("node_modules/unified") || id.includes("node_modules/mdast") || id.includes("node_modules/hast") || id.includes("node_modules/micromark")) return "vendor-markdown";
          // Date utils
          if (id.includes("node_modules/date-fns")) return "vendor-date-fns";
          // Form handling
          if (id.includes("node_modules/react-hook-form") || id.includes("node_modules/@hookform") || id.includes("node_modules/zod")) return "vendor-forms";

          // ── Phase 7: Plane-keyed app-code chunking ──────────────────
          // Split admin control plane into per-domain chunks so an
          // operator opening /admin/security never downloads /admin/ai-runtime.
          if (id.includes("/src/admin/modules/")) {
            const m = id.match(/\/src\/admin\/modules\/([^/]+)\//);
            if (m) return `admin-mod-${m[1]}`;
          }
          if (id.includes("/src/pages/admin/")) return "admin-legacy-pages";
          if (id.includes("/src/routes/AdminRoutes")) return "admin-router";

          // User-domain features: keep each shell in its own chunk.
          if (id.includes("/src/features/")) {
            const m = id.match(/\/src\/features\/([^/]+)\//);
            if (m) return `feature-${m[1]}`;
          }
          // Investment-office page family is the largest single user surface (121 routes).
          if (id.includes("/src/pages/investment-office/")) return "feature-investment-office";

          // Architecture & generated truth artifacts should never ship to user bundles.
          if (id.includes("/src/platform/architecture/")) return "platform-architecture";

          // ── G5: Split heavy kernel / platform subtrees out of `index` ──
          // These are imported transitively from contexts/providers in App.tsx.
          // Splitting them into named chunks lets the browser parallelize
          // download + parse and lets Lovable update the kernel without
          // invalidating the user-page chunks.
          if (id.includes("/src/lib/sita-kernel/")) return "lib-sita-kernel";
          if (id.includes("/src/lib/orchestration/")) return "lib-orchestration";
          if (id.includes("/src/lib/intelligence/")) return "lib-intelligence";
          if (id.includes("/src/lib/ai-gateway/")) return "lib-ai-gateway";
          if (id.includes("/src/lib/agent/") || id.includes("/src/lib/agents/")) return "lib-agents";
          if (id.includes("/src/lib/runtime/")) return "lib-runtime";
          if (id.includes("/src/lib/backend-topology/")) return "lib-backend-topology";
          if (id.includes("/src/lib/truth-manifests/")) return "lib-truth-manifests";
          if (id.includes("/src/lib/policy/")) return "lib-policy";
          if (id.includes("/src/lib/services/")) return "lib-services";
          if (id.includes("/src/lib/debug/")) return "lib-debug";
          if (id.includes("/src/services/")) return "platform-services";
          if (id.includes("/src/contracts/")) return "platform-contracts";
          if (id.includes("/src/data/")) return "platform-data";
        },
      },
    },
  },
}));