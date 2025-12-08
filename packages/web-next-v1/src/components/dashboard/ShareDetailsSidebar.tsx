"use client";

import {
  Calendar,
  ChevronRight,
  Copy,
  Hash,
  Share2,
  User,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBytes, formatDate } from "@/lib/formatters";
import getFileIcon from "@/lib/getFileIcon";
import type { AccessGrant } from "@/types/api";

type ShareDetailsSidebarProps = {
  isOpen: boolean;
  selectedGrant: AccessGrant | null;
  isLoading?: boolean;
  type: "given" | "received";
  onCloseAction?: () => void;
};

function truncateHash(
  hash: string | undefined | null,
  start = 8,
  end = 8
): string {
  if (!hash) {
    return "N/A";
  }
  if (hash.length <= start + end) {
    return hash;
  }
  return `${hash.slice(0, start)}...${hash.slice(-end)}`;
}

function getStatusBadge(status: string, expiresAt: string | null) {
  if (status === "revoked") {
    return <Badge variant="destructive">Revoked</Badge>;
  }

  if (expiresAt && new Date(expiresAt) < new Date()) {
    return <Badge variant="secondary">Expired</Badge>;
  }

  return (
    <Badge className="bg-primary" variant="default">
      Active
    </Badge>
  );
}

export default function ShareDetailsSidebar({
  isOpen,
  selectedGrant,
  isLoading = false,
  type,
  onCloseAction,
}: ShareDetailsSidebarProps) {
  if (!isOpen) {
    return null;
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <aside
      className="flex h-full w-full flex-col space-y-6 overflow-y-auto border-border border-l bg-card p-4 shadow-2xl sm:w-[320px] sm:p-6 md:w-[360px] xl:w-[400px] xl:shadow-none"
      data-share-details-sidebar
    >
      {/* Header with Close Button */}
      <div className="flex items-center justify-between border-border border-b pb-4">
        <h3 className="font-bold">Share Details</h3>
        <Button
          className="size-6"
          onClick={onCloseAction}
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
      {!isLoading && selectedGrant === null && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
            <ChevronRight className="size-8 text-muted-foreground" />
          </div>
          <h4 className="mb-2 font-semibold text-foreground">
            No Share Selected
          </h4>
          <p className="text-muted-foreground text-sm">
            Select a share to view its details
          </p>
        </div>
      )}

      {/* Share Details */}
      {!isLoading && selectedGrant && (
        <div className="space-y-6">
          {/* File Info Card */}
          <div className="space-y-3 rounded-lg border border-border bg-muted/50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                {getFileIcon(
                  selectedGrant.file?.fileName,
                  "size-6 text-primary"
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <h4 className="truncate font-semibold text-foreground">
                  {selectedGrant.file?.fileName || "Unknown file"}
                </h4>
                <p className="text-muted-foreground text-xs">
                  {selectedGrant.file?.fileType || "Unknown type"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Size</span>
              <span className="font-medium text-foreground">
                {selectedGrant.file?.fileSize
                  ? formatBytes(selectedGrant.file.fileSize)
                  : "—"}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              {getStatusBadge(
                selectedGrant.status.name,
                selectedGrant.expiresAt
              )}
            </div>
          </div>

          <Separator />

          {/* Share Information */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 font-semibold text-foreground text-sm">
              <Share2 className="size-4" />
              Share Information
            </h4>

            {/* Shared With/By */}
            <div className="space-y-2">
              <p className="text-muted-foreground text-xs">
                {type === "given" ? "Shared With" : "Shared By"}
              </p>
              <div className="flex items-center gap-2">
                <User className="size-4 text-muted-foreground" />
                <div className="flex-1 overflow-hidden">
                  <p className="truncate font-medium text-foreground text-sm">
                    {type === "given"
                      ? selectedGrant.grantee?.username
                      : selectedGrant.grantor?.username}
                  </p>
                  <p className="truncate text-muted-foreground text-xs">
                    {truncateHash(
                      type === "given"
                        ? selectedGrant.grantee?.walletAddress || ""
                        : selectedGrant.grantor?.walletAddress || "",
                      6,
                      4
                    )}
                  </p>
                </div>
                <Button
                  className="size-6 shrink-0"
                  onClick={() =>
                    copyToClipboard(
                      type === "given"
                        ? selectedGrant.grantee?.walletAddress || ""
                        : selectedGrant.grantor?.walletAddress || ""
                    )
                  }
                  size="icon"
                  variant="ghost"
                >
                  <Copy className="size-3" />
                </Button>
              </div>
            </div>

            {/* Granted Date */}
            <div className="space-y-2">
              <p className="text-muted-foreground text-xs">Date Granted</p>
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-muted-foreground" />
                <span className="font-medium text-foreground text-sm">
                  {formatDate(selectedGrant.grantedAt)}
                </span>
              </div>
            </div>

            {/* Expiry Date */}
            <div className="space-y-2">
              <p className="text-muted-foreground text-xs">Expires At</p>
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-muted-foreground" />
                <span className="font-medium text-foreground text-sm">
                  {selectedGrant.expiresAt
                    ? formatDate(selectedGrant.expiresAt)
                    : "Never"}
                </span>
              </div>
            </div>

            {/* Revoked Date */}
            {selectedGrant.revokedAt && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs">Revoked At</p>
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 text-muted-foreground" />
                  <span className="font-medium text-foreground text-sm">
                    {formatDate(selectedGrant.revokedAt)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Blockchain Information */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 font-semibold text-foreground text-sm">
              <Hash className="size-4" />
              Blockchain
            </h4>

            <div className="space-y-2">
              <p className="text-muted-foreground text-xs">Transaction Hash</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate rounded bg-muted px-2 py-1 font-mono text-foreground text-xs">
                  {truncateHash(selectedGrant.txHash, 10, 8)}
                </code>
                <Button
                  className="size-6 shrink-0"
                  onClick={() => copyToClipboard(selectedGrant.txHash)}
                  size="icon"
                  variant="ghost"
                >
                  <Copy className="size-3" />
                </Button>
              </div>
            </div>

            {/* View on Explorer */}
            <Button asChild className="w-full" size="sm" variant="outline">
              <a
                href={`https://sepolia.etherscan.io/tx/${selectedGrant.txHash}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                View on Etherscan
              </a>
            </Button>
          </div>

          {/* File Owner (if received) */}
          {type === "received" && selectedGrant.file?.owner && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 font-semibold text-foreground text-sm">
                  <User className="size-4" />
                  File Owner
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="size-4 text-muted-foreground" />
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate font-medium text-foreground text-sm">
                        {selectedGrant.file.owner.username}
                      </p>
                      <p className="truncate text-muted-foreground text-xs">
                        {truncateHash(
                          selectedGrant.file.owner.walletAddress,
                          6,
                          4
                        )}
                      </p>
                    </div>
                    <Button
                      className="size-6 shrink-0"
                      onClick={() =>
                        copyToClipboard(
                          selectedGrant.file?.owner?.walletAddress || ""
                        )
                      }
                      size="icon"
                      variant="ghost"
                    >
                      <Copy className="size-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </aside>
  );
}
