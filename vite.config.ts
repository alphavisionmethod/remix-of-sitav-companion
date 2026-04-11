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
  plugins: [react(), mode === "development" && componentTagger(), healthJsonPlugin()].filter(Boolean),
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