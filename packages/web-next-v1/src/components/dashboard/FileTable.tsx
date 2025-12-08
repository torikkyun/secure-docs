"use client";

import { Download, Eye, Share2, Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSelectedFile } from "@/contexts/SelectedFileContext";
import { useDownload } from "@/hooks/useDownload";
import { fileApi } from "@/lib/api";
import { formatBytes, formatDate } from "@/lib/formatters";
import getFileIcon from "@/lib/getFileIcon";
import type { File as FileType } from "@/types/api";

type FileTableProps = {
  files?: FileType[];
  loading?: boolean;
  onFileDeletedAction?: () => void;
  onShareAction?: (file: FileType) => void;
  sectionTitle?: string;
  isReceivedFiles?: boolean;
};

export default function FileTable({
  files = [],
  loading = false,
  onFileDeletedAction,
  onShareAction,
  sectionTitle = "Recent Files",
  isReceivedFiles = false,
}: FileTableProps) {
  const { selectedFile, setSelectedFile, setIsLoading } = useSelectedFile();
  const { downloadFile } = useDownload();
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle click outside to deselect
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      // Check if click is inside FileDetailsSidebar
      const sidebar = document.querySelector("[data-file-details-sidebar]");
      const isClickInsideSidebar = sidebar?.contains(target);

      if (
        selectedFile &&
        containerRef.current &&
        !containerRef.current.contains(target) &&
        !isClickInsideSidebar
      ) {
        setSelectedFile(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedFile, setSelectedFile]);

  const handleViewFile = async (file: FileType) => {
    try {
      setIsLoading(true);
      const response = await fileApi.findOne(file.id);
      setSelectedFile(response.file);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load file details"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareFile = (file: FileType) => {
    if (onShareAction) {
      onShareAction(file);
    } else {
      toast.error("Share action is not available");
    }
  };

  const handleDownloadFile = async (file: FileType) => {
    const loadingToast = toast.loading(
      `Preparing ${file.fileName} for download`
    );

    try {
      await downloadFile(file.id, (step) => {
        toast.loading(step, { id: loadingToast });
      });

      toast.success(`${file.fileName} downloaded successfully`, {
        id: loadingToast,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Download failed", {
        id: loadingToast,
      });
    }
  };

  const handleDeleteFile = async (file: FileType) => {
    // biome-ignore lint: User confirmation required for delete
    const confirmed = window.confirm(
      `Are you sure you want to delete "${file.fileName}"?`
    );
    if (!confirmed) {
      return;
    }

    const loadingToast = toast.loading(`Removing ${file.fileName}`);

    try {
      await fileApi.delete(file.id);

      toast.success(`${file.fileName} has been removed`, {
        id: loadingToast,
      });

      if (onFileDeletedAction) {
        onFileDeletedAction();
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete file",
        { id: loadingToast }
      );
    }
  };
  if (loading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between border-border border-t pt-6">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton className="h-16 w-full" key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!files || files.length === 0) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between border-border border-t pt-6">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-foreground text-lg">
              {sectionTitle}
            </h3>
          </div>
        </div>
        <div className="flex items-center justify-center rounded-lg border border-border bg-card p-12">
          <p className="text-muted-foreground text-sm">No files available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5" ref={containerRef}>
      {/* Section Header */}
      <div className="flex flex-col gap-3 border-border border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-foreground text-lg">{sectionTitle}</h3>
          <Badge className="bg-primary/20 text-primary" variant="secondary">
            {files.length} Total
          </Badge>
        </div>
      </div>

      {/* Table - Responsive with horizontal scroll on mobile */}
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border border-b hover:bg-transparent">
              <TableHead className="w-[40%] min-w-[200px]">File Name</TableHead>
              <TableHead className="hidden md:table-cell">Size</TableHead>
              <TableHead className="hidden lg:table-cell">
                Upload Date
              </TableHead>
              <TableHead className="w-16 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => (
              <ContextMenu key={file.id}>
                <ContextMenuTrigger asChild>
                  <TableRow
                    className={`group cursor-pointer border-border border-b transition-colors hover:bg-primary/5 ${
                      selectedFile?.id === file.id
                        ? "bg-primary/10 hover:bg-primary/10"
                        : ""
                    }`}
                    onClick={() => handleViewFile(file)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleViewFile(file);
                      }
                    }}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                            selectedFile?.id === file.id
                              ? "bg-primary/20"
                              : "bg-primary/10 group-hover:bg-primary/15"
                          }`}
                        >
                          {getFileIcon(file.fileName)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-foreground group-hover:text-primary">
                            {file.fileName}
                          </p>
                          <p className="truncate text-muted-foreground text-xs md:hidden">
                            {formatBytes(file.fileSize)} •{" "}
                            {formatDate(file.uploadTimestamp)}
                          </p>
                          <p className="hidden truncate text-muted-foreground text-xs md:block">
                            {file.fileType || "Unknown type"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground text-sm md:table-cell">
                      {formatBytes(file.fileSize)}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground text-sm lg:table-cell">
                      {formatDate(file.uploadTimestamp)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            className="size-8"
                            onClick={(e) => e.stopPropagation()}
                            size="icon"
                            variant="ghost"
                          >
                            <span className="sr-only">Open menu</span>
                            <svg
                              className="size-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <title>More options</title>
                              <path
                                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                              />
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewFile(file);
                            }}
                          >
                            <Eye className="mr-2 size-4" />
                            View Details
                          </DropdownMenuItem>
                          {!isReceivedFiles && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShareFile(file);
                              }}
                            >
                              <Share2 className="mr-2 size-4" />
                              Share File
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadFile(file);
                            }}
                          >
                            <Download className="mr-2 size-4" />
                            Download
                          </DropdownMenuItem>
                          {!isReceivedFiles && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteFile(file);
                                }}
                              >
                                <Trash2 className="mr-2 size-4" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-56">
                  <ContextMenuItem onClick={() => handleViewFile(file)}>
                    <Eye className="mr-2 size-4" />
                    View Details
                  </ContextMenuItem>
                  {!isReceivedFiles && (
                    <ContextMenuItem onClick={() => handleShareFile(file)}>
                      <Share2 className="mr-2 size-4" />
                      Share File
                    </ContextMenuItem>
                  )}
                  <ContextMenuItem onClick={() => handleDownloadFile(file)}>
                    <Download className="mr-2 size-4" />
                    Download
                  </ContextMenuItem>
                  {!isReceivedFiles && (
                    <>
                      <ContextMenuSeparator />
                      <ContextMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => handleDeleteFile(file)}
                      >
                        <Trash2 className="mr-2 size-4" />
                        Delete
                      </ContextMenuItem>
                    </>
                  )}
                </ContextMenuContent>
              </ContextMenu>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
