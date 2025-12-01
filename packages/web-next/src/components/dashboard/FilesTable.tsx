"use client";

import { formatDistanceToNow } from "date-fns";
import {
  FileCode,
  FileText,
  Folder,
  Image,
  MoreVertical,
  Star,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { FileItem } from "@/types/dashboard";

type FilesTableProps = {
  files: FileItem[];
};

export default function FilesTable({ files }: FilesTableProps) {
  const getFileIcon = (fileType: string) => {
    if (fileType.includes("image")) {
      return <Image className="h-5 w-5 text-indigo-600" />;
    }
    if (fileType.includes("folder")) {
      return <Folder className="h-5 w-5 text-indigo-600" />;
    }
    if (fileType.includes("code") || fileType.includes("text")) {
      return <FileCode className="h-5 w-5 text-indigo-600" />;
    }
    return <FileText className="h-5 w-5 text-indigo-600" />;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) {
      return "0 Bytes";
    }
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`;
  };

  const getPermissionBadge = (grants?: FileItem["grants"]) => {
    if (!grants || grants.length === 0) {
      return (
        <Badge className="bg-slate-100 text-slate-700" variant="secondary">
          Private
        </Badge>
      );
    }

    const activeGrants = grants.filter(
      (g) => g.status.name.toLowerCase() === "active"
    );

    if (activeGrants.length > 0) {
      return (
        <Badge
          className="border-green-200 bg-green-50 text-green-700"
          variant="secondary"
        >
          Shared
        </Badge>
      );
    }

    return (
      <Badge
        className="border-yellow-200 bg-yellow-50 text-yellow-700"
        variant="secondary"
      >
        Pending
      </Badge>
    );
  };

  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader className="border-slate-200 border-b pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="font-bold text-lg text-slate-900">
              All Files
            </CardTitle>
            <Badge
              className="border-indigo-200 bg-indigo-50 text-indigo-700"
              variant="secondary"
            >
              {files.length} Total
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              className="border-slate-200 text-slate-700 hover:bg-slate-50"
              size="sm"
              variant="outline"
            >
              <Star className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button
              className="bg-indigo-600 text-white hover:bg-indigo-700"
              size="sm"
              variant="default"
            >
              <Users className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow className="hover:bg-slate-50">
              <TableHead className="font-semibold text-slate-700">
                Name
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                Size
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                Last Modified
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                Permission
              </TableHead>
              <TableHead className="text-right font-semibold text-slate-700">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => (
              <TableRow
                className="cursor-pointer hover:bg-slate-50"
                key={file.id}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
                      {getFileIcon(file.fileType)}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900">
                        {file.fileName}
                      </span>
                      <span className="text-slate-500 text-xs">
                        {file.fileType}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-slate-600">
                  {formatBytes(file.fileSize)}
                </TableCell>
                <TableCell className="text-slate-600">
                  {formatDistanceToNow(new Date(file.uploadTimestamp), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell>{getPermissionBadge(file.grants)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    className="h-8 w-8 text-slate-400 hover:text-slate-900"
                    size="icon"
                    variant="ghost"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
