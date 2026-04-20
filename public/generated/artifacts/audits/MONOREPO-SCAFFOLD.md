# SITA OS — Monorepo Scaffold Configuration

## Recommended: Turborepo + pnpm workspaces

### Root `package.json`

```json
{
  "name": "sita-os",
  "private": true,
  "workspaces": [
    "shared/*",
    "os/*",
    "backend/*",
    "apps/*",
    "internal-tools/*"
  ],
  "scripts": {
    "build": "turbo run build",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "typecheck": "turbo run typecheck",
    "check:boundaries": "tsx scripts/check-plane-boundaries.ts"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.6.0",
    "tsx": "^4.0.0"
  }
}
```

### Root `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "lint": {},
    "test": {
      "dependsOn": ["build"]
    }
  }
}
```

### Root `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "composite": true
  }
}
```

---

## Per-Plane Configurations

### `shared/contracts/package.json`
```json
{
  "name": "@sita/shared-contracts",
  "version": "1.0.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts",
  "scripts": {
    "build": "tsc --build",
    "typecheck": "tsc --noEmit"
  }
}
```

### `os/kernel/package.json`
```json
{
  "name": "@sita/os-kernel",
  "version": "1.0.0",
  "private": true,
  "main": "src/index.ts",
  "dependencies": {
    "@sita/shared-contracts": "workspace:*"
  }
}
```

### `apps/product-shell/package.json`
```json
{
  "name": "@sita/product-shell",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@sita/shared-contracts": "workspace:*",
    "@sita/shared-events": "workspace:*",
    "@sita/design-tokens": "workspace:*",
    "@sita/os-shell": "workspace:*",
    "@sita/os-sdk": "workspace:*",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.26.0",
    "@tanstack/react-query": "^5.56.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "typecheck": "tsc --noEmit"
  }
}
```

### `apps/admin-console/package.json`
```json
{
  "name": "@sita/admin-console",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@sita/shared-contracts": "workspace:*",
    "@sita/shared-auth": "workspace:*",
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  }
}
```

### `backend/edge-functions/` structure
```
backend/edge-functions/
├── _shared/              # Shared edge function utilities
├── ai-gateway/
│   └── index.ts
├── admin-api/
│   └── index.ts
├── advisor-agent-loop/
│   └── index.ts
└── ... (all current supabase/functions/)
```

> **Note**: Edge functions remain Deno-based and deploy via Supabase CLI.
> They reference `@sita/shared-contracts` via import maps, not npm workspaces.

---

## CI Boundary Enforcement Script

Create `scripts/check-plane-boundaries.ts`:

```typescript
import * as fs from "fs";
import * as path from "path";

const RULES: Record<string, string[]> = {
  "shared/":         [],
  "os/":             ["shared/"],
  "backend/":        ["shared/"],
  "apps/product-shell/": ["shared/", "os/"],
  "apps/admin-console/": ["shared/"],
  "apps/founder-center/": ["shared/"],
  "apps/mobile/":    ["shared/"],
  "internal-tools/": ["shared/"],
};

// Scan for @sita/ imports and verify they match allowed deps
// Implementation: read every .ts/.tsx file, extract @sita/* imports,
// check against RULES map based on file's plane membership
```

This runs in CI to prevent regression.
