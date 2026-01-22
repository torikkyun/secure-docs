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
          className="flex w-fit items-center gap-1 bg-green-600"
          variant="default"
        >
          <CheckCircle className="size-3" />
          Success
        </Badge>
      );
    case "failed":
      return (
        <Badge className="flex w-fit items-center gap-1" variant="destructive">
          <XCircle className="size-3" />
          Failed
        </Badge>
      );
    case "interrupted":
      return (
        <Badge className="flex w-fit items-center gap-1" variant="secondary">
          <Clock className="size-3" />
          Interrupted
        </Badge>
      );
    default:
      return (
        <Badge className="flex w-fit items-center gap-1" variant="outline">
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
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <DownloadIcon className="mb-4 size-12 text-muted-foreground" />
        <h3 className="mb-2 font-semibold text-lg">No downloads yet</h3>
        <p className="text-muted-foreground text-sm">
          Your download history will appear here once you start downloading
          files.
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
            <TableHead>Downloaded At</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {downloads.map((download) => (
            <TableRow key={download.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {getFileIcon(download.file?.fileName)}
                  <div className="flex flex-col">
                    <span>{download.file?.fileName || "Unknown file"}</span>
                    {download.file && (
                      <span className="text-muted-foreground text-xs">
                        {download.file.fileType}
                      </span>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>{formatDate(download.downloadTimestamp)}</TableCell>
              <TableCell>
                <code className="rounded bg-muted px-2 py-1 text-xs">
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
          : "Failed to load download history"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDownloads();
  }, [fetchDownloads]);

  return (
    <AppLayout
      breadcrumbs={["Downloads"]}
      description="Track all your file downloads and their status"
      title="Download History"
    >
      <div className="space-y-6 p-4 md:p-6 lg:p-8">
        {(pagination?.total ?? 0) > 0 && (
          <div className="flex justify-end">
            <Badge className="px-4 py-2 text-base" variant="secondary">
              Total Downloads: {pagination?.total ?? 0}
            </Badge>
          </div>
        )}

        <DownloadsTable downloads={downloads} loading={loading} />

        {(pagination?.totalPages ?? 0) > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              disabled={page === 1}
              onClick={() => fetchDownloads(page - 1)}
              size="sm"
              variant="outline"
            >
              Previous
            </Button>
            <span className="text-muted-foreground text-sm">
              Page {page} of {pagination?.totalPages ?? 0}
            </span>
            <Button
              disabled={page === pagination.totalPages}
              onClick={() => fetchDownloads(page + 1)}
              size="sm"
              variant="outline"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
