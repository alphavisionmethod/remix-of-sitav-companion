

# Files App — Full File Explorer Implementation

## Overview
Transform the Files app into a true file explorer (like Windows Explorer / macOS Finder) with folder navigation, create/rename/delete folders, file management, drag-and-drop, breadcrumb navigation, grid/list views, and context menus. The database already has `cloud_folders`, `cloud_files`, and `cloud_file_versions` tables with proper RLS — we just need to build the UI and data layer.

## Architecture

The "All Files" tab (`FilesAll.tsx`) becomes the file explorer. A new tab "Explorer" replaces it in the sidebar nav. The existing intelligence/security tabs remain untouched.

```text
┌─────────────────────────────────────────────────┐
│ Breadcrumb: Home / Documents / Contracts        │
│ [← Back] [New Folder] [Upload] [Grid|List] [⋮]│
├────────────┬────────────────────────────────────┤
│ Folder     │  📁 Contracts     📁 Invoices     │
│ Tree       │  📁 Personal      📄 Report.pdf   │
│ (sidebar)  │  📄 NDA_v2.docx  📄 Budget.xlsx  │
│            │                                    │
│ Quick      │  Right-click → Rename / Delete /  │
│ Access     │  Move / Download / Properties     │
│ ─────────  │                                    │
│ ★ Starred  │  [Detail panel when file selected]│
│ 🕐 Recent  │                                    │
│ 🗑 Trash   │                                    │
└────────────┴────────────────────────────────────┘
```

## Implementation Plan

### 1. Data Service Layer (`src/lib/data-services/file-explorer-service.ts`)
CRUD operations against `cloud_folders` and `cloud_files` tables:
- `fetchFolderContents(folderId: string | null)` — list folders + files in a directory
- `createFolder(name, parentId)`, `renameFolder(id, name)`, `deleteFolder(id)`
- `renameFile(id, name)`, `moveFile(id, folderId)`, `softDeleteFile(id)`, `restoreFile(id)`
- `uploadFileToFolder(file, folderId)` — uploads to Supabase Storage + creates `cloud_files` row
- `downloadFile(id)` — generates signed URL from storage
- `fetchBreadcrumbs(folderId)` — walks `parent_id` chain for breadcrumb path
- `fetchTrash()` — files where `deleted = true`
- `emptyTrash()` — permanently delete soft-deleted files + storage blobs

### 2. React Query Hooks (`src/hooks/use-file-explorer.ts`)
- `useFolderContents(folderId)` — returns `{ folders, files, isLoading }`
- `useCreateFolder()`, `useRenameFolder()`, `useDeleteFolder()` — mutations with cache invalidation
- `useRenameFile()`, `useMoveFile()`, `useDeleteFile()`, `useRestoreFile()`
- `useUploadToFolder()` — mutation wrapping the upload flow
- `useBreadcrumbs(folderId)` — breadcrumb chain
- `useTrash()` — soft-deleted items

### 3. Explorer UI Component (`src/pages/files/FilesExplorer.tsx`)
The main explorer view with:
- **Breadcrumb bar** — clickable path segments, back button
- **Toolbar** — New Folder, Upload, view toggle (grid/list), sort (name/date/size/type)
- **Left sidebar** — folder tree (collapsible), quick access (Starred, Recent, Trash)
- **Main area** — grid of folder/file cards or list rows depending on view mode
- **Context menu** (right-click) — Open, Rename, Move to, Download, Delete, Properties
- **Rename inline** — click-to-edit folder/file names
- **Drag and drop** — drag files/folders to move them into other folders
- **Empty states** — "This folder is empty" with upload CTA
- **Detail panel** (optional right side) — file properties, preview, version history
- **Multi-select** — shift/cmd click for bulk operations (delete, move)
- **Trash view** — shows deleted files with Restore / Permanently Delete actions

### 4. Sub-components
- `FileExplorerBreadcrumb.tsx` — breadcrumb navigation
- `FileExplorerToolbar.tsx` — action bar with New Folder, Upload, View toggle, Sort
- `FileExplorerSidebar.tsx` — folder tree + quick access
- `FileExplorerGrid.tsx` — grid/list rendering of items with context menu
- `FileExplorerContextMenu.tsx` — right-click menu using Radix ContextMenu
- `FileExplorerTrash.tsx` — trash view
- `FileExplorerProperties.tsx` — detail/properties panel
- `NewFolderDialog.tsx` — modal for creating folders
- `MoveToDialog.tsx` — modal with folder picker for moving items

### 5. Wire into FilesCenter
- Add "Explorer" tab to the Browse group in `FilesCenter.tsx`
- Add route `/files/explorer` in `files-routes.tsx`
- Keep existing "All Files" as the flat intelligence view, Explorer as the spatial navigation view

### 6. Mobile File Explorer (`MobileFiles.tsx`)
- Replace static hardcoded list with real data from `cloud_folders` / `cloud_files`
- Folder navigation with back button
- Long-press context menu (rename, delete, move)
- FAB button for New Folder / Upload
- Pull-to-refresh

### Files Created/Modified

| File | Action |
|---|---|
| `src/lib/data-services/file-explorer-service.ts` | Create — all CRUD operations |
| `src/hooks/use-file-explorer.ts` | Create — React Query hooks |
| `src/pages/files/FilesExplorer.tsx` | Create — main explorer view |
| `src/components/files/FileExplorerBreadcrumb.tsx` | Create |
| `src/components/files/FileExplorerToolbar.tsx` | Create |
| `src/components/files/FileExplorerSidebar.tsx` | Create |
| `src/components/files/FileExplorerGrid.tsx` | Create |
| `src/components/files/FileExplorerContextMenu.tsx` | Create |
| `src/components/files/FileExplorerTrash.tsx` | Create |
| `src/components/files/FileExplorerProperties.tsx` | Create |
| `src/components/files/NewFolderDialog.tsx` | Create |
| `src/components/files/MoveToDialog.tsx` | Create |
| `src/pages/FilesCenter.tsx` | Modify — add Explorer tab |
| `src/routes/files-routes.tsx` | Modify — add explorer route |
| `src/pages/mobile/MobileFiles.tsx` | Rewrite — real data + folder nav |

No database migrations needed — tables and RLS already exist.

