"use client";

import { CheckCircle, Clock, Eye, XCircle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { signMessage } from "wagmi/actions";
import FileTable from "@/components/dashboard/FileTable";
import AppLayout from "@/components/layout/AppLayout";
import { ShareFileDialog } from "@/components/ShareFileDialog";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSelectedFile } from "@/contexts/SelectedFileContext";
import { useUnifiedSidebar } from "@/contexts/UnifiedSidebarContext";
import { loadIdentity } from "@/lib/crypto/key-manager";
import { formatBytes, formatDate } from "@/lib/formatters";
import getFileIcon from "@/lib/getFileIcon";
import { config } from "@/lib/wagmi-config";
import { fileService } from "@/services/api/file.service";
import { shareService } from "@/services/api/share.service";
import type { AccessGrant, File as FileType } from "@/types/api";

function getStatusBadge(status: string, expiresAt: string | null) {
  if (status === "revoked") {
    return (
      <Badge className="flex w-fit items-center gap-1" variant="destructive">
        <XCircle className="size-3" />
        Revoked
      </Badge>
    );
  }

  if (expiresAt && new Date(expiresAt) < new Date()) {
    return (
      <Badge className="flex w-fit items-center gap-1" variant="secondary">
        <Clock className="size-3" />
        Expired
      </Badge>
    );
  }

  return (
    <Badge
      className="flex w-fit items-center gap-1 bg-primary"
      variant="default"
    >
      <CheckCircle className="size-3" />
      Active
    </Badge>
  );
}

function SharesTable({
  grants,
  loading,
  type,
  onRevoke,
  selectedGrant,
  onSelectGrant,
}: {
  grants: AccessGrant[];
  loading: boolean;
  type: "given" | "received";
  onRevoke?: (id: string) => void;
  selectedGrant: AccessGrant | null;
  onSelectGrant: (grant: AccessGrant) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
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

  if (grants.length === 0) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between border-border border-t pt-6">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-foreground text-lg">
              {type === "given" ? "Shared by Me" : "Shared with Me"}
            </h3>
          </div>
        </div>
        <div className="flex items-center justify-center rounded-lg border border-border bg-card p-12">
          <p className="text-muted-foreground text-sm">
            {type === "given"
              ? "You haven't shared any files yet"
              : "No files have been shared with you"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5" ref={containerRef}>
      {/* Section Header */}
      <div className="flex flex-col gap-3 border-border border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-foreground text-lg">
            {type === "given" ? "Shared by Me" : "Shared with Me"}
          </h3>
          <Badge className="bg-primary/20 text-primary" variant="secondary">
            {grants.length} Total
          </Badge>
        </div>
      </div>

      {/* Table - Responsive with horizontal scroll on mobile */}
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border border-b hover:bg-transparent">
              <TableHead className="w-[35%] min-w-[200px]">File Name</TableHead>
              <TableHead className="hidden md:table-cell">
                {type === "given" ? "Shared With" : "Shared By"}
              </TableHead>
              <TableHead className="hidden lg:table-cell">Granted</TableHead>
              <TableHead className="hidden lg:table-cell">Expires</TableHead>
              <TableHead className="hidden xl:table-cell">Status</TableHead>
              <TableHead className="w-16 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grants.map((grant) => (
              <ContextMenu key={grant.id}>
                <ContextMenuTrigger asChild>
                  <TableRow
                    className={`group cursor-pointer border-border border-b transition-colors hover:bg-primary/5 ${
                      selectedGrant?.id === grant.id
                        ? "bg-primary/10 hover:bg-primary/10"
                        : ""
                    }`}
                    onClick={() => onSelectGrant(grant)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        onSelectGrant(grant);
                      }
                    }}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                            selectedGrant?.id === grant.id
                              ? "bg-primary/20"
                              : "bg-primary/10 group-hover:bg-primary/15"
                          }`}
                        >
                          {getFileIcon(grant.file?.fileName)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-foreground group-hover:text-primary">
                            {grant.file?.fileName || "Unknown file"}
                          </p>
                          <p className="truncate text-muted-foreground text-xs">
                            {grant.file?.fileSize
                              ? formatBytes(grant.file.fileSize)
                              : "—"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground text-sm">
                          {type === "given"
                            ? grant.grantee?.username
                            : grant.grantor?.username}
                        </span>
                        <span className="max-w-[150px] truncate text-muted-foreground text-xs">
                          {type === "given"
                            ? grant.grantee?.walletAddress
                            : grant.grantor?.walletAddress}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground text-sm lg:table-cell">
                      {formatDate(grant.grantedAt)}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground text-sm lg:table-cell">
                      {grant.expiresAt ? formatDate(grant.expiresAt) : "Never"}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      {getStatusBadge(grant.status.name, grant.expiresAt)}
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
                              onSelectGrant(grant);
                            }}
                          >
                            <Eye className="mr-2 size-4" />
                            View Details
                          </DropdownMenuItem>
                          {type === "given" &&
                            grant.status.name === "active" &&
                            onRevoke && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRevoke(grant.id);
                                  }}
                                >
                                  <XCircle className="mr-2 size-4" />
                                  Revoke Access
                                </DropdownMenuItem>
                              </>
                            )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-56">
                  <ContextMenuItem onClick={() => onSelectGrant(grant)}>
                    <Eye className="mr-2 size-4" />
                    View Details
                  </ContextMenuItem>
                  {type === "given" &&
                    grant.status.name === "active" &&
                    onRevoke && (
                      <>
                        <ContextMenuSeparator />
                        <ContextMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => onRevoke(grant.id)}
                        >
                          <XCircle className="mr-2 size-4" />
                          Revoke Access
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

export default function SharesPage() {
  const [activeTab, setActiveTab] = useState<"given" | "received">("given");
  const [grantsGiven, setGrantsGiven] = useState<AccessGrant[]>([]);
  const [grantsReceived, setGrantsReceived] = useState<AccessGrant[]>([]);
  const [loadingGiven, setLoadingGiven] = useState(true);
  const [loadingReceived, setLoadingReceived] = useState(true);
  const [myFiles, setMyFiles] = useState<FileType[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { setSelectedFile } = useSelectedFile();
  const {
    content,
    isOpen: sidebarOpen,
    showShareDetails,
    closeSidebar,
  } = useUnifiedSidebar();

  // Get current selected grant from unified sidebar
  const selectedGrant = content?.type === "share" ? content.data : null;

  const fetchGrantsGiven = useCallback(async () => {
    try {
      setLoadingGiven(true);
      const response = await shareService.findAll({ type: "given" });
      setGrantsGiven(response.grants);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load shares"
      );
    } finally {
      setLoadingGiven(false);
    }
  }, []);

  const fetchGrantsReceived = useCallback(async () => {
    try {
      setLoadingReceived(true);
      const response = await shareService.findAll({ type: "received" });
      setGrantsReceived(response.grants);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load shares"
      );
    } finally {
      setLoadingReceived(false);
    }
  }, []);

  // Run once on mount
  useEffect(() => {
    fetchGrantsGiven();
    fetchGrantsReceived();
  }, [fetchGrantsGiven, fetchGrantsReceived]);

  const fetchMyFiles = useCallback(async () => {
    try {
      setLoadingFiles(true);
      const res = await fileService.findAll({ limit: 100 });
      setMyFiles(res.files || []);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load files"
      );
      setMyFiles([]);
    } finally {
      setLoadingFiles(false);
    }
  }, []);

  // Handle click outside to deselect
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      // Check if click is inside UnifiedDetailsSidebar
      const sidebar = document.querySelector("[data-share-details-sidebar]");
      const isClickInsideSidebar = sidebar?.contains(target);

      if (
        sidebarOpen &&
        selectedGrant &&
        containerRef.current &&
        !containerRef.current.contains(target) &&
        !isClickInsideSidebar
      ) {
        closeSidebar();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedGrant, sidebarOpen, closeSidebar]);

  const handleSelectGrant = (grant: AccessGrant) => {
    showShareDetails(grant, activeTab);
    // Close file sidebar if open
    setSelectedFile(null);
  };

  // Fetch files when on 'given' tab
  useEffect(() => {
    if (activeTab === "given") {
      fetchMyFiles();
    }
  }, [activeTab, fetchMyFiles]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingRevokeId, setPendingRevokeId] = useState<string | null>(null);

  // Share flow state
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedFileToShare, setSelectedFileToShare] =
    useState<FileType | null>(null);

  // Handler for share action from FileTable
  const handleShareFromTable = (file: FileType) => {
    setSelectedFileToShare(file);
    setShareDialogOpen(true);
  };

  const handleRevoke = (grantId: string) => {
    setPendingRevokeId(grantId);
    setConfirmOpen(true);
  };

  // Helper to create SIWE revoke message
  const createRevokeMessage = (
    grantId: string,
    granteeAddress: string,
    publicKey: string
  ) => {
    const domain = window.location.host;
    const issuedAt = new Date().toISOString();
    const nonce = Math.random().toString(36).substring(2, 15);

    return `${domain} wants you to sign in with your Ethereum account:
${publicKey}

Revoke file access from: ${granteeAddress}

URI: ${window.location.origin}
Version: 1
Chain ID: 1
Nonce: ${nonce}
Issued At: ${issuedAt}
Resources:
- grant://${grantId}`;
  };

  // Helper to handle revoke errors
  const handleRevokeError = (error: unknown) => {
    console.error("Revoke error:", error);

    if (error instanceof Error && error.message.includes("User rejected")) {
      toast.error("Signature request was rejected");
    } else {
      toast.error(
        error instanceof Error ? error.message : "Failed to revoke access"
      );
    }
  };

  const confirmRevoke = async () => {
    if (!pendingRevokeId) {
      return;
    }

    try {
      // Load identity for signature
      const identity = await loadIdentity();
      if (!identity) {
        throw new Error("Identity not found. Please login first.");
      }

      // Find the grant details
      const grant = grantsGiven.find((g) => g.id === pendingRevokeId);
      if (!grant) {
        throw new Error("Grant not found");
      }

      // Create and sign revoke message
      const revokeMessage = createRevokeMessage(
        grant.id,
        grant.grantee?.walletAddress || "unknown",
        identity.publicKey
      );

      toast.info("Please sign the revoke request in your wallet");
      const signature = await signMessage(config, { message: revokeMessage });

      // Submit revoke request with signature
      await shareService.revoke(pendingRevokeId, {
        message: revokeMessage,
        signature,
        reason: "Access revoked by owner",
      });

      toast.success("Access revoked successfully");
      setConfirmOpen(false);
      setPendingRevokeId(null);

      // Refresh the grants list
      await fetchGrantsGiven();
    } catch (error) {
      handleRevokeError(error);
    }
  };

  const handleShareSuccess = () => {
    // refresh grants after successful share
    fetchGrantsGiven();
  };

  return (
    <AppLayout
      breadcrumbs={["Shares"]}
      description="Manage files you've shared and files shared with you"
      title="Shares Management"
    >
      <div className="flex h-full">
        <div
          className="flex-1 space-y-6 overflow-auto p-4 md:p-6 lg:p-8"
          ref={containerRef}
        >
          <Tabs
            onValueChange={(v) => setActiveTab(v as "given" | "received")}
            value={activeTab}
          >
            <TabsList>
              <TabsTrigger value="given">Shared by Me</TabsTrigger>
              <TabsTrigger value="received">Shared with Me</TabsTrigger>
            </TabsList>

            <TabsContent className="mt-6" value="given">
              <div className="space-y-6">
                <SharesTable
                  grants={grantsGiven}
                  loading={loadingGiven}
                  onRevoke={handleRevoke}
                  onSelectGrant={handleSelectGrant}
                  selectedGrant={selectedGrant}
                  type="given"
                />

                {/* Show FileTable for easy sharing */}
                <div className="rounded-lg border bg-card p-6">
                  <h3 className="mb-4 font-semibold text-lg">
                    Quick Share - My Files
                  </h3>
                  <FileTable
                    files={myFiles}
                    loading={loadingFiles}
                    onFileDeletedAction={fetchMyFiles}
                    onShareAction={handleShareFromTable}
                    sectionTitle=""
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent className="mt-6" value="received">
              <SharesTable
                grants={grantsReceived}
                loading={loadingReceived}
                onSelectGrant={handleSelectGrant}
                selectedGrant={selectedGrant}
                type="received"
              />
            </TabsContent>
          </Tabs>
          <Dialog onOpenChange={setConfirmOpen} open={confirmOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Revoke access</DialogTitle>
                <DialogDescription>
                  Are you sure you want to revoke access to this file? This
                  action can be undone only by granting access again.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  onClick={() => setConfirmOpen(false)}
                  size="sm"
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button onClick={confirmRevoke} size="sm" variant="destructive">
                  Revoke Access
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Share dialog (per-file) */}
          <ShareFileDialog
            file={selectedFileToShare}
            isOpen={shareDialogOpen}
            onCloseAction={() => setShareDialogOpen(false)}
            onSuccessAction={handleShareSuccess}
          />
        </div>
      </div>
    </AppLayout>
  );
}
