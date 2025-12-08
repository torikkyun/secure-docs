"use client";

import {
  CheckCircle,
  Clock,
  Download as DownloadIcon,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { downloadApi } from "@/lib/api";
import { formatDate } from "@/lib/formatters";
import getFileIcon from "@/lib/getFileIcon";
import type { Download } from "@/types/api";

function getStatusBadge(status: string) {
  switch (status.toLowerCase()) {
    case "success":
      return (
        <Badge
          className="flex w-fit items-center gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-900"
          variant="outline"
        >
          <CheckCircle className="size-3" />
          Thành công
        </Badge>
      );
    case "failed":
      return (
        <Badge className="flex w-fit items-center gap-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-900" variant="outline">
          <XCircle className="size-3" />
          Thất bại
        </Badge>
      );
    case "interrupted":
      return (
        <Badge className="flex w-fit items-center gap-1 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700" variant="outline">
          <Clock className="size-3" />
          Gián đoạn
        </Badge>
      );
    default:
      return (
        <Badge className="flex w-fit items-center gap-1 text-gray-600 border-gray-200 dark:text-gray-400 dark:border-gray-800" variant="outline">
          {status}
        </Badge>
      );
  }
}

function DownloadsTable({
  downloads,
  loading,
}: {
  downloads: Download[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 })
          .map(() => crypto.randomUUID())
          .map((id) => (
            <Skeleton className="h-16 w-full" key={id} />
          ))}
      </div>
    );
  }

  if (downloads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center border rounded-lg border-dashed border-gray-300 dark:border-neutral-800">
        <DownloadIcon className="mb-4 size-12 text-gray-400 dark:text-gray-600" />
        <h3 className="mb-2 font-bold text-lg text-black dark:text-white">Chưa có lượt tải xuống</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Lịch sử tải xuống của bạn sẽ xuất hiện ở đây khi bạn bắt đầu tải xuống tệp.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-neutral-800 overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50 dark:bg-neutral-900">
          <TableRow className="border-gray-200 dark:border-neutral-800 hover:bg-transparent">
            <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Tên tệp</TableHead>
            <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Thời gian tải</TableHead>
            <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Địa chỉ IP</TableHead>
            <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Trạng thái</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {downloads.map((download) => (
            <TableRow key={download.id} className="border-gray-100 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800/50">
              <TableCell className="font-medium text-black dark:text-white">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-gray-100 dark:bg-neutral-800 p-2">
                    {getFileIcon(download.file?.fileName)}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{download.file?.fileName || "Unknown file"}</span>
                    {download.file && (
                      <span className="text-gray-500 text-xs mt-0.5">
                        {download.file.fileType}
                      </span>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-gray-600 dark:text-gray-400">{formatDate(download.downloadTimestamp)}</TableCell>
              <TableCell>
                <code className="rounded border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 px-2 py-1 text-xs font-mono text-gray-600 dark:text-gray-400">
                  {download.ipAddress}
                </code>
              </TableCell>
              <TableCell>{getStatusBadge(download.status.name)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchDownloads = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await downloadApi.findAll({ page: pageNum, limit: 20 });
      const downloadsRes = response?.downloads ?? [];
      const paginationRes = response?.pagination ?? {
        page: pageNum,
        limit: 20,
        total: 0,
        totalPages: 0,
      };

      console.log("Downloads response:", response);

      setDownloads(downloadsRes);
      setPagination(paginationRes);
      setPage(paginationRes.page ?? pageNum);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể tải lịch sử tải xuống"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDownloads();
  }, [fetchDownloads]);

  return (
    <AppLayout breadcrumbs={["Tải xuống"]}>
      <div className="space-y-6 p-4 md:p-6 lg:p-8 min-h-screen bg-white dark:bg-neutral-950 text-black dark:text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-3xl tracking-tight text-black dark:text-white">
              Lịch sử tải xuống
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Theo dõi tất cả các tệp tải xuống của bạn và trạng thái của chúng
            </p>
          </div>
          {(pagination?.total ?? 0) > 0 && (
            <Badge className="px-4 py-2 text-sm bg-gray-100 text-gray-900 dark:bg-neutral-800 dark:text-gray-100 border border-gray-200 dark:border-neutral-700" variant="secondary">
              Tổng lượt tải: {pagination?.total ?? 0}
            </Badge>
          )}
        </div>

        <DownloadsTable downloads={downloads} loading={loading} />

        {(pagination?.totalPages ?? 0) > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              disabled={page === 1}
              onClick={() => fetchDownloads(page - 1)}
              size="sm"
              variant="outline"
              className="border-gray-200 dark:border-neutral-800"
            >
              Trước
            </Button>
            <span className="text-gray-600 dark:text-gray-400 text-sm">
              Trang {page} / {pagination?.totalPages ?? 0}
            </span>
            <Button
              disabled={page === pagination.totalPages}
              onClick={() => fetchDownloads(page + 1)}
              size="sm"
              variant="outline"
              className="border-gray-200 dark:border-neutral-800"
            >
              Sau
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
