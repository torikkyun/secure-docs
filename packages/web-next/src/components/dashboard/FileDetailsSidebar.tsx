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
      className="flex h-full w-full flex-col space-y-6 overflow-y-auto border-border border-l bg-card p-4 shadow-2xl sm:w-[320px] sm:p-6 md:w-[360px] xl:w-[400px] xl:shadow-none"
      data-file-details-sidebar
    >
      {/* Header with Close Button */}
      <div className="flex items-center justify-between border-border border-b pb-4">
        <h3 className="font-bold">File Details</h3>
        <Button
          className="size-6"
          onClick={onClose}
          size="icon"
          variant="ghost"
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && selectedFile === null && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
            <ChevronRight className="size-8 text-muted-foreground" />
          </div>
          <h4 className="mb-2 font-semibold text-foreground">
            No File Selected
          </h4>
          <p className="text-muted-foreground text-sm">
            Select a file to view its details
          </p>
        </div>
      )}

      {/* File Details */}
      {!isLoading && selectedFile && (
        <div className="space-y-6">
          {/* File Info Card */}
          <div className="space-y-3 rounded-lg border border-border bg-muted/50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="size-6 text-primary" />
              </div>
              <div className="flex-1 overflow-hidden">
                <h4 className="truncate font-semibold text-foreground">
                  {selectedFile.fileName}
                </h4>
                <p className="text-muted-foreground text-xs">
                  {selectedFile.fileType || "Unknown type"}
                </p>
              </div>
            </div>
            <Badge
              className="bg-green-500/10 text-green-600"
              variant="secondary"
            >
              {selectedFile.status.name}
            </Badge>
          </div>

          <Separator />

          {/* File Properties */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground text-sm">
              Properties
            </h4>

            {/* Size */}
            <div className="flex items-start gap-3">
              <HardDrive className="mt-0.5 size-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-foreground text-sm">Size</p>
                <p className="text-muted-foreground text-xs">
                  {formatBytes(selectedFile.fileSize)}
                </p>
              </div>
            </div>

            {/* Upload Date */}
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 size-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-foreground text-sm">Uploaded</p>
                <p className="text-muted-foreground text-xs">
                  {formatDate(selectedFile.uploadTimestamp)}
                </p>
              </div>
            </div>

            {/* Owner */}
            {selectedFile.owner && (
              <div className="flex items-start gap-3">
                <User className="mt-0.5 size-4 text-muted-foreground" />
                <div className="flex-1 overflow-hidden">
                  <p className="text-foreground text-sm">Owner</p>
                  <p className="truncate text-muted-foreground text-xs">
                    {selectedFile.owner.username}
                  </p>
                  <p className="truncate text-muted-foreground text-xs">
                    {truncateHash(selectedFile.owner.walletAddress)}
                  </p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Technical Details */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground text-sm">
              Technical Details
            </h4>

            {/* File Hash */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Hash className="size-4 text-muted-foreground" />
                <p className="text-foreground text-sm">File Hash</p>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate rounded bg-muted px-2 py-1 font-mono text-muted-foreground text-xs">
                  {truncateHash(selectedFile.fileHash, 10, 10)}
                </code>
                <Button
                  className="size-6 shrink-0"
                  onClick={() => copyToClipboard(selectedFile.fileHash)}
                  size="icon"
                  variant="ghost"
                >
                  <Copy className="size-3" />
                </Button>
              </div>
            </div>

            {/* CID */}
            <div className="space-y-2">
              <p className="text-foreground text-sm">IPFS CID</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate rounded bg-muted px-2 py-1 font-mono text-muted-foreground text-xs">
                  {selectedFile.cid}
                </code>
                <Button
                  className="size-6 shrink-0"
                  onClick={() => copyToClipboard(selectedFile.cid)}
                  size="icon"
                  variant="ghost"
                >
                  <Copy className="size-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
