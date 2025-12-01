"use client";

import { formatDistanceToNow } from "date-fns";
import { FileCode, FileText, Folder, Image, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FileItem } from "@/types/dashboard";

interface RecentFilesProps {
  files: FileItem[];
}

export default function RecentFiles({ files }: RecentFilesProps) {
  const getFileIcon = (fileType: string) => {
    if (fileType.includes("image")) return <Image className="h-5 w-5" />;
    if (fileType.includes("folder")) return <Folder className="h-5 w-5" />;
    if (fileType.includes("code") || fileType.includes("text"))
      return <FileCode className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / k ** i) * 100) / 100 + " " + sizes[i];
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return (
          <Badge
            className="border-green-200 bg-green-50 text-green-700"
            variant="secondary"
          >
            Active
          </Badge>
        );
      case "pending":
        return (
          <Badge
            className="border-yellow-200 bg-yellow-50 text-yellow-700"
            variant="secondary"
          >
            Pending
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-100 text-slate-700" variant="secondary">
            {status}
          </Badge>
        );
    }
  };

  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader className="border-slate-200 border-b pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="font-bold text-lg text-slate-900">
            Recent Files
          </CardTitle>
          <Button
            className="text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
            size="sm"
            variant="ghost"
          >
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100">
          {files.slice(0, 6).map((file) => (
            <div
              className="flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-slate-50"
              key={file.id}
            >
              <div className="flex flex-1 items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  {getFileIcon(file.fileType)}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="truncate font-semibold text-slate-900 text-sm">
                    {file.fileName}
                  </h4>
                  <p className="mt-0.5 text-slate-500 text-xs">
                    {formatBytes(file.fileSize)} •{" "}
                    {formatDistanceToNow(new Date(file.uploadTimestamp), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(file.status.name)}
                <Button
                  className="h-8 w-8 text-slate-400 hover:text-slate-900"
                  size="icon"
                  variant="ghost"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
