import { Ban, CheckCircle, XCircle } from "lucide-react";
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
import type { AdminUser } from "@/hooks/admin/useAdminUsers";
import { formatDate } from "@/lib/formatters";

type UsersTableProps = {
  users: AdminUser[];
  onToggleStatus: (userId: string, currentStatus: boolean) => void;
};

/**
 * Component hiển thị bảng users với actions (cho users page)
 */
export function UsersTable({ users, onToggleStatus }: UsersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Username</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Wallet Address</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Files</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <div>
                <p className="font-medium text-sm">{user.username}</p>
                {user.lastLoginAt && (
                  <p className="text-muted-foreground text-xs">
                    Last login: {formatDate(user.lastLoginAt)}
                  </p>
                )}
              </div>
            </TableCell>
            <TableCell className="text-sm">{user.email}</TableCell>
            <TableCell>
              <code className="rounded bg-muted px-2 py-1 text-xs">
                {user.walletAddress.substring(0, 6)}...
                {user.walletAddress.substring(user.walletAddress.length - 4)}
              </code>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{user.role.name}</Badge>
            </TableCell>
            <TableCell className="text-sm">
              <div className="text-xs">
                <p>{user._count.files} files</p>
                <p className="text-muted-foreground">
                  {user._count.grantsGiven} shared
                </p>
              </div>
            </TableCell>
            <TableCell>
              {user.isActive ? (
                <Badge className="gap-1" variant="default">
                  <CheckCircle className="size-3" />
                  Active
                </Badge>
              ) : (
                <Badge className="gap-1" variant="destructive">
                  <XCircle className="size-3" />
                  Inactive
                </Badge>
              )}
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {formatDate(user.createdAt)}
            </TableCell>
            <TableCell className="text-right">
              <Button
                onClick={() => onToggleStatus(user.id, user.isActive)}
                size="sm"
                variant={user.isActive ? "destructive" : "default"}
              >
                <Ban className="mr-1 size-4" />
                {user.isActive ? "Ban" : "Unban"}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
