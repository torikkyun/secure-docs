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
      <Badge className="flex w-fit items-center gap-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-900" variant="outline">
        <XCircle className="size-3" />
        Đã thu hồi
      </Badge>
    );
  }

  if (expiresAt && new Date(expiresAt) < new Date()) {
    return (
      <Badge className="flex w-fit items-center gap-1 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700" variant="outline">
        <Clock className="size-3" />
        Đã hết hạn
      </Badge>
    );
  }

  return (
    <Badge
      className="flex w-fit items-center gap-1 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
      variant="default"
    >
      <CheckCircle className="size-3" />
      Hoạt động
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
      <div className="flex flex-col items-center justify-center py-24 text-center border rounded-lg border-dashed border-gray-300 dark:border-neutral-800">
        <FileText className="mb-4 size-12 text-gray-400 dark:text-gray-600" />
        <h3 className="mb-2 font-bold text-lg text-black dark:text-white">Không tìm thấy chia sẻ</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {type === "given"
            ? "Bạn chưa chia sẻ tệp nào."
            : "Chưa có tệp nào được chia sẻ với bạn."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-neutral-800 overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50 dark:bg-neutral-900">
          <TableRow className="border-gray-200 dark:border-neutral-800 hover:bg-transparent">
            <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Tên Tệp</TableHead>
            <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Kích thước</TableHead>
            <TableHead className="font-semibold text-gray-900 dark:text-gray-100">
              {type === "given" ? "Chia sẻ với" : "Chia sẻ bởi"}
            </TableHead>
            <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Ngày cấp</TableHead>
            <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Hết hạn vào</TableHead>
            <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Trạng thái</TableHead>
            <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {grants.map((grant) => (
            <TableRow key={grant.id} className="border-gray-100 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800/50">
              <TableCell className="font-medium text-black dark:text-white">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-gray-100 dark:bg-neutral-800 p-2">
                    <FileText className="size-4 text-black dark:text-white" />
                  </div>
                  {grant.file?.fileName || "Tệp không xác định"}
                </div>
              </TableCell>
              <TableCell className="text-gray-600 dark:text-gray-400">
                {grant.file?.fileSize ? formatBytes(grant.file.fileSize) : "—"}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-black dark:text-white">
                    {type === "given"
                      ? grant.grantee?.username
                      : grant.grantor?.username}
                  </span>
                  <span className="max-w-[150px] truncate text-gray-500 text-xs font-mono">
                    {type === "given"
                      ? grant.grantee?.walletAddress
                      : grant.grantor?.walletAddress}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-gray-600 dark:text-gray-400">{formatDate(grant.grantedAt)}</TableCell>
              <TableCell className="text-gray-600 dark:text-gray-400">
                {grant.expiresAt ? formatDate(grant.expiresAt) : "Không bao giờ"}
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
                      className="hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
                      title="Mở tệp"
                    >
                      <ExternalLink className="size-4" />
                    </Button>
                  )}
                  {type === "given" &&
                    grant.status.name === "active" &&
                    onRevoke && (
                      <Button
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                        onClick={() => onRevoke(grant.id)}
                        size="sm"
                        variant="ghost"
                        title="Thu hồi quyền truy cập"
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
        error instanceof Error ? error.message : "Không thể tải danh sách chia sẻ"
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
        error instanceof Error ? error.message : "Không thể tải danh sách chia sẻ"
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
      toast.success("Thu hồi quyền truy cập thành công");
      setConfirmOpen(false);
      setPendingRevokeId(null);
      fetchGrantsGiven();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Thu hồi quyền truy cập thất bại"
      );
    }
  };

  return (
    <AppLayout breadcrumbs={["Chia sẻ"]}>
      <div className="space-y-6 p-4 md:p-6 lg:p-8 min-h-screen bg-white dark:bg-neutral-950 text-black dark:text-white">
        <div>
          <h1 className="font-bold text-3xl tracking-tight text-black dark:text-white">
            Quản lý chia sẻ
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Quản lý các tệp bạn đã chia sẻ và các tệp được chia sẻ với bạn
          </p>
        </div>

        <Tabs
          onValueChange={(v) => setActiveTab(v as "given" | "received")}
          value={activeTab}
          className="w-full"
        >
          <TabsList className="bg-transparent border-b border-gray-300 dark:border-neutral-700 p-0 w-full justify-start rounded-none h-auto gap-0">
            <TabsTrigger
              value="given"
              className="relative px-4 py-4 font-semibold text-base rounded-none border-b-2 border-transparent data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:border-black dark:data-[state=active]:bg-white dark:data-[state=active]:border-white dark:data-[state=active]:text-black text-gray-700 dark:text-gray-500 bg-transparent hover:text-gray-900 dark:hover:text-gray-300 transition-all duration-200"
            >
              Tôi đã chia sẻ
            </TabsTrigger>
            <TabsTrigger
              value="received"
              className="relative px-4 py-4 font-semibold text-base rounded-none border-b-2 border-transparent data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:border-black dark:data-[state=active]:bg-white dark:data-[state=active]:border-white dark:data-[state=active]:text-black text-gray-700 dark:text-gray-500 bg-transparent hover:text-gray-900 dark:hover:text-gray-300 transition-all duration-200"
            >
              Được chia sẻ với tôi
            </TabsTrigger>
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
          <DialogContent className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800">
            <DialogHeader>
              <DialogTitle className="text-black dark:text-white">Thu hồi quyền truy cập</DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                Bạn có chắc chắn muốn thu hồi quyền truy cập vào tệp này không? Hành động này có thể được hoàn tác bằng cách cấp quyền lại.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                onClick={() => setConfirmOpen(false)}
                size="sm"
                variant="outline"
                className="border-gray-200 dark:border-neutral-700"
              >
                Hủy
              </Button>
              <Button
                onClick={confirmRevoke}
                size="sm"
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Thu hồi
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
