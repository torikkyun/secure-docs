"use client";

import {
  ArrowUpDown,
  File,
  FileText,
  Folder,
  Image,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { File as FileType } from "@/types/api";

type FileCardsProps = {
  files: FileType[];
  loading: boolean;
};

function formatBytes(bytes: number): string {
  if (bytes === 0) {
    return "0 B";
  }
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

function getFileIcon(fileType: string) {
  const iconClass = "size-12 text-primary";
  const type = fileType.toLowerCase();

  if (type.includes("folder") || type.includes("directory")) {
    return <Folder className={iconClass} />;
  }
  if (type.includes("text") || type.includes("txt")) {
    return <FileText className={iconClass} />;
  }
  if (
    type.includes("zip") ||
    type.includes("rar") ||
    type.includes("archive")
  ) {
    return <File className={iconClass} />;
  }
  if (
    type.includes("image") ||
    type.includes("png") ||
    type.includes("jpg") ||
    type.includes("jpeg")
  ) {
    return <Image className={iconClass} />;
  }
  return <FileText className={iconClass} />;
}

export default function FileCards({ files, loading }: FileCardsProps) {
  if (loading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {["1", "2", "3", "4"].map((id) => (
            <Card className="overflow-hidden" key={id}>
              <Skeleton className="h-32 w-full" />
              <div className="p-4">
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-foreground text-lg">Recent Files</h3>
        <Button
          className="text-muted-foreground text-sm hover:text-foreground"
          size="sm"
          variant="ghost"
        >
          <ArrowUpDown className="mr-2 size-4" />
          Newest First
        </Button>
      </div>

      {/* File Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {files && files.length > 0 ? (
          files.slice(0, 4).map((file) => (
            <Card
              className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-md hover:shadow-primary/10"
              key={file.id}
            >
              {/* Icon Area */}
              <div className="flex items-center justify-center bg-primary/5 py-10">
                {getFileIcon(file.fileType)}
              </div>

              {/* Info Area */}
              <div className="space-y-1 border-border border-t bg-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="flex-1 truncate font-semibold text-foreground text-sm">
                    {file.fileName}
                  </p>
                  <Button
                    className="size-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                    size="icon"
                    variant="ghost"
                  >
                    <MoreVertical className="size-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-xs">
                    {formatBytes(file.fileSize)}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {new Date(file.uploadTimestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center">
            <p className="text-muted-foreground">No files yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
