// ═══════════════════════════════════════════════════════
// SITA OS — Files Selectors
// ═══════════════════════════════════════════════════════

export const FILES = {
  FILES_PAGE: "[data-testid='files-page']",
  FILE_UPLOAD: "[data-testid='file-upload']",
  FILE_UPLOAD_INPUT: "[data-testid='file-upload-input'], input[type='file']",
  FILE_LIST: "[data-testid='file-list']",
  FILE_ITEM: "[data-testid='file-item']",
  FILE_NAME: "[data-testid='file-name']",
  FILE_DELETE: "[data-testid='file-delete']",
  FILE_DOWNLOAD: "[data-testid='file-download']",
  FILES_EMPTY: "[data-testid='files-empty-state']",
} as const;
