import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Folder, File, Upload, FolderPlus, Grid3X3, List, Trash2,
  Download, MoreHorizontal, ChevronRight, Home, RefreshCw,
  FileText, Image, Music, Video, Archive, Code, HardDrive, Search
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cloudStorageService } from "@/platform/cloud/cloud-storage-service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CloudFile {
  id: string;
  name: string;
  size: number;
  mime_type: string;
  version: number;
  created_at: string;
  updated_at: string;
  blob_id: string | null;
}

interface CloudFolder {
  id: string;
  name: string;
  parent_id: string | null;
  path_cache: string;
  created_at: string;
}

interface QuotaInfo {
  used_bytes: number;
  quota_bytes: number;
  file_count: number;
}

function getFileIcon(mime: string) {
  if (mime.startsWith("image/")) return <Image className="h-5 w-5 text-pink-400" />;
  if (mime.startsWith("video/")) return <Video className="h-5 w-5 text-purple-400" />;
  if (mime.startsWith("audio/")) return <Music className="h-5 w-5 text-amber-400" />;
  if (mime.includes("zip") || mime.includes("tar") || mime.includes("rar")) return <Archive className="h-5 w-5 text-orange-400" />;
  if (mime.includes("json") || mime.includes("javascript") || mime.includes("typescript") || mime.includes("html") || mime.includes("css")) return <Code className="h-5 w-5 text-blue-400" />;
  if (mime.includes("pdf") || mime.includes("document") || mime.includes("text")) return <FileText className="h-5 w-5 text-blue-400" />;
  return <File className="h-5 w-5 text-muted-foreground" />;
}

export function CloudFileBrowser() {
  const { user } = useAuth();
  const [folders, setFolders] = useState<CloudFolder[]>([]);
  const [files, setFiles] = useState<CloudFile[]>([]);
  const [quota, setQuota] = useState<QuotaInfo>({ used_bytes: 0, quota_bytes: 5_368_709_120, file_count: 0 });
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ id: string | null; name: string }>>([{ id: null, name: "My Files" }]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [search, setSearch] = useState("");

  const loadFiles = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("cloud-storage-api", {
        body: {},
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      // Use query params via body workaround
      const res = await supabase.functions.invoke("cloud-storage-api?action=list&folder_id=" + (currentFolder || ""), {
        body: {},
      });
      if (res.data) {
        setFolders(res.data.folders || []);
        setFiles(res.data.files || []);
        setQuota(res.data.quota || { used_bytes: 0, quota_bytes: 5_368_709_120, file_count: 0 });
      }
    } catch {
      // Use empty state
    } finally {
      setLoading(false);
    }
  }, [user?.id, currentFolder]);

  useEffect(() => { loadFiles(); }, [loadFiles]);

  const navigateToFolder = (folderId: string | null, folderName: string) => {
    if (folderId === null) {
      setCurrentFolder(null);
      setBreadcrumbs([{ id: null, name: "My Files" }]);
    } else {
      setCurrentFolder(folderId);
      setBreadcrumbs(prev => [...prev, { id: folderId, name: folderName }]);
    }
  };

  const navigateBreadcrumb = (index: number) => {
    const bc = breadcrumbs[index];
    setCurrentFolder(bc.id);
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    await supabase.functions.invoke("cloud-storage-api?action=create-folder", {
      body: { name: newFolderName.trim(), parent_id: currentFolder },
    });
    setNewFolderName("");
    setShowNewFolder(false);
    toast.success("Folder created");
    loadFiles();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0 || !user?.id) return;

    setUploading(true);
    for (const file of Array.from(fileList)) {
      // Init upload
      const initRes = await supabase.functions.invoke("cloud-storage-api?action=upload-init", {
        body: { file_name: file.name, file_size: file.size, mime_type: file.type, folder_id: currentFolder },
      });

      if (initRes.error || !initRes.data?.storage_key) {
        toast.error(`Upload init failed: ${initRes.error?.message || "Unknown error"}`);
        continue;
      }

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("user-files")
        .upload(initRes.data.storage_key, file, { contentType: file.type, upsert: false });

      if (uploadError) {
        toast.error(`Upload failed: ${uploadError.message}`);
        continue;
      }

      // Finalize
      await supabase.functions.invoke("cloud-storage-api?action=upload-finalize", {
        body: { blob_id: initRes.data.blob_id, file_name: file.name, folder_id: currentFolder, mime_type: file.type },
      });

      toast.success(`${file.name} uploaded`);
    }
    setUploading(false);
    loadFiles();
    e.target.value = "";
  };

  const deleteFile = async (fileId: string) => {
    await supabase.functions.invoke("cloud-storage-api?action=delete", {
      body: { file_id: fileId },
    });
    toast.success("Moved to trash");
    loadFiles();
  };

  const downloadFile = async (fileId: string) => {
    const res = await supabase.functions.invoke("cloud-storage-api?action=download-url", {
      body: { file_id: fileId },
    });
    if (res.data?.url) {
      window.open(res.data.url, "_blank");
    } else {
      toast.error("Download URL not available");
    }
  };

  const renameFile = async (fileId: string, newName: string) => {
    await supabase.functions.invoke("cloud-storage-api?action=rename", {
      body: { file_id: fileId, new_name: newName },
    });
    toast.success("Renamed");
    loadFiles();
  };

  const usagePct = quota.quota_bytes > 0 ? Math.round((quota.used_bytes / quota.quota_bytes) * 100) : 0;

  const filteredFiles = search
    ? files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    : files;
  const filteredFolders = search
    ? folders.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    : folders;

  return (
    <div className="space-y-4">
      {/* Quota Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <HardDrive className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Storage</span>
            <span className="text-xs text-muted-foreground ml-auto">
              {cloudStorageService.formatBytes(quota.used_bytes)} / {cloudStorageService.formatBytes(quota.quota_bytes)}
            </span>
          </div>
          <Progress value={usagePct} className="h-2" />
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-muted-foreground">{quota.file_count} files</span>
            <span className="text-xs text-muted-foreground">{usagePct}% used</span>
          </div>
        </CardContent>
      </Card>

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowNewFolder(!showNewFolder)}>
          <FolderPlus className="h-4 w-4 mr-1" /> New Folder
        </Button>
        <Button size="sm" variant="default" className="relative" disabled={uploading}>
          <Upload className="h-4 w-4 mr-1" /> {uploading ? "Uploading..." : "Upload"}
          <input
            type="file"
            multiple
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={handleUpload}
            disabled={uploading}
          />
        </Button>
        <div className="flex border rounded-md overflow-hidden">
          <Button size="icon" variant={viewMode === "list" ? "default" : "ghost"} className="h-8 w-8 rounded-none" onClick={() => setViewMode("list")}>
            <List className="h-4 w-4" />
          </Button>
          <Button size="icon" variant={viewMode === "grid" ? "default" : "ghost"} className="h-8 w-8 rounded-none" onClick={() => setViewMode("grid")}>
            <Grid3X3 className="h-4 w-4" />
          </Button>
        </div>
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={loadFiles}>
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
      </div>

      {/* New Folder Input */}
      {showNewFolder && (
        <div className="flex items-center gap-2">
          <Input
            placeholder="Folder name"
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && createFolder()}
            className="h-8 text-sm flex-1"
            autoFocus
          />
          <Button size="sm" onClick={createFolder}>Create</Button>
          <Button size="sm" variant="ghost" onClick={() => setShowNewFolder(false)}>Cancel</Button>
        </div>
      )}

      {/* Breadcrumbs */}
      <div className="flex items-center gap-1 text-sm text-muted-foreground overflow-x-auto">
        {breadcrumbs.map((bc, i) => (
          <span key={i} className="flex items-center gap-1 shrink-0">
            {i > 0 && <ChevronRight className="h-3 w-3" />}
            <button
              className={cn("hover:text-foreground transition-colors", i === breadcrumbs.length - 1 && "text-foreground font-medium")}
              onClick={() => navigateBreadcrumb(i)}
            >
              {i === 0 ? <Home className="h-3.5 w-3.5 inline mr-1" /> : null}
              {bc.name}
            </button>
          </span>
        ))}
      </div>

      {/* Content */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin mr-2" /> Loading...
            </div>
          ) : filteredFolders.length === 0 && filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Folder className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">No files yet</p>
              <p className="text-xs mt-1">Upload files or create a folder to get started</p>
            </div>
          ) : viewMode === "list" ? (
            <div className="divide-y divide-border/30">
              {filteredFolders.map(folder => (
                <div
                  key={folder.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => navigateToFolder(folder.id, folder.name)}
                >
                  <Folder className="h-5 w-5 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{folder.name}</p>
                    <p className="text-xs text-muted-foreground">Folder</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
              {filteredFiles.map(file => (
                <div key={file.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                  {getFileIcon(file.mime_type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {cloudStorageService.formatBytes(file.size)} · v{file.version} · {new Date(file.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-7 w-7">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => downloadFile(file.id)}>
                        <Download className="h-4 w-4 mr-2" /> Download
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        const name = prompt("New name:", file.name);
                        if (name) renameFile(file.id, name);
                      }}>
                        <FileText className="h-4 w-4 mr-2" /> Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => deleteFile(file.id)}>
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4">
              {filteredFolders.map(folder => (
                <div
                  key={folder.id}
                  className="flex flex-col items-center p-4 rounded-lg border border-border/30 hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => navigateToFolder(folder.id, folder.name)}
                >
                  <Folder className="h-10 w-10 text-primary mb-2" />
                  <p className="text-xs font-medium text-center truncate w-full">{folder.name}</p>
                </div>
              ))}
              {filteredFiles.map(file => (
                <div key={file.id} className="flex flex-col items-center p-4 rounded-lg border border-border/30 hover:bg-muted/30 transition-colors group relative">
                  <div className="mb-2">{getFileIcon(file.mime_type)}</div>
                  <p className="text-xs font-medium text-center truncate w-full">{file.name}</p>
                  <p className="text-[10px] text-muted-foreground">{cloudStorageService.formatBytes(file.size)}</p>
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-6 w-6">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => downloadFile(file.id)}>Download</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteFile(file.id)}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
