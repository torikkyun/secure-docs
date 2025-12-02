"use client";

import {
  CheckCircle,
  Clock,
  ExternalLink,
  FileText,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { accessGrantApi } from "@/lib/api";
import { formatBytes, formatDate } from "@/lib/formatters";
import type { AccessGrant } from "@/types/api";

/* formatBytes and formatDate moved to `@/lib/formatters` */

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
}: {
  grants: AccessGrant[];
  loading: boolean;
  type: "given" | "received";
  onRevoke?: (id: string) => void;
}) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 })
          .map(() => crypto.randomUUID())
          .map((id) => (
            <Skeleton className="h-16 w-full" key={id} />
          ))}
      </div>
    );
  }

  if (grants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="mb-4 size-12 text-muted-foreground" />
        <h3 className="mb-2 font-semibold text-lg">No shares found</h3>
        <p className="text-muted-foreground text-sm">
          {type === "given"
            ? "You haven't shared any files yet."
            : "No files have been shared with you."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>File Name</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>
              {type === "given" ? "Shared With" : "Shared By"}
            </TableHead>
            <TableHead>Date Granted</TableHead>
            <TableHead>Expires At</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {grants.map((grant) => (
            <TableRow key={grant.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-primary" />
                  {grant.file?.fileName || "Unknown file"}
                </div>
              </TableCell>
              <TableCell>
                {grant.file?.fileSize ? formatBytes(grant.file.fileSize) : "—"}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">
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
              <TableCell>{formatDate(grant.grantedAt)}</TableCell>
              <TableCell>
                {grant.expiresAt ? formatDate(grant.expiresAt) : "Never"}
              </TableCell>
              <TableCell>
                {getStatusBadge(grant.status.name, grant.expiresAt)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {grant.file && (
                    <Button
                      onClick={() =>
                        window.open(`/files/${grant.fileId}`, "_blank")
                      }
                      size="sm"
                      variant="ghost"
                    >
                      <ExternalLink className="size-4" />
                    </Button>
                  )}
                  {type === "given" &&
                    grant.status.name === "active" &&
                    onRevoke && (
                      <Button
                        className="text-destructive hover:text-destructive"
                        onClick={() => onRevoke(grant.id)}
                        size="sm"
                        variant="ghost"
                      >
                        <XCircle className="size-4" />
                      </Button>
                    )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function SharesPage() {
  const [activeTab, setActiveTab] = useState<"given" | "received">("given");
  const [grantsGiven, setGrantsGiven] = useState<AccessGrant[]>([]);
  const [grantsReceived, setGrantsReceived] = useState<AccessGrant[]>([]);
  const [loadingGiven, setLoadingGiven] = useState(true);
  const [loadingReceived, setLoadingReceived] = useState(true);

  const fetchGrantsGiven = useCallback(async () => {
    try {
      setLoadingGiven(true);
      const response = await accessGrantApi.findAll({ type: "given" });
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
      const response = await accessGrantApi.findAll({ type: "received" });
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

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingRevokeId, setPendingRevokeId] = useState<string | null>(null);

  const handleRevoke = (grantId: string) => {
    setPendingRevokeId(grantId);
    setConfirmOpen(true);
  };

  const confirmRevoke = async () => {
    if (!pendingRevokeId) {
      return;
    }
    try {
      const signature = `0x${"0".repeat(130)}`;
      await accessGrantApi.revoke(pendingRevokeId, {
        revokeReason: "Access revoked by owner",
        revokeSignature: signature,
      });
      toast.success("Access revoked successfully");
      setConfirmOpen(false);
      setPendingRevokeId(null);
      fetchGrantsGiven();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to revoke access"
      );
    }
  };

  return (
    <AppLayout breadcrumbs={["Shares"]}>
      <div className="space-y-6 p-4 md:p-6 lg:p-8">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">
            Shares Management
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage files you've shared and files shared with you
          </p>
        </div>

        <Tabs
          onValueChange={(v) => setActiveTab(v as "given" | "received")}
          value={activeTab}
        >
          <TabsList>
            <TabsTrigger value="given">Shared by Me</TabsTrigger>
            <TabsTrigger value="received">Shared with Me</TabsTrigger>
          </TabsList>

          <TabsContent className="mt-6" value="given">
            <SharesTable
              grants={grantsGiven}
              loading={loadingGiven}
              onRevoke={handleRevoke}
              type="given"
            />
          </TabsContent>

          <TabsContent className="mt-6" value="received">
            <SharesTable
              grants={grantsReceived}
              loading={loadingReceived}
              type="received"
            />
          </TabsContent>
        </Tabs>
        <Dialog onOpenChange={setConfirmOpen} open={confirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Revoke access</DialogTitle>
              <DialogDescription>
                Are you sure you want to revoke access to this file? This action
                can be undone only by granting access again.
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
      </div>
    </AppLayout>
  );
}
