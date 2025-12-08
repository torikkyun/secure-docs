"use client";

import {
  Calendar,
  ChevronRight,
  Copy,
  FileText,
  HardDrive,
  Hash,
  User,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useSelectedFile } from "@/contexts/SelectedFileContext";
import { formatBytes, formatDate } from "@/lib/formatters";

type FileDetailsSidebarProps = {
  isOpen: boolean;
  onClose?: () => void;
};

function truncateHash(hash: string, start = 8, end = 8): string {
  if (hash.length <= start + end) {
    return hash;
  }
  return `${hash.slice(0, start)}...${hash.slice(-end)}`;
}

const STATUS_MAP: Record<string, string> = {
  active: "Hoạt động",
  revoked: "Đã thu hồi",
  deleted: "Đã xóa",
  pending: "Đang chờ",
};

export default function FileDetailsSidebar({
  isOpen,
  onClose,
}: FileDetailsSidebarProps) {
  const { selectedFile, isLoading } = useSelectedFile();

  if (!isOpen) {
    return null;
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You can add toast notification here
  };

  return (
    <aside
      className="flex h-full w-full flex-col space-y-6 overflow-y-auto border-l border-gray-200 bg-white dark:bg-black dark:border-zinc-800 p-4 shadow-none sm:w-[320px] sm:p-6 md:w-[360px] xl:w-[400px]"
      data-file-details-sidebar
    >
      {/* Header with Close Button */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 pb-4">
        <h3 className="font-bold text-lg text-black dark:text-white">Chi tiết tệp</h3>
        <Button
          className="size-8 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full"
          onClick={onClose}
          size="icon"
          variant="ghost"
        >
          <X className="size-5" />
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-xl bg-gray-100 dark:bg-zinc-900" />
          <Skeleton className="h-20 w-full rounded-xl bg-gray-100 dark:bg-zinc-900" />
          <Skeleton className="h-20 w-full rounded-xl bg-gray-100 dark:bg-zinc-900" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && selectedFile === null && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-gray-50 dark:bg-zinc-900">
            <ChevronRight className="size-8 text-gray-400 dark:text-gray-600" />
          </div>
          <h4 className="mb-2 font-bold text-black dark:text-white">
            Chưa chọn tệp nào
          </h4>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Chọn một tệp để xem chi tiết
          </p>
        </div>
      )}

      {/* File Details */}
      {!isLoading && selectedFile && (
        <div className="space-y-6">
          {/* File Info Card */}
          <div className="space-y-3 rounded-xl border border-dashed border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900/50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black">
                <FileText className="size-6" />
              </div>
              <div className="flex-1 overflow-hidden">
                <h4 className="truncate font-bold text-black dark:text-white">
                  {selectedFile.fileName}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                  {selectedFile.fileType || "Loại không xác định"}
                </p>
              </div>
            </div>
            <Badge
              className="bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 w-full justify-center py-1 mt-1"
              variant="secondary"
            >
              {STATUS_MAP[selectedFile.status.name.toLowerCase()] ||
                selectedFile.status.name}
            </Badge>
          </div>

          <Separator className="bg-gray-200 dark:bg-zinc-800" />

          {/* File Properties */}
          <div className="space-y-4">
            <h4 className="font-bold text-black dark:text-white text-sm uppercase tracking-wider text-xs text-gray-500 dark:text-gray-500">
              Thuộc tính
            </h4>

            {/* Size */}
            <div className="flex items-start gap-3 group">
              <div className="p-2 rounded-lg bg-gray-50 dark:bg-zinc-900 text-gray-500 dark:text-gray-400">
                <HardDrive className="size-4" />
              </div>
              <div className="flex-1 py-1">
                <p className="text-black dark:text-white text-sm font-medium">Kích thước</p>
                <p className="text-gray-600 dark:text-gray-400 text-xs mt-0.5">
                  {formatBytes(selectedFile.fileSize)}
                </p>
              </div>
            </div>

            {/* Upload Date */}
            <div className="flex items-start gap-3 group">
              <div className="p-2 rounded-lg bg-gray-50 dark:bg-zinc-900 text-gray-500 dark:text-gray-400">
                <Calendar className="size-4" />
              </div>
              <div className="flex-1 py-1">
                <p className="text-black dark:text-white text-sm font-medium">Đã tải lên</p>
                <p className="text-gray-600 dark:text-gray-400 text-xs mt-0.5">
                  {formatDate(selectedFile.uploadTimestamp)}
                </p>
              </div>
            </div>

            {/* Owner */}
            {selectedFile.owner && (
              <div className="flex items-start gap-3 group">
                <div className="p-2 rounded-lg bg-gray-50 dark:bg-zinc-900 text-gray-500 dark:text-gray-400">
                  <User className="size-4" />
                </div>
                <div className="flex-1 overflow-hidden py-1">
                  <p className="text-black dark:text-white text-sm font-medium">Chủ sở hữu</p>
                  <p className="truncate text-gray-600 dark:text-gray-400 text-xs mt-0.5">
                    {selectedFile.owner.username}
                  </p>
                  <p className="truncate text-gray-400 dark:text-gray-500 text-xs font-mono mt-0.5">
                    {truncateHash(selectedFile.owner.walletAddress)}
                  </p>
                </div>
              </div>
            )}
          </div>

          <Separator className="bg-gray-200 dark:bg-zinc-800" />

          {/* Technical Details */}
          <div className="space-y-4">
            <h4 className="font-bold text-black dark:text-white text-sm uppercase tracking-wider text-xs text-gray-500 dark:text-gray-500">
              Chi tiết kỹ thuật
            </h4>

            {/* File Hash */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Hash className="size-3 text-gray-400" />
                <p className="text-black dark:text-white text-xs font-medium">Mã băm tệp</p>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 px-3 py-2 font-mono text-xs text-gray-600 dark:text-gray-300">
                  {truncateHash(selectedFile.fileHash, 10, 10)}
                </code>
                <Button
                  className="size-8 shrink-0 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-800"
                  onClick={() => copyToClipboard(selectedFile.fileHash)}
                  size="icon"
                  variant="ghost"
                >
                  <Copy className="size-3.5 text-black dark:text-white" />
                </Button>
              </div>
            </div>

            {/* CID */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <div className="size-1.5 rounded-full bg-blue-500" />
                </div>
                <p className="text-black dark:text-white text-xs font-medium">IPFS CID</p>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 px-3 py-2 font-mono text-xs text-gray-600 dark:text-gray-300">
                  {selectedFile.cid}
                </code>
                <Button
                  className="size-8 shrink-0 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-800"
                  onClick={() => copyToClipboard(selectedFile.cid)}
                  size="icon"
                  variant="ghost"
                >
                  <Copy className="size-3.5 text-black dark:text-white" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
