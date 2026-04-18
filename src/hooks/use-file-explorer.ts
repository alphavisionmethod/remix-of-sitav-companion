import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchFolderContents,
  createFolder,
  renameFolder,
  deleteFolder,
  renameFile,
  moveFile,
  softDeleteFile,
  restoreFile,
  permanentDeleteFile,
  uploadFileToFolder,
  fetchBreadcrumbs,
  fetchTrash,
  emptyTrash,
  fetchAllFolders,
} from "@/data/repositories/file-explorer-service";
import { toast } from "sonner";

export function useFolderContents(folderId: string | null) {
  return useQuery({
    queryKey: ["file-explorer", "contents", folderId],
    queryFn: () => fetchFolderContents(folderId),
  });
}

export function useBreadcrumbs(folderId: string | null) {
  return useQuery({
    queryKey: ["file-explorer", "breadcrumbs", folderId],
    queryFn: () => fetchBreadcrumbs(folderId),
  });
}

export function useAllFolders() {
  return useQuery({
    queryKey: ["file-explorer", "all-folders"],
    queryFn: fetchAllFolders,
  });
}

export function useTrash() {
  return useQuery({
    queryKey: ["file-explorer", "trash"],
    queryFn: fetchTrash,
  });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["file-explorer"] });
}

export function useCreateFolder() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ name, parentId }: { name: string; parentId: string | null }) =>
      createFolder(name, parentId),
    onSuccess: () => { toast.success("Folder created"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRenameFolder() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => renameFolder(id, name),
    onSuccess: () => { toast.success("Folder renamed"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteFolder() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => deleteFolder(id),
    onSuccess: () => { toast.success("Folder deleted"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRenameFile() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => renameFile(id, name),
    onSuccess: () => { toast.success("File renamed"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useMoveFile() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, folderId }: { id: string; folderId: string | null }) =>
      moveFile(id, folderId),
    onSuccess: () => { toast.success("File moved"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteFile() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => softDeleteFile(id),
    onSuccess: () => { toast.success("Moved to trash"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRestoreFile() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => restoreFile(id),
    onSuccess: () => { toast.success("File restored"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function usePermanentDeleteFile() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => permanentDeleteFile(id),
    onSuccess: () => { toast.success("Permanently deleted"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUploadToFolder() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ file, folderId }: { file: File; folderId: string | null }) =>
      uploadFileToFolder(file, folderId),
    onSuccess: () => { toast.success("File uploaded"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useEmptyTrash() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: emptyTrash,
    onSuccess: () => { toast.success("Trash emptied"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
}
