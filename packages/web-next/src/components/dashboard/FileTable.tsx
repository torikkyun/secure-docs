"use client";

import {
  Archive,
  File,
  FileText,
  Folder,
  Image,
  MoreVertical,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type FilePermission = "Administrator" | "Editor" | "View Only";

interface FileTableItem {
  id: string;
  name: string;
  type: "file" | "folder";
  fileType?: string;
  size: string;
  modified: string;
  permission: FilePermission;
}

const files: FileTableItem[] = [
  {
    id: "1",
    name: "Screenshot 22.jpg",
    type: "file",
    fileType: "image",
    size: "798 TB",
    modified: "2025/18/16",
    permission: "Editor",
  },
  {
    id: "2",
    name: "React Component.tsx",
    type: "file",
    fileType: "code",
    size: "155 KB",
    modified: "2025/18/16",
    permission: "View Only",
  },
  {
    id: "3",
    name: "Landing Page.html",
    type: "file",
    fileType: "html",
    size: "187 KB",
    modified: "2025/18/16",
    permission: "Editor",
  },
  {
    id: "4",
    name: "Website Styles.css",
    type: "file",
    fileType: "folder",
    size: "1,251 TB",
    modified: "2025/18/16",
    permission: "Administrator",
  },
  {
    id: "5",
    name: "Cheat Codez.txt",
    type: "file",
    fileType: "text",
    size: "889 KB",
    modified: "2025/18/16",
    permission: "Administrator",
  },
  {
    id: "6",
    name: "Project Docs.pdf",
    type: "file",
    fileType: "pdf",
    size: "2.3 MB",
    modified: "2025/18/16",
    permission: "Editor",
  },
  {
    id: "7",
    name: "Archive.zip",
    type: "file",
    fileType: "archive",
    size: "45 MB",
    modified: "2025/18/16",
    permission: "View Only",
  },
];

function getFileIcon(fileType?: string) {
  switch (fileType) {
    case "folder":
      return <Folder className="size-5 text-primary" />;
    case "image":
      return <Image className="size-5 text-primary" />;
    case "code":
      return <File className="size-5 text-primary" />;
    case "pdf":
      return <FileText className="size-5 text-red-500" />;
    case "archive":
      return <Archive className="size-5 text-primary" />;
    default:
      return <FileText className="size-5 text-primary" />;
  }
}

function getPermissionBadge(permission: FilePermission) {
  switch (permission) {
    case "Administrator":
      return (
        <Badge
          className="bg-red-500/20 text-red-500 hover:bg-red-500/30"
          variant="destructive"
        >
          Administrator
        </Badge>
      );
    case "Editor":
      return (
        <Badge
          className="bg-green-500/20 text-green-500 hover:bg-green-500/30"
          variant="secondary"
        >
          Editor
        </Badge>
      );
    case "View Only":
      return (
        <Badge className="bg-muted text-muted-foreground" variant="secondary">
          View Only
        </Badge>
      );
  }
}

export default function FileTable() {
  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between border-border border-t pt-5">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-lg">Public Files</h3>
          <Badge className="bg-primary/20 text-primary" variant="secondary">
            81 Total
          </Badge>
        </div>
        <Button size="icon" variant="outline">
          <MoreVertical className="size-4" />
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border border-b hover:bg-transparent">
              <TableHead className="w-[50%]">File Name</TableHead>
              <TableHead>Last Modified</TableHead>
              <TableHead>File Permission</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => (
              <TableRow
                className="border-border border-b hover:bg-accent/50"
                key={file.id}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      {getFileIcon(file.fileType)}
                    </div>
                    <div>
                      <p className="font-semibold">{file.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {file.size}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {file.modified}
                </TableCell>
                <TableCell>{getPermissionBadge(file.permission)}</TableCell>
                <TableCell>
                  <Button className="size-8" size="icon" variant="ghost">
                    <MoreVertical className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
