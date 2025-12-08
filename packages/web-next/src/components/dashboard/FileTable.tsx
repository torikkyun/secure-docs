"use client";

import { Download, Eye, Share2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
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
};

export default function FileTable({
  files = [],
  loading = false,
  onFileDeletedAction,
  onShareAction,
}: FileTableProps) {
  const router = useRouter();
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
        error instanceof Error ? error.message : "Không thể tải chi tiết tệp"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareFile = (file: FileType) => {
    if (onShareAction) {
      onShareAction(file);
    } else {
      router.push(`/files/${file.id}/share`);
    }
  };

  const handleDownloadFile = async (file: FileType) => {
    const loadingToast = toast.loading(
      `Đang chuẩn bị tải xuống ${file.fileName}`
    );

    try {
      await downloadFile(file.id, (step) => {
        toast.loading(step, { id: loadingToast });
      });

      toast.success(`${file.fileName} đã được tải xuống thành công`, {
        id: loadingToast,
        duration: 3000,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Tải xuống thất bại", {
        id: loadingToast,
        duration: 3000,
      });
    }
  };

  const handleDeleteFile = async (file: FileType) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa "${file.fileName}" không?`
    );
    if (!confirmed) {
      return;
    }

    const loadingToast = toast.loading(`Đang xóa ${file.fileName}`);

    try {
      await fileApi.delete(file.id);

      toast.success(`${file.fileName} đã được xóa`, {
        id: loadingToast,
        duration: 3000,
      });

      if (onFileDeletedAction) {
        onFileDeletedAction();
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể xóa tệp",
        { id: loadingToast, duration: 3000 }
      );
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 pb-4">
          <Skeleton className="h-6 w-32 bg-gray-200 dark:bg-zinc-800" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton className="h-16 w-full bg-gray-100 dark:bg-zinc-900" key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!files || files.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-black dark:text-white text-lg">Tệp gần đây</h3>
          </div>
        </div>
        <div className="flex items-center justify-center rounded-lg border border-dashed border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900/50 p-12">
          <p className="text-gray-500 dark:text-gray-400 text-sm">Không tệp nào khả dụng</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" ref={containerRef}>
      {/* Section Header */}
      <div className="flex flex-col gap-3 border-b border-gray-200 dark:border-zinc-800 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-black dark:text-white text-lg">Tệp gần đây</h3>
          <Badge className="bg-gray-100 dark:bg-zinc-800 text-black dark:text-white border-0" variant="secondary">
            {files.length} Tổng cộng
          </Badge>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black w-full shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-zinc-900">
            <TableRow className="border-gray-200 dark:border-zinc-800 hover:bg-transparent">
              <TableHead className="w-[40%] min-w-[200px] text-black dark:text-white font-semibold">Tên tệp</TableHead>
              <TableHead className="hidden md:table-cell text-black dark:text-white font-semibold">Kích thước</TableHead>
              <TableHead className="hidden lg:table-cell text-black dark:text-white font-semibold">
                Ngày tải lên
              </TableHead>
              <TableHead className="w-16 text-right text-black dark:text-white font-semibold">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => (
              <ContextMenu key={file.id}>
                <ContextMenuTrigger asChild>
                  <TableRow
                    className={`group cursor-pointer border-gray-100 dark:border-zinc-900/50 border-b last:border-0 transition-colors hover:bg-gray-50 dark:hover:bg-zinc-900 ${selectedFile?.id === file.id
                      ? "bg-gray-100 dark:bg-zinc-900"
                      : ""
                      }`}
                    onClick={() => handleViewFile(file)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleViewFile(file);
                      }
                    }}
                  >
                    <TableCell className="font-medium py-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors border border-gray-100 dark:border-zinc-800 ${selectedFile?.id === file.id
                            ? "bg-white dark:bg-black shadow-sm"
                            : "bg-gray-50 dark:bg-zinc-900 group-hover:bg-white dark:group-hover:bg-black group-hover:shadow-sm"
                            }`}
                        >
                          {getFileIcon(file.fileName)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`truncate font-semibold text-sm transition-colors ${selectedFile?.id === file.id ? "text-black dark:text-white" : "text-gray-900 dark:text-gray-100 group-hover:text-black dark:group-hover:text-white"}`}>
                            {file.fileName}
                          </p>
                          <p className="truncate text-gray-500 text-xs md:hidden mt-1">
                            {formatBytes(file.fileSize)} •{" "}
                            {formatDate(file.uploadTimestamp)}
                          </p>
                          <p className="hidden truncate text-gray-400 text-xs md:block mt-1">
                            {file.fileType || "Loại không xác định"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-gray-600 dark:text-gray-400 text-sm md:table-cell">
                      {formatBytes(file.fileSize)}
                    </TableCell>
                    <TableCell className="hidden text-gray-600 dark:text-gray-400 text-sm lg:table-cell">
                      {formatDate(file.uploadTimestamp)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            className="size-8 rounded-full data-[state=open]:bg-gray-100 dark:data-[state=open]:bg-zinc-800"
                            onClick={(e) => e.stopPropagation()}
                            size="icon"
                            variant="ghost"
                          >
                            <span className="sr-only">Mở menu</span>
                            <svg // Meatballs menu icon
                              className="size-4 text-gray-500"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px] bg-white dark:bg-black border border-gray-200 dark:border-zinc-800">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewFile(file);
                            }}
                            className="cursor-pointer text-gray-700 dark:text-gray-300 focus:bg-gray-100 dark:focus:bg-zinc-900 py-2.5"
                          >
                            <Eye className="mr-2 size-4" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShareFile(file);
                            }}
                            className="cursor-pointer text-gray-700 dark:text-gray-300 focus:bg-gray-100 dark:focus:bg-zinc-900 py-2.5"
                          >
                            <Share2 className="mr-2 size-4" />
                            Chia sẻ tệp
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadFile(file);
                            }}
                            className="cursor-pointer text-gray-700 dark:text-gray-300 focus:bg-gray-100 dark:focus:bg-zinc-900 py-2.5"
                          >
                            <Download className="mr-2 size-4" />
                            Tải xuống
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-gray-100 dark:bg-zinc-800" />
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-950/20 cursor-pointer py-2.5"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFile(file);
                            }}
                          >
                            <Trash2 className="mr-2 size-4" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-56 bg-white dark:bg-black border border-gray-200 dark:border-zinc-800">
                  <ContextMenuItem onClick={() => handleViewFile(file)} className="cursor-pointer text-gray-700 dark:text-gray-300 focus:bg-gray-100 dark:focus:bg-zinc-900 py-2.5">
                    <Eye className="mr-2 size-4" />
                    Xem chi tiết
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => handleShareFile(file)} className="cursor-pointer text-gray-700 dark:text-gray-300 focus:bg-gray-100 dark:focus:bg-zinc-900 py-2.5">
                    <Share2 className="mr-2 size-4" />
                    Chia sẻ tệp
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => handleDownloadFile(file)} className="cursor-pointer text-gray-700 dark:text-gray-300 focus:bg-gray-100 dark:focus:bg-zinc-900 py-2.5">
                    <Download className="mr-2 size-4" />
                    Tải xuống
                  </ContextMenuItem>
                  <ContextMenuSeparator className="bg-gray-100 dark:bg-zinc-800" />
                  <ContextMenuItem
                    className="text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-950/20 cursor-pointer py-2.5"
                    onClick={() => handleDeleteFile(file)}
                  >
                    <Trash2 className="mr-2 size-4" />
                    Xóa
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
