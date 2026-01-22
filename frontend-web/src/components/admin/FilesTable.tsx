import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminFile } from "@/hooks/admin/useAdminFiles";
import { formatBytes, formatDate } from "@/lib/formatters";
import getFileIcon from "@/lib/getFileIcon";

type FilesTableProps = {
  files: AdminFile[];
};

/**
 * Component hiển thị bảng files
 */
export function FilesTable({ files }: FilesTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "deleted":
        return <Badge variant="destructive">Deleted</Badge>;
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>File Name</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Upload Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>CID</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {files.map((file) => {
          const FileIcon = getFileIcon(file.fileName, "size-5 text-primary");
          return (
            <TableRow key={file.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg border bg-muted/50">
                    {FileIcon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-sm">
                      {file.fileName}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {file.mimeType}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium text-sm">
                    {file.owner?.username || "Unknown"}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {file.owner?.email}
                  </p>
                </div>
              </TableCell>
              <TableCell className="text-sm">
                {formatBytes(file.fileSize)}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatDate(file.uploadTimestamp)}
              </TableCell>
              <TableCell>{getStatusBadge(file.status.name)}</TableCell>
              <TableCell>
                <code className="rounded bg-muted px-2 py-1 text-xs">
                  {file.cid.substring(0, 12)}...
                </code>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
