import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { execSync } from "child_process";
import fs from "fs";

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
  plugins: [react(), mode === "development" && componentTagger(), healthJsonPlugin(), publicHostRewritePlugin()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  build: {
    target: "es2020",
    cssCodeSplit: true,
    sourcemap: false,
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
        },
      },
    },
  },
}));