"use client";

import { File, FileText, Folder, Image, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileCardItem {
  id: string;
  name: string;
  type: "file" | "folder";
  fileType?: string;
  size?: string;
  modified?: string;
  icon?: React.ReactNode;
}

const recentFiles: FileCardItem[] = [
  {
    id: "1",
    name: "filename.txt",
    type: "file",
    fileType: "text",
    size: "798 TB",
    modified: "2025/18/16",
  },
  {
    id: "2",
    name: "2028-19-88_do-not-open.rar",
    type: "file",
    fileType: "archive",
    size: "155 KB",
    modified: "2025/18/16",
  },
  {
    id: "3",
    name: "SecretFolder",
    type: "folder",
    modified: "2025/18/16",
  },
  {
    id: "4",
    name: "filename.txt",
    type: "file",
    fileType: "text",
    size: "798 TB",
    modified: "2025/18/16",
  },
];

function getFileIcon(type: string, fileType?: string) {
  if (type === "folder") {
    return <Folder className="size-16 text-primary" />;
  }
  if (fileType === "text") {
    return <FileText className="size-16 text-primary" />;
  }
  if (fileType === "archive") {
    return <File className="size-16 text-primary" />;
  }
  if (fileType === "image") {
    return <Image className="size-16 text-primary" />;
  }
  return <FileText className="size-16 text-primary" />;
}

export default function FileCards() {
  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg">Recent Files</h3>
        <Button className="text-sm" size="sm" variant="link">
          <span className="mr-1">Newest First</span>
          <svg
            className="ml-1"
            fill="none"
            height="16"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="16"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M11 5h10" />
            <path d="M11 9h7" />
            <path d="M11 13h4" />
            <path d="m3 17 3 3 3-3" />
            <path d="M6 18V4" />
          </svg>
          <svg
            className="ml-1"
            fill="none"
            height="12"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="12"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </Button>
      </div>

      {/* File Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {recentFiles.map((item) => (
          <div
            className="group relative overflow-hidden rounded-3xl border border-border bg-card transition-all hover:shadow-lg"
            key={item.id}
          >
            {/* Icon Area */}
            <div className="flex items-center justify-center p-8">
              {getFileIcon(item.type, item.fileType)}
            </div>

            {/* Info Area */}
            <div className="space-y-1 border-border border-t bg-background p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="flex-1 truncate font-semibold text-sm">
                  {item.name}
                </p>
                <Button
                  className="size-5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                  size="icon"
                  variant="ghost"
                >
                  <MoreVertical className="size-4" />
                </Button>
              </div>
              {item.size && (
                <p className="text-muted-foreground text-xs">{item.size}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
